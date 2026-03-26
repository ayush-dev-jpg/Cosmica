# app/api/chat.py
# Cosmica AI Chatbot - answers astrology questions using RAG

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.knowledge.ingestion import search_knowledge
from app.core.security import get_current_user
from app.core.config import settings
import httpx

router = APIRouter(prefix="/chat", tags=["Chatbot"])

class ChatRequest(BaseModel):
    message: str
    kundli_context: Optional[dict] = None   # Optional: include user's chart

@router.post("/ask")
async def ask_cosmica(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Ask Cosmica any astrology question. Optionally include birth chart context."""

    # Search knowledge base for relevant passages
    passages = search_knowledge(req.message, top_k=4)
    knowledge_ctx = "\n\n".join(passages) if passages else ""

    # Build kundli context string if provided
    kundli_ctx = ""
    if req.kundli_context:
        kundli = req.kundli_context
        kundli_ctx = f"""
User's Birth Chart:
- Nakshatra: {kundli.get('nakshatra', {}).get('name', 'Unknown')}
- Moon Rashi: {kundli.get('moon_rashi', 'Unknown')}
- Lagna: {kundli.get('lagna', {}).get('name', 'Unknown')}
- Sun Rashi: {kundli.get('sun_rashi', 'Unknown')}
"""

    # If no OpenAI, return rule-based answer
    if not settings.OPENAI_API_KEY or not settings.OPENAI_API_KEY.startswith("sk-"):
        return {
            "answer": get_fallback_answer(req.message),
            "sources_used": len(passages)
        }

    system_prompt = """You are Cosmica, an expert Vedic astrologer and spiritual guide. 
You have deep knowledge of Jyotish Shastra, Nakshatras, Rashis, planetary transits, 
dashas, yogas, and remedies. You answer questions with wisdom, clarity, and compassion. 
Keep answers concise but meaningful. Use both Sanskrit terms and their English equivalents."""

    user_prompt = f"""Question: {req.message}

{kundli_ctx}

{f"Relevant Knowledge:{chr(10)}{knowledge_ctx}" if knowledge_ctx else ""}

Please provide a clear, helpful answer."""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 600
                },
                timeout=20.0
            )
            data = response.json()
            answer = data["choices"][0]["message"]["content"]
    except Exception as e:
        answer = get_fallback_answer(req.message)

    return {
        "answer": answer,
        "sources_used": len(passages)
    }

def get_fallback_answer(question: str) -> str:
    """Simple rule-based fallback when AI is not available"""
    q = question.lower()
    if "nakshatra" in q:
        return "Nakshatras are 27 lunar mansions in Vedic astrology, each spanning 13°20'. Your birth Nakshatra is determined by the Moon's position at your birth time and reveals your core nature, talents, and life themes."
    elif "rashi" in q:
        return "Rashi refers to the 12 zodiac signs in Vedic astrology. Your Moon Rashi (Chandra Rashi) governs your mind and emotions, while your Sun Rashi reflects your soul's purpose."
    elif "lagna" in q or "ascendant" in q:
        return "Lagna (Ascendant) is the zodiac sign rising on the eastern horizon at your birth moment. It's the most personal point in your chart, governing your physical appearance, personality, and overall life direction."
    elif "remedy" in q or "remedies" in q:
        return "Vedic astrology remedies include mantra chanting, gemstone therapy, yagnas (fire rituals), fasting on specific days, charitable giving, and planetary worship. Each remedy is tailored to specific planetary imbalances in your chart."
    elif "dasha" in q:
        return "Vimshottari Dasha is a 120-year planetary period system used in Vedic astrology. Each planet rules a specific period, during which its themes and influences dominate your life."
    else:
        return "I'm here to help with all your Vedic astrology questions! Ask me about Nakshatras, Rashis, planetary influences, dashas, remedies, or anything related to Jyotish Shastra. For AI-powered responses, configure your OpenAI key in settings."
