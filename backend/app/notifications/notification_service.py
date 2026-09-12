"""
Vignan CommiAI — Core Notification & Email Dispatch Service
Coordinates template rendering, delivery via Brevo, database logging (email_logs, notifications, audit_logs),
and failure resiliency.
"""
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import (
    Notification, EmailLog, NotificationRule, AuditLog, User,
    Committee, Meeting, ActionItem
)
from app.notifications.template_service import render_template
from app.notifications.rule_engine import (
    SERVICE_NAME_BY_EVENT, is_rule_enabled, generate_idempotency_key, is_duplicate_dispatch
)
from app.services.email_service import send_email

logger = logging.getLogger(__name__)

def create_in_app_notification(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "INFO",  # INFO, SUCCESS, WARNING, CRITICAL
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    channel: str = "BOTH"
) -> Notification:
    """Stores an in-app notification record for the user."""
    notif = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
        channel=channel,
        status="UNREAD",
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def dispatch_service_notification(
    event_type: str,
    payload: Dict[str, Any],
    recipients_data: Dict[str, Any],
    db: Session,
    force: bool = False
) -> Dict[str, Any]:
    """
    Executes the full automated email & in-app notification flow:
    1. Check if rule is enabled
    2. Render template for the service
    3. Iterate through recipients, check idempotency, dispatch email
    4. Log EmailLog (SENT / FAILED)
    5. Create matching in-app Notification records for active users
    6. Record AuditLog
    """
    service_name = SERVICE_NAME_BY_EVENT.get(event_type, "Institutional Notification Service")

    if not force and not is_rule_enabled(event_type, db):
        logger.info(f"Rule for {event_type} ({service_name}) is currently disabled. Skipping dispatch.")
        return {"status": "skipped", "reason": "rule_disabled"}

    # Render email content
    rendered = render_template(service_name, payload)
    subject = rendered["subject"]
    html_content = rendered["html"]

    recipients = recipients_data.get("recipients", [])
    cc_list = recipients_data.get("cc", [])
    cc_string = ", ".join(cc_list) if cc_list else None

    dispatch_results = []

    for r in recipients:
        email = r.get("email")
        if not email:
            continue

        member_name = r.get("name", "Committee Stakeholder")
        idempotency_key = generate_idempotency_key(event_type, payload, email)

        if not force and is_duplicate_dispatch(idempotency_key, db):
            logger.info(f"Duplicate email prevented by idempotency key: {idempotency_key}")
            dispatch_results.append({
                "email": email,
                "status": "SKIPPED_DUPLICATE",
                "idempotency_key": idempotency_key
            })
            continue

        # In-app notification creation if user exists
        user = db.query(User).filter(User.email.ilike(email)).first()
        notif_record = None
        
        # Determine notification type
        notif_type = "CRITICAL" if ("DEFICIT" in event_type or "OVERDUE" in event_type or "RISK" in subject.upper()) else \
                     "WARNING" if ("WARNING" in subject.upper() or "OVERRIDE" in event_type or "EXPIRY" in subject.upper()) else \
                     "SUCCESS" if ("RATIFIED" in subject.upper() or "APPROVED" in subject.upper()) else "INFO"

        if user:
            notif_record = create_in_app_notification(
                db=db,
                user_id=user.id,
                title=subject,
                message=f"[{service_name}] Notification regarding {payload.get('committee_name', 'statutory governance')}.",
                notification_type=notif_type,
                entity_type=payload.get("entity_type", "meeting" if "meeting_id" in payload else "committee"),
                entity_id=payload.get("meeting_id") or payload.get("committee_id") or payload.get("action_id"),
                channel="BOTH"
            )

        # Check if log already exists with this idempotency key
        existing_log = db.query(EmailLog).filter(EmailLog.idempotency_key == idempotency_key).first()
        if existing_log:
            if not force and existing_log.status == "SENT":
                logger.info(f"Duplicate email prevented by idempotency key: {idempotency_key}")
                dispatch_results.append({
                    "email": email,
                    "status": "SKIPPED_DUPLICATE",
                    "idempotency_key": idempotency_key
                })
                continue
            email_log = existing_log
            email_log.status = "PENDING"
            email_log.error_message = None
            if notif_record:
                email_log.notification_id = notif_record.id
        else:
            email_log = EmailLog(
                notification_id=notif_record.id if notif_record else None,
                service_name=service_name,
                event_type=event_type,
                recipient_email=email,
                cc_emails=cc_string,
                subject=subject,
                template_name=service_name,
                idempotency_key=idempotency_key,
                status="PENDING"
            )
            db.add(email_log)
        
        db.commit()
        db.refresh(email_log)

        # Dispatch via Brevo SMTP / API
        try:
            # Combine recipient + CC if needed
            all_targets = [email]
            if cc_list:
                all_targets.extend(cc_list)

            res = send_email(
                recipients=all_targets,
                subject=subject,
                html_content=html_content
            )

            email_log.status = "SENT"
            email_log.sent_at = datetime.now(timezone.utc)
            db.commit()

            dispatch_results.append({
                "email": email,
                "status": "SENT",
                "id": email_log.id
            })

        except Exception as err:
            logger.error(f"Failed to dispatch email to {email}: {err}")
            email_log.status = "FAILED"
            email_log.error_message = str(err)
            db.commit()

            dispatch_results.append({
                "email": email,
                "status": "FAILED",
                "error": str(err),
                "id": email_log.id
            })

    # Record institutional AuditLog
    sent_count = len([d for d in dispatch_results if d["status"] == "SENT"])
    failed_count = len([d for d in dispatch_results if d["status"] == "FAILED"])

    audit = AuditLog(
        entity_type="NOTIFICATION",
        entity_id=payload.get("meeting_id") or payload.get("committee_id") or None,
        action=f"EMAIL_DISPATCH:{event_type}",
        description=f"[{service_name}] Dispatched {event_type} to {len(recipients)} recipients ({sent_count} delivered, {failed_count} failed)."
    )
    db.add(audit)
    db.commit()

    return {
        "status": "completed",
        "service_name": service_name,
        "event_type": event_type,
        "subject": subject,
        "sent_count": sent_count,
        "failed_count": failed_count,
        "results": dispatch_results
    }

def retry_failed_email_log(log_id: str, db: Session) -> Dict[str, Any]:
    """Retries sending a previously failed email log."""
    email_log = db.query(EmailLog).filter(EmailLog.id == log_id).first()
    if not email_log:
        return {"status": "error", "message": "Email log not found"}

    # Re-render template
    rendered = render_template(email_log.service_name, {"title": email_log.subject})
    html_content = rendered["html"]

    try:
        send_email(
            recipients=[email_log.recipient_email],
            subject=email_log.subject,
            html_content=html_content
        )
        email_log.status = "SENT"
        email_log.error_message = None
        email_log.sent_at = datetime.now(timezone.utc)
        db.commit()
        return {"status": "success", "message": f"Successfully retried email to {email_log.recipient_email}"}
    except Exception as e:
        email_log.status = "FAILED"
        email_log.error_message = f"Retry failed: {str(e)}"
        db.commit()
        return {"status": "failed", "error": str(e)}
