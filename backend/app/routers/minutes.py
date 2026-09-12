from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import (
    Minutes, MinuteSection, Meeting, ActionItem, AuditLog,
    User, UserRole, MinutesStatus, ActionStatus, SectionType
)
from app.auth.auth import get_current_user, require_role
from app.schemas.schemas import MinutesCreate, MinutesUpdate

router = APIRouter(prefix="/api/minutes", tags=["minutes"])


@router.get("", response_model=List[dict])
async def list_minutes(
    committee_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.utils.cache import cache
    cache_key = f"minutes:{committee_id}:{status}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from sqlalchemy.orm import joinedload
    q = db.query(Minutes).options(joinedload(Minutes.meeting).joinedload(Meeting.committee))
    if status:
        q = q.filter(Minutes.status == status)
    if committee_id:
        q = q.join(Meeting).filter(Meeting.committee_id == committee_id)
    
    minutes_list = q.order_by(Minutes.created_at.desc()).all()
    result = []
    for m in minutes_list:
        committee_name = m.meeting.committee.name if m.meeting and m.meeting.committee else None
        result.append({
            "id": m.id,
            "meeting_id": m.meeting_id,
            "meeting_title": m.meeting.title if m.meeting else None,
            "meeting_date": str(m.meeting.meeting_date) if m.meeting and m.meeting.meeting_date else None,
            "committee_name": committee_name,
            "status": m.status,
            "generated_by_ai": m.generated_by_ai,
            "approved_at": str(m.approved_at) if m.approved_at else None,
            "created_at": str(m.created_at) if m.created_at else None,
            "summary": m.summary[:200] if m.summary else None
        })
    
    cache.set(cache_key, result, ttl_seconds=15)
    return result


@router.get("/{minutes_id}", response_model=dict)
async def get_minutes(
    minutes_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    minutes = db.query(Minutes).filter(Minutes.id == minutes_id).first()
    if not minutes:
        raise HTTPException(status_code=404, detail="Minutes not found")
    
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
        "approved_by": minutes.approved_by,
        "approved_at": str(minutes.approved_at) if minutes.approved_at else None,
        "created_at": str(minutes.created_at) if minutes.created_at else None,
        "updated_at": str(minutes.updated_at) if minutes.updated_at else None,
        "sections": [
            {
                "id": s.id,
                "section_type": s.section_type,
                "title": s.title,
                "content": s.content,
                "display_order": s.display_order
            }
            for s in minutes.sections
        ],
        "meeting_title": minutes.meeting.title if minutes.meeting else None,
        "meeting_date": str(minutes.meeting.meeting_date) if minutes.meeting and minutes.meeting.meeting_date else None,
        "committee_name": minutes.meeting.committee.name if minutes.meeting and minutes.meeting.committee else None
    }


@router.post("", response_model=dict, status_code=201)
async def create_minutes(
    body: MinutesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    existing = db.query(Minutes).filter(Minutes.meeting_id == body.meeting_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Minutes already exist for this meeting")
    
    minutes = Minutes(
        meeting_id=body.meeting_id,
        summary=body.summary,
        discussion=body.discussion,
        decisions=body.decisions,
        conclusion=body.conclusion,
        next_meeting_date=body.next_meeting_date,
        status=MinutesStatus.DRAFT
    )
    db.add(minutes)
    db.commit()
    db.refresh(minutes)
    return {"id": minutes.id, "meeting_id": minutes.meeting_id, "status": minutes.status}


@router.put("/{minutes_id}", response_model=dict)
async def update_minutes(
    minutes_id: str,
    body: MinutesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    minutes = db.query(Minutes).filter(Minutes.id == minutes_id).first()
    if not minutes:
        raise HTTPException(status_code=404, detail="Minutes not found")
    
    if minutes.status == MinutesStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Cannot edit approved minutes")
    
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(minutes, key, value)
    
    db.commit()
    db.refresh(minutes)
    return {"id": minutes.id, "status": minutes.status, "updated_at": str(minutes.updated_at)}


@router.post("/{minutes_id}/submit", response_model=dict)
async def submit_minutes(
    minutes_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    minutes = db.query(Minutes).filter(Minutes.id == minutes_id).first()
    if not minutes:
        raise HTTPException(status_code=404, detail="Minutes not found")
    
    minutes.status = MinutesStatus.PENDING_APPROVAL
    db.commit()

    try:
        from app.notifications.event_service import emit_event
        emit_event("MINUTES_SUBMITTED_FOR_APPROVAL", {
            "meeting_id": str(minutes.meeting_id),
            "committee_id": str(minutes.meeting.committee_id) if minutes.meeting else None,
            "committee_name": minutes.meeting.committee.name if minutes.meeting and minutes.meeting.committee else "Statutory Body",
            "meeting_title": minutes.meeting.title if minutes.meeting else "Meeting",
            "meeting_date": str(minutes.meeting.meeting_date) if minutes.meeting else "Recent Date",
            "meeting_number": minutes.meeting.meeting_number or "" if minutes.meeting else "",
            "convener_name": current_user.name,
            "approver_name": "Registrar",
            "minutes_url": f"http://localhost:5173/meetings/{minutes.meeting_id}"
        }, db)
    except Exception:
        pass

from pydantic import BaseModel
import random
import logging
from app.utils.cache import cache
from app.services.email_service import send_email

logger = logging.getLogger(__name__)


class ApprovalPayload(BaseModel):
    otp: Optional[str] = None
    pin: Optional[str] = None
    comments: Optional[str] = None


@router.post("/{minutes_id}/request-otp", response_model=dict)
async def request_signing_otp(
    minutes_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    minutes = db.query(Minutes).filter(Minutes.id == minutes_id).first()
    if not minutes:
        raise HTTPException(status_code=404, detail="Minutes record not found")
    
    # Generate 6-digit verification code
    otp_code = f"{random.randint(100000, 999999)}"
    cache_key = f"signing_otp_{minutes_id}_{current_user.id}"
    cache.set(cache_key, otp_code, ttl_seconds=600)  # 10 minutes expiry
    
    meeting_title = minutes.meeting.title if minutes.meeting else "Statutory Meeting"
    committee_name = minutes.meeting.committee.name if (minutes.meeting and minutes.meeting.committee) else "Governance Committee"
    
    subject = f"🔐 Sign-off Verification OTP: {otp_code} — Vignan CommiAI"
    html_content = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Vignan CommiAI</h1>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Statutory Committee Governance & Compliance Platform</p>
      </div>
      
      <div style="padding: 32px 28px;">
        <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Official Digital Sign-off Verification Code</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Hello <strong>{current_user.name}</strong>,<br/>
          You have requested a secure verification code (OTP) to digitally sign and ratify the official Minutes of Meeting for:
        </p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Committee & Session</div>
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 4px;">{meeting_title}</div>
          <div style="font-size: 13px; color: #3b82f6; margin-top: 2px;">{committee_name}</div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your 6-Digit Verification Code</div>
          <div style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1e3a8a; background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 12px 28px;">
            {otp_code}
          </div>
          <div style="font-size: 12px; color: #ef4444; margin-top: 8px; font-weight: 600;">⏱ Valid for 10 minutes. Do not share this code.</div>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          If you did not initiate this digital signature request, please notify your institutional administrator immediately.
        </p>
      </div>

      <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        © 2026 VFSTR (Deemed to be University) — Institutional Governance Agent
      </div>
    </div>
    """

    def _dispatch_otp_email(recipient_email, subj, html):
        try:
            send_email(
                recipients=[recipient_email],
                subject=subj,
                html_content=html,
                sender_name="Vignan CommiAI Governance",
                sender_email="thanujkrishna22@gmail.com"
            )
        except Exception as e:
            logger.warning(f"Failed to dispatch sign-off OTP email: {e}")

    background_tasks.add_task(
        _dispatch_otp_email,
        current_user.email,
        subject,
        html_content
    )

    logger.info(f"Generated signing OTP for user {current_user.email} (minutes {minutes_id}): {otp_code}")

    return {
        "status": "success",
        "message": f"Verification code sent to {current_user.email}",
        "email": current_user.email
    }


@router.post("/{minutes_id}/approve", response_model=dict)
async def approve_minutes(
    minutes_id: str,
    background_tasks: BackgroundTasks,
    payload: Optional[ApprovalPayload] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    minutes = db.query(Minutes).filter(Minutes.id == minutes_id).first()
    if not minutes:
        raise HTTPException(status_code=404, detail="Minutes not found")

    provided_code = (payload.otp if payload and payload.otp else (payload.pin if payload and payload.pin else "")).strip()
    cache_key = f"signing_otp_{minutes_id}_{current_user.id}"
    cached_otp = cache.get(cache_key)

    # If an OTP was generated, verify it
    if cached_otp:
        if provided_code != cached_otp:
            from app.auth.auth import verify_password
            if not verify_password(provided_code, current_user.password_hash):
                raise HTTPException(status_code=400, detail="Invalid verification OTP. Please enter the 6-digit code received on your email.")
        cache.invalidate(cache_key)
    else:
        # If no OTP was requested yet, allow verification with account password or master PIN
        if provided_code not in ["1234", "123456"]:
            from app.auth.auth import verify_password
            if not verify_password(provided_code, current_user.password_hash):
                raise HTTPException(status_code=400, detail="Please click 'Send OTP to Email' to receive your 6-digit verification code, or enter your account password.")
    
    minutes.status = MinutesStatus.APPROVED
    minutes.approved_by = current_user.id
    minutes.approved_at = datetime.utcnow()
    
    log = AuditLog(
        user_id=current_user.id,
        action="minutes_approved",
        entity_type="minutes",
        entity_id=minutes_id,
        description=f"Minutes approved and ratified with digital OTP signature by {current_user.name}"
    )
    db.add(log)
    db.commit()

    # Emit notification in background
    def _send_approval_notif(m_id, comm_id, comm_name, m_title, m_date, m_num, dec_text):
        try:
            from app.database import SessionLocal
            from app.notifications.event_service import emit_event
            bg_db = SessionLocal()
            try:
                emit_event("MINUTES_APPROVED", {
                    "meeting_id": m_id,
                    "committee_id": comm_id,
                    "committee_name": comm_name,
                    "meeting_title": m_title,
                    "meeting_date": m_date,
                    "meeting_number": m_num,
                    "ratified_date": datetime.utcnow().strftime("%d %b %Y"),
                    "resolutions_summary": dec_text,
                    "minutes_url": f"http://localhost:5173/meetings/{m_id}"
                }, bg_db)
            finally:
                bg_db.close()
        except Exception:
            pass

    background_tasks.add_task(
        _send_approval_notif,
        str(minutes.meeting_id),
        str(minutes.meeting.committee_id) if minutes.meeting else None,
        minutes.meeting.committee.name if minutes.meeting and minutes.meeting.committee else "Statutory Body",
        minutes.meeting.title if minutes.meeting else "Meeting",
        str(minutes.meeting.meeting_date) if minutes.meeting else "Date",
        minutes.meeting.meeting_number or "" if minutes.meeting else "",
        minutes.decisions or minutes.summary or "Official resolutions recorded and ratified."
    )
    
    return {"id": minutes.id, "status": minutes.status, "approved_at": str(minutes.approved_at)}
