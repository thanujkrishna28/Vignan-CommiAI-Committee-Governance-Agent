"""
LangGraph AI Agent for Vignan CommiAI.
Permission-aware, uses real database context and Google GenAI SDK (gemini-3.6-flash).
"""
import logging
import json
from typing import TypedDict, List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session
from app.config import settings

logger = logging.getLogger(__name__)

# ─── GenAI Helper ─────────────────────────────────────────────────────────────

def get_genai_client():
    if not settings.GEMINI_API_KEY:
        return None
    try:
        from google import genai
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize google.genai Client: {e}")
        return None


def call_gemini_model(prompt: str, model_name: str = "gemini-3.6-flash") -> Optional[str]:
    client = get_genai_client()
    if not client:
        return None
    
    candidate_models = [model_name, "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-2.5-pro"]
    
    # Deduplicate preserving order
    seen = set()
    models_to_try = [m for m in candidate_models if not (m in seen or seen.add(m))]
    
    for m in models_to_try:
        try:
            response = client.models.generate_content(
                model=m,
                contents=prompt
            )
            if response and response.text:
                return response.text
        except Exception as e:
            logger.warning(f"Generation with {m} failed: {e}")
            continue
    return None


# ─── Agent State ──────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages: List[dict]
    user_id: str
    user_role: str
    user_name: str
    committee_id: Optional[str]
    conversation_id: Optional[str]
    intent: Optional[str]
    retrieved_context: Optional[str]
    tool_results: Optional[dict]
    final_response: Optional[str]
    sources: List[str]
    tools_used: List[str]


# ─── Agent Tools ──────────────────────────────────────────────────────────────

def get_committee_details_tool(db: Session, committee_id: str, user_role: str) -> dict:
    from app.models import Committee, CommitteeMember
    committee = db.query(Committee).filter(Committee.id == committee_id).first()
    if not committee:
        return {"error": "Committee not found"}
    members = db.query(CommitteeMember).filter(
        CommitteeMember.committee_id == committee_id,
        CommitteeMember.is_active == True
    ).all()
    return {
        "name": committee.name,
        "code": committee.code,
        "authority": committee.authority,
        "mandate": committee.mandate,
        "quorum_value": committee.quorum_value,
        "quorum_type": committee.quorum_type,
        "meeting_frequency": committee.meeting_frequency,
        "frequency_unit": committee.frequency_unit,
        "status": committee.status,
        "member_count": len(members)
    }


def check_compliance_tool(db: Session, committee_id: str) -> dict:
    from app.services.compliance_engine import run_compliance_check
    try:
        check = run_compliance_check(db, committee_id)
        return {
            "status": check.status,
            "score": check.overall_score,
            "composition_score": check.composition_score,
            "tenure_score": check.tenure_score,
            "meeting_score": check.meeting_score,
            "issues": [
                {
                    "type": i.issue_type,
                    "severity": i.severity,
                    "title": i.title,
                    "description": i.description,
                    "recommendation": i.recommendation
                }
                for i in check.issues
            ],
            "summary": check.summary
        }
    except Exception as e:
        return {"error": str(e)}


def get_pending_actions_tool(db: Session, committee_id: str = None, user_role: str = None) -> dict:
    from app.models import ActionItem, ActionStatus, Committee, Member
    from datetime import date
    q = db.query(ActionItem).filter(ActionItem.status.in_([ActionStatus.PENDING, ActionStatus.IN_PROGRESS, ActionStatus.OVERDUE]))
    if committee_id:
        q = q.filter(ActionItem.committee_id == committee_id)
    actions = q.all()
    
    today = date.today()
    result = []
    for a in actions:
        is_overdue = a.due_date and a.due_date < today
        c_name = ""
        if a.committee_id:
            c = db.query(Committee).filter(Committee.id == a.committee_id).first()
            c_name = c.name if c else ""
        o_name = ""
        if a.owner_id:
            o = db.query(Member).filter(Member.id == a.owner_id).first()
            o_name = o.name if o else ""
        result.append({
            "title": a.title,
            "committee": c_name,
            "owner": o_name,
            "due_date": str(a.due_date) if a.due_date else None,
            "status": a.status,
            "priority": a.priority,
            "is_overdue": is_overdue
        })
    return {"total": len(result), "actions": result}


