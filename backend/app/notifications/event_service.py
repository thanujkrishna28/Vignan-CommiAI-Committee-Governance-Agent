"""
Vignan CommiAI — Event Notification Service
Central event bus for institutional lifecycle triggers. Resolves recipients and dispatches notifications.
"""
import logging
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.notifications.recipient_service import resolve_recipients_for_event
from app.notifications.notification_service import dispatch_service_notification

logger = logging.getLogger(__name__)

def emit_event(event_type: str, payload: Dict[str, Any], db: Session, force: bool = False) -> Dict[str, Any]:
    """
    Central event emission function.
    Flow:
    1. Resolve target recipients & CC list based on event and database relationships
    2. Dispatch notifications (Email + In-App + EmailLog + AuditLog)
    """
    logger.info(f"Emitting notification event: {event_type} with payload: {payload}")
    
    # 1. Resolve recipients
    recipients_data = resolve_recipients_for_event(event_type, payload, db)
    
    # If custom recipient was passed in payload (e.g. testing or specific override), include it
    if payload.get("recipient_email"):
        recipients_data["recipients"].append({
            "name": payload.get("recipient_name", "Recipient"),
            "email": payload.get("recipient_email")
        })

    # 2. Dispatch
    result = dispatch_service_notification(
        event_type=event_type,
        payload=payload,
        recipients_data=recipients_data,
        db=db,
        force=force
    )
    
    return result
