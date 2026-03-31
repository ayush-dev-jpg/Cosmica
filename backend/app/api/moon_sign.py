# app/api/moon_sign.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.database import db
from app.core.config import settings
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from app.astrology.swisseph_compat import swe, SWE_AVAILABLE
import pytz
from datetime import datetime
import httpx

router = APIRouter(prefix="/moon-sign", tags=["Moon Sign"])

RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
          'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']

RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
            'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

NAKSHATRAS = [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
    "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
    "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
    "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta",
    "Shatabhisha","Purva Bhadra","Uttara Bhadra","Revati"
]

class MoonSignRequest(BaseModel):
    date:    str
    time:    str
    city:    str
    country: str

@router.post("/find")
async def find_moon_sign(req: MoonSignRequest):
    if not SWE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Astrology engine unavailable: Swiss Ephemeris (pyswisseph) is not installed."
        )
    # Geocode
    try:
        geolocator = Nominatim(user_agent="cosmica_moonsign")
        location   = geolocator.geocode(f"{req.city}, {req.country}", timeout=10)
        if not location:
            raise HTTPException(status_code=400, detail=f"Location '{req.city}' not found")
        lat, lon = location.latitude, location.longitude
    except GeocoderTimedOut:
        raise HTTPException(status_code=408, detail="Location lookup timed out")

    # Timezone
    try:
        import timezonefinder
        tf      = timezonefinder.TimezoneFinder()
        tz_name = tf.timezone_at(lat=lat, lng=lon) or "Asia/Kolkata"
    except Exception:
        tz_name = "Asia/Kolkata"

    # Julian day
    dt       = datetime.strptime(f"{req.date} {req.time}", "%Y-%m-%d %H:%M")
    tz       = pytz.timezone(tz_name)
    dt_local = tz.localize(dt)
    dt_utc   = dt_local.astimezone(pytz.utc)
    jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day,
                    dt_utc.hour + dt_utc.minute/60.0)

    # Moon longitude (sidereal)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    moon_result = swe.calc_ut(jd, swe.MOON, swe.FLG_SIDEREAL)
    moon_lon    = moon_result[0][0] % 360

    # Moon sign
    rashi_index = int(moon_lon / 30) % 12
    moon_rashi  = RASHIS[rashi_index]

    # Nakshatra
    nak_index = int(moon_lon / (360/27)) % 27
    nakshatra = NAKSHATRAS[nak_index]
    nak_lon   = moon_lon % (360/27)
    pada      = int(nak_lon / (360/27/4)) + 1

    # Your knowledge for this rashi
    your_knowledge = None
    rashi_doc = await db.rashi_knowledge.find_one({"rashi": moon_rashi})
    if rashi_doc and rashi_doc.get("text"):
        your_knowledge = rashi_doc["text"]

    # AI reading
    ai_reading = None
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            system_prompt = """You are Cosmica, an expert Vedic astrologer specializing in Moon sign readings.
Give a deeply personal, warm, and insightful reading about someone's Moon sign (Chandra Rashi).
The Moon sign reveals the emotional nature, subconscious mind, and inner self.
Be specific, eloquent, and thorough. Write in flowing, rich paragraphs."""

            user_prompt = f"""Give a detailed Moon sign reading for Moon in {moon_rashi} ({RASHI_EN[rashi_index]}).
Moon degree: {moon_lon:.2f}°
Nakshatra: {nakshatra}, Pada {pada}

{"Astrologer's personal knowledge (include this first, expand richly):" if your_knowledge else ""}
{your_knowledge or ""}

Cover fully:
1. Emotional nature and inner world
2. How they love and need to be loved
3. Subconscious patterns and instincts
4. Relationship with mother and home
5. What makes them feel safe and nourished
6. Shadow side and emotional challenges
7. Path to emotional fulfilment

Write in rich, flowing paragraphs. Be warm, specific, and deeply insightful.
Make each section at least 3-4 sentences. Do not cut off — complete every section fully."""

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
                    timeout=35.0
                )
                data       = response.json()
                ai_reading = data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"AI moon sign error: {e}")

    return {
        "moon_rashi":      moon_rashi,
        "moon_rashi_en":   RASHI_EN[rashi_index],
        "moon_degree":     round(moon_lon, 4),
        "nakshatra":       nakshatra,
        "pada":            min(pada, 4),
        "your_knowledge":  your_knowledge,
        "ai_reading":      ai_reading,
        "birth_details": {
            "date": req.date, "time": req.time,
            "city": req.city, "country": req.country,
        }
    }