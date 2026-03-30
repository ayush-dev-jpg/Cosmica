# app/knowledge/ingestion.py
# ChromaDB/RAG feature disabled — using OpenAI directly instead

async def search_knowledge(query: str, lagna: str = None, n_results: int = 3):
    """Stub — ChromaDB removed. Returns empty results."""
    return []

async def ingest_pdf(file_content: bytes, filename: str):
    """Stub — ChromaDB removed."""
    return {"message": "PDF ingestion temporarily disabled", "chunks": 0}
