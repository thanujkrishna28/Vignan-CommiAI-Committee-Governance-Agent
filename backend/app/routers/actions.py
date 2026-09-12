from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models import (
    ActionItem, Committee, Member, Meeting, AuditLog,
    User, UserRole, ActionStatus, ActionPriority
)
from app.auth.auth import get_current_user, require_role
from app.schemas.schemas import ActionItemCreate, ActionItemUpdate

router = APIRouter(prefix="/api/actions", tags=["actions"])


def enrich_action(action: ActionItem, db: Session) -> dict:
    today = date.today()
    is_overdue = (
        action.status in [ActionStatus.PENDING, ActionStatus.IN_PROGRESS] and
        action.due_date and action.due_date < today
    )
    
    # Auto-update overdue status
    if is_overdue and action.status != ActionStatus.OVERDUE:
        action.status = ActionStatus.OVERDUE
        db.commit()
    
    committee_name = action.committee.name if action.committee else None
    owner_name = action.owner.name if action.owner else None
    meeting_title = action.meeting.title if action.meeting else None
    
    return {
        "id": action.id,
        "committee_id": action.committee_id,
        "meeting_id": action.meeting_id,
        "minute_id": action.minute_id,
        "title": action.title,
        "description": action.description,
        "owner_id": action.owner_id,
        "due_date": str(action.due_date) if action.due_date else None,
        "priority": action.priority,
        "status": action.status,
        "remarks": action.remarks,
        "completed_at": str(action.completed_at) if action.completed_at else None,
        "created_at": str(action.created_at) if action.created_at else None,
        "committee_name": committee_name,
        "owner_name": owner_name,
        "meeting_title": meeting_title,
        "is_overdue": is_overdue
    }


@router.get("", response_model=List[dict])
async def list_actions(
    committee_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    owner_id: Optional[str] = None,
    overdue_only: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.utils.cache import cache
    cache_key = f"actions:{committee_id}:{status}:{priority}:{owner_id}:{overdue_only}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from sqlalchemy.orm import joinedload
    q = db.query(ActionItem).options(
        joinedload(ActionItem.committee),
        joinedload(ActionItem.owner),
        joinedload(ActionItem.meeting)
    )
    
    if committee_id:
        q = q.filter(ActionItem.committee_id == committee_id)
    if status:
        q = q.filter(ActionItem.status == status)
    if priority:
        q = q.filter(ActionItem.priority == priority)
    if owner_id:
        q = q.filter(ActionItem.owner_id == owner_id)
    if overdue_only:
        today = date.today()
        q = q.filter(
            ActionItem.due_date < today,
            ActionItem.status.in_([ActionStatus.PENDING, ActionStatus.IN_PROGRESS, ActionStatus.OVERDUE])
        )
    
    actions = q.order_by(ActionItem.due_date.asc()).all()
    today = date.today()
    result = []
    for a in actions:
        is_overdue = (
            a.status in [ActionStatus.PENDING, ActionStatus.IN_PROGRESS] and
            a.due_date and a.due_date < today
        )
        result.append({
            "id": a.id,
            "committee_id": a.committee_id,
            "meeting_id": a.meeting_id,
            "minute_id": a.minute_id,
            "title": a.title,
            "description": a.description,
            "owner_id": a.owner_id,
            "due_date": str(a.due_date) if a.due_date else None,
            "priority": a.priority,
            "status": a.status,
            "remarks": a.remarks,
            "completed_at": str(a.completed_at) if a.completed_at else None,
            "created_at": str(a.created_at) if a.created_at else None,
            "committee_name": a.committee.name if a.committee else None,
            "owner_name": a.owner.name if a.owner else None,
            "meeting_title": a.meeting.title if a.meeting else None,
            "is_overdue": is_overdue
        })
    
    cache.set(cache_key, result, ttl_seconds=15)
    return result


@router.post("", response_model=dict, status_code=201)
async def create_action(
    body: ActionItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    action = ActionItem(
        **body.model_dump(),
        status=ActionStatus.PENDING
    )
    db.add(action)
    db.commit()
    db.refresh(action)

    try:
        from app.notifications.event_service import emit_event
        owner_member = db.query(Member).filter(Member.id == action.owner_id).first() if action.owner_id else None
        emit_event("ACTION_ASSIGNED", {
            "action_id": str(action.id),
            "committee_id": str(action.committee_id) if action.committee_id else None,
            "committee_name": action.committee.name if action.committee else "Statutory Body",
            "meeting_title": action.meeting.title if action.meeting else "Committee Deliberation",
            "action_title": action.title,
            "priority": str(action.priority),
            "due_date": str(action.due_date),
            "assigner": current_user.name,
            "owner_name": owner_member.name if owner_member else "Responsible Official",
            "owner_email": owner_member.email if owner_member else None,
            "action_url": "http://localhost:5173/action-items"
        }, db)
    except Exception:
        pass

    result = enrich_action(action, db)
    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("actions", "created", result)
    except Exception:
        pass

    return result


@router.get("/{action_id}", response_model=dict)
async def get_action(
    action_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    action = db.query(ActionItem).filter(ActionItem.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action item not found")
    return enrich_action(action, db)


@router.put("/{action_id}", response_model=dict)
async def update_action(
    action_id: str,
    body: ActionItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    action = db.query(ActionItem).filter(ActionItem.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    # Members can only update status and remarks of their own actions
    if current_user.role == UserRole.MEMBER:
        if body.status:
            action.status = body.status
        if body.remarks:
            action.remarks = body.remarks
        if body.status == ActionStatus.COMPLETED:
            action.completed_at = datetime.utcnow()
    else:
        update_data = body.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(action, key, value)
        if body.status == ActionStatus.COMPLETED and not action.completed_at:
            action.completed_at = datetime.utcnow()
    
    log = AuditLog(
        user_id=current_user.id,
        action="action_updated",
        entity_type="action_item",
        entity_id=action_id,
        description=f"Action '{action.title}' updated to status {action.status}"
    )
    db.add(log)
    db.commit()
    db.refresh(action)

    result = enrich_action(action, db)
    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("actions", "updated", result)
    except Exception:
        pass

    return result
