# app/api/nakshatra.py
# Nakshatra calculation and description endpoint

from fastapi import APIRouter
from pydantic import BaseModel
from app.core.database import db
from app.core.config import settings
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import swisseph as swe
import pytz
from datetime import datetime
import httpx

router = APIRouter(prefix="/nakshatra", tags=["Nakshatra"])

# 27 Nakshatras — full data
NAKSHATRAS = [
    {"name":"Ashwini",         "ruler":"Ketu",    "deity":"Ashwini Kumaras", "start":0,      "end":13.333},
    {"name":"Bharani",         "ruler":"Venus",   "deity":"Yama",            "start":13.333, "end":26.667},
    {"name":"Krittika",        "ruler":"Sun",     "deity":"Agni",            "start":26.667, "end":40},
    {"name":"Rohini",          "ruler":"Moon",    "deity":"Brahma",          "start":40,     "end":53.333},
    {"name":"Mrigashira",      "ruler":"Mars",    "deity":"Soma",            "start":53.333, "end":66.667},
    {"name":"Ardra",           "ruler":"Rahu",    "deity":"Rudra",           "start":66.667, "end":80},
    {"name":"Punarvasu",       "ruler":"Jupiter", "deity":"Aditi",           "start":80,     "end":93.333},
    {"name":"Pushya",          "ruler":"Saturn",  "deity":"Brihaspati",      "start":93.333, "end":106.667},
    {"name":"Ashlesha",        "ruler":"Mercury", "deity":"Nagas",           "start":106.667,"end":120},
    {"name":"Magha",           "ruler":"Ketu",    "deity":"Pitris",          "start":120,    "end":133.333},
    {"name":"Purva Phalguni",  "ruler":"Venus",   "deity":"Bhaga",           "start":133.333,"end":146.667},
    {"name":"Uttara Phalguni", "ruler":"Sun",     "deity":"Aryaman",         "start":146.667,"end":160},
    {"name":"Hasta",           "ruler":"Moon",    "deity":"Savitr",          "start":160,    "end":173.333},
    {"name":"Chitra",          "ruler":"Mars",    "deity":"Vishwakarma",     "start":173.333,"end":186.667},
    {"name":"Swati",           "ruler":"Rahu",    "deity":"Vayu",            "start":186.667,"end":200},
    {"name":"Vishakha",        "ruler":"Jupiter", "deity":"Indra-Agni",      "start":200,    "end":213.333},
    {"name":"Anuradha",        "ruler":"Saturn",  "deity":"Mitra",           "start":213.333,"end":226.667},
    {"name":"Jyeshtha",        "ruler":"Mercury", "deity":"Indra",           "start":226.667,"end":240},
    {"name":"Mula",            "ruler":"Ketu",    "deity":"Nirrti",          "start":240,    "end":253.333},
    {"name":"Purva Ashadha",   "ruler":"Venus",   "deity":"Apas",            "start":253.333,"end":266.667},
    {"name":"Uttara Ashadha",  "ruler":"Sun",     "deity":"Vishwadevas",     "start":266.667,"end":280},
    {"name":"Shravana",        "ruler":"Moon",    "deity":"Vishnu",          "start":280,    "end":293.333},
    {"name":"Dhanishta",       "ruler":"Mars",    "deity":"Vasus",           "start":293.333,"end":306.667},
    {"name":"Shatabhisha",     "ruler":"Rahu",    "deity":"Varuna",          "start":306.667,"end":320},
    {"name":"Purva Bhadra",    "ruler":"Jupiter", "deity":"Aja Ekapada",     "start":320,    "end":333.333},
    {"name":"Uttara Bhadra",   "ruler":"Saturn",  "deity":"Ahir Budhnya",    "start":333.333,"end":346.667},
    {"name":"Revati",          "ruler":"Mercury", "deity":"Pushan",          "start":346.667,"end":360},
]

RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
          'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']

class NakshatraRequest(BaseModel):
    date:    str   # YYYY-MM-DD
    time:    str   # HH:MM
    city:    str
    country: str

def get_nakshatra_from_longitude(lon: float) -> dict:
    """Calculate nakshatra from Moon's sidereal longitude"""
    lon = lon % 360
    for i, nak in enumerate(NAKSHATRAS):
        if nak["start"] <= lon < nak["end"]:
            pada_size = (nak["end"] - nak["start"]) / 4
            pada = int((lon - nak["start"]) / pada_size) + 1
            degree_in_nak = lon - nak["start"]
            return {
                "index":          i,
                "name":           nak["name"],
                "ruler":          nak["ruler"],
                "deity":          nak["deity"],
                "pada":           min(pada, 4),
                "degree_in_nak":  round(degree_in_nak, 4),
                "moon_longitude": round(lon, 4),
            }
    # Fallback to Revati
    return {"index":26,"name":"Revati","ruler":"Mercury","deity":"Pushan","pada":4,"degree_in_nak":0,"moon_longitude":lon}

