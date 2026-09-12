"""
Deterministic Compliance Engine — calculates compliance mathematically.
Gemini is NOT used for compliance calculations, only for explanation.
"""
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models import (
    Committee, CommitteeMember, CommitteeRequirement, Meeting,
    QuorumRecord, ComplianceCheck, ComplianceIssue,
    ComplianceStatus, IssueType, IssueSeverity, MeetingStatus
)


def calculate_tenure_status(end_date) -> Tuple[str, int]:
    """Returns (status, days_remaining)."""
    if end_date is None:
        return "ACTIVE", 9999
    today = date.today()
    delta = (end_date - today).days
    if delta < 0:
        return "EXPIRED", delta
    elif delta <= 30:
        return "EXPIRING_SOON", delta
    elif delta <= 90:
        return "WARNING", delta
    else:
        return "ACTIVE", delta


def get_active_members(db: Session, committee_id: str) -> List[CommitteeMember]:
    return db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == committee_id,
        CommitteeMember.is_active == True
    ).all()


def check_composition(
    committee: Committee,
    requirements: List[CommitteeRequirement],
    members: List[CommitteeMember]
) -> Tuple[float, List[Dict]]:
    """Checks member composition against requirements."""
    issues = []
    score = 100.0
    
    if not requirements:
        return score, issues
    
    for req in requirements:
        if req.requirement_type == "COUNT":
            if req.required_count and len(members) < req.required_count:
                deficit = req.required_count - len(members)
                issues.append({
                    "type": IssueType.MISSING_MEMBER,
                    "severity": IssueSeverity.HIGH,
                    "title": f"Insufficient members: {len(members)} of {req.required_count} required",
                    "description": req.description,
                    "recommendation": f"Add {deficit} more members to meet the minimum requirement."
                })
                score -= 25
        
        elif req.requirement_type == "EXTERNAL":
            if req.requires_external or req.required_count:
                ext_count = sum(1 for m in members if m.member and m.member.is_external)
                required = req.required_count or 1
                if ext_count < required:
                    issues.append({
                        "type": IssueType.MISSING_MEMBER,
                        "severity": IssueSeverity.HIGH,
                        "title": f"External member required: {ext_count} of {required} present",
                        "description": req.description,
                        "recommendation": "Nominate and appoint an external member from industry/academia."
                    })
                    score -= 20
        
        elif req.requirement_type == "STUDENT":
            if req.requires_student or req.required_count:
                stu_count = sum(1 for m in members if m.member and m.member.is_student)
                required = req.required_count or 1
                if stu_count < required:
                    issues.append({
                        "type": IssueType.MISSING_MEMBER,
                        "severity": IssueSeverity.MEDIUM,
                        "title": f"Student representative required: {stu_count} of {required} present",
                        "description": req.description,
                        "recommendation": "Appoint a student representative to the committee."
                    })
                    score -= 15
        
        elif req.requirement_type == "GENDER":
            if req.required_gender:
                gender_count = sum(
                    1 for m in members
                    if m.member and m.member.gender and m.member.gender.upper() == req.required_gender.upper()
                )
                required = req.required_count or 1
                if gender_count < required:
                    issues.append({
                        "type": IssueType.INVALID_COMPOSITION,
                        "severity": IssueSeverity.MEDIUM,
                        "title": f"Gender requirement not met: {gender_count} {req.required_gender} member(s) of {required} required",
                        "description": req.description,
                        "recommendation": f"Ensure at least {required} {req.required_gender} member(s) are appointed."
                    })
                    score -= 10
    
    return max(0.0, score), issues


def check_tenure(members: List[CommitteeMember]) -> Tuple[float, List[Dict]]:
    """Checks member tenure status."""
    issues = []
    score = 100.0
    
    for cm in members:
        status, days = calculate_tenure_status(cm.end_date)
        name = cm.member.name if cm.member else "Unknown"
        
        if status == "EXPIRED":
            issues.append({
                "type": IssueType.TENURE_EXPIRED,
                "severity": IssueSeverity.CRITICAL,
                "title": f"Tenure expired: {name}",
                "description": f"Member {name}'s tenure expired {abs(days)} days ago.",
                "recommendation": "Initiate reconstitution process immediately. The member's appointment is invalid."
            })
            score -= 20
        elif status == "EXPIRING_SOON":
            issues.append({
                "type": IssueType.TENURE_EXPIRING,
                "severity": IssueSeverity.HIGH,
                "title": f"Tenure expiring soon: {name} ({days} days remaining)",
                "description": f"Member {name}'s tenure expires in {days} days.",
                "recommendation": "Begin renewal or replacement process within the next 7 days."
            })
            score -= 10
        elif status == "WARNING":
            issues.append({
                "type": IssueType.TENURE_EXPIRING,
                "severity": IssueSeverity.MEDIUM,
                "title": f"Tenure expiring: {name} ({days} days remaining)",
                "description": f"Member {name}'s tenure expires in {days} days.",
                "recommendation": "Plan for renewal or replacement within 30 days."
            })
            score -= 5
    
    return max(0.0, score), issues


