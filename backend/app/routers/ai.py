from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    AIConversation, AIMessage, Minutes, MinuteSection, ActionItem, Agenda, AgendaItem,
    User, UserRole, MessageRole, SectionType, AgendaSource, ActionStatus, MinutesStatus
)
from app.auth.auth import get_current_user
from app.schemas.schemas import ChatMessage, GenerateAgendaRequest, GenerateMinutesRequest, ExtractActionsRequest
from app.agent.agent import run_agent, generate_agenda_ai, generate_minutes_ai, extract_actions_ai
from app.config import settings
import uuid

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/chat")
async def chat(
    body: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GEMINI_API_KEY:
        return {
            "response": "AI service is not configured. Please contact the administrator.",
            "conversation_id": body.conversation_id or str(uuid.uuid4()),
            "sources": [],
            "tools_used": []
        }
    
    # Get or create conversation
    conversation_id = body.conversation_id
    if conversation_id:
        conversation = db.query(AIConversation).filter(AIConversation.id == conversation_id).first()
        if not conversation:
            conversation_id = None
    
    if not conversation_id:
        conversation = AIConversation(
            user_id=current_user.id,
            title=body.message[:50] + "..." if len(body.message) > 50 else body.message
        )
        db.add(conversation)
        db.flush()
        conversation_id = conversation.id
    
    # Save user message
    user_msg = AIMessage(
        conversation_id=conversation_id,
        role=MessageRole.USER,
        content=body.message
    )
    db.add(user_msg)
    db.commit()
    
    # Run agent
    result = run_agent(
        message=body.message,
        user_id=current_user.id,
        user_role=current_user.role,
        user_name=current_user.name,
        db=db,
        committee_id=body.committee_id,
        conversation_id=conversation_id
    )
    
    # Save assistant response
    assistant_msg = AIMessage(
        conversation_id=conversation_id,
        role=MessageRole.ASSISTANT,
        content=result["response"],
        tool_used=",".join(result.get("tools_used", []))
    )
    db.add(assistant_msg)
    db.commit()
    
    return {
        "response": result["response"],
        "conversation_id": conversation_id,
        "sources": result.get("sources", []),
        "tools_used": result.get("tools_used", [])
    }


@router.post("/generate-agenda")
async def generate_agenda(
    body: GenerateAgendaRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GEMINI_API_KEY:
        return {"agenda": "AI service not configured.", "generated_by_ai": False}
    
    result = generate_agenda_ai(db, body.meeting_id, body.additional_topics)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Save the agenda
    from app.models import Meeting, Agenda, AgendaItem
    meeting = db.query(Meeting).filter(Meeting.id == body.meeting_id).first()
    if meeting:
        agenda = Agenda(
            meeting_id=body.meeting_id,
            title=f"AI Generated Agenda - {meeting.title}",
            content=result["agenda"],
            generated_by_ai=True,
            created_by=current_user.id
        )
        db.add(agenda)
        db.commit()
    
    return result


@router.post("/generate-minutes")
async def generate_minutes(
    body: GenerateMinutesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GEMINI_API_KEY:
        return {"full_text": body.notes, "generated_by_ai": False}
    
    result = generate_minutes_ai(db, body.meeting_id, body.notes)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Create or update minutes record
    existing = db.query(Minutes).filter(Minutes.meeting_id == body.meeting_id).first()
    if existing:
        existing.summary = result.get("full_text", "")[:2000]
        existing.generated_by_ai = True
        existing.status = MinutesStatus.DRAFT
        
        # Clear old sections
        db.query(MinuteSection).filter(MinuteSection.minutes_id == existing.id).delete()
        
        for i, section in enumerate(result.get("sections", [])):
            s = MinuteSection(
                minutes_id=existing.id,
                section_type=SectionType.DISCUSSION,
                title=section.get("title", "Section"),
                content=section.get("content", ""),
                display_order=i
            )
            db.add(s)
        db.commit()
        minutes_id = existing.id
    else:
        minutes = Minutes(
            meeting_id=body.meeting_id,
            summary=result.get("full_text", "")[:2000],
            generated_by_ai=True,
            status=MinutesStatus.DRAFT
        )
        db.add(minutes)
        db.flush()
        
        for i, section in enumerate(result.get("sections", [])):
            s = MinuteSection(
                minutes_id=minutes.id,
                section_type=SectionType.DISCUSSION,
                title=section.get("title", "Section"),
                content=section.get("content", ""),
                display_order=i
            )
            db.add(s)
        db.commit()
        minutes_id = minutes.id
    
    result["minutes_id"] = minutes_id
    return result


@router.post("/extract-actions")
async def extract_actions(
    body: ExtractActionsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GEMINI_API_KEY:
        return {"actions": [], "message": "AI service not configured"}
    
    actions_data = extract_actions_ai(body.text, body.committee_id)
    
    created_actions = []
    for action_data in actions_data:
        action = ActionItem(
            committee_id=body.committee_id,
            meeting_id=body.meeting_id,
            title=action_data.get("title", "Unnamed action"),
            description=action_data.get("description", ""),
            due_date=action_data.get("due_date"),
            priority=action_data.get("priority", "MEDIUM"),
            status=ActionStatus.PENDING
        )
        db.add(action)
        created_actions.append({
            "title": action_data.get("title"),
            "owner": action_data.get("owner"),
            "due_date": action_data.get("due_date"),
            "priority": action_data.get("priority")
        })
    
    db.commit()
    return {"actions": created_actions, "count": len(created_actions)}


@router.post("/compliance-analysis")
async def compliance_analysis(
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    committee_id = body.get("committee_id")
    if not committee_id:
        raise HTTPException(status_code=400, detail="committee_id required")
    
    from app.services.compliance_engine import run_compliance_check
    from app.models import Committee
    
    committee = db.query(Committee).filter(Committee.id == committee_id).first()
    if not committee:
        raise HTTPException(status_code=404, detail="Committee not found")
    
    check = run_compliance_check(db, committee_id, current_user.id)
    
    if not settings.GEMINI_API_KEY:
        return {
            "analysis": f"Compliance check for {committee.name}: Status={check.status}, Score={check.overall_score:.0f}/100. {len(check.issues)} issues found.",
            "check": {"status": check.status, "score": check.overall_score, "issues": [i.title for i in check.issues]}
        }
    
    # Use AI to explain the compliance result
    issues_text = "\n".join([f"- [{i.severity}] {i.title}: {i.description}. Recommendation: {i.recommendation}" for i in check.issues])
    
    prompt = f"""Provide a professional compliance analysis for the following committee:

Committee: {committee.name}
Authority: {committee.authority}
Mandate: {committee.mandate}

Compliance Status: {check.status}
Overall Score: {check.overall_score:.0f}/100
Composition Score: {check.composition_score:.0f}/100
Tenure Score: {check.tenure_score:.0f}/100
Meeting Frequency Score: {check.meeting_score:.0f}/100

Issues Found:
{issues_text if issues_text else "No issues found."}

Provide:
1. Summary of the compliance status
2. Explanation of each issue
3. Priority recommendations
4. Action timeline

Be precise, institutional, and actionable."""
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        analysis_text = response.text
    except Exception as e:
        analysis_text = f"Compliance check completed. Status: {check.status}. Score: {check.overall_score:.0f}/100. {len(check.issues)} issues found."
    
    return {
        "analysis": analysis_text,
        "check": {
            "status": check.status,
            "score": check.overall_score,
            "composition_score": check.composition_score,
            "tenure_score": check.tenure_score,
            "meeting_score": check.meeting_score,
            "issues": [
                {"severity": i.severity, "title": i.title, "recommendation": i.recommendation}
                for i in check.issues
            ]
        }
    }
