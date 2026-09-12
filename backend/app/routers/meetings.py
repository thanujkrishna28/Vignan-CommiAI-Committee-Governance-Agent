from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models import (
    Meeting, Committee, MeetingAttendance, CommitteeMember, QuorumRecord,
    Agenda, AgendaItem, Minutes, MinuteSection, AuditLog, User, UserRole,
    MeetingStatus, AttendanceStatus, MinutesStatus
)
from app.auth.auth import get_current_user, require_role
from app.schemas.schemas import (
    MeetingCreate, MeetingUpdate, MeetingOut,
    AttendanceBulk, AttendanceRecord, QuorumValidate,
    AgendaCreate, MinutesCreate, MinutesUpdate
)

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def enrich_meeting(meeting: Meeting, db: Session) -> dict:
    committee = db.query(Committee).filter(Committee.id == meeting.committee_id).first()
    quorum = db.query(QuorumRecord).filter(QuorumRecord.meeting_id == meeting.id).first()
    
    return {
        "id": meeting.id,
        "committee_id": meeting.committee_id,
        "committee_name": committee.name if committee else None,
        "title": meeting.title,
        "meeting_number": meeting.meeting_number,
        "meeting_date": str(meeting.meeting_date) if meeting.meeting_date else None,
        "start_time": str(meeting.start_time) if meeting.start_time else None,
        "end_time": str(meeting.end_time) if meeting.end_time else None,
        "location": meeting.location,
        "meeting_mode": meeting.meeting_mode,
        "meeting_link": meeting.meeting_link,
        "status": meeting.status,
        "agenda_text": meeting.agenda_text,
        "notes": meeting.notes,
        "created_at": str(meeting.created_at) if meeting.created_at else None,
        "quorum_met": quorum.quorum_met if quorum else None,
        "has_minutes": meeting.minutes is not None
    }


