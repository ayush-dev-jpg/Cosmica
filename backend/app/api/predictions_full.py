# app/api/predictions_full.py
# Complete prediction engine — pulls ALL knowledge from DB for a chart

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import db
from app.core.config import settings
import asyncio
import httpx

router = APIRouter(prefix="/predictions-full", tags=["Full Predictions"])

RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
          'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']
RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
            'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

PLANET_LORDS = {
    'Mesha':     {'Sun':5,'Moon':4,'Mars':[1,8],'Mercury':[3,6],'Jupiter':[9,12],'Venus':[2,7],'Saturn':[10,11]},
    'Vrishabha': {'Sun':4,'Moon':3,'Mars':[7,12],'Mercury':[2,5],'Jupiter':[8,11],'Venus':[1,6],'Saturn':[9,10]},
    'Mithuna':   {'Sun':3,'Moon':2,'Mars':[6,11],'Mercury':[1,4],'Jupiter':[7,10],'Venus':[5,12],'Saturn':[8,9]},
    'Karka':     {'Sun':2,'Moon':1,'Mars':[5,10],'Mercury':[3,12],'Jupiter':[6,9],'Venus':[4,11],'Saturn':[7,8]},
    'Simha':     {'Sun':1,'Moon':12,'Mars':[4,9],'Mercury':[2,11],'Jupiter':[5,8],'Venus':[3,10],'Saturn':[6,7]},
    'Kanya':     {'Sun':12,'Moon':11,'Mars':[3,8],'Mercury':[1,10],'Jupiter':[4,7],'Venus':[2,9],'Saturn':[5,6]},
    'Tula':      {'Sun':11,'Moon':10,'Mars':[2,7],'Mercury':[9,12],'Jupiter':[3,6],'Venus':[1,8],'Saturn':[4,5]},
    'Vrishchika':{'Sun':10,'Moon':9,'Mars':[1,6],'Mercury':[8,11],'Jupiter':[2,5],'Venus':[7,12],'Saturn':[3,4]},
    'Dhanu':     {'Sun':9,'Moon':8,'Mars':[5,12],'Mercury':[7,10],'Jupiter':[1,4],'Venus':[6,11],'Saturn':[2,3]},
    'Makara':    {'Sun':8,'Moon':7,'Mars':[4,11],'Mercury':[6,9],'Jupiter':[3,12],'Venus':[5,10],'Saturn':[1,2]},
    'Kumbha':    {'Sun':7,'Moon':6,'Mars':[3,10],'Mercury':[5,8],'Jupiter':[2,11],'Venus':[4,9],'Saturn':[1,12]},
    'Meena':     {'Sun':6,'Moon':5,'Mars':[2,9],'Mercury':[4,7],'Jupiter':[1,10],'Venus':[3,8],'Saturn':[11,12]},
}

ORDINALS = {1:'1st',2:'2nd',3:'3rd',4:'4th',5:'5th',6:'6th',
            7:'7th',8:'8th',9:'9th',10:'10th',11:'11th',12:'12th'}

HOUSE_THEMES = {
    1:'Self, personality, body, appearance and life direction',
    2:'Wealth, family, speech and accumulated assets',
    3:'Courage, siblings, communication and short travels',
    4:'Mother, home, vehicles, property and happiness',
    5:'Children, intelligence, past life merit and creativity',
    6:'Enemies, diseases, debts, service and daily work',
    7:'Spouse, partnerships, business and marriage',
    8:'Longevity, occult, inheritance and transformation',
    9:'Luck, dharma, father, higher learning and fortune',
    10:'Career, profession, public status and authority',
    11:'Gains, elder siblings, social networks and aspirations',
    12:'Expenses, foreign lands, spirituality and liberation',
}

def get_house(rashi_name, lagna):
    li = RASHIS.index(lagna) if lagna in RASHIS else 0
    ri = RASHIS.index(rashi_name) if rashi_name in RASHIS else 0
    return (ri - li) % 12 + 1

class FullPredictionRequest(BaseModel):
    kundli:    dict
    lagna:     str
    person_name: Optional[str] = None

