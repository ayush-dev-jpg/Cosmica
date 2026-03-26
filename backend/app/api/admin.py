# app/api/admin.py
# Admin-only routes for managing the knowledge base

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from app.knowledge.ingestion import (
    extract_text_from_pdf, extract_text_from_txt,
    ingest_document, list_sources, delete_source, search_knowledge
)
from app.core.security import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/upload-knowledge")
async def upload_knowledge(
    file: UploadFile = File(...),
    category: str = "general",
    # current_user: dict = Depends(require_admin)  # Uncomment for production
):
    """
    Upload a PDF or text file to the astrology knowledge base.
    Categories: general, nakshatra, rashi, remedies, yoga, dasha, planets
    """
    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # Extract text based on file type
    filename = file.filename or "unknown"
    if filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(content)
    elif filename.lower().endswith((".txt", ".md")):
        text = extract_text_from_txt(content)
    else:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and text files are supported"
        )

    if len(text.strip()) < 100:
        raise HTTPException(status_code=400, detail="File has too little readable text")

    # Ingest into vector database
    result = ingest_document(text, source_name=filename, category=category)

    return {
        "message": f"✅ '{filename}' successfully added to knowledge base",
        **result
    }

class RuleInput(BaseModel):
    title: str
    content: str
    category: str = "rules"

@router.post("/add-rule")
async def add_custom_rule(
    rule: RuleInput,
    # current_user: dict = Depends(require_admin)
):
    """Add a custom astrology rule or interpretation directly"""
    text = f"RULE: {rule.title}\n\n{rule.content}"
    result = ingest_document(text, source_name=f"rule_{rule.title}", category=rule.category)
    return {"message": "✅ Rule added to knowledge base", **result}

@router.get("/knowledge-sources")
async def get_knowledge_sources():
    """List all uploaded knowledge sources"""
    sources = list_sources()
    return {"sources": sources, "total": len(sources)}

@router.delete("/knowledge-source/{source_name}")
async def remove_knowledge_source(source_name: str):
    """Remove a knowledge source from the database"""
    result = delete_source(source_name)
    return {"message": f"Deleted '{source_name}'", **result}

@router.get("/search-knowledge")
async def search_knowledge_base(query: str, category: str = None, limit: int = 5):
    """Search the knowledge base (for testing)"""
    results = search_knowledge(query, top_k=limit, category=category)
    return {"query": query, "results": results, "count": len(results)}