@router.get("", response_model=List[dict])
async def list_meetings(
    committee_id: Optional[str] = None,
    status: Optional[str] = None,
    upcoming: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.utils.cache import cache
    cache_key = f"meetings:{current_user.id}:{committee_id}:{status}:{upcoming}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from sqlalchemy.orm import joinedload
    q = db.query(Meeting).options(joinedload(Meeting.committee))
    
    if committee_id:
        q = q.filter(Meeting.committee_id == committee_id)
    if status:
        q = q.filter(Meeting.status == status)
    
    today = date.today()
    if upcoming:
        q = q.filter(Meeting.meeting_date >= today)
    
    # Role-based access
    if current_user.role in [UserRole.CONVENER, UserRole.MEMBER]:
        from app.models import UserCommitteeAccess
        access_records = db.query(UserCommitteeAccess.committee_id).filter(
            UserCommitteeAccess.user_id == current_user.id
        ).all()
        access_ids = [a[0] for a in access_records]
        q = q.filter(Meeting.committee_id.in_(access_ids))
    
    meetings = q.order_by(Meeting.meeting_date.desc()).all()
    if not meetings:
        cache.set(cache_key, [], ttl_seconds=15)
        return []
        
    meeting_ids = [m.id for m in meetings]
    
    # 1 single batch query for quorum records
    quorum_map = {
        q_rec.meeting_id: q_rec.quorum_met
        for q_rec in db.query(QuorumRecord).filter(QuorumRecord.meeting_id.in_(meeting_ids)).all()
    }
    
    result = [
        {
            "id": m.id,
            "committee_id": m.committee_id,
            "committee_name": m.committee.name if m.committee else None,
            "title": m.title,
            "meeting_number": m.meeting_number,
            "meeting_date": str(m.meeting_date) if m.meeting_date else None,
            "start_time": str(m.start_time) if m.start_time else None,
            "end_time": str(m.end_time) if m.end_time else None,
            "location": m.location,
            "meeting_mode": m.meeting_mode,
            "meeting_link": m.meeting_link,
            "status": m.status,
            "agenda_text": m.agenda_text,
            "notes": m.notes,
            "created_at": str(m.created_at) if m.created_at else None,
            "quorum_met": quorum_map.get(m.id),
            "has_minutes": m.minutes is not None
        }
        for m in meetings
    ]
    cache.set(cache_key, result, ttl_seconds=15)
    return result


@router.post("", response_model=dict, status_code=201)
async def create_meeting(
    body: MeetingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    committee = db.query(Committee).filter(Committee.id == body.committee_id).first()
    if not committee:
        raise HTTPException(status_code=404, detail="Committee not found")
    
    meeting = Meeting(
        **body.model_dump(),
        created_by=current_user.id,
        status=MeetingStatus.SCHEDULED if body.meeting_date else MeetingStatus.DRAFT
    )
    db.add(meeting)
    
    log = AuditLog(
        user_id=current_user.id,
        action="meeting_created",
        entity_type="meeting",
        description=f"Meeting '{body.title}' created for {committee.name}"
    )
    db.add(log)
    db.commit()
    db.refresh(meeting)

    # Emit MEETING_SCHEDULED event in the background for instant HTTP response
    if meeting.status == MeetingStatus.SCHEDULED:
        def _send_meeting_notification(m_id, c_id, c_name, m_num, m_date, s_time, e_time, venue, mode, link, ag_text):
            try:
                from app.database import SessionLocal
                from app.notifications.event_service import emit_event
                bg_db = SessionLocal()
                try:
                    emit_event("MEETING_SCHEDULED", {
                        "meeting_id": m_id,
                        "committee_id": c_id,
                        "committee_name": c_name,
                        "meeting_number": m_num,
                        "meeting_date": m_date,
                        "start_time": s_time,
                        "end_time": e_time,
                        "venue": venue,
                        "mode": mode,
                        "meeting_link": link,
                        "agenda_summary": ag_text,
                        "meeting_url": f"http://localhost:5173/meetings/{m_id}"
                    }, bg_db)
                finally:
                    bg_db.close()
            except Exception as notif_err:
                pass

        background_tasks.add_task(
            _send_meeting_notification,
            str(meeting.id),
            str(committee.id),
            committee.name,
            str(meeting.meeting_number or "Session"),
            str(meeting.meeting_date),
            str(meeting.start_time) if meeting.start_time else "10:00 AM",
            str(meeting.end_time) if meeting.end_time else "12:00 PM",
            meeting.location or "Senate Hall",
            meeting.meeting_mode or "Physical",
            meeting.meeting_link,
            meeting.agenda_text or "Standard Statutory Agenda items"
        )

    result = enrich_meeting(meeting, db)
    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("meetings", "created", result)
    except Exception:
        pass

    return result


@router.get("/{meeting_id}", response_model=dict)
async def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return enrich_meeting(meeting, db)


@router.put("/{meeting_id}", response_model=dict)
async def update_meeting(
    meeting_id: str,
    body: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(meeting, key, value)
    
    db.commit()
    db.refresh(meeting)

    result = enrich_meeting(meeting, db)
    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("meetings", "updated", result)
    except Exception:
        pass

    return result


@router.delete("/{meeting_id}", status_code=204)
async def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR))
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()

    try:
        from app.realtime.socket_manager import broadcast_change
        broadcast_change("meetings", "deleted", {"id": meeting_id})
    except Exception:
        pass


# ─── Attendance ───────────────────────────────────────────────────────────────

@router.get("/{meeting_id}/attendance", response_model=List[dict])
async def get_attendance(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attendance = db.query(MeetingAttendance).filter(
        MeetingAttendance.meeting_id == meeting_id
    ).all()
    
    result = []
    for a in attendance:
        result.append({
            "id": a.id,
            "meeting_id": a.meeting_id,
            "member_id": a.member_id,
            "attendance_status": a.attendance_status,
            "remarks": a.remarks,
            "member": {
                "id": a.member.id,
                "name": a.member.name,
                "designation": a.member.designation,
                "department": a.member.department,
                "member_type": a.member.member_type
            } if a.member else None
        })
    return result


@router.post("/{meeting_id}/attendance", response_model=dict)
async def record_attendance(
    meeting_id: str,
    body: AttendanceBulk,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Clear existing attendance
    db.query(MeetingAttendance).filter(MeetingAttendance.meeting_id == meeting_id).delete()
    
    for record in body.records:
        att = MeetingAttendance(
            meeting_id=meeting_id,
            member_id=record.member_id,
            attendance_status=record.attendance_status,
            remarks=record.remarks,
            marked_by=current_user.id
        )
        db.add(att)
    
    log = AuditLog(
        user_id=current_user.id,
        action="attendance_recorded",
        entity_type="meeting",
        entity_id=meeting_id,
        description=f"Attendance recorded for meeting {meeting.title}"
    )
    db.add(log)
    db.commit()
    return {"message": f"Attendance recorded for {len(body.records)} members"}


# ─── Quorum ───────────────────────────────────────────────────────────────────

@router.get("/{meeting_id}/quorum", response_model=dict)
async def get_quorum(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    committee = db.query(Committee).filter(Committee.id == meeting.committee_id).first()
    
    # Count eligible members (active committee members)
    eligible_count = db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == meeting.committee_id,
        CommitteeMember.is_active == True
    ).count()
    
    # Count present members
    present_count = db.query(MeetingAttendance).filter(
        MeetingAttendance.meeting_id == meeting_id,
        MeetingAttendance.attendance_status == AttendanceStatus.PRESENT
    ).count()
    
    # Calculate required quorum
    if committee.quorum_type == "PERCENTAGE":
        required_count = max(1, int((committee.quorum_value / 100) * eligible_count))
    else:
        required_count = committee.quorum_value
    
    quorum_met = present_count >= required_count
    
    # Get or create quorum record
    quorum_record = db.query(QuorumRecord).filter(QuorumRecord.meeting_id == meeting_id).first()
    
    return {
        "meeting_id": meeting_id,
        "required_count": required_count,
        "eligible_count": eligible_count,
        "present_count": present_count,
        "quorum_met": quorum_met,
        "override_allowed": quorum_record.override_allowed if quorum_record else False,
        "override_reason": quorum_record.override_reason if quorum_record else None,
        "validated_at": str(quorum_record.validated_at) if quorum_record and quorum_record.validated_at else None,
        "quorum_percentage": round((present_count / max(1, eligible_count)) * 100, 1)
    }


@router.post("/{meeting_id}/quorum/validate", response_model=dict)
async def validate_quorum(
    meeting_id: str,
    body: QuorumValidate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    committee = db.query(Committee).filter(Committee.id == meeting.committee_id).first()
    
    eligible_count = db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == meeting.committee_id,
        CommitteeMember.is_active == True
    ).count()
    
    present_count = db.query(MeetingAttendance).filter(
        MeetingAttendance.meeting_id == meeting_id,
        MeetingAttendance.attendance_status == AttendanceStatus.PRESENT
    ).count()
    
    if committee.quorum_type == "PERCENTAGE":
        required_count = max(1, int((committee.quorum_value / 100) * eligible_count))
    else:
        required_count = committee.quorum_value
    
    quorum_met = present_count >= required_count
    override_allowed = body.override_reason is not None and not quorum_met
    
    # Delete old record and create new one
    db.query(QuorumRecord).filter(QuorumRecord.meeting_id == meeting_id).delete()
    
    record = QuorumRecord(
        meeting_id=meeting_id,
        required_count=required_count,
        eligible_count=eligible_count,
        present_count=present_count,
        quorum_met=quorum_met,
        override_allowed=override_allowed,
        override_reason=body.override_reason,
        validated_by=current_user.id,
        validated_at=datetime.utcnow()
    )
    db.add(record)
    
    log = AuditLog(
        user_id=current_user.id,
        action="quorum_validated",
        entity_type="meeting",
        entity_id=meeting_id,
        description=f"Quorum {'MET' if quorum_met else 'NOT MET'}: {present_count}/{required_count}"
    )
    db.add(log)
    db.commit()

    if override_allowed:
        try:
            from app.notifications.event_service import emit_event
            emit_event("QUORUM_OVERRIDE", {
                "meeting_id": str(meeting.id),
                "committee_id": str(committee.id),
                "committee_name": committee.name,
                "meeting_title": meeting.title,
                "timestamp": datetime.utcnow().strftime("%d %b %Y %I:%M %p"),
                "override_by_name": current_user.name,
                "override_by_role": str(current_user.role),
                "present_count": present_count,
                "total_members": eligible_count,
                "quorum_required": required_count,
                "reason": body.override_reason or "Executive statutory authorization",
                "audit_url": f"http://localhost:5173/meetings/{meeting.id}"
            }, db)
        except Exception:
            pass

    return {
        "meeting_id": meeting_id,
        "required_count": required_count,
        "eligible_count": eligible_count,
        "present_count": present_count,
        "quorum_met": quorum_met,
        "override_allowed": override_allowed,
        "message": "Quorum met. Meeting can proceed." if quorum_met else
                   f"Quorum not met. {required_count - present_count} more member(s) required."
    }


# ─── Agenda ───────────────────────────────────────────────────────────────────

@router.get("/{meeting_id}/agenda", response_model=List[dict])
async def get_agenda(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    agendas = db.query(Agenda).filter(Agenda.meeting_id == meeting_id).all()
    result = []
    for a in agendas:
        result.append({
            "id": a.id,
            "meeting_id": a.meeting_id,
            "title": a.title,
            "version": a.version,
            "content": a.content,
            "generated_by_ai": a.generated_by_ai,
            "created_at": str(a.created_at) if a.created_at else None,
            "items": [
                {
                    "id": item.id,
                    "item_number": item.item_number,
                    "title": item.title,
                    "description": item.description,
                    "source": item.source,
                    "priority": item.priority
                }
                for item in a.items
            ]
        })
    return result


@router.post("/{meeting_id}/agenda", response_model=dict, status_code=201)
async def create_agenda(
    meeting_id: str,
    body: AgendaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    agenda = Agenda(
        meeting_id=meeting_id,
        title=body.title,
        content=body.content,
        created_by=current_user.id
    )
    db.add(agenda)
    db.flush()
    
    for item_data in (body.items or []):
        item = AgendaItem(
            agenda_id=agenda.id,
            **item_data.model_dump()
        )
        db.add(item)
    
    db.commit()
    db.refresh(agenda)
    return {"id": agenda.id, "meeting_id": agenda.meeting_id, "title": agenda.title}


# ─── Minutes ──────────────────────────────────────────────────────────────────

@router.get("/{meeting_id}/minutes", response_model=dict)
async def get_meeting_minutes(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    minutes = db.query(Minutes).filter(Minutes.meeting_id == meeting_id).first()
    if not minutes:
        return {}
    
    return {
        "id": minutes.id,
        "meeting_id": minutes.meeting_id,
        "summary": minutes.summary,
        "discussion": minutes.discussion,
        "decisions": minutes.decisions,
        "conclusion": minutes.conclusion,
        "next_meeting_date": str(minutes.next_meeting_date) if minutes.next_meeting_date else None,
        "status": minutes.status,
        "generated_by_ai": minutes.generated_by_ai,
        "approved_at": str(minutes.approved_at) if minutes.approved_at else None,
        "created_at": str(minutes.created_at) if minutes.created_at else None,
        "sections": [
            {"id": s.id, "section_type": s.section_type, "title": s.title, "content": s.content, "display_order": s.display_order}
            for s in minutes.sections
        ]
    }