def check_meeting_frequency(db: Session, committee: Committee) -> Tuple[float, List[Dict]]:
    """Checks if meetings are held at required frequency."""
    issues = []
    score = 100.0
    
    # Get last completed meeting
    last_meeting = db.query(Meeting).filter(
        Meeting.committee_id == committee.id,
        Meeting.status == MeetingStatus.COMPLETED,
        Meeting.meeting_date != None
    ).order_by(Meeting.meeting_date.desc()).first()
    
    if not last_meeting:
        issues.append({
            "type": IssueType.MEETING_OVERDUE,
            "severity": IssueSeverity.HIGH,
            "title": "No meetings recorded",
            "description": "No completed meetings found for this committee.",
            "recommendation": "Schedule the first meeting immediately."
        })
        return 0.0, issues
    
    # Calculate expected next meeting
    freq = committee.meeting_frequency
    unit = committee.frequency_unit.upper()
    
    if unit == "WEEK":
        delta = timedelta(weeks=freq)
    elif unit == "QUARTER":
        delta = timedelta(days=90 * freq)
    elif unit == "YEAR":
        delta = timedelta(days=365 * freq)
    else:  # MONTH default
        delta = timedelta(days=30 * freq)
    
    expected_next = last_meeting.meeting_date + delta
    today = date.today()
    
    if today > expected_next:
        overdue_days = (today - expected_next).days
        severity = IssueSeverity.CRITICAL if overdue_days > 30 else IssueSeverity.HIGH
        issues.append({
            "type": IssueType.MEETING_OVERDUE,
            "severity": severity,
            "title": f"Meeting overdue by {overdue_days} days",
            "description": f"Expected meeting on {expected_next.strftime('%d %b %Y')}. Last meeting was on {last_meeting.meeting_date.strftime('%d %b %Y')}.",
            "recommendation": f"Schedule meeting immediately. The committee requires meetings every {freq} {unit.lower()}(s)."
        })
        score -= min(40, overdue_days)
    elif (expected_next - today).days <= 7:
        issues.append({
            "type": IssueType.MEETING_OVERDUE,
            "severity": IssueSeverity.LOW,
            "title": "Meeting due within 7 days",
            "description": f"Next meeting expected by {expected_next.strftime('%d %b %Y')}.",
            "recommendation": "Schedule meeting soon."
        })
        score -= 5
    
    return max(0.0, score), issues


def check_quorum_history(db: Session, committee_id: str) -> Tuple[float, List[Dict]]:
    """Checks quorum records for recent meetings."""
    issues = []
    score = 100.0
    
    recent_quorum_failures = db.query(QuorumRecord).join(Meeting).filter(
        Meeting.committee_id == committee_id,
        QuorumRecord.quorum_met == False,
        QuorumRecord.override_allowed == False
    ).count()
    
    if recent_quorum_failures > 0:
        issues.append({
            "type": IssueType.QUORUM_ISSUE,
            "severity": IssueSeverity.HIGH,
            "title": f"{recent_quorum_failures} meeting(s) held without quorum",
            "description": "Meetings were conducted without achieving required quorum.",
            "recommendation": "Review member availability and attendance policies."
        })
        score -= min(20, recent_quorum_failures * 10)
    
    return max(0.0, score), issues


def run_compliance_check(db: Session, committee_id: str, checked_by: str = None) -> ComplianceCheck:
    """Main compliance check — fully deterministic."""
    committee = db.query(Committee).filter(Committee.id == committee_id).first()
    if not committee:
        raise ValueError(f"Committee {committee_id} not found")
    
    requirements = db.query(CommitteeRequirement).filter(
        CommitteeRequirement.committee_id == committee_id
    ).all()
    
    members = get_active_members(db, committee_id)
    
    # Run all checks
    comp_score, comp_issues = check_composition(committee, requirements, members)
    tenure_score, tenure_issues = check_tenure(members)
    meeting_score, meeting_issues = check_meeting_frequency(db, committee)
    quorum_score, quorum_issues = check_quorum_history(db, committee_id)
    
    # Combined score (weighted)
    overall_score = (comp_score * 0.35 + tenure_score * 0.25 + meeting_score * 0.30 + quorum_score * 0.10)
    
    # Determine status
    all_issues = comp_issues + tenure_issues + meeting_issues + quorum_issues
    
    critical_issues = [i for i in all_issues if i["severity"] == IssueSeverity.CRITICAL]
    high_issues = [i for i in all_issues if i["severity"] == IssueSeverity.HIGH]
    
    if critical_issues or len(high_issues) >= 2 or overall_score < 60:
        status = ComplianceStatus.NON_COMPLIANT
    elif high_issues or overall_score < 80:
        status = ComplianceStatus.WARNING
    else:
        status = ComplianceStatus.COMPLIANT
    
    # Build summary
    summary_parts = []
    if not all_issues:
        summary = "All compliance checks passed. The committee is fully compliant."
    else:
        summary = f"Found {len(all_issues)} compliance issue(s). Score: {overall_score:.0f}/100."
    
    # Save compliance check
    # Delete old check first
    old_check = db.query(ComplianceCheck).filter(ComplianceCheck.committee_id == committee_id).first()
    if old_check:
        db.delete(old_check)
        db.flush()
    
    check = ComplianceCheck(
        committee_id=committee_id,
        checked_by=checked_by,
        overall_score=round(overall_score, 2),
        status=status,
        composition_score=round(comp_score, 2),
        tenure_score=round(tenure_score, 2),
        meeting_score=round(meeting_score, 2),
        quorum_score=round(quorum_score, 2),
        summary=summary
    )
    db.add(check)
    db.flush()
    
    for issue_data in all_issues:
        issue = ComplianceIssue(
            compliance_check_id=check.id,
            issue_type=issue_data["type"],
            severity=issue_data["severity"],
            title=issue_data["title"],
            description=issue_data.get("description", ""),
            recommendation=issue_data.get("recommendation", "")
        )
        db.add(issue)
    
    db.commit()
    db.refresh(check)
    return check