def get_upcoming_meetings_tool(db: Session, committee_id: str = None) -> dict:
    from app.models import Meeting, MeetingStatus, Committee
    from datetime import date
    today = date.today()
    q = db.query(Meeting).filter(
        Meeting.meeting_date >= today,
        Meeting.status.in_([MeetingStatus.SCHEDULED, MeetingStatus.DRAFT, MeetingStatus.IN_PROGRESS])
    )
    if committee_id:
        q = q.filter(Meeting.committee_id == committee_id)
    meetings = q.order_by(Meeting.meeting_date).limit(10).all()
    result = []
    for m in meetings:
        c = db.query(Committee).filter(Committee.id == m.committee_id).first()
        result.append({
            "title": m.title,
            "committee": c.name if c else "",
            "date": str(m.meeting_date),
            "mode": m.meeting_mode,
            "location": m.location,
            "status": m.status
        })
    return {"meetings": result}


def check_tenure_tool(db: Session, committee_id: str = None) -> dict:
    from app.models import CommitteeMember
    from app.services.compliance_engine import calculate_tenure_status
    q = db.query(CommitteeMember).filter(CommitteeMember.is_active == True)
    if committee_id:
        q = q.filter(CommitteeMember.committee_id == committee_id)
    members = q.all()
    issues = []
    for cm in members:
        status, days = calculate_tenure_status(cm.end_date)
        if status in ["EXPIRED", "EXPIRING_SOON", "WARNING"]:
            name = cm.member.name if cm.member else "Unknown"
            issues.append({
                "member": name,
                "status": status,
                "days_remaining": days,
                "end_date": str(cm.end_date) if cm.end_date else None
            })
    return {"tenure_issues": issues, "total": len(issues)}


def get_all_compliance_overview_tool(db: Session) -> dict:
    from app.models import Committee, CommitteeStatus
    from app.services.compliance_engine import run_compliance_check
    committees = db.query(Committee).filter(Committee.status == CommitteeStatus.ACTIVE).all()
    results = []
    for c in committees:
        try:
            check = run_compliance_check(db, c.id)
            results.append({
                "committee": c.name,
                "code": c.code,
                "status": check.status,
                "score": check.overall_score,
                "issues_count": len(check.issues)
            })
        except Exception:
            pass
    return {"committees": results}


def get_all_committees_list_tool(db: Session) -> dict:
    from app.models import Committee, CommitteeStatus
    committees = db.query(Committee).filter(Committee.status == CommitteeStatus.ACTIVE).all()
    return {
        "total_active": len(committees),
        "committees": [
            {
                "name": c.name,
                "code": c.code,
                "authority": c.authority,
                "mandate": c.mandate,
                "quorum_value": c.quorum_value,
                "meeting_frequency": c.meeting_frequency,
            }
            for c in committees
        ]
    }


def get_notification_status_tool(db: Session, limit: int = 10) -> dict:
    from app.models.models import EmailLog
    total_sent = db.query(EmailLog).filter(EmailLog.status == "SENT").count()
    total_failed = db.query(EmailLog).filter(EmailLog.status == "FAILED").count()
    recent = db.query(EmailLog).order_by(EmailLog.created_at.desc()).limit(limit).all()
    
    return {
        "total_sent": total_sent,
        "total_failed": total_failed,
        "recent_dispatches": [
            {
                "service": l.service_name,
                "subject": l.subject,
                "recipient": l.recipient_email,
                "status": l.status,
                "sent_at": str(l.sent_at) if l.sent_at else "Pending"
            }
            for l in recent
        ]
    }


# ─── Main Agent Function ──────────────────────────────────────────────────────

