from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models import (
    Committee, CommitteeMember, Member, CommitteeRequirement,
    Meeting, MeetingStatus, ComplianceCheck, AuditLog, UserRole, User
)
from app.auth.auth import get_current_user, require_role
from app.schemas.schemas import (
    CommitteeCreate, CommitteeUpdate, CommitteeOut,
    CommitteeMemberAdd, CommitteeMemberUpdate, CommitteeMemberOut,
    RequirementCreate, RequirementOut
)
from app.services.compliance_engine import calculate_tenure_status, run_compliance_check

router = APIRouter(prefix="/api/committees", tags=["committees"])


def get_committee_member_count(db: Session, committee_id: str) -> int:
    return db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == committee_id,
        CommitteeMember.is_active == True
    ).count()


def get_last_meeting(db: Session, committee_id: str):
    return db.query(Meeting).filter(
        Meeting.committee_id == committee_id,
        Meeting.status == MeetingStatus.COMPLETED,
        Meeting.meeting_date != None
    ).order_by(Meeting.meeting_date.desc()).first()


def get_latest_compliance(db: Session, committee_id: str):
    return db.query(ComplianceCheck).filter(
        ComplianceCheck.committee_id == committee_id
    ).order_by(ComplianceCheck.checked_at.desc()).first()


def enrich_committee(committee: Committee, db: Session) -> dict:
    """Add computed fields to committee data."""
    data = {
        "id": committee.id,
        "name": committee.name,
        "code": committee.code,
        "authority": committee.authority,
        "mandate": committee.mandate,
        "description": committee.description,
        "quorum_type": committee.quorum_type,
        "quorum_value": committee.quorum_value,
        "meeting_frequency": committee.meeting_frequency,
        "frequency_unit": committee.frequency_unit,
        "status": committee.status,
        "created_at": committee.created_at,
        "member_count": get_committee_member_count(db, committee.id),
        "last_meeting_date": None,
        "next_meeting_date": None,
        "compliance_status": None,
        "compliance_score": None
    }
    
    last_meeting = get_last_meeting(db, committee.id)
    if last_meeting:
        data["last_meeting_date"] = last_meeting.meeting_date
    
    compliance = get_latest_compliance(db, committee.id)
    if compliance:
        data["compliance_status"] = compliance.status
        data["compliance_score"] = compliance.overall_score
    
    return data


@router.get("", response_model=List[dict])
async def list_committees(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.utils.cache import cache
    cache_key = f"committees:{current_user.id}:{status}:{search}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from sqlalchemy import func
    q = db.query(Committee)
    
    if status:
        q = q.filter(Committee.status == status)
    
    if search:
        q = q.filter(Committee.name.ilike(f"%{search}%"))
    
    # Role-based filtering
    if current_user.role in [UserRole.CONVENER, UserRole.MEMBER]:
        from app.models import UserCommitteeAccess
        access_records = db.query(UserCommitteeAccess.committee_id).filter(
            UserCommitteeAccess.user_id == current_user.id
        ).all()
        access_ids = [a[0] for a in access_records]
        q = q.filter(Committee.id.in_(access_ids))
    
    committees = q.order_by(Committee.name).all()
    if not committees:
        cache.set(cache_key, [], ttl_seconds=15)
        return []
    
    comm_ids = [c.id for c in committees]
    
    # 1 single batch query for active member counts
    member_counts = dict(
        db.query(CommitteeMember.committee_id, func.count(CommitteeMember.id))
        .filter(CommitteeMember.committee_id.in_(comm_ids), CommitteeMember.is_active == True)
        .group_by(CommitteeMember.committee_id)
        .all()
    )
    
    # 1 single batch query for latest compliance checks
    latest_compliance = {}
    for comp in db.query(ComplianceCheck).filter(ComplianceCheck.committee_id.in_(comm_ids)).order_by(ComplianceCheck.checked_at.desc()).all():
        if comp.committee_id not in latest_compliance:
            latest_compliance[comp.committee_id] = comp
            
    # 1 single batch query for completed meetings
    last_meetings = {}
    for m in db.query(Meeting).filter(Meeting.committee_id.in_(comm_ids), Meeting.status == MeetingStatus.COMPLETED).order_by(Meeting.meeting_date.desc()).all():
        if m.committee_id not in last_meetings:
            last_meetings[m.committee_id] = m.meeting_date

    result = []
    for c in committees:
        comp = latest_compliance.get(c.id)
        result.append({
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "authority": c.authority,
            "mandate": c.mandate,
            "description": c.description,
            "quorum_type": c.quorum_type,
            "quorum_value": c.quorum_value,
            "meeting_frequency": c.meeting_frequency,
            "frequency_unit": c.frequency_unit,
            "status": c.status,
            "created_at": c.created_at,
            "member_count": member_counts.get(c.id, 0),
            "last_meeting_date": last_meetings.get(c.id),
            "next_meeting_date": None,
            "compliance_status": comp.status if comp else None,
            "compliance_score": comp.overall_score if comp else None
        })
    cache.set(cache_key, result, ttl_seconds=20)
    return result


@router.post("", response_model=dict, status_code=201)
async def create_committee(
    body: CommitteeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR))
):
    from app.utils.cache import cache
    cache.invalidate()
    existing = db.query(Committee).filter(Committee.code == body.code).first()
    if existing:
        raise HTTPException(status_code=409, detail="Committee code already exists")
    
    committee = Committee(**body.model_dump())
    db.add(committee)
    
    log = AuditLog(
        user_id=current_user.id,
        action="committee_created",
        entity_type="committee",
        description=f"Committee '{body.name}' created"
    )
    db.add(log)
    db.commit()
    db.refresh(committee)
    result = enrich_committee(committee, db)

    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("committees", "created", result)
    except Exception:
        pass
    return result


