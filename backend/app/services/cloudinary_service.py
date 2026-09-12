"""
Cloudinary document service — all file operations go through the backend.
API secrets are never exposed to frontend.
Enforces structured institutional folder taxonomy:
- vignan-commiai/persons/{person_id}/{category}
- vignan-commiai/members/{member_id}/{category}
- vignan-commiai/committees/{committee_id}/{category}
- vignan-commiai/meetings/{meeting_id}/{category}
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.config import settings
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv", ".txt", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def is_cloudinary_configured() -> bool:
    return bool(settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET)


def build_cloudinary_folder(
    person_id: Optional[str] = None,
    member_id: Optional[str] = None,
    committee_id: Optional[str] = None,
    meeting_id: Optional[str] = None,
    category: str = "general"
) -> str:
    """Constructs a clean hierarchical Cloudinary folder path."""
    cat = category.lower().replace(" ", "_")
    if person_id:
        return f"vignan-commiai/persons/{person_id}/{cat}"
    if member_id:
        return f"vignan-commiai/members/{member_id}/{cat}"
    if meeting_id:
        return f"vignan-commiai/meetings/{meeting_id}/{cat}"
    if committee_id:
        return f"vignan-commiai/committees/{committee_id}/{cat}"
    return f"vignan-commiai/general/{cat}"


def upload_document(
    file_content: bytes,
    filename: str,
    folder: Optional[str] = None,
    person_id: Optional[str] = None,
    member_id: Optional[str] = None,
    committee_id: Optional[str] = None,
    meeting_id: Optional[str] = None,
    category: str = "documents"
) -> dict:
    """Upload a document to Cloudinary within structured institutional folders."""
    if not is_cloudinary_configured():
        raise ValueError("Cloudinary is not configured")
    
    target_folder = folder or build_cloudinary_folder(
        person_id=person_id,
        member_id=member_id,
        committee_id=committee_id,
        meeting_id=meeting_id,
        category=category
    )
    
    try:
        result = cloudinary.uploader.upload(
            file_content,
            folder=target_folder,
            resource_type="auto",
            use_filename=True,
            unique_filename=True
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "folder": target_folder,
            "format": result.get("format", ""),
            "size": result.get("bytes", 0)
        }
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise


def delete_document(public_id: str) -> bool:
    """Delete a document from Cloudinary."""
    if not is_cloudinary_configured():
        return False
    try:
        cloudinary.uploader.destroy(public_id, resource_type="auto")
        return True
    except Exception as e:
        logger.error(f"Cloudinary delete failed: {e}")
        return False


def get_document_url(public_id: str) -> str:
    """Get a secure URL for a document."""
    return cloudinary.utils.cloudinary_url(public_id, secure=True)[0]
