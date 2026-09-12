"""
Vignan CommiAI — Notification Automation Scheduler
Runs periodic background compliance & reminder sweeps across meetings, tenures, action items, and quorum thresholds.
"""
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import Meeting, Committee, CommitteeMember, Member, ActionItem, MeetingAttendance, MeetingStatus, ActionStatus
from app.notifications.event_service import emit_event

logger = logging.getLogger(__name__)

_scheduler_task = None
_running = False

def run_scheduled_sweeps():
    """Performs full compliance and reminder checks across the database."""
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        logger.info(f"Running automated notification scheduler sweep at {now.isoformat()}")

        # ── 1. Meeting 48h & 24h Reminders ──
        today_d = now.date()
        upcoming_meetings = db.query(Meeting).filter(
            Meeting.status.in_([MeetingStatus.SCHEDULED, MeetingStatus.DRAFT]),
            Meeting.meeting_date >= today_d
        ).all()

        for m in upcoming_meetings:
            if not m.meeting_date:
                continue
            days_until = (m.meeting_date - today_d).days

            # 48 hours (2 days)
            if days_until == 2:
                emit_event("MEETING_48_HOURS", {
                    "meeting_id": str(m.id),
                    "committee_id": str(m.committee_id),
                    "committee_name": m.committee.name if m.committee else "Statutory Committee",
                    "meeting_date": str(m.meeting_date),
                    "start_time": str(m.start_time) if m.start_time else "10:00 AM",
                    "venue": m.location or "Conference Hall",
                    "hours_remaining": "48",
                    "rsvp_url": f"http://localhost:5173/meetings/{m.id}"
                }, db)

            # 24 hours (1 day)
            if days_until == 1:
                emit_event("MEETING_24_HOURS", {
                    "meeting_id": str(m.id),
                    "committee_id": str(m.committee_id),
                    "committee_name": m.committee.name if m.committee else "Statutory Committee",
                    "meeting_date": str(m.meeting_date),
                    "start_time": str(m.start_time) if m.start_time else "10:00 AM",
                    "venue": m.location or "Conference Hall",
                    "hours_remaining": "24",
                    "rsvp_url": f"http://localhost:5173/meetings/{m.id}"
                }, db)

        # ── 2. Member Tenure Expiry Check (30 days & 15 days) ──
        memberships = db.query(CommitteeMember).filter(
            CommitteeMember.is_active == True,
            CommitteeMember.end_date != None
        ).all()

        for cm in memberships:
            end_date = cm.end_date
            if hasattr(end_date, 'date'):
                if isinstance(end_date, datetime):
                    end_d = end_date.date()
                else:
                    end_d = end_date
            else:
                end_d = end_date
                
            days_left = (end_d - now.date()).days

            if 25 <= days_left <= 30:
                emit_event("TENURE_30_DAYS", {
                    "committee_id": str(cm.committee_id),
                    "member_id": str(cm.member_id),
                    "member_name": cm.member.name if cm.member else "Member",
                    "committee_name": cm.committee.name if cm.committee else "Committee",
                    "role": cm.role or "Member",
                    "expiry_date": str(end_d),
                    "days_remaining": days_left,
                    "committee_url": f"http://localhost:5173/committees/{cm.committee_id}"
                }, db)

            if 10 <= days_left <= 15:
                emit_event("TENURE_15_DAYS", {
                    "committee_id": str(cm.committee_id),
                    "member_id": str(cm.member_id),
                    "member_name": cm.member.name if cm.member else "Member",
                    "committee_name": cm.committee.name if cm.committee else "Committee",
                    "role": cm.role or "Member",
                    "expiry_date": str(end_d),
                    "days_remaining": days_left,
                    "committee_url": f"http://localhost:5173/committees/{cm.committee_id}"
                }, db)

        # ── 3. Action Items 3-Day & Overdue Checks ──
        open_actions = db.query(ActionItem).filter(
            ActionItem.status.in_([ActionStatus.PENDING, ActionStatus.IN_PROGRESS])
        ).all()

        for act in open_actions:
            if not act.due_date:
                continue
            due = act.due_date
            if isinstance(due, datetime):
                due_date = due.date()
            else:
                due_date = due
            days_until = (due_date - now.date()).days

            if days_until == 3:
                emit_event("ACTION_3_DAYS_BEFORE", {
                    "action_id": str(act.id),
                    "committee_id": str(act.committee_id) if act.committee_id else None,
                    "committee_name": act.committee.name if act.committee else "Statutory Body",
                    "action_title": act.title,
                    "due_date": str(due_date),
                    "status": str(act.status),
                    "days_remaining": 3,
                    "action_url": "http://localhost:5173/actions"
                }, db)

            if days_until < 0:
                emit_event("ACTION_OVERDUE", {
                    "action_id": str(act.id),
                    "committee_id": str(act.committee_id) if act.committee_id else None,
                    "committee_name": act.committee.name if act.committee else "Statutory Body",
                    "action_title": act.title,
                    "due_date": str(due_date),
                    "status": "OVERDUE",
                    "days_remaining": abs(days_until),
                    "action_url": "http://localhost:5173/actions"
                }, db)

        # ── 4. Overdue Statutory Meetings Check ──
        committees = db.query(Committee).filter(Committee.status == "ACTIVE").all()
        for comm in committees:
            latest_meeting = db.query(Meeting).filter(
                Meeting.committee_id == comm.id,
                Meeting.status.in_([MeetingStatus.COMPLETED, MeetingStatus.CANCELLED])
            ).order_by(Meeting.meeting_date.desc()).first()

            freq = comm.meeting_frequency or 1
            unit = (comm.frequency_unit or "MONTH").upper()
            interval_days = freq * (7 if unit == "WEEK" else 30 if unit == "MONTH" else 90 if unit == "QUARTER" else 365)

            ref_date = latest_meeting.meeting_date if (latest_meeting and latest_meeting.meeting_date) else None
            if ref_date:
                overdue_delta = (now.date() - ref_date).days
                if overdue_delta > (interval_days + 15):
                    emit_event("MEETING_OVERDUE", {
                        "committee_id": str(comm.id),
                        "committee_name": comm.name,
                        "required_frequency": f"Every {freq} {unit.lower()}(s)",
                        "last_meeting_date": str(ref_date),
                        "days_overdue": int(overdue_delta - interval_days),
                        "meeting_url": f"http://localhost:5173/committees/{comm.id}"
                    }, db)

    except Exception as e:
        logger.error(f"Error executing notification scheduler sweep: {e}", exc_info=True)
    finally:
        db.close()


async def _scheduler_loop(interval_seconds: int = 300):
    """Background async worker loop."""
    global _running
    _running = True
    logger.info(f"Notification background scheduler loop started (interval={interval_seconds}s)")
    # Wait 10 seconds after server startup before running the first sweep
    await asyncio.sleep(10)
    while _running:
        try:
            await asyncio.to_thread(run_scheduled_sweeps)
        except Exception as e:
            logger.error(f"Scheduler loop error: {e}")
        await asyncio.sleep(interval_seconds)


def start_scheduler(interval_seconds: int = 300):
    """Starts the async background scheduler."""
    global _scheduler_task
    if _scheduler_task is None or _scheduler_task.done():
        loop = asyncio.get_event_loop()
        _scheduler_task = loop.create_task(_scheduler_loop(interval_seconds))
        logger.info("Notification scheduler initialized.")


def stop_scheduler():
    """Stops the scheduler."""
    global _running, _scheduler_task
    _running = False
    if _scheduler_task and not _scheduler_task.done():
        _scheduler_task.cancel()
        logger.info("Notification scheduler stopped.")
