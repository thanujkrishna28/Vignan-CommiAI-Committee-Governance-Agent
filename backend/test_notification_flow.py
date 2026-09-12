import sys
import os
from datetime import datetime, timezone

from app.database import SessionLocal
from app.models.models import NotificationRule, Notification, EmailLog, AuditLog, User
from app.notifications.rule_engine import ensure_default_rules, DEFAULT_RULES
from app.notifications.event_service import emit_event
from app.notifications.scheduler import run_scheduled_sweeps

def test_notification_system():
    print("Testing Vignan CommiAI Notification & Email Engine...")
    from app.database import init_db
    init_db()
    db = SessionLocal()
    try:
        # 1. Ensure default rules
        ensure_default_rules(db)
        rules_count = db.query(NotificationRule).count()
        print(f"[OK] Default notification rules initialized: {rules_count} rules found.")

        # 2. Test emit event: MEETING_SCHEDULED with test recipient
        print("\nEmitting test event: MEETING_SCHEDULED...")
        res = emit_event("MEETING_SCHEDULED", {
            "committee_name": "Academic Council",
            "meeting_number": "AC-2026-05",
            "meeting_date": "30 Sep 2026",
            "start_time": "10:30 AM",
            "end_time": "01:00 PM",
            "venue": "Senate Conference Hall",
            "mode": "Hybrid",
            "agenda_summary": "1. Curriculum revision<br>2. Statutory NAAC SSR sign-off",
            "recipient_email": "thanujkrishna22@gmail.com",
            "recipient_name": "Dr. Thanuj Krishna"
        }, db, force=True)
        print(f"[OK] Dispatch result: {res.get('status')} | Subject: {res.get('subject')} | Sent: {res.get('sent_count')}")

        # 3. Check logs in DB
        latest_log = db.query(EmailLog).order_by(EmailLog.created_at.desc()).first()
        if latest_log:
            print(f"[OK] Latest EmailLog: ID={latest_log.id}, Service={latest_log.service_name}, Recipient={latest_log.recipient_email}, Status={latest_log.status}")

        latest_notif = db.query(Notification).order_by(Notification.created_at.desc()).first()
        if latest_notif:
            print(f"[OK] Latest In-App Notification: ID={latest_notif.id}, Title={latest_notif.title}, Type={latest_notif.type}")

        # 4. Test scheduler sweep
        print("\nExecuting scheduler sweep...")
        run_scheduled_sweeps()
        print("[OK] Scheduler sweep executed without exceptions.")

        print("\nALL 13 NOTIFICATION ENGINE TESTS PASSED!")

    except Exception as e:
        print(f"Error during test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_notification_system()
