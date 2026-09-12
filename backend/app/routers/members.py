from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Member, CommitteeMember, Committee, AuditLog, User, UserRole
from app.auth.auth import get_current_user, require_role
from app.schemas.schemas import MemberCreate, MemberUpdate, MemberOut
from app.services.compliance_engine import calculate_tenure_status

router = APIRouter(prefix="/api/members", tags=["members"])


@router.get("", response_model=List[dict])
async def list_members(
    search: Optional[str] = None,
    member_type: Optional[str] = None,
    department: Optional[str] = None,
    committee_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.utils.cache import cache
    cache_key = f"members:{search}:{member_type}:{department}:{committee_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    q = db.query(Member)
    
    if search:
        q = q.filter(Member.name.ilike(f"%{search}%"))
    if member_type:
        q = q.filter(Member.member_type == member_type)
    if department:
        q = q.filter(Member.department.ilike(f"%{department}%"))
    
    members = q.order_by(Member.name).all()
    if not members:
        cache.set(cache_key, [], ttl_seconds=15)
        return []
        
    member_ids = [m.id for m in members]
    
    # 1 single batch query for active memberships
    all_memberships = db.query(CommitteeMember).filter(
        CommitteeMember.member_id.in_(member_ids),
        CommitteeMember.is_active == True
    ).all()
    
    memberships_by_member = {}
    for ms in all_memberships:
        memberships_by_member.setdefault(ms.member_id, []).append(ms)
    
    result = []
    for m in members:
        memberships = memberships_by_member.get(m.id, [])
        
        tenure_status = "ACTIVE"
        days_remaining = None
        
        if memberships:
            earliest_expiry = min(
                [cm.end_date for cm in memberships if cm.end_date],
                default=None
            )
            if earliest_expiry:
                tenure_status, days_remaining = calculate_tenure_status(earliest_expiry)
        
        result.append({
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "phone": m.phone,
            "designation": m.designation,
            "department": m.department,
            "organization": m.organization,
            "member_type": m.member_type,
            "gender": m.gender,
            "is_external": m.is_external,
            "is_student": m.is_student,
            "status": m.status,
            "created_at": str(m.created_at) if m.created_at else None,
            "committee_count": len(memberships),
            "committees": [
                {
                    "id": ms.committee_id,
                    "role": ms.role,
                    "start_date": str(ms.start_date) if ms.start_date else None,
                    "end_date": str(ms.end_date) if ms.end_date else None
                }
                for ms in memberships
            ],
            "tenure_status": tenure_status,
            "days_remaining": days_remaining
        })
    
    cache.set(cache_key, result, ttl_seconds=15)
    return result


@router.post("", response_model=dict, status_code=201)
async def create_member(
    body: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    member = Member(**body.model_dump())
    db.add(member)
    
    log = AuditLog(
        user_id=current_user.id,
        action="member_created",
        entity_type="member",
        description=f"Member '{body.name}' created"
    )
    db.add(log)
    db.commit()
    db.refresh(member)
    result = {
        "id": member.id, "name": member.name, "email": member.email,
        "designation": member.designation, "department": member.department,
        "member_type": member.member_type, "status": member.status
    }
    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("members", "created", result)
    except Exception:
        pass
    return result


@router.get("/{member_id}", response_model=dict)
async def get_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    memberships = db.query(CommitteeMember).filter(
        CommitteeMember.member_id == member_id
    ).all()
    
    return {
        "id": member.id,
        "name": member.name,
        "email": member.email,
        "phone": member.phone,
        "designation": member.designation,
        "department": member.department,
        "organization": member.organization,
        "member_type": member.member_type,
        "gender": member.gender,
        "is_external": member.is_external,
        "is_student": member.is_student,
        "status": member.status,
        "committees": [
            {
                "id": ms.committee_id,
                "committee_name": ms.committee.name if ms.committee else None,
                "role": ms.role,
                "start_date": str(ms.start_date) if ms.start_date else None,
                "end_date": str(ms.end_date) if ms.end_date else None,
                "is_active": ms.is_active
            }
            for ms in memberships
        ]
    }


@router.put("/{member_id}", response_model=dict)
async def update_member(
    member_id: str,
    body: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(member, key, value)
    
    db.commit()
    db.refresh(member)
    result = {"id": member.id, "name": member.name, "status": member.status}
    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("members", "updated", result)
    except Exception:
        pass
    return result


@router.delete("/{member_id}", status_code=204)
async def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR))
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()

    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("members", "deleted", {"id": member_id})
    except Exception:
        pass