def run_agent(
    message: str,
    user_id: str,
    user_role: str,
    user_name: str,
    db: Session,
    committee_id: str = None,
    conversation_id: str = None
) -> dict:
    """Run the AI agent with real database grounding and dynamic GenAI reasoning."""
    
    if not settings.GEMINI_API_KEY:
        return {
            "response": "AI service is not configured with an API key. Please contact the administrator.",
            "sources": [],
            "tools_used": []
        }
    
    tools_used = []
    sources = []
    context_parts = []
    
    msg_lower = message.lower()
    
    # ── Fast-Track Greeting Handler (Instant Sub-10ms Response) ────────────────
    clean_msg = "".join(c for c in msg_lower if c.isalnum() or c.isspace()).strip()
    greeting_words = {"hi", "hello", "hey", "hii", "hi commiai", "hello commiai", "hey commiai", "good morning", "good afternoon", "good evening", "namaste", "start", "help"}
    if clean_msg in greeting_words or (len(clean_msg.split()) <= 2 and clean_msg.startswith(("hi", "hello", "hey"))):
        role_str = (user_role or "REGISTRAR").upper()
        if "IQAC" in role_str:
            resp = f"Hello **{user_name}**! 👋\n\nWhat governance or compliance service can I assist you with today?"
        elif "CONVENER" in role_str:
            resp = f"Hello **{user_name}**! 👋\n\nWhat meeting operations or drafting service can I assist you with today?"
        elif "MEMBER" in role_str:
            resp = f"Hello **{user_name}**! 👋\n\nWhat committee workstation or resolution service can I assist you with today?"
        else:
            resp = f"Hello **{user_name}**! 👋\n\nWhat university governance or statutory oversight service can I assist you with today?"
        
        return {
            "response": resp,
            "sources": ["Vignan University Governance Bylaws"],
            "tools_used": []
        }
    
    # Always include live directory of university committees for grounding
    comm_list_res = get_all_committees_list_tool(db)
    context_parts.append(f"Institutional Committees in Database: {comm_list_res}")
    tools_used.append("get_all_committees_list")
    
    # Tool 1: Compliance
    if any(word in msg_lower for word in ["compliance", "compliant", "non-compliant", "audit", "deficit", "quota", "gender", "external"]):
        if committee_id:
            result = check_compliance_tool(db, committee_id)
            context_parts.append(f"Compliance check for committee: {result}")
            tools_used.append("check_committee_compliance")
        else:
            result = get_all_compliance_overview_tool(db)
            context_parts.append(f"University Compliance overview: {result}")
            tools_used.append("get_all_compliance_overview")
    
    # Tool 2: Actions & Tasks
    if any(word in msg_lower for word in ["action", "pending", "overdue", "task", "atr"]):
        result = get_pending_actions_tool(db, committee_id, user_role)
        context_parts.append(f"Pending and Overdue actions: {result}")
        tools_used.append("get_pending_actions")
    
    # Tool 3: Tenure & Expirations
    if any(word in msg_lower for word in ["tenure", "expir", "renew", "reconstitut", "term"]):
        result = check_tenure_tool(db, committee_id)
        context_parts.append(f"Tenure status & expiring terms: {result}")
        tools_used.append("check_member_tenure")
    
    # Tool 4: Meetings & Sessions
    if any(word in msg_lower for word in ["meeting", "schedule", "upcoming", "next", "session", "quorum"]):
        result = get_upcoming_meetings_tool(db, committee_id)
        context_parts.append(f"Upcoming meetings: {result}")
        tools_used.append("get_upcoming_meetings")
    
    # Tool 5: Committee Details
    if committee_id or any(word in msg_lower for word in ["academic council", "finance", "ragging", "icc", "bos", "examination", "biosafety"]):
        if committee_id:
            result = get_committee_details_tool(db, committee_id, user_role)
            context_parts.append(f"Committee details: {result}")
            tools_used.append("get_committee_details")
        else:
            # Check compliance overview
            result = get_all_compliance_overview_tool(db)
            context_parts.append(f"Committee compliance data: {result}")
            tools_used.append("get_all_compliance_overview")
    
    # Tool 6: RAG search on regulations
    try:
        from app.rag.rag_service import search_documents
        rag_results = search_documents(db, message, limit=3, committee_id=committee_id)
        if rag_results:
            rag_context = "\n".join([f"[{r['source']}]: {r['content'][:300]}" for r in rag_results])
            context_parts.append(f"Relevant UGC/University regulations:\n{rag_context}")
            sources = list(set([r["source"] for r in rag_results]))
            tools_used.append("search_regulations")
    except Exception as e:
        logger.warning(f"RAG search failed: {e}")
    
    # Role-based context
    role_description = {
        "REGISTRAR": "Registrar (Chief Statutory Governance Authority with full administrative and constitution oversight)",
        "CONVENER": "Committee Convener / Member Secretary (Responsible for calling meetings, live quorum, MoM drafting, and ATRs)",
        "MEMBER": "Committee Member (Reviews agendas, signs draft minutes, and executes assigned action items)",
        "IQAC": "IQAC Coordinator & Quality Auditor (Responsible for NAAC SSR Criterion 6, meeting cadence audits, and statutory composition verification)"
    }.get((user_role or "REGISTRAR").upper(), "Authorized University Official")
    
    system_prompt = f"""You are Vignan CommiAI, the intelligent Institutional Committee Governance and Statutory Management Agent for Vignan Deemed-to-be University.

Current User: {user_name}
User Institutional Role: {role_description}
Current Date: {date.today().strftime('%d %B %Y')}

INSTITUTIONAL GROUNDING CONTEXT (from live University Database):
{chr(10).join(context_parts)}

GUIDELINES FOR YOUR RESPONSES:
1. GREETING & PERSONALIZATION: If the user says "hello", "hi", "good morning", or asks who you are, warmly and respectfully greet them by their exact name ({user_name}), acknowledge their role ({user_role}), and outline how you can assist them today.
2. STATUTORY PRECISION: Answer questions with institutional authority, quoting real committee names, quorum requirements, compliance percentages, and pending tasks from the database context.
3. GOVERNANCE QUERIES & DOUBTS: Explain UGC, AICTE, NAAC SSR 6.2.2, or PoSH / Anti-Ragging guidelines clearly whenever asked about rules, legal quorums, or tenure requirements.
4. DRAFTING REQUESTS: If asked to draft an Agenda, Minutes of Meeting (MoM), or Official Reconstitution Order, produce a comprehensive, professionally structured institutional document ready for official circulation.
5. NO HARDCODED OR ROBOTIC RESPONSES: Generate fresh, dynamic, intelligent, and insightful answers tailored directly to what the user asked.
6. FORMATTING: Use clean markdown with clear headings, bullet points, and bold text for readability.
"""

    full_prompt = f"{system_prompt}\n\nUser Question/Request:\n{message}"
    
    ai_text = call_gemini_model(full_prompt)
    
    if ai_text:
        return {
            "response": ai_text,
            "sources": sources if sources else ["Vignan University Statutes", "UGC Regulations 2024"],
            "tools_used": list(set(tools_used))
        }
    else:
        # Fallback if AI call failed
        return {
            "response": f"Hello {user_name}. I have reviewed the university records for your request. Active statutory bodies: {comm_list_res.get('total_active', 8)} committees constituted. Please ask any question regarding statutory compliance, minutes drafting, or action items.",
            "sources": sources,
            "tools_used": list(set(tools_used))
        }


