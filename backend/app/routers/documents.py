from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Document, Committee, User, UserRole, AuditLog, DocumentCategory
from app.auth.auth import get_current_user, require_role
from app.services.cloudinary_service import upload_document, delete_document, is_cloudinary_configured, ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from app.services.document_processor import extract_text
import os

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_MIME_TYPES = {
    "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv", "text/plain"
}


@router.get("", response_model=List[dict])
async def list_documents(
    committee_id: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Document)
    if committee_id:
        q = q.filter(Document.committee_id == committee_id)
    if category:
        q = q.filter(Document.category == category)
    if search:
        q = q.filter(Document.name.ilike(f"%{search}%"))
    
    docs = q.order_by(Document.created_at.desc()).all()
    result = []
    for d in docs:
        result.append({
            "id": d.id,
            "name": d.name,
            "original_filename": d.original_filename,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "cloudinary_url": d.cloudinary_url,
            "category": d.category,
            "description": d.description,
            "committee_id": d.committee_id,
            "meeting_id": d.meeting_id,
            "is_indexed": d.is_indexed,
            "created_at": str(d.created_at) if d.created_at else None,
            "committee_name": d.committee.name if d.committee else None,
            "uploaded_by_name": d.uploader.name if d.uploader else None
        })
    return result


@router.post("/upload", response_model=dict, status_code=201)
async def upload_doc(
    file: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form("OTHER"),
    description: Optional[str] = Form(None),
    committee_id: Optional[str] = Form(None),
    meeting_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")
    
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 50MB allowed.")
    
    cloudinary_url = None
    cloudinary_public_id = None
    
    if is_cloudinary_configured():
        try:
            result = upload_document(
                file_content=content,
                filename=file.filename,
                person_id=current_user.id,
                committee_id=committee_id,
                meeting_id=meeting_id,
                category=category
            )
            cloudinary_url = result["url"]
            cloudinary_public_id = result["public_id"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
    doc = Document(
        name=name,
        original_filename=file.filename,
        file_type=ext.lstrip("."),
        file_size=len(content),
        cloudinary_url=cloudinary_url,
        cloudinary_public_id=cloudinary_public_id,
        category=category,
        description=description,
        committee_id=committee_id,
        meeting_id=meeting_id,
        uploaded_by=current_user.id,
        is_indexed=False
    )
    db.add(doc)
    
    log = AuditLog(
        user_id=current_user.id,
        action="document_uploaded",
        entity_type="document",
        description=f"Document '{name}' uploaded"
    )
    db.add(log)
    db.commit()
    db.refresh(doc)
    
    # Index document for RAG asynchronously
    try:
        from app.rag.rag_service import index_document
        index_document(db, doc.id, content, file.filename)
    except Exception as e:
        pass  # RAG indexing is optional
    
    return {
        "id": doc.id,
        "name": doc.name,
        "cloudinary_url": doc.cloudinary_url,
        "is_indexed": doc.is_indexed,
        "category": doc.category
    }


@router.delete("/{document_id}", status_code=204)
async def delete_doc(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.REGISTRAR, UserRole.CONVENER))
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc.cloudinary_public_id:
        delete_document(doc.cloudinary_public_id)
    
    db.delete(doc)
    db.commit()
