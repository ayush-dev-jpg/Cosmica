# app/api/knowledge_editor.py
from fastapi import APIRouter, HTTPException
from app.models.knowledge import PlanetHouseKnowledge, RashiKnowledge, NakshatraKnowledge
from app.core.database import db
from app.core.config import settings
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional
import httpx

router = APIRouter(prefix="/knowledge-editor", tags=["Knowledge Editor"])

# ── Astrology reference data ──────────────────────────────────
RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
          'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']
RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
            'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
RASHI_LORD = ['Mars','Venus','Mercury','Moon','Sun','Mercury',
              'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter']

# House lordship for each lagna — which houses each planet rules
PLANET_LORDS = {
    'Mesha':     {'Sun':5,'Moon':4,'Mars':[1,8],'Mercury':[3,6],'Jupiter':[9,12],'Venus':[2,7],'Saturn':[10,11],'Rahu':None,'Ketu':None},
    'Vrishabha': {'Sun':4,'Moon':3,'Mars':[7,12],'Mercury':[2,5],'Jupiter':[8,11],'Venus':[1,6],'Saturn':[9,10],'Rahu':None,'Ketu':None},
    'Mithuna':   {'Sun':3,'Moon':2,'Mars':[6,11],'Mercury':[1,4],'Jupiter':[7,10],'Venus':[5,12],'Saturn':[8,9],'Rahu':None,'Ketu':None},
    'Karka':     {'Sun':2,'Moon':1,'Mars':[5,10],'Mercury':[3,12],'Jupiter':[6,9],'Venus':[4,11],'Saturn':[7,8],'Rahu':None,'Ketu':None},
    'Simha':     {'Sun':1,'Moon':12,'Mars':[4,9],'Mercury':[2,11],'Jupiter':[5,8],'Venus':[3,10],'Saturn':[6,7],'Rahu':None,'Ketu':None},
    'Kanya':     {'Sun':12,'Moon':11,'Mars':[3,8],'Mercury':[1,10],'Jupiter':[4,7],'Venus':[2,9],'Saturn':[5,6],'Rahu':None,'Ketu':None},
    'Tula':      {'Sun':11,'Moon':10,'Mars':[2,7],'Mercury':[9,12],'Jupiter':[3,6],'Venus':[1,8],'Saturn':[4,5],'Rahu':None,'Ketu':None},
    'Vrishchika':{'Sun':10,'Moon':9,'Mars':[1,6],'Mercury':[8,11],'Jupiter':[2,5],'Venus':[7,12],'Saturn':[3,4],'Rahu':None,'Ketu':None},
    'Dhanu':     {'Sun':9,'Moon':8,'Mars':[5,12],'Mercury':[7,10],'Jupiter':[1,4],'Venus':[6,11],'Saturn':[2,3],'Rahu':None,'Ketu':None},
    'Makara':    {'Sun':8,'Moon':7,'Mars':[4,11],'Mercury':[6,9],'Jupiter':[3,12],'Venus':[5,10],'Saturn':[1,2],'Rahu':None,'Ketu':None},
    'Kumbha':    {'Sun':7,'Moon':6,'Mars':[3,10],'Mercury':[5,8],'Jupiter':[2,11],'Venus':[4,9],'Saturn':[1,12],'Rahu':None,'Ketu':None},
    'Meena':     {'Sun':6,'Moon':5,'Mars':[2,9],'Mercury':[4,7],'Jupiter':[1,10],'Venus':[3,8],'Saturn':[11,12],'Rahu':None,'Ketu':None},
}

ORDINALS = {1:'1st',2:'2nd',3:'3rd',4:'4th',5:'5th',6:'6th',
            7:'7th',8:'8th',9:'9th',10:'10th',11:'11th',12:'12th'}

# ── Planet in House ───────────────────────────────────────────

