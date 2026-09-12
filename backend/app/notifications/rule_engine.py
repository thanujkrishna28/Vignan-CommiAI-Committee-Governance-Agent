"""
Vignan CommiAI — Notification Rule Engine & Idempotency Manager
Enforces rule enablement, user preferences, and prevents duplicate notification dispatches.
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import NotificationRule, EmailLog

DEFAULT_RULES = [
    {"name": "Meeting Notice & Agenda Circular Service", "event_type": "MEETING_SCHEDULED", "enabled": True},
    {"name": "Attendance RSVP & Calendar Invite Service", "event_type": "MEETING_24_HOURS", "enabled": True},
    {"name": "Meeting Reschedule / Adjournment Alert Service", "event_type": "MEETING_UPDATED", "enabled": True},
    {"name": "Quorum Deficit Warning Service", "event_type": "QUORUM_DEFICIT", "enabled": True},
    {"name": "Authorized Quorum Override Audit Circular", "event_type": "QUORUM_OVERRIDE", "enabled": True},
    {"name": "Minutes Draft Approval Request Service", "event_type": "MINUTES_SUBMITTED_FOR_APPROVAL", "enabled": True},
    {"name": "Ratified Minutes Official Broadcast Service", "event_type": "MINUTES_APPROVED", "enabled": True},
    {"name": "Action Item Assignment Dispatcher", "event_type": "ACTION_ASSIGNED", "enabled": True},
    {"name": "Action Item Deadline & Escalation Reminder Service", "event_type": "ACTION_3_DAYS_BEFORE", "enabled": True},
    {"name": "Action Taken Report (ATR) Compilation Circular", "event_type": "ATR_GENERATION_REQUIRED", "enabled": True},
    {"name": "Member Tenure Expiry Early-Warning Service", "event_type": "TENURE_30_DAYS", "enabled": True},
    {"name": "Statutory Composition Deficit Alert Service", "event_type": "COMPOSITION_DEFICIT", "enabled": True},
    {"name": "Overdue Statutory Meeting Alert Service", "event_type": "MEETING_OVERDUE", "enabled": True},
]

SERVICE_NAME_BY_EVENT = {
    "MEETING_SCHEDULED": "Meeting Notice & Agenda Circular Service",
    "MEETING_48_HOURS": "Attendance RSVP & Calendar Invite Service",
    "MEETING_24_HOURS": "Attendance RSVP & Calendar Invite Service",
    "MEETING_UPDATED": "Meeting Reschedule / Adjournment Alert Service",
    "QUORUM_DEFICIT": "Quorum Deficit Warning Service",
    "QUORUM_OVERRIDE": "Authorized Quorum Override Audit Circular",
    "MINUTES_SUBMITTED_FOR_APPROVAL": "Minutes Draft Approval Request Service",
    "MINUTES_APPROVED": "Ratified Minutes Official Broadcast Service",
    "ACTION_ASSIGNED": "Action Item Assignment Dispatcher",
    "ACTION_3_DAYS_BEFORE": "Action Item Deadline & Escalation Reminder Service",
    "ACTION_DUE": "Action Item Deadline & Escalation Reminder Service",
    "ACTION_OVERDUE": "Action Item Deadline & Escalation Reminder Service",
    "ATR_GENERATION_REQUIRED": "Action Taken Report (ATR) Compilation Circular",
    "TENURE_30_DAYS": "Member Tenure Expiry Early-Warning Service",
    "TENURE_15_DAYS": "Member Tenure Expiry Early-Warning Service",
    "COMPOSITION_DEFICIT": "Statutory Composition Deficit Alert Service",
    "MEETING_OVERDUE": "Overdue Statutory Meeting Alert Service",
}

def ensure_default_rules(db: Session) -> None:
    """Seeds the 13 default rules into notification_rules table if not present."""
    for rule_def in DEFAULT_RULES:
        existing = db.query(NotificationRule).filter(NotificationRule.event_type == rule_def["event_type"]).first()
        if not existing:
            new_rule = NotificationRule(
                name=rule_def["name"],
                event_type=rule_def["event_type"],
                enabled=rule_def["enabled"],
                trigger_config={"priority": "CRITICAL" if "Deficit" in rule_def["name"] or "Quorum" in rule_def["name"] else "STANDARD"}
            )
            db.add(new_rule)
    db.commit()

def is_rule_enabled(event_type: str, db: Session) -> bool:
    """Checks if notification rule is enabled in DB."""
    # Statutory critical alerts are always delivered
    if event_type in ["COMPOSITION_DEFICIT", "QUORUM_OVERRIDE", "MINUTES_APPROVED"]:
        return True
        
    rule = db.query(NotificationRule).filter(NotificationRule.event_type == event_type).first()
    if rule is not None:
        return rule.enabled
    return True

def generate_idempotency_key(event_type: str, payload: Dict[str, Any], recipient_email: str) -> str:
    """
    Generates deterministic idempotency key to prevent duplicate email dispatch.
    Examples:
    MEETING_24_HOURS:{meeting_id}:{recipient_email}
    TENURE_30_DAYS:{committee_id}:{member_id}
    ACTION_3_DAYS:{action_id}
    """
    meeting_id = payload.get("meeting_id", "none")
    committee_id = payload.get("committee_id", "none")
    action_id = payload.get("action_id", "none")
    member_id = payload.get("member_id", "none")

    if event_type in ["MEETING_SCHEDULED", "MEETING_48_HOURS", "MEETING_24_HOURS", "MEETING_UPDATED", "QUORUM_DEFICIT", "QUORUM_OVERRIDE"]:
        return f"{event_type}:{meeting_id}:{recipient_email.lower()}"
    elif event_type in ["MINUTES_SUBMITTED_FOR_APPROVAL", "MINUTES_APPROVED"]:
        return f"{event_type}:{meeting_id}:{recipient_email.lower()}"
    elif event_type in ["ACTION_ASSIGNED", "ACTION_3_DAYS_BEFORE", "ACTION_DUE", "ACTION_OVERDUE"]:
        return f"{event_type}:{action_id}:{recipient_email.lower()}"
    elif event_type in ["TENURE_30_DAYS", "TENURE_15_DAYS"]:
        return f"{event_type}:{committee_id}:{member_id}:{recipient_email.lower()}"
    elif event_type == "COMPOSITION_DEFICIT":
        req_id = payload.get("requirement_name", "general")
        return f"{event_type}:{committee_id}:{req_id}:{recipient_email.lower()}"
    elif event_type == "MEETING_OVERDUE":
        return f"{event_type}:{committee_id}:{recipient_email.lower()}"
    else:
        return f"{event_type}:{recipient_email.lower()}"

def is_duplicate_dispatch(idempotency_key: str, db: Session) -> bool:
    """Checks if an email with this idempotency key was already SENT successfully."""
    existing = db.query(EmailLog).filter(
        EmailLog.idempotency_key == idempotency_key,
        EmailLog.status == "SENT"
    ).first()
    return existing is not None
