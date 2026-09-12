from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import (
    Committee, CommitteeStatus, Meeting, MeetingStatus, ActionItem, ActionStatus,
    CommitteeMember, ComplianceCheck, ComplianceStatus, AuditLog,
    User, UserRole
)
from app.auth.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/compliance")
async def compliance_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.compliance_engine import run_compliance_check
    
    committees = db.query(Committee).filter(Committee.status == CommitteeStatus.ACTIVE).all()
    report = []
    
    for c in committees:
        check = db.query(ComplianceCheck).filter(ComplianceCheck.committee_id == c.id).first()
        if not check:
            try:
                check = run_compliance_check(db, c.id)
            except Exception:
                continue
        
        report.append({
            "committee": c.name,
            "code": c.code,
            "authority": c.authority,
            "status": check.status,
            "score": check.overall_score,
            "composition_score": check.composition_score,
            "tenure_score": check.tenure_score,
            "meeting_score": check.meeting_score,
            "issues": len(check.issues),
            "critical_issues": sum(1 for i in check.issues if i.severity == "CRITICAL"),
            "summary": check.summary
        })
    
    summary = {
        "total": len(report),
        "compliant": sum(1 for r in report if r["status"] == "COMPLIANT"),
        "warning": sum(1 for r in report if r["status"] == "WARNING"),
        "non_compliant": sum(1 for r in report if r["status"] == "NON_COMPLIANT"),
        "average_score": sum(r["score"] for r in report) / max(1, len(report))
    }
    
    return {"report": report, "summary": summary, "generated_at": str(date.today())}


@router.get("/tenure")
async def tenure_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.compliance_engine import calculate_tenure_status
    
    memberships = db.query(CommitteeMember).filter(
        CommitteeMember.is_active == True,
        CommitteeMember.end_date != None
    ).all()
    
    report = []
    for cm in memberships:
        status, days = calculate_tenure_status(cm.end_date)
        if status != "ACTIVE":
            report.append({
                "member": cm.member.name if cm.member else "Unknown",
                "committee": cm.committee.name if cm.committee else "Unknown",
                "role": cm.role,
                "end_date": str(cm.end_date),
                "tenure_status": status,
                "days_remaining": days
            })
    
    report.sort(key=lambda x: x["days_remaining"])
    return {"report": report, "total_issues": len(report)}


@router.get("/meetings")
async def meetings_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    committees = db.query(Committee).filter(Committee.status == CommitteeStatus.ACTIVE).all()
    from app.services.compliance_engine import check_meeting_frequency
    
    report = []
    for c in committees:
        score, issues = check_meeting_frequency(db, c)
        last_meeting = db.query(Meeting).filter(
            Meeting.committee_id == c.id,
            Meeting.status == MeetingStatus.COMPLETED
        ).order_by(Meeting.meeting_date.desc()).first()
        
        upcoming = db.query(Meeting).filter(
            Meeting.committee_id == c.id,
            Meeting.meeting_date >= date.today(),
            Meeting.status.in_([MeetingStatus.SCHEDULED, MeetingStatus.DRAFT])
        ).order_by(Meeting.meeting_date).first()
        
        report.append({
            "committee": c.name,
            "frequency": f"Every {c.meeting_frequency} {c.frequency_unit}",
            "last_meeting": str(last_meeting.meeting_date) if last_meeting else "Never",
            "next_meeting": str(upcoming.meeting_date) if upcoming else "Not scheduled",
            "status": "OVERDUE" if issues else "ON_TRACK",
            "issues": [i["title"] for i in issues]
        })
    
    return {"report": report}