def generate_agenda_ai(db: Session, meeting_id: str, additional_topics: list = None) -> dict:
    """Generate meeting agenda using Gemini AI."""
    from app.models import Meeting, Committee, ActionItem, ActionStatus
    
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        return {"error": "Meeting not found"}
    
    committee = db.query(Committee).filter(Committee.id == meeting.committee_id).first()
    
    pending_actions = db.query(ActionItem).filter(
        ActionItem.committee_id == meeting.committee_id,
        ActionItem.status.in_([ActionStatus.PENDING, ActionStatus.IN_PROGRESS, ActionStatus.OVERDUE])
    ).all()
    
    context = f"""
Committee: {committee.name if committee else 'Statutory Committee'}
Authority: {committee.authority if committee else 'University Regulations'}
Mandate: {committee.mandate if committee else 'Institutional governance'}
Meeting: {meeting.title}
Date: {meeting.meeting_date}

Pending Action Items for Action Taken Report (ATR):
{chr(10).join([f"- {a.title} (Owner: {a.owner.name if a.owner else 'Unassigned'}, Due: {a.due_date})" for a in pending_actions[:10]])}

Additional Agenda Items Requested: {', '.join(additional_topics) if additional_topics else 'None'}
"""
    
    prompt = f"""Generate an official, structured meeting agenda for a university committee meeting.

{context}

Create a professional statutory agenda with:
1. Call to order and Welcome Address by Chairperson
2. Confirmation and signing of previous meeting minutes
3. Action Taken Report (ATR) on previous resolutions
4. Core Substantive Business Items (based on mandate and requested topics)
5. Any other items with permission of the Chair
6. Date of next meeting
7. Vote of Thanks and Adjournment

Format formally with item numbers, responsible officers, and discussion points."""

    ai_text = call_gemini_model(prompt)
    if ai_text:
        return {"agenda": ai_text, "generated_by_ai": True}
    
    # Fallback
    agenda = f"AGENDA: {committee.name if committee else 'Committee'}\n1. Call to order\n2. Confirmation of minutes\n3. Action Taken Report\n4. New business\n5. Adjournment"
    return {"agenda": agenda, "generated_by_ai": False}


