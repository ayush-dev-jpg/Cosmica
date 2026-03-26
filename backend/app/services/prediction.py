# app/services/prediction.py
from app.knowledge.ingestion import search_knowledge
from app.core.config import settings
from app.core.database import db
import httpx

# ── Your knowledge fetcher ────────────────────────────────────

async def fetch_your_knowledge(kundli: dict) -> str:
    """
    Fetches YOUR personal knowledge from MongoDB for this specific chart.
    Checks planet-house combinations, lagna description, and nakshatra.
    """
    lagna_name      = kundli.get("lagna", {}).get("name", "")
    house_positions = kundli.get("house_positions", {})
    parts           = []

    # 1. Your Lagna description
    rashi_doc = await db.rashi_knowledge.find_one({"rashi": lagna_name})
    if rashi_doc and rashi_doc.get("text"):
        parts.append(f"► {lagna_name} Lagna:\n{rashi_doc['text']}")

    # 2. Your Nakshatra description
    nakshatra_name = kundli.get("nakshatra", {}).get("name", "")
    nak_doc = await db.nakshatra_knowledge.find_one({"nakshatra": nakshatra_name})
    if nak_doc and nak_doc.get("text"):
        parts.append(f"► {nakshatra_name} Nakshatra:\n{nak_doc['text']}")

    # 3. Your planet-in-house knowledge (lagna-specific first, then general)
    for planet, house_num in house_positions.items():
        # Try lagna-specific first
        doc = await db.planet_house_knowledge.find_one({
            "planet": planet,
            "house":  house_num,
            "lagna":  lagna_name,
        })
        if not doc:
            # Fall back to general
            doc = await db.planet_house_knowledge.find_one({
                "planet": planet,
                "house":  house_num,
                "lagna":  None,
            })
        if doc and doc.get("text"):
            label = f"for {lagna_name} Lagna" if doc.get("lagna") else "(general)"
            parts.append(f"► {planet} in House {house_num} {label}:\n{doc['text']}")

    return "\n\n".join(parts)

# ── Kundli description builder ────────────────────────────────

def build_kundli_description(kundli: dict) -> str:
    planets = kundli.get("planetary_positions", {})
    planet_lines = []
    for planet, data in planets.items():
        retro = " (Retrograde)" if data.get("retrograde") else ""
        planet_lines.append(
            f"  - {planet}: {data['rashi']}, "
            f"{data['degree_in_rashi']:.1f}°{retro}"
        )
    house_positions = kundli.get("house_positions", {})
    house_lines = [f"  - {p}: House {h}" for p, h in house_positions.items()]

    return f"""
BIRTH CHART:
━━━━━━━━━━━
Lagna:     {kundli.get('lagna', {}).get('name', 'Unknown')}
Moon Rashi: {kundli.get('moon_rashi', 'Unknown')}
Sun Rashi:  {kundli.get('sun_rashi', 'Unknown')}
Nakshatra:  {kundli.get('nakshatra', {}).get('name', 'Unknown')}, Pada {kundli.get('nakshatra', {}).get('pada', 1)}
Nakshatra Ruler: {kundli.get('nakshatra', {}).get('ruler', 'Unknown')}

PLANETARY POSITIONS:
{chr(10).join(planet_lines)}

HOUSE PLACEMENTS:
{chr(10).join(house_lines)}
"""

# ── AI prediction ─────────────────────────────────────────────

async def generate_ai_prediction(kundli: dict, prediction_type: str, your_knowledge: str) -> str:
    """Send chart + YOUR knowledge to GPT-4. Your knowledge is always priority."""

    # Get classical text from knowledge base (uploaded books)
    nakshatra  = kundli.get("nakshatra", {}).get("name", "")
    moon_rashi = kundli.get("moon_rashi", "")
    lagna      = kundli.get("lagna", {}).get("name", "")
    query      = f"{nakshatra} {moon_rashi} {lagna} {prediction_type}"
    passages   = search_knowledge(query, top_k=3)
    classical  = "\n\n".join(passages) if passages else ""

    system_prompt = """You are Cosmica, a Vedic astrology expert.
You have been given the astrologer's OWN personal knowledge (marked with ►).
This is the most important content — include ALL of it in your response.
Then enrich it with classical Vedic wisdom.
Be specific, warm, and personal. Never be generic."""

    user_prompt = f"""Generate a {prediction_type} Vedic astrology reading.

{build_kundli_description(kundli)}

══════════════════════════════════════════
ASTROLOGER'S PERSONAL KNOWLEDGE — INCLUDE ALL OF THIS FIRST:
══════════════════════════════════════════
{your_knowledge if your_knowledge else "No personal knowledge entered yet for this chart combination."}

══════════════════════════════════════════
ADDITIONAL CLASSICAL CONTEXT:
══════════════════════════════════════════
{classical if classical else "No classical texts uploaded yet."}

Instructions:
- Start with the astrologer's personal knowledge
- Then enrich with classical Vedic wisdom
- Give specific, actionable guidance
- Cover personality, current influences, and {prediction_type} forecast
- Write in warm, flowing language"""

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
                "max_tokens":  1400
            },
            timeout=30.0
        )
        data = response.json()
        return data["choices"][0]["message"]["content"]

# ── Rule-based fallback ───────────────────────────────────────

