"""
Vignan CommiAI — Recipient Resolution Service
Deterministically resolves authorized recipient and CC email lists based on event type and database state.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.models import Committee, CommitteeMember, Member, User, UserRole, ActionItem, Meeting

REGISTRAR_EMAIL = "231fa04e50@gmail.com"
IQAC_EMAIL = "pujithayarramsetty@gmail.com"
VC_EMAIL = "vc.secretariat@testmail.com"

def get_registrar_email(db: Session) -> str:
    user = db.query(User).filter(User.role == UserRole.REGISTRAR, User.status == "ACTIVE").first()
    return user.email if user else REGISTRAR_EMAIL

def get_iqac_email(db: Session) -> str:
    user = db.query(User).filter(User.role == UserRole.IQAC, User.status == "ACTIVE").first()
    return user.email if user else IQAC_EMAIL

def get_committee_active_members(committee_id: str, db: Session) -> List[Dict[str, str]]:
    """Returns list of {name, email, role} for all active members of the committee."""
    cms = db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == committee_id,
        CommitteeMember.is_active == True
    ).all()
    results = []
    for cm in cms:
        if cm.member and cm.member.email:
            role_name = cm.role or (cm.member.designation if hasattr(cm.member, 'designation') else "Member")
            is_conv = bool(role_name and any(c in role_name for c in ["Convener", "Secretary", "Member Secretary"]))
            results.append({
                "id": str(cm.id),
                "member_id": str(cm.member.id),
                "name": cm.member.name,
                "email": cm.member.email,
                "role": role_name,
                "is_convener": is_conv
            })
    return results

def get_committee_convener(committee_id: str, db: Session) -> Optional[Dict[str, str]]:
    """Finds the primary convener for the committee."""
    members = get_committee_active_members(committee_id, db)
    for m in members:
        if m["is_convener"]:
            return m
    # Fallback to first member if no explicit convener
    return members[0] if members else None

def resolve_recipients_for_event(event_type: str, payload: Dict[str, Any], db: Session) -> Dict[str, Any]:
    """
    Returns resolved recipients, cc_list, and member context list for the event.
    Result structure:
    {
        "recipients": [{"name": "...", "email": "...", "member_id": "...", "user_id": "..."}],
        "cc": ["email1@...", "email2@..."]
    }
    """
    committee_id = payload.get("committee_id")
    meeting_id = payload.get("meeting_id")
    action_id = payload.get("action_id")
    member_id = payload.get("member_id")

    registrar_email = get_registrar_email(db)
    iqac_email = get_iqac_email(db)

    recipients = []
    cc = []

    # 1. MEETING_SCHEDULED / 2. MEETING_48_HOURS / MEETING_24_HOURS / 3. MEETING_UPDATED
    if event_type in ["MEETING_SCHEDULED", "MEETING_48_HOURS", "MEETING_24_HOURS", "MEETING_UPDATED"]:
        if committee_id:
            members = get_committee_active_members(committee_id, db)
            recipients = members
            convener = get_committee_convener(committee_id, db)
            if convener and convener["email"] not in [r["email"] for r in recipients]:
                cc.append(convener["email"])
            cc.append(registrar_email)

    # 4. QUORUM_DEFICIT
    elif event_type == "QUORUM_DEFICIT":
        if committee_id:
            convener = get_committee_convener(committee_id, db)
            if convener:
                recipients.append(convener)
            recipients.append({"name": "Registrar", "email": registrar_email, "role": "Registrar"})
            cc.append(iqac_email)

    # 5. QUORUM_OVERRIDE
    elif event_type == "QUORUM_OVERRIDE":
        recipients.append({"name": "Registrar", "email": registrar_email, "role": "Registrar"})
        recipients.append({"name": "Director IQAC", "email": iqac_email, "role": "IQAC"})
        recipients.append({"name": "Vice Chancellor", "email": VC_EMAIL, "role": "Vice Chancellor"})

    # 6. MINUTES_SUBMITTED_FOR_APPROVAL
    elif event_type == "MINUTES_SUBMITTED_FOR_APPROVAL":
        recipients.append({"name": "Registrar", "email": registrar_email, "role": "Registrar Approving Authority"})
        if committee_id:
            convener = get_committee_convener(committee_id, db)
            if convener:
                cc.append(convener["email"])

    # 7. MINUTES_APPROVED
    elif event_type == "MINUTES_APPROVED":
        if committee_id:
            recipients = get_committee_active_members(committee_id, db)
            recipients.append({"name": "Registrar", "email": registrar_email, "role": "Registrar"})
            recipients.append({"name": "Director IQAC", "email": iqac_email, "role": "IQAC"})

    # 8. ACTION_ASSIGNED / 9. ACTION_3_DAYS_BEFORE / ACTION_DUE / ACTION_OVERDUE
    elif event_type in ["ACTION_ASSIGNED", "ACTION_3_DAYS_BEFORE", "ACTION_DUE", "ACTION_OVERDUE"]:
        owner_email = payload.get("owner_email")
        owner_name = payload.get("owner_name", "Responsible Official")
        if not owner_email and action_id:
            action = db.query(ActionItem).filter(ActionItem.id == action_id).first()
            if action and action.assignee:
                owner_email = action.assignee.email
                owner_name = action.assignee.name
        
        if owner_email:
            recipients.append({"name": owner_name, "email": owner_email, "role": "Assignee"})
        
        if committee_id:
            convener = get_committee_convener(committee_id, db)
            if convener:
                cc.append(convener["email"])
        
        if event_type == "ACTION_OVERDUE":
            cc.append(registrar_email)

    # 10. ATR_GENERATION_REQUIRED
    elif event_type == "ATR_GENERATION_REQUIRED":
        if committee_id:
            recipients = get_committee_active_members(committee_id, db)
            convener = get_committee_convener(committee_id, db)
            if convener and convener["email"] not in [r["email"] for r in recipients]:
                cc.append(convener["email"])

    # 11. TENURE_30_DAYS / TENURE_15_DAYS
    elif event_type in ["TENURE_30_DAYS", "TENURE_15_DAYS"]:
        recipients.append({"name": "Registrar", "email": registrar_email, "role": "Registrar"})
        if committee_id:
            convener = get_committee_convener(committee_id, db)
            if convener:
                recipients.append(convener)
        cc.append(iqac_email)

    # 12. COMPOSITION_DEFICIT
    elif event_type == "COMPOSITION_DEFICIT":
        recipients.append({"name": "Registrar", "email": registrar_email, "role": "Registrar"})
        recipients.append({"name": "Director IQAC", "email": iqac_email, "role": "IQAC"})
        recipients.append({"name": "Vice Chancellor", "email": VC_EMAIL, "role": "Vice Chancellor"})
        if committee_id:
            convener = get_committee_convener(committee_id, db)
            if convener:
                cc.append(convener["email"])

    # 13. MEETING_OVERDUE
    elif event_type == "MEETING_OVERDUE":
        if committee_id:
            convener = get_committee_convener(committee_id, db)
            if convener:
                recipients.append(convener)
        recipients.append({"name": "Registrar", "email": registrar_email, "role": "Registrar"})
        cc.append(iqac_email)

    # Fallback default
    if not recipients:
        fallback_email = payload.get("recipient_email") or registrar_email
        recipients.append({"name": payload.get("recipient_name", "Official"), "email": fallback_email, "role": "Stakeholder"})

    # Deduplicate CC against recipients
    recipient_emails = {r["email"].lower() for r in recipients if "email" in r}
    cleaned_cc = [c for c in set(cc) if c.lower() not in recipient_emails]

    return {
        "recipients": recipients,
        "cc": cleaned_cc
    }
