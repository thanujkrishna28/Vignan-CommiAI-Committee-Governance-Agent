from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Committee, CommitteeStatus, ComplianceCheck, AuditLog, User, UserRole
from app.auth.auth import get_current_user, require_role
from app.services.compliance_engine import run_compliance_check

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.get("", response_model=List[dict])
async def get_all_compliance(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.utils.cache import cache
    cache_key = f"compliance:all:{status}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from sqlalchemy.orm import joinedload
    committees = db.query(Committee).filter(Committee.status == CommitteeStatus.ACTIVE).all()
    if not committees:
        cache.set(cache_key, [], ttl_seconds=15)
        return []
        
    comm_ids = [c.id for c in committees]
    
    # 1 single batch query with joinedload to eliminate N+1 queries completely
    checks = (
        db.query(ComplianceCheck)
        .options(joinedload(ComplianceCheck.issues))
        .filter(ComplianceCheck.committee_id.in_(comm_ids))
        .order_by(ComplianceCheck.checked_at.desc())
        .all()
    )
    
    latest_checks = {}
    for chk in checks:
        if chk.committee_id not in latest_checks:
            latest_checks[chk.committee_id] = chk
            
    result = []
    for committee in committees:
        check = latest_checks.get(committee.id)
        if not check:
            try:
                check = run_compliance_check(db, committee.id)
            except Exception:
                continue
        
        if status and check.status != status:
            continue
        
        result.append({
            "committee_id": committee.id,
            "committee_name": committee.name,
            "committee_code": committee.code,
            "overall_score": check.overall_score,
            "status": check.status,
            "composition_score": check.composition_score,
            "tenure_score": check.tenure_score,
            "meeting_score": check.meeting_score,
            "quorum_score": check.quorum_score,
            "issues_count": len(check.issues) if check.issues else 0,
            "critical_issues": sum(1 for i in check.issues if i.severity == "CRITICAL") if check.issues else 0,
            "high_issues": sum(1 for i in check.issues if i.severity == "HIGH") if check.issues else 0,
            "checked_at": str(check.checked_at) if check.checked_at else None,
            "summary": check.summary
        })
    
    cache.set(cache_key, result, ttl_seconds=15)
    return result


@router.get("/{committee_id}", response_model=dict)
async def get_committee_compliance(
    committee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    committee = db.query(Committee).filter(Committee.id == committee_id).first()
    if not committee:
        raise HTTPException(status_code=404, detail="Committee not found")
    
    check = db.query(ComplianceCheck).filter(
        ComplianceCheck.committee_id == committee_id
    ).order_by(ComplianceCheck.checked_at.desc()).first()
    
    if not check:
        check = run_compliance_check(db, committee_id)
    
    return {
        "committee_id": committee_id,
        "committee_name": committee.name,
        "overall_score": check.overall_score,
        "status": check.status,
        "composition_score": check.composition_score,
        "tenure_score": check.tenure_score,
        "meeting_score": check.meeting_score,
        "quorum_score": check.quorum_score,
        "summary": check.summary,
        "checked_at": str(check.checked_at) if check.checked_at else None,
        "issues": [
            {
                "id": i.id,
                "issue_type": i.issue_type,
                "severity": i.severity,
                "title": i.title,
                "description": i.description,
                "recommendation": i.recommendation,
                "is_resolved": i.is_resolved
            }
            for i in check.issues
        ]
    }


@router.post("/check", response_model=dict)
async def run_check(
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    committee_id = body.get("committee_id")
    if not committee_id:
        raise HTTPException(status_code=400, detail="committee_id required")
    
    try:
        check = run_compliance_check(db, committee_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    log = AuditLog(
        user_id=current_user.id,
        action="compliance_checked",
        entity_type="committee",
        entity_id=committee_id,
        description=f"Compliance check run: {check.status} ({check.overall_score:.0f}/100)"
    )
    db.add(log)
    db.commit()

    from app.realtime import broadcast_change
    await broadcast_change("compliance", "checked", {
        "committee_id": committee_id,
        "status": check.status,
        "overall_score": check.overall_score,
    })
    
    return {
        "committee_id": committee_id,
        "status": check.status,
        "overall_score": check.overall_score,
        "issues_count": len(check.issues)
    }

