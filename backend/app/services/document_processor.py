"""
Document processing — extract text from PDF, DOCX, XLSX, CSV.
"""
import io
import logging
from typing import List

logger = logging.getLogger(__name__)


def extract_text_from_pdf(content: bytes) -> str:
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except ImportError:
        logger.warning("PyMuPDF not available")
        return ""
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return ""


def extract_text_from_docx(content: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    except ImportError:
        logger.warning("python-docx not available")
        return ""
    except Exception as e:
        logger.error(f"DOCX extraction failed: {e}")
        return ""


def extract_text_from_excel(content: bytes) -> str:
    try:
        import pandas as pd
        df = pd.read_excel(io.BytesIO(content))
        return df.to_string(index=False)
    except ImportError:
        logger.warning("pandas/openpyxl not available")
        return ""
    except Exception as e:
        logger.error(f"Excel extraction failed: {e}")
        return ""


def extract_text_from_csv(content: bytes) -> str:
    try:
        import pandas as pd
        df = pd.read_csv(io.BytesIO(content))
        return df.to_string(index=False)
    except Exception as e:
        logger.error(f"CSV extraction failed: {e}")
        return ""


def extract_text(content: bytes, filename: str) -> str:
    """Extract text from a document based on its extension."""
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    
    extractors = {
        "pdf": extract_text_from_pdf,
        "docx": extract_text_from_docx,
        "doc": extract_text_from_docx,
        "xlsx": extract_text_from_excel,
        "xls": extract_text_from_excel,
        "csv": extract_text_from_csv,
    }
    
    extractor = extractors.get(ext)
    if extractor:
        return extractor(content)
    
    # Try plain text
    try:
        return content.decode("utf-8")
    except Exception:
        return ""


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks."""
    if not text:
        return []
    
    words = text.split()
    chunks = []
    start = 0
    
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start = end - overlap
    
    return chunks