@router.post("/find")
async def find_nakshatra(req: NakshatraRequest):
    """
    Calculate the user's Nakshatra from birth details.
    Returns nakshatra info + your knowledge + AI reading.
    """

    # Step 1: Geocode location
    try:
        geolocator = Nominatim(user_agent="cosmica_nakshatra")
        location   = geolocator.geocode(f"{req.city}, {req.country}", timeout=10)
        if not location:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail=f"Location '{req.city}' not found")
        lat, lon = location.latitude, location.longitude
    except GeocoderTimedOut:
        from fastapi import HTTPException
        raise HTTPException(status_code=408, detail="Location lookup timed out, try again")

    # Step 2: Get timezone
    try:
        import timezonefinder
        tf = timezonefinder.TimezoneFinder()
        tz_name = tf.timezone_at(lat=lat, lng=lon) or "Asia/Kolkata"
    except Exception:
        tz_name = "Asia/Kolkata"

    # Step 3: Convert to Julian Day
    dt = datetime.strptime(f"{req.date} {req.time}", "%Y-%m-%d %H:%M")
    tz = pytz.timezone(tz_name)
    dt_local = tz.localize(dt)
    dt_utc   = dt_local.astimezone(pytz.utc)
    jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day,
                    dt_utc.hour + dt_utc.minute/60.0)

    # Step 4: Calculate Moon's sidereal longitude
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    moon_result = swe.calc_ut(jd, swe.MOON, swe.FLG_SIDEREAL)
    moon_lon    = moon_result[0][0]

    # Step 5: Get nakshatra
    nak_data = get_nakshatra_from_longitude(moon_lon)

    # Step 6: Get Moon's rashi
    rashi_index = int(moon_lon / 30) % 12
    moon_rashi  = RASHIS[rashi_index]

    # Step 7: Fetch YOUR knowledge for this nakshatra
    your_knowledge = None
    nak_doc = await db.nakshatra_knowledge.find_one({"nakshatra": nak_data["name"]})
    if nak_doc and nak_doc.get("text"):
        your_knowledge = nak_doc["text"]

    # Step 8: Generate AI reading
    ai_reading = None
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            system_prompt = """You are Cosmica, an expert Vedic astrologer specializing in Nakshatras.
Give a deeply personalized, warm, and insightful reading about someone's birth Nakshatra.
Be specific, not generic. Cover personality, life path, relationships, and spiritual purpose."""

            user_prompt = f"""Give a detailed Nakshatra reading for:
Nakshatra: {nak_data['name']} (Pada {nak_data['pada']})
Ruling Planet: {nak_data['ruler']}
Deity: {nak_data['deity']}
Moon in: {moon_rashi}
Moon degree: {moon_lon:.2f}°

{"Astrologer's personal knowledge (include this first, expand on it):" if your_knowledge else ""}
{your_knowledge or ""}

Cover:
1. Core personality and nature
2. Life purpose and dharma  
3. Relationships and compatibility approach
4. Strengths and challenges
5. Spiritual path and growth
6. Career inclinations
7. Pada {nak_data['pada']} specific qualities

Be warm, specific, and insightful. Write in flowing paragraphs.
Make sure to fully complete every section — do not cut off mid-sentence."""

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
                            {"role":"system","content":system_prompt},
                            {"role":"user",  "content":user_prompt}
                        ],
                        "temperature": 0.75,
                        "max_tokens":  2000
                    },
                    timeout=30.0
                )
                data = response.json()
                ai_reading = data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"AI nakshatra error: {e}")

    return {
        "nakshatra_name":   nak_data["name"],
        "nakshatra_index":  nak_data["index"],
        "pada":             nak_data["pada"],
        "ruler":            nak_data["ruler"],
        "deity":            nak_data["deity"],
        "moon_rashi":       moon_rashi,
        "moon_degree":      moon_lon,
        "nakshatra_degree": nak_data["degree_in_nak"],
        "your_knowledge":   your_knowledge,
        "ai_reading":       ai_reading,
        "birth_details": {
            "date":    req.date,
            "time":    req.time,
            "city":    req.city,
            "country": req.country,
        }
    }
@router.get("/knowledge/{nakshatra_name}")
async def get_nakshatra_knowledge(nakshatra_name: str):
    """Fetch your personal knowledge for a specific nakshatra"""
    doc = await db.nakshatra_knowledge.find_one({"nakshatra": nakshatra_name})
    return {
        "nakshatra":     nakshatra_name,
        "your_knowledge": doc["text"] if doc and doc.get("text") else None,
    }