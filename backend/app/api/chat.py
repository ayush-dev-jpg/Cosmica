# app/api/chat.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import httpx
from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str
    kundli_data: Optional[dict] = None

@router.post("/message")
async def chat_message(req: ChatRequest):
    if not settings.OPENAI_API_KEY:
        return {"response": "AI chat not configured."}
    try:
        system = "You are Cosmica, an expert Vedic astrologer. Answer questions about Vedic astrology clearly and helpfully."
        if req.kundli_data:
            system += f"\n\nUser's chart data: {req.kundli_data}"
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                json={"model": "gpt-4o-mini", "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": req.message}
                ], "max_tokens": 500},
                timeout=20.0
            )
            data = res.json()
            return {"response": data["choices"][0]["message"]["content"]}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}