NAKSHATRA_TRAITS = {
    "Ashwini":"Swift, energetic, healing abilities, pioneering spirit",
    "Bharani":"Determined, transformative, carries deep responsibilities",
    "Krittika":"Sharp, purifying, leadership qualities like the sun",
    "Rohini":"Creative, sensual, growth-oriented, deeply artistic",
    "Mrigashira":"Curious, gentle, investigative mind, love of travel",
    "Ardra":"Intense, stormy, transformative, sharp intellect",
    "Punarvasu":"Optimistic, wise, ability to renew after any setback",
    "Pushya":"Nourishing, protective, spiritually inclined, reliable",
    "Ashlesha":"Mystical, perceptive, sharp, deep psychological insight",
    "Magha":"Royal, powerful, connected to ancestors, natural authority",
    "Purva Phalguni":"Creative, pleasure-seeking, generous, charming",
    "Uttara Phalguni":"Social, generous, partnership-oriented, balanced",
    "Hasta":"Skilled hands, healing abilities, clever, adaptable",
    "Chitra":"Artistic, brilliant, architectural thinking, strong drive",
    "Swati":"Independent, flexible, moves freely through life",
    "Vishakha":"Goal-oriented, fiery, determined, wise ambition",
    "Anuradha":"Devoted, friendly, disciplined, loyal and hardworking",
    "Jyeshtha":"Protective, intense, carries responsibility well",
    "Mula":"Investigative, drawn to root causes, philosophical",
    "Purva Ashadha":"Invincible spirit, seeks purification, early victories",
    "Uttara Ashadha":"Final lasting victory, righteous, universal outlook",
    "Shravana":"Great listener, connects people, preserves knowledge",
    "Dhanishta":"Wealthy in spirit, musical, ambitious, abundance",
    "Shatabhisha":"Healer and mystic, drawn to spiritual healing",
    "Purva Bhadra":"Fiery, intense, deep spiritual undercurrents",
    "Uttara Bhadra":"Serpentine wisdom, calm and deep, sustained effort",
    "Revati":"Nourishing, protective, completion, communication gifts",
}

RASHI_PREDICTIONS = {
    "Mesha":"Dynamic energy and new beginnings. Take initiative boldly.",
    "Vrishabha":"Stability and material security. Patience brings lasting rewards.",
    "Mithuna":"Communication and connections highlighted. Express your ideas.",
    "Karka":"Emotions and intuition guide you. Focus on home and nurturing.",
    "Simha":"Natural leadership and creativity shine. Step into the spotlight.",
    "Kanya":"Details, health, and service in focus. Analytical skills bring success.",
    "Tula":"Balance and partnerships guide your path. Relationships need attention.",
    "Vrishchika":"Deep transformation and uncovering hidden truths marks this period.",
    "Dhanu":"Expansion, wisdom, and higher learning call you. Travel brings growth.",
    "Makara":"Discipline and long-term goals are favored. Patient effort builds success.",
    "Kumbha":"Innovation and humanitarian ideals inspire you. Think outside convention.",
    "Meena":"Spirituality and compassion heightened. Trust your inner guidance.",
}

def generate_rule_based_prediction(kundli: dict, prediction_type: str, your_knowledge: str) -> str:
    """Used when no OpenAI key — still shows YOUR knowledge first"""
    nakshatra_name = kundli.get("nakshatra", {}).get("name", "Ashwini")
    moon_rashi     = kundli.get("moon_rashi", "Mesha")
    lagna_name     = kundli.get("lagna", {}).get("name", "Mesha")
    pada           = kundli.get("nakshatra", {}).get("pada", 1)
    ruler          = kundli.get("nakshatra", {}).get("ruler", "")

    nak_desc   = NAKSHATRA_TRAITS.get(nakshatra_name, "You have unique cosmic gifts.")
    rashi_fore = RASHI_PREDICTIONS.get(moon_rashi, "The stars guide your path forward.")

    # YOUR knowledge goes first if it exists
    your_section = ""
    if your_knowledge:
        your_section = f"""

---

## 📖 Astrologer's Personal Insights

{your_knowledge}"""

    return f"""✨ **Your Vedic Cosmic Profile**

**Nakshatra: {nakshatra_name} (Pada {pada})**
{nak_desc}. Your Nakshatra is ruled by **{ruler}**.

---

**Lagna: {lagna_name}**
Your rising sign shapes how the world perceives you and your overall life approach.

---

**Moon Rashi: {moon_rashi}**
{rashi_fore}
{your_section}

---

*Add your OpenAI API key for full AI-powered predictions.*"""

# ── Main function called by API ───────────────────────────────

async def generate_prediction(kundli: dict, prediction_type: str = "general") -> dict:
    """
    Main prediction function.
    1. Fetches YOUR knowledge from MongoDB first
    2. Sends it to AI as top priority
    3. AI enriches it with classical texts
    """
    # Step 1: Get YOUR personal knowledge for this chart
    your_knowledge = await fetch_your_knowledge(kundli)

    # Step 2: Generate prediction
    try:
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
            prediction_text = await generate_ai_prediction(kundli, prediction_type, your_knowledge)
            engine_used     = "AI + Your Knowledge"
        else:
            prediction_text = generate_rule_based_prediction(kundli, prediction_type, your_knowledge)
            engine_used     = "Rule-based + Your Knowledge"
    except Exception as e:
        print(f"Prediction error: {e}")
        prediction_text = generate_rule_based_prediction(kundli, prediction_type, your_knowledge)
        engine_used     = "Rule-based + Your Knowledge (fallback)"

    return {
        "prediction":              prediction_text,
        "prediction_type":         prediction_type,
        "engine":                  engine_used,
        "your_knowledge_entries":  len([p for p in your_knowledge.split("►") if p.strip()]),
        "nakshatra":               kundli.get("nakshatra", {}).get("name"),
        "moon_rashi":              kundli.get("moon_rashi"),
        "lagna":                   kundli.get("lagna", {}).get("name"),
    }