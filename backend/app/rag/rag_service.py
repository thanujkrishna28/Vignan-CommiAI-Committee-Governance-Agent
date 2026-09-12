"""
RAG (Retrieval Augmented Generation) service using pgvector.
"""
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Document, DocumentChunk
from app.services.document_processor import extract_text, chunk_text
from app.config import settings

logger = logging.getLogger(__name__)


def get_embedding(text: str) -> Optional[List[float]]:
    """Generate embedding using Gemini embedding model if supported."""
    return None


def index_document(db: Session, document_id: str, file_content: bytes, filename: str) -> bool:
    """Process and index a document for RAG."""
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return False
        
        # Extract text
        text = extract_text(file_content, filename)
        if not text:
            logger.warning(f"No text extracted from {filename}")
            return False
        
        # Chunk text
        chunks = chunk_text(text, chunk_size=800, overlap=100)
        
        # Delete old chunks
        db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
        
        # Store chunks with embeddings
        for i, chunk_text_content in enumerate(chunks):
            embedding = get_embedding(chunk_text_content)
            
            chunk = DocumentChunk(
                document_id=document_id,
                chunk_index=i,
                content=chunk_text_content,
                embedding=embedding,
                metadata_={"source": filename, "chunk": i, "total_chunks": len(chunks)}
            )
            db.add(chunk)
        
        doc.is_indexed = True
        db.commit()
        logger.info(f"Indexed document {filename} with {len(chunks)} chunks")
        return True
        
    except Exception as e:
        logger.error(f"Document indexing failed: {e}")
        db.rollback()
        return False


def search_documents(db: Session, query: str, limit: int = 5, committee_id: str = None) -> List[dict]:
    """Semantic search over indexed documents."""
    try:
        query_embedding = get_embedding(query)
        if not query_embedding:
            return text_search_fallback(db, query, limit, committee_id)
        
        # pgvector similarity search
        try:
            from pgvector.sqlalchemy import Vector
            from sqlalchemy import func, text as sql_text
            
            # Build query
            q = db.query(
                DocumentChunk,
                func.cosine_distance(DocumentChunk.embedding, query_embedding).label("distance")
            ).join(Document)
            
            if committee_id:
                q = q.filter(Document.committee_id == committee_id)
            
            results = q.order_by("distance").limit(limit).all()
            
            return [
                {
                    "content": r.DocumentChunk.content,
                    "document_id": r.DocumentChunk.document_id,
                    "score": 1 - r.distance,
                    "source": r.DocumentChunk.metadata_.get("source", "Unknown") if r.DocumentChunk.metadata_ else "Unknown"
                }
                for r in results
            ]
        except Exception as ve:
            logger.warning(f"pgvector search failed, using fallback: {ve}")
            return text_search_fallback(db, query, limit, committee_id)
            
    except Exception as e:
        logger.error(f"Document search failed: {e}")
        return []


def text_search_fallback(db: Session, query: str, limit: int = 5, committee_id: str = None) -> List[dict]:
    """Simple text search fallback when pgvector is unavailable."""
    q = db.query(DocumentChunk).join(Document)
    if committee_id:
        q = q.filter(Document.committee_id == committee_id)
    
    # Basic keyword search
    keywords = query.lower().split()[:3]
    results = []
    chunks = q.limit(100).all()
    
    for chunk in chunks:
        score = sum(1 for kw in keywords if kw in chunk.content.lower())
        if score > 0:
            results.append({"chunk": chunk, "score": score})
    
    results.sort(key=lambda x: x["score"], reverse=True)
    
    return [
        {
            "content": r["chunk"].content,
            "document_id": r["chunk"].document_id,
            "score": r["score"] / len(keywords),
            "source": r["chunk"].metadata_.get("source", "Document") if r["chunk"].metadata_ else "Document"
        }
        for r in results[:limit]
    ]