@router.post("/generate")
async def generate_full_predictions(req: FullPredictionRequest):
    """Pull ALL knowledge from DB for this chart in one shot"""
    lagna  = req.lagna
    pp     = req.kundli.get('planetary_positions', {})
    lords  = PLANET_LORDS.get(lagna, {})
    li     = RASHIS.index(lagna) if lagna in RASHIS else 0

    sections = []

    # ── For each planet: get planet-in-house, planet-in-sign, lord-in-house ──
    planet_order = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']

    # Build all DB queries to run in parallel
    async def fetch_one(planet, data):
        rashi = data.get('rashi','')
        house = get_house(rashi, lagna)
        rashi_en = RASHI_EN[RASHIS.index(rashi)] if rashi in RASHIS else rashi

        results = {}

        # Planet in house (lagna-specific first, then general)
        ph = await db.planet_house_knowledge.find_one({"planet":planet,"house":house,"lagna":lagna})
        if not ph:
            ph = await db.planet_house_knowledge.find_one({"planet":planet,"house":house,"lagna":None})
        if ph and ph.get('text'):
            results['planet_house'] = {
                'title': f"{planet} in House {house} ({ORDINALS[house]})",
                'text': ph['text'],
                'type': 'planet_house',
            }

        # Planet in sign
        ps = await db.planet_sign_knowledge.find_one({"planet":planet,"rashi":rashi})
        if ps and ps.get('text'):
            results['planet_sign'] = {
                'title': f"{planet} in {rashi} ({rashi_en})",
                'text': ps['text'],
                'type': 'planet_sign',
            }

        # Lord in house (this planet lords which houses?)
        owned = lords.get(planet)
        lord_readings = []
        if owned:
            if isinstance(owned, int): owned = [owned]
            for oh in owned:
                lh = await db.lord_in_house_knowledge.find_one(
                    {"lord_house":oh,"placed_in_house":house,"lagna":lagna})
                if not lh:
                    lh = await db.lord_in_house_knowledge.find_one(
                        {"lord_house":oh,"placed_in_house":house,"lagna":None})
                if lh and lh.get('text'):
                    lord_readings.append({
                        'title': f"{ORDINALS[oh]} Lord ({planet}) in House {house}",
                        'text': lh['text'],
                        'type': 'lord_house',
                        'lord_house': oh,
                    })
        if lord_readings:
            results['lord_house'] = lord_readings

        return planet, house, rashi, rashi_en, results

    # Run all planets in parallel
    tasks = [fetch_one(p, pp[p]) for p in planet_order if p in pp]
    planet_results = await asyncio.gather(*tasks)

    for planet, house, rashi, rashi_en, readings in planet_results:
        if not readings: continue
        planet_section = {
            'planet': planet,
            'house': house,
            'rashi': rashi,
            'rashi_en': rashi_en,
            'house_theme': HOUSE_THEMES.get(house, ''),
            'readings': [],
        }
        if 'planet_house' in readings:
            planet_section['readings'].append(readings['planet_house'])
        if 'planet_sign' in readings:
            planet_section['readings'].append(readings['planet_sign'])
        if 'lord_house' in readings:
            planet_section['readings'].extend(readings['lord_house'])

        if planet_section['readings']:
            sections.append(planet_section)

    # Build summary text for chatbot context
    summary_text = f"Chart for {req.person_name or 'the native'}, {lagna} Lagna.\n\n"
    for s in sections:
        summary_text += f"{s['planet']} in House {s['house']} ({s['rashi']}):\n"
        for r in s['readings']:
            summary_text += f"  [{r['type']}] {r['title']}: {r['text'][:200]}...\n"
        summary_text += "\n"

    return {
        'lagna': lagna,
        'person_name': req.person_name,
        'sections': sections,
        'total_readings': sum(len(s['readings']) for s in sections),
        'summary_for_chatbot': summary_text[:4000],  # keep under token limit
    }

class ChatRequest(BaseModel):
    question:       str
    chart_summary:  str
    person_name:    Optional[str] = None
    lagna:          Optional[str] = None
    history:        Optional[List[dict]] = []

@router.post("/chat")
async def prediction_chat(req: ChatRequest):
    """Chatbot that answers questions using the chart knowledge"""
    if not settings.OPENAI_API_KEY or not settings.OPENAI_API_KEY.startswith("sk-"):
        return {"answer": "AI chat not configured."}
    try:
        system = f"""You are Cosmica, an expert Vedic astrologer assistant.
You are helping {req.person_name or 'the user'} understand their birth chart ({req.lagna} Lagna).

Here is the complete knowledge from their chart:
{req.chart_summary}

Guidelines:
- Answer questions specifically based on their chart data above
- Be warm, encouraging, and specific
- Reference actual planets and houses when answering
- If asked about something not in the chart data, say you'll need more details
- Keep answers concise but insightful (2-3 paragraphs max)
- Use simple language, avoid jargon"""

        messages = [{"role":"system","content":system}]
        # Add conversation history
        for h in (req.history or [])[-6:]:  # last 6 messages
            messages.append(h)
        messages.append({"role":"user","content":req.question})

        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization":f"Bearer {settings.OPENAI_API_KEY}","Content-Type":"application/json"},
                json={"model":"gpt-4o-mini","messages":messages,"temperature":0.7,"max_tokens":500},
                timeout=20.0
            )
            data = res.json()
            answer = data["choices"][0]["message"]["content"]
            return {"answer": answer}
    except Exception as e:
        return {"answer": f"Could not process your question: {str(e)}"}