@router.get("/actions")
async def actions_report(
    committee_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    q = db.query(ActionItem)
    if committee_id:
        q = q.filter(ActionItem.committee_id == committee_id)
    
    actions = q.all()
    
    report = []
    for a in actions:
        is_overdue = a.due_date and a.due_date < today and a.status in [
            ActionStatus.PENDING, ActionStatus.IN_PROGRESS
        ]
        report.append({
            "title": a.title,
            "committee": a.committee.name if a.committee else "N/A",
            "owner": a.owner.name if a.owner else "Unassigned",
            "due_date": str(a.due_date) if a.due_date else "No deadline",
            "priority": a.priority,
            "status": a.status,
            "is_overdue": is_overdue,
            "remarks": a.remarks
        })
    
    summary = {
        "total": len(report),
        "pending": sum(1 for r in report if r["status"] == "PENDING"),
        "in_progress": sum(1 for r in report if r["status"] == "IN_PROGRESS"),
        "completed": sum(1 for r in report if r["status"] == "COMPLETED"),
        "overdue": sum(1 for r in report if r["is_overdue"])
    }
    
    return {"report": report, "summary": summary}


@router.get("/evidence")
async def evidence_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models import Document
    docs = db.query(Document).all()
    
    return {
        "documents": [
            {
                "name": d.name,
                "category": d.category,
                "committee": d.committee.name if d.committee else "N/A",
                "uploaded": str(d.created_at)[:10] if d.created_at else "N/A",
                "indexed": d.is_indexed,
                "url": d.cloudinary_url
            }
            for d in docs
        ],
        "total": len(docs)
    }


@router.get("/dashboard")
async def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.utils.cache import cache
    cache_key = f"dashboard_stats:{current_user.role}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from app.models import Member, MemberStatus
    from sqlalchemy.orm import joinedload
    
    today = date.today()
    
    committees = db.query(Committee).filter(Committee.status == CommitteeStatus.ACTIVE).all()
    total_committees = len(committees)
    comm_ids = [c.id for c in committees]
    
    # 1 single batch query for compliance checks
    compliant = warning = non_compliant = 0
    if comm_ids:
        latest_compliance = {}
        for comp in db.query(ComplianceCheck).filter(ComplianceCheck.committee_id.in_(comm_ids)).order_by(ComplianceCheck.checked_at.desc()).all():
            if comp.committee_id not in latest_compliance:
                latest_compliance[comp.committee_id] = comp
                if comp.status == "COMPLIANT":
                    compliant += 1
                elif comp.status == "WARNING":
                    warning += 1
                elif comp.status == "NON_COMPLIANT":
                    non_compliant += 1
    
    # Overdue meetings
    overdue_meetings = db.query(Meeting).filter(
        Meeting.meeting_date < today,
        Meeting.status.in_([MeetingStatus.SCHEDULED, MeetingStatus.OVERDUE])
    ).count()
    
    # Active members
    active_members = db.query(Member).filter(Member.status == MemberStatus.ACTIVE).count()
    
    # Open action items
    open_actions = db.query(ActionItem).filter(
        ActionItem.status.in_([ActionStatus.PENDING, ActionStatus.IN_PROGRESS])
    ).count()
    
    # Overdue action items
    overdue_actions = db.query(ActionItem).filter(
        ActionItem.due_date < today,
        ActionItem.status.in_([ActionStatus.PENDING, ActionStatus.IN_PROGRESS, ActionStatus.OVERDUE])
    ).count()
    
    # Recent audit logs
    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(10).all()
    
    # Upcoming meetings with joinedload
    upcoming_meetings = db.query(Meeting).options(joinedload(Meeting.committee)).filter(
        Meeting.meeting_date >= today,
        Meeting.status.in_([MeetingStatus.SCHEDULED, MeetingStatus.DRAFT])
    ).order_by(Meeting.meeting_date).limit(5).all()
    
    result = {
        "stats": {
            "total_committees": total_committees,
            "compliant_committees": compliant,
            "warning_committees": warning,
            "non_compliant_committees": non_compliant,
            "overdue_meetings": overdue_meetings,
            "active_members": active_members,
            "open_action_items": open_actions,
            "overdue_action_items": overdue_actions
        },
        "compliance_distribution": {
            "compliant": compliant,
            "warning": warning,
            "non_compliant": non_compliant
        },
        "upcoming_meetings": [
            {
                "id": m.id,
                "title": m.title,
                "committee_name": m.committee.name if m.committee else "N/A",
                "meeting_date": str(m.meeting_date),
                "meeting_mode": m.meeting_mode,
                "status": m.status
            }
            for m in upcoming_meetings
        ],
        "recent_activity": [
            {
                "action": log.action,
                "description": log.description,
                "user": log.user.name if log.user else "System",
                "created_at": str(log.created_at)
            }
            for log in recent_logs
        ]
    }
    cache.set(cache_key, result, ttl_seconds=15)
    return result


@router.get("/notifications")
async def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models import Notification
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": str(n.created_at)
        }
        for n in notifications
    ]
