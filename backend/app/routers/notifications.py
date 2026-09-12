"""
Vignan CommiAI — Notifications, Email Logs & Rule Management Router
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel

from app.database import get_db
from app.models.models import Notification, EmailLog, NotificationRule, User, UserRole
from app.auth.auth import get_current_user
from app.notifications.rule_engine import ensure_default_rules, DEFAULT_RULES
from app.notifications.notification_service import retry_failed_email_log
from app.notifications.event_service import emit_event
from app.notifications.scheduler import run_scheduled_sweeps

router = APIRouter(prefix="/notifications", tags=["Notifications & Automated Emails"])


class RuleUpdate(BaseModel):
    enabled: bool
    trigger_config: Optional[Dict[str, Any]] = None


class TriggerServiceRequest(BaseModel):
    service_name: str
    event_type: str
    recipient_email: Optional[str] = None
    recipient_name: Optional[str] = None
    payload: Dict[str, Any] = {}
    force: bool = True


# ─── In-App Notifications ───────────────────────────────────────────────────

@router.get("")
def get_user_notifications(
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetches in-app notifications for the logged in user or admin."""
    query = db.query(Notification)
    if current_user.role not in [UserRole.REGISTRAR, UserRole.ADMIN, UserRole.IQAC]:
        query = query.filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id if current_user.role not in [UserRole.REGISTRAR, UserRole.ADMIN] else True,
        Notification.is_read == False
    ).count()

    return {
        "unread_count": unread_count,
        "items": notifications
    }


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Marks a single notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    notif.status = "READ"
    db.commit()
    return {"status": "success", "id": notification_id}


@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Marks all notifications for current user as read."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True, "status": "READ"}, synchronize_session=False)
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}


# ─── Email Logs & Failure Management ─────────────────────────────────────────

@router.get("/logs")
def get_email_logs(
    limit: int = Query(50, ge=1, le=200),
    status_filter: Optional[str] = Query(None),
    service_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns email delivery audit logs with statistics."""
    query = db.query(EmailLog)
    if status_filter:
        query = query.filter(EmailLog.status == status_filter.upper())
    if service_filter:
        query = query.filter(EmailLog.service_name.ilike(f"%{service_filter}%"))

    logs = query.order_by(EmailLog.created_at.desc()).limit(limit).all()

    # Aggregate stats
    total_sent = db.query(EmailLog).filter(EmailLog.status == "SENT").count()
    total_failed = db.query(EmailLog).filter(EmailLog.status == "FAILED").count()
    total_pending = db.query(EmailLog).filter(EmailLog.status.in_(["PENDING", "SENDING"])).count()

    return {
        "stats": {
            "sent": total_sent,
            "failed": total_failed,
            "pending": total_pending,
            "total": total_sent + total_failed + total_pending
        },
        "logs": logs
    }


@router.post("/logs/{log_id}/retry")
def retry_email(
    log_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retries sending a failed email."""
    if current_user.role not in [UserRole.REGISTRAR, UserRole.ADMIN, UserRole.IQAC, UserRole.CONVENER]:
        raise HTTPException(status_code=403, detail="Not authorized to retry email dispatch")
    
    result = retry_failed_email_log(log_id, db)
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    return result


# ─── Automation Rules ────────────────────────────────────────────────────────

@router.get("/rules")
def get_automation_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns all 13 automated service rules."""
    ensure_default_rules(db)
    rules = db.query(NotificationRule).order_by(NotificationRule.created_at.asc()).all()
    return rules


@router.put("/rules/{rule_id}")
def update_automation_rule(
    rule_id: str,
    body: RuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Enables or disables an automation rule."""
    if current_user.role not in [UserRole.REGISTRAR, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only Registrar or Admin can modify global automation rules")
    
    rule = db.query(NotificationRule).filter(NotificationRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Notification rule not found")
    
    rule.enabled = body.enabled
    if body.trigger_config is not None:
        rule.trigger_config = body.trigger_config
    rule.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(rule)
    return rule


# ─── Manual Trigger / Live Demo Dispatcher ───────────────────────────────────

@router.post("/trigger-service")
def trigger_email_service(
    body: TriggerServiceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Manually triggers any of the 13 automated email services for live demonstration or manual execution.
    """
    payload = body.payload.copy()
    if body.recipient_email:
        payload["recipient_email"] = body.recipient_email
    if body.recipient_name:
        payload["recipient_name"] = body.recipient_name

    res = emit_event(
        event_type=body.event_type,
        payload=payload,
        db=db,
        force=body.force
    )
    return res


@router.post("/run-sweep")
def trigger_manual_scheduler_sweep(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Runs on-demand background scheduler sweep."""
    run_scheduled_sweeps()
    return {"status": "success", "message": "Scheduler compliance sweep completed successfully"}