@router.post("/planet-house")
async def save_planet_house(data: PlanetHouseKnowledge):
    query = {"planet": data.planet, "house": data.house, "lagna": data.lagna}
    await db.planet_house_knowledge.update_one(
        query,
        {"$set": {**query, "text": data.text, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    lagna_label = f" for {data.lagna} Lagna" if data.lagna else " (all lagnas)"
    return {"message": f"✅ Saved: {data.planet} in House {data.house}{lagna_label}"}

@router.get("/planet-house")
async def get_planet_house(planet: str = None, house: int = None, lagna: str = None):
    query = {}
    if planet: query["planet"] = planet
    if house:  query["house"]  = house
    if lagna:  query["lagna"]  = lagna
    cursor = db.planet_house_knowledge.find(query).sort([("planet", 1), ("house", 1)])
    entries = []
    async for doc in cursor:
        entries.append({
            "id":     str(doc["_id"]),
            "planet": doc["planet"],
            "house":  doc["house"],
            "lagna":  doc.get("lagna"),
            "text":   doc["text"],
        })
    return {"entries": entries}

@router.delete("/planet-house/{entry_id}")
async def delete_planet_house(entry_id: str):
    result = await db.planet_house_knowledge.delete_one({"_id": ObjectId(entry_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Deleted successfully"}

# ── Lord in House ─────────────────────────────────────────────

class LordInHouseKnowledge(BaseModel):
    lord_house:      int
    placed_in_house: int
    lagna:           Optional[str] = None
    text:            str

@router.post("/lord-in-house")
async def save_lord_in_house(data: LordInHouseKnowledge):
    query = {
        "lord_house":      data.lord_house,
        "placed_in_house": data.placed_in_house,
        "lagna":           data.lagna,
    }
    await db.lord_in_house_knowledge.update_one(
        query,
        {"$set": {**query, "text": data.text, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    lagna_label = f" for {data.lagna} Lagna" if data.lagna else " (all lagnas)"
    return {"message": f"✅ Saved: House {data.lord_house} lord in House {data.placed_in_house}{lagna_label}"}

@router.get("/lord-in-house")
async def get_lord_in_house(lord_house: int = None, placed_in_house: int = None, lagna: str = None):
    query = {}
    if lord_house:      query["lord_house"]      = lord_house
    if placed_in_house: query["placed_in_house"]  = placed_in_house
    if lagna:           query["lagna"]            = lagna
    cursor = db.lord_in_house_knowledge.find(query).sort([("lord_house", 1), ("placed_in_house", 1)])
    entries = []
    async for doc in cursor:
        entries.append({
            "id":              str(doc["_id"]),
            "lord_house":      doc["lord_house"],
            "placed_in_house": doc["placed_in_house"],
            "lagna":           doc.get("lagna"),
            "text":            doc["text"],
        })
    return {"entries": entries}

@router.delete("/lord-in-house/{entry_id}")
async def delete_lord_in_house(entry_id: str):
    result = await db.lord_in_house_knowledge.delete_one({"_id": ObjectId(entry_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Deleted successfully"}

# ── Planet in Sign ────────────────────────────────────────────

class PlanetInSignKnowledge(BaseModel):
    planet: str
    rashi:  str
    text:   str

@router.post("/planet-sign")
async def save_planet_sign(data: PlanetInSignKnowledge):
    await db.planet_sign_knowledge.update_one(
        {"planet": data.planet, "rashi": data.rashi},
        {"$set": {"planet": data.planet, "rashi": data.rashi, "text": data.text, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    return {"message": f"✅ Saved: {data.planet} in {data.rashi}"}

@router.get("/planet-sign")
async def get_planet_sign(planet: str = None, rashi: str = None):
    query = {}
    if planet: query["planet"] = planet
    if rashi:  query["rashi"]  = rashi
    cursor = db.planet_sign_knowledge.find(query).sort([("planet", 1), ("rashi", 1)])
    entries = []
    async for doc in cursor:
        entries.append({
            "id":     str(doc["_id"]),
            "planet": doc["planet"],
            "rashi":  doc["rashi"],
            "text":   doc["text"],
        })
    return {"entries": entries}

@router.delete("/planet-sign/{entry_id}")
async def delete_planet_sign(entry_id: str):
    result = await db.planet_sign_knowledge.delete_one({"_id": ObjectId(entry_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Deleted successfully"}

# ── Rashi ─────────────────────────────────────────────────────

@router.post("/rashi")
async def save_rashi(data: RashiKnowledge):
    await db.rashi_knowledge.update_one(
        {"rashi": data.rashi},
        {"$set": {"rashi": data.rashi, "text": data.text, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    return {"message": f"✅ Saved description for {data.rashi}"}

@router.get("/rashi")
async def get_rashi():
    cursor = db.rashi_knowledge.find({}).sort("rashi", 1)
    entries = []
    async for doc in cursor:
        entries.append({"id": str(doc["_id"]), "rashi": doc["rashi"], "text": doc["text"]})
    return {"entries": entries}

# ── Nakshatra ─────────────────────────────────────────────────

@router.post("/nakshatra")
async def save_nakshatra(data: NakshatraKnowledge):
    await db.nakshatra_knowledge.update_one(
        {"nakshatra": data.nakshatra},
        {"$set": {"nakshatra": data.nakshatra, "text": data.text, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    return {"message": f"✅ Saved description for {data.nakshatra}"}

@router.get("/nakshatra")
async def get_nakshatra():
    cursor = db.nakshatra_knowledge.find({}).sort("nakshatra", 1)
    entries = []
    async for doc in cursor:
        entries.append({"id": str(doc["_id"]), "nakshatra": doc["nakshatra"], "text": doc["text"]})
    return {"entries": entries}

# ── Stats ─────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats():
    return {
        "planet_house_entries":  await db.planet_house_knowledge.count_documents({}),
        "lord_in_house_entries": await db.lord_in_house_knowledge.count_documents({}),
        "planet_sign_entries":   await db.planet_sign_knowledge.count_documents({}),
        "rashi_entries":         await db.rashi_knowledge.count_documents({}),
        "nakshatra_entries":     await db.nakshatra_knowledge.count_documents({}),
    }

# ── House Description (called when user clicks a house) ───────

class HouseDescriptionRequest(BaseModel):
    house:     int
    lagna:     str
    planets:   List[str]
    kundli_id: Optional[str] = None

@router.post("/house-description")
async def get_house_description(req: HouseDescriptionRequest):
    """
    Called when user clicks a house on the chart.
    Returns 4 types of knowledge:
      1. Planet in House  (e.g. Jupiter in House 1)
      2. Lord in House    (e.g. 9th lord in House 1, 12th lord in House 1)
      3. Planet in Sign   (e.g. Jupiter in Simha/Leo)
      4. AI description combining all of the above
    """

    # ── Correct rashi for this house ─────────────────────────
    lagna_index       = RASHIS.index(req.lagna) if req.lagna in RASHIS else 0
    house_rashi_index = (lagna_index + req.house - 1) % 12
    house_rashi       = RASHIS[house_rashi_index]
    house_rashi_en    = RASHI_EN[house_rashi_index]
    house_lord_planet = RASHI_LORD[house_rashi_index]

    lagna_lords = PLANET_LORDS.get(req.lagna, {})

    # ── 1. Planet in House knowledge ─────────────────────────
    planet_house_parts = []
    for planet in req.planets:
        # Try: 1) exact lagna, 2) general (lagna=None), 3) any available lagna
        doc = await db.planet_house_knowledge.find_one({
            "planet": planet, "house": req.house, "lagna": req.lagna,
        })
        if not doc:
            doc = await db.planet_house_knowledge.find_one({
                "planet": planet, "house": req.house, "lagna": None,
            })
        if not doc:
            doc = await db.planet_house_knowledge.find_one({
                "planet": planet, "house": req.house,
            })
        if doc and doc.get("text"):
            lagna_label = f"for {doc['lagna']} Lagna" if doc.get("lagna") else "(general)"
            planet_house_parts.append({
                "title":  f"{planet} in House {req.house} {lagna_label}",
                "text":   doc["text"],
                "planet": planet,
            })

    # ── 2. Lord in House knowledge ────────────────────────────
    lord_house_parts = []
    for planet in req.planets:
        owned_houses = lagna_lords.get(planet)
        if not owned_houses:
            continue
        if isinstance(owned_houses, int):
            owned_houses = [owned_houses]
        for owned_house in owned_houses:
            doc = await db.lord_in_house_knowledge.find_one({
                "lord_house": owned_house, "placed_in_house": req.house, "lagna": req.lagna,
            })
            if not doc:
                doc = await db.lord_in_house_knowledge.find_one({
                    "lord_house": owned_house, "placed_in_house": req.house, "lagna": None,
                })
            if not doc:
                doc = await db.lord_in_house_knowledge.find_one({
                    "lord_house": owned_house, "placed_in_house": req.house,
                })
            if doc and doc.get("text"):
                lagna_label = f"for {doc['lagna']} Lagna" if doc.get("lagna") else "(general)"
                lord_house_parts.append({
                    "title":      f"{ORDINALS.get(owned_house,str(owned_house))} Lord ({planet}) in House {req.house} {lagna_label}",
                    "text":       doc["text"],
                    "lord_house": owned_house,
                    "planet":     planet,
                })

    # ── 3. Planet in Sign knowledge ───────────────────────────
    planet_sign_parts = []
    for planet in req.planets:
        # The sign this planet is in = the rashi of this house
        doc = await db.planet_sign_knowledge.find_one({
            "planet": planet, "rashi": house_rashi,
        })
        if doc and doc.get("text"):
            rashi_en = RASHI_EN[house_rashi_index]
            planet_sign_parts.append({
                "title":  f"{planet} in {house_rashi} ({rashi_en})",
                "text":   doc["text"],
                "planet": planet,
                "rashi":  house_rashi,
            })

    # ── 4. Build context for AI ───────────────────────────────
    all_knowledge_text = ""
    for p in planet_house_parts:
        all_knowledge_text += f"\n{p['title']}:\n{p['text']}\n"
    for l in lord_house_parts:
        all_knowledge_text += f"\n{l['title']}:\n{l['text']}\n"
    for s in planet_sign_parts:
        all_knowledge_text += f"\n{s['title']}:\n{s['text']}\n"

    # Build lordship context
    lordship_context = []
    for planet in req.planets:
        owned = lagna_lords.get(planet)
        if owned:
            if isinstance(owned, int): owned = [owned]
            lordship_context.append(
                f"{planet} rules houses {', '.join(map(str, owned))} for {req.lagna} Lagna"
            )

    # ── 5. AI description ─────────────────────────────────────
    ai_description = None
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            planets_str = ", ".join(req.planets) if req.planets else "no planets"

            system_prompt = """You are Cosmica, an expert Vedic astrologer.
Give a detailed, insightful reading of a house considering:
1. The planet placed in the house
2. The house lordship of that planet
3. The sign the planet is placed in
Be warm, specific, and thorough. Prioritize the astrologer's personal knowledge."""

            user_prompt = f"""Describe House {req.house} for {req.lagna} Lagna.

House {req.house} sign: {house_rashi_en} ({house_rashi}), lord: {house_lord_planet}
Planets placed here: {planets_str}
{chr(10).join(lordship_context)}

{"Astrologer's personal knowledge (PRIORITY — include all of this):" if all_knowledge_text.strip() else "No personal knowledge entered yet."}
{all_knowledge_text}

Give a complete Vedic reading covering planetary placement, house lordship effects, and sign influence.
Be specific to {req.lagna} Lagna."""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type":  "application/json"
                    },
                    json={
                        "model":       "gpt-4o-mini",
                        "messages":    [
                            {"role": "system", "content": system_prompt},
                            {"role": "user",   "content": user_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens":  1200
                    },
                    timeout=25.0
                )
                data = response.json()
                ai_description = data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"AI house description error: {e}")

    return {
        "house":              req.house,
        "lagna":              req.lagna,
        "house_rashi":        house_rashi,
        "house_rashi_en":     house_rashi_en,
        "house_lord":         house_lord_planet,
        "planets":            req.planets,
        "planet_house_parts": planet_house_parts,
        "lord_house_parts":   lord_house_parts,
        "planet_sign_parts":  planet_sign_parts,
        "ai_description":     ai_description,
    }
# Add this to the END of your knowledge_editor.py file
# (paste before the last line if any)

# ── Separate AI reading endpoint (lazy-loaded) ────────────────

class AIReadingRequest(BaseModel):
    house:               int
    lagna:               str
    planets:             List[str]
    house_rashi:         str
    house_rashi_en:      str
    house_lord:          str
    your_knowledge_text: Optional[str] = ""

@router.post("/ai-reading")
async def get_ai_reading(req: AIReadingRequest):
    """Called only when user explicitly clicks 'Generate AI Reading'"""
    if not settings.OPENAI_API_KEY or not settings.OPENAI_API_KEY.startswith("sk-"):
        return {"ai_description": "AI not configured."}
    try:
        planets_str = ", ".join(req.planets) if req.planets else "no planets"
        system = "You are Cosmica, an expert Vedic astrologer. Give specific, insightful readings based on the astrologer's knowledge provided."
        user_prompt = f"""House {req.house} for {req.lagna} Lagna.
Sign: {req.house_rashi_en} ({req.house_rashi}), Lord: {req.house_lord}
Planets here: {planets_str}

{f"Astrologer's personal knowledge (use this as the foundation):{chr(10)}{req.your_knowledge_text}" if req.your_knowledge_text else "No personal knowledge entered yet — give a general Vedic reading."}

Give a detailed, specific Vedic reading for this house for {req.lagna} Lagna. Be concrete and personal."""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user",   "content": user_prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 700
                },
                timeout=25.0
            )
            data = response.json()
            return {"ai_description": data["choices"][0]["message"]["content"]}
    except Exception as e:
        return {"ai_description": f"Could not generate AI reading: {str(e)}"}