@router.get("/{committee_id}", response_model=dict)
async def get_committee(
    committee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    committee = db.query(Committee).filter(Committee.id == committee_id).first()
    if not committee:
        raise HTTPException(status_code=404, detail="Committee not found")
    return enrich_committee(committee, db)


@router.put("/{committee_id}", response_model=dict)
async def update_committee(
    committee_id: str,
    body: CommitteeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR))
):
    from app.utils.cache import cache
    cache.invalidate()
    committee = db.query(Committee).filter(Committee.id == committee_id).first()
    if not committee:
        raise HTTPException(status_code=404, detail="Committee not found")
    
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(committee, key, value)
    
    log = AuditLog(
        user_id=current_user.id,
        action="committee_updated",
        entity_type="committee",
        entity_id=committee_id,
        description=f"Committee '{committee.name}' updated"
    )
    db.add(log)
    db.commit()
    db.refresh(committee)

    result = enrich_committee(committee, db)
    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("committees", "updated", result)
    except Exception:
        pass
    return result


@router.delete("/{committee_id}", status_code=204)
async def delete_committee(
    committee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR))
):
    from app.utils.cache import cache
    cache.invalidate()
    committee = db.query(Committee).filter(Committee.id == committee_id).first()
    if not committee:
        raise HTTPException(status_code=404, detail="Committee not found")
    db.delete(committee)
    db.commit()

    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("committees", "deleted", {"id": committee_id})
    except Exception:
        pass


# ─── Committee Members ────────────────────────────────────────────────────────

@router.get("/{committee_id}/members", response_model=List[dict])
async def get_committee_members(
    committee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    members = db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == committee_id
    ).all()
    
    result = []
    for cm in members:
        tenure_status, days_remaining = calculate_tenure_status(cm.end_date)
        result.append({
            "id": cm.id,
            "committee_id": cm.committee_id,
            "member_id": cm.member_id,
            "role": cm.role,
            "start_date": str(cm.start_date) if cm.start_date else None,
            "end_date": str(cm.end_date) if cm.end_date else None,
            "is_active": cm.is_active,
            "appointment_reference": cm.appointment_reference,
            "created_at": str(cm.created_at) if cm.created_at else None,
            "tenure_status": tenure_status,
            "days_remaining": days_remaining,
            "member": {
                "id": cm.member.id,
                "name": cm.member.name,
                "email": cm.member.email,
                "designation": cm.member.designation,
                "department": cm.member.department,
                "member_type": cm.member.member_type,
                "gender": cm.member.gender,
                "is_external": cm.member.is_external,
                "is_student": cm.member.is_student,
                "status": cm.member.status
            } if cm.member else None
        })
    return result


@router.post("/{committee_id}/members", response_model=dict, status_code=201)
async def add_committee_member(
    committee_id: str,
    body: CommitteeMemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    # Check committee exists
    committee = db.query(Committee).filter(Committee.id == committee_id).first()
    if not committee:
        raise HTTPException(status_code=404, detail="Committee not found")
    
    # Check member exists
    member = db.query(Member).filter(Member.id == body.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Check not already added
    existing = db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == committee_id,
        CommitteeMember.member_id == body.member_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Member already in committee")
    
    cm = CommitteeMember(
        committee_id=committee_id,
        member_id=body.member_id,
        role=body.role,
        start_date=body.start_date,
        end_date=body.end_date,
        appointment_reference=body.appointment_reference,
        is_active=True
    )
    db.add(cm)
    
    log = AuditLog(
        user_id=current_user.id,
        action="member_added",
        entity_type="committee_member",
        entity_id=committee_id,
        description=f"Member '{member.name}' added to '{committee.name}'"
    )
    db.add(log)
    db.commit()
    db.refresh(cm)
    
    tenure_status, days_remaining = calculate_tenure_status(cm.end_date)
    return {
        "id": cm.id,
        "committee_id": cm.committee_id,
        "member_id": cm.member_id,
        "role": cm.role,
        "is_active": cm.is_active,
        "tenure_status": tenure_status,
        "days_remaining": days_remaining
    }


@router.put("/{committee_id}/members/{member_id}", response_model=dict)
async def update_committee_member(
    committee_id: str,
    member_id: str,
    body: CommitteeMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    cm = db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == committee_id,
        CommitteeMember.member_id == member_id
    ).first()
    if not cm:
        raise HTTPException(status_code=404, detail="Committee member not found")
    
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cm, key, value)
    
    db.commit()
    db.refresh(cm)
    tenure_status, days_remaining = calculate_tenure_status(cm.end_date)
    return {"id": cm.id, "tenure_status": tenure_status, "days_remaining": days_remaining}


@router.delete("/{committee_id}/members/{member_id}", status_code=204)
async def remove_committee_member(
    committee_id: str,
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR))
):
    cm = db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == committee_id,
        CommitteeMember.member_id == member_id
    ).first()
    if not cm:
        raise HTTPException(status_code=404, detail="Committee member not found")
    db.delete(cm)
    db.commit()


# ─── Committee Requirements ───────────────────────────────────────────────────

@router.get("/{committee_id}/requirements", response_model=List[RequirementOut])
async def get_requirements(
    committee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(CommitteeRequirement).filter(
        CommitteeRequirement.committee_id == committee_id
    ).all()


@router.post("/{committee_id}/requirements", response_model=RequirementOut, status_code=201)
async def add_requirement(
    committee_id: str,
    body: RequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR))
):
    req = CommitteeRequirement(committee_id=committee_id, **body.model_dump())
    db.add(req)
    db.commit()
    db.refresh(req)
    return req