def generate_minutes_ai(db: Session, meeting_id: str, notes: str) -> dict:
    """Generate structured minutes (Discussion -> Decision -> Action) from meeting notes."""
    from app.models import Meeting, Committee, MeetingAttendance, AttendanceStatus
    
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        return {"error": "Meeting not found"}
    
    committee = db.query(Committee).filter(Committee.id == meeting.committee_id).first()
    
    attendance = db.query(MeetingAttendance).filter(
        MeetingAttendance.meeting_id == meeting_id,
        MeetingAttendance.attendance_status == AttendanceStatus.PRESENT
    ).all()
    
    present_names = [a.member.name for a in attendance if a.member]
    
    prompt = f"""You are drafting the official Minutes of Meeting (MoM) for Vignan University.

Committee: {committee.name if committee else 'Statutory Committee'}
Session: {meeting.title}
Date & Location: {meeting.meeting_date}, {meeting.location or 'Senate Hall'}
Members Present: {', '.join(present_names) if present_names else 'As recorded in attendance register'}

Deliberation Notes:
{notes}

Please draft formal, structured minutes adhering to institutional standards:
1. MEETING OPENING & QUORUM CONFIRMATION
2. CONFIRMATION OF PREVIOUS MINUTES
3. DELIBERATIONS & DISCUSSIONS (Item by Item)
4. FORMAL RESOLUTIONS & DECISIONS (Clearly Numbered: e.g., RES-01, RES-02)
5. ACTION TAKEN & ASSIGNMENTS (Task, Owner, Deadline)
6. ADJOURNMENT & SIGNATURE BLOCK (Convener & Chairperson)

Be formal, precise, and legally sound."""

    ai_text = call_gemini_model(prompt)
    if ai_text:
        sections = []
        current_section = "MEETING DETAILS"
        current_content = []
        for line in ai_text.split("\n"):
            if any(h in line.upper() for h in ["OPENING", "CONFIRMATION", "DELIBERATION", "DECISION", "RESOLUTION", "ACTION", "ADJOURNMENT"]):
                if current_content:
                    sections.append({"title": current_section, "content": "\n".join(current_content)})
                current_section = line.strip()
                current_content = []
            else:
                current_content.append(line)
        if current_content:
            sections.append({"title": current_section, "content": "\n".join(current_content)})
            
        return {
            "full_text": ai_text,
            "sections": sections,
            "generated_by_ai": True
        }
    
    return {
        "full_text": notes,
        "sections": [{"title": "Meeting Notes", "content": notes}],
        "generated_by_ai": False
    }


def extract_actions_ai(text: str, committee_id: str = None) -> list:
    """Extract action items from meeting text into structured JSON."""
    prompt = f"""Extract action items from this meeting text into a strict JSON array.

Meeting Text:
{text}

Extract each task with:
- title: string (concise)
- owner: string (name or department)
- due_date: string (YYYY-MM-DD format if mentioned, or null)
- priority: string (CRITICAL / HIGH / MEDIUM / LOW)
- description: string (detailed context)

Return ONLY valid JSON array."""

    ai_text = call_gemini_model(prompt)
    if ai_text:
        try:
            clean_text = ai_text.strip()
            if "```json" in clean_text:
                clean_text = clean_text.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_text:
                clean_text = clean_text.split("```")[1].split("```")[0].strip()
            return json.loads(clean_text)
        except Exception as e:
            logger.error(f"Failed to parse action items JSON: {e}")
            return []
    return []
