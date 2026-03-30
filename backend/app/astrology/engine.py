# app/astrology/engine.py
# =====================================================
# COSMICA VEDIC ASTROLOGY ENGINE
# Calculates: Nakshatra, Rashi, Lagna, All 9 Planets
# Uses: Swiss Ephemeris (most accurate astronomical data)
# =====================================================

from app.astrology.swisseph_compat import swe, SWE_AVAILABLE
from datetime import datetime
import pytz

# ---------------------------------------------------
# 27 NAKSHATRAS - Complete data
# Each nakshatra spans 13°20' (13.333°) of the zodiac
# ---------------------------------------------------
NAKSHATRAS = [
    {"name": "Ashwini",         "ruler": "Ketu",    "deity": "Ashwini Kumaras", "quality": "Swift, energetic, healing"},
    {"name": "Bharani",         "ruler": "Venus",   "deity": "Yama",            "quality": "Determined, transformative"},
    {"name": "Krittika",        "ruler": "Sun",     "deity": "Agni",            "quality": "Sharp, purifying, critical"},
    {"name": "Rohini",          "ruler": "Moon",    "deity": "Brahma",          "quality": "Creative, sensual, growth"},
    {"name": "Mrigashira",      "ruler": "Mars",    "deity": "Soma",            "quality": "Searching, curious, gentle"},
    {"name": "Ardra",           "ruler": "Rahu",    "deity": "Rudra",           "quality": "Intense, stormy, transforming"},
    {"name": "Punarvasu",       "ruler": "Jupiter", "deity": "Aditi",           "quality": "Renewal, optimism, wisdom"},
    {"name": "Pushya",          "ruler": "Saturn",  "deity": "Brihaspati",      "quality": "Nourishing, protective, sacred"},
    {"name": "Ashlesha",        "ruler": "Mercury", "deity": "Nagas",           "quality": "Serpentine, mystical, sharp"},
    {"name": "Magha",           "ruler": "Ketu",    "deity": "Pitris",          "quality": "Royal, ancestral, powerful"},
    {"name": "Purva Phalguni",  "ruler": "Venus",   "deity": "Bhaga",           "quality": "Creative, pleasure, luxury"},
    {"name": "Uttara Phalguni", "ruler": "Sun",     "deity": "Aryaman",         "quality": "Partnership, social, generous"},
    {"name": "Hasta",           "ruler": "Moon",    "deity": "Savitr",          "quality": "Skilled hands, healing, clever"},
    {"name": "Chitra",          "ruler": "Mars",    "deity": "Vishwakarma",     "quality": "Artistic, brilliant, architectural"},
    {"name": "Swati",           "ruler": "Rahu",    "deity": "Vayu",            "quality": "Independent, flexible, moving"},
    {"name": "Vishakha",        "ruler": "Jupiter", "deity": "Indra-Agni",      "quality": "Goal-oriented, fiery, determined"},
    {"name": "Anuradha",        "ruler": "Saturn",  "deity": "Mitra",           "quality": "Devoted, friendly, disciplined"},
    {"name": "Jyeshtha",        "ruler": "Mercury", "deity": "Indra",           "quality": "Eldest, protective, intense"},
    {"name": "Mula",            "ruler": "Ketu",    "deity": "Nirrti",          "quality": "Rooted, investigative, extreme"},
    {"name": "Purva Ashadha",   "ruler": "Venus",   "deity": "Apas",            "quality": "Invincible, purifying, early victory"},
    {"name": "Uttara Ashadha",  "ruler": "Sun",     "deity": "Vishwadevas",     "quality": "Final victory, universal, righteous"},
    {"name": "Shravana",        "ruler": "Moon",    "deity": "Vishnu",          "quality": "Listening, learning, connecting"},
    {"name": "Dhanishta",       "ruler": "Mars",    "deity": "Vasus",           "quality": "Wealthy, musical, ambitious"},
    {"name": "Shatabhisha",     "ruler": "Rahu",    "deity": "Varuna",          "quality": "Healing, mystical, solitary"},
    {"name": "Purva Bhadra",    "ruler": "Jupiter", "deity": "Aja Ekapada",     "quality": "Fiery, intense, spiritual"},
    {"name": "Uttara Bhadra",   "ruler": "Saturn",  "deity": "Ahir Budhnya",    "quality": "Depth, serpentine wisdom, calm"},
    {"name": "Revati",          "ruler": "Mercury", "deity": "Pushan",          "quality": "Nourishing, protective, final"},
]

# ---------------------------------------------------
# 12 RASHIS (Zodiac Signs) with properties
# ---------------------------------------------------
RASHIS = [
    {"name": "Mesha",      "english": "Aries",       "element": "Fire",  "ruler": "Mars",    "quality": "Cardinal"},
    {"name": "Vrishabha",  "english": "Taurus",      "element": "Earth", "ruler": "Venus",   "quality": "Fixed"},
    {"name": "Mithuna",    "english": "Gemini",       "element": "Air",   "ruler": "Mercury", "quality": "Mutable"},
    {"name": "Karka",      "english": "Cancer",       "element": "Water", "ruler": "Moon",    "quality": "Cardinal"},
    {"name": "Simha",      "english": "Leo",          "element": "Fire",  "ruler": "Sun",     "quality": "Fixed"},
    {"name": "Kanya",      "english": "Virgo",        "element": "Earth", "ruler": "Mercury", "quality": "Mutable"},
    {"name": "Tula",       "english": "Libra",        "element": "Air",   "ruler": "Venus",   "quality": "Cardinal"},
    {"name": "Vrishchika", "english": "Scorpio",      "element": "Water", "ruler": "Mars",    "quality": "Fixed"},
    {"name": "Dhanu",      "english": "Sagittarius",  "element": "Fire",  "ruler": "Jupiter", "quality": "Mutable"},
    {"name": "Makara",     "english": "Capricorn",    "element": "Earth", "ruler": "Saturn",  "quality": "Cardinal"},
    {"name": "Kumbha",     "english": "Aquarius",     "element": "Air",   "ruler": "Saturn",  "quality": "Fixed"},
    {"name": "Meena",      "english": "Pisces",       "element": "Water", "ruler": "Jupiter", "quality": "Mutable"},
]

# Swiss Ephemeris planet IDs (deferred to avoid crash when swisseph is missing)
def _get_planet_ids():
    if not SWE_AVAILABLE:
        return {}
    return {
        "Sun":     swe.SUN,
        "Moon":    swe.MOON,
        "Mars":    swe.MARS,
        "Mercury": swe.MERCURY,
        "Jupiter": swe.JUPITER,
        "Venus":   swe.VENUS,
        "Saturn":  swe.SATURN,
        "Rahu":    swe.MEAN_NODE,   # North Node
    }

# ---------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------

def datetime_to_julian(date_str: str, time_str: str, timezone_str: str = "Asia/Kolkata") -> float:
    """
    Convert human date/time to Julian Day Number.
    Swiss Ephemeris requires Julian Day for all calculations.
    Example: "2000-01-01" "12:00" -> 2451545.0
    """
    dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    tz = pytz.timezone(timezone_str)
    dt_local = tz.localize(dt)
    dt_utc = dt_local.astimezone(pytz.utc)

    # Convert to decimal hours for Swiss Ephemeris
    decimal_hour = dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0
    return swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, decimal_hour)

def longitude_to_rashi(longitude: float) -> dict:
    """
    Convert a longitude (0-360°) to Rashi name and degree within that Rashi.
    Each Rashi = 30°. Mesha starts at 0°.
    """
    rashi_index = int(longitude / 30) % 12
    degree_in_rashi = longitude % 30
    rashi = RASHIS[rashi_index]
    return {
        "name": rashi["name"],
        "english": rashi["english"],
        "degree": round(degree_in_rashi, 2),
        "element": rashi["element"],
        "ruler": rashi["ruler"],
    }

def longitude_to_nakshatra(longitude: float) -> dict:
    """
    Convert Moon's longitude to Nakshatra.
    Each Nakshatra = 13°20' (13.333°). 27 Nakshatras × 13.333° = 360°.
    Pada = quarter of Nakshatra = 3°20' each.
    """
    nak_index = int(longitude / (360 / 27)) % 27
    nak_start = nak_index * (360 / 27)
    position_in_nak = longitude - nak_start
    pada = int(position_in_nak / (360 / 108)) + 1   # 108 padas total

    nak = NAKSHATRAS[nak_index]
    return {
        "name": nak["name"],
        "pada": min(pada, 4),   # Cap at 4
        "ruler": nak["ruler"],
        "deity": nak["deity"],
        "quality": nak["quality"],
        "degree": round(longitude, 2),
    }

# ---------------------------------------------------
# CORE CALCULATION FUNCTIONS
# ---------------------------------------------------

def calculate_planetary_positions(jd: float) -> dict:
    """
    Calculate sidereal positions for all 9 Vedic planets.
    Uses Lahiri Ayanamsa (official Indian government standard).
    """
    # Set Lahiri ayanamsa - the standard used in India for Vedic astrology
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa(jd)   # Precession correction value

    positions = {}

    for planet_name, planet_id in _get_planet_ids().items():
        # calc_ut returns: longitude, latitude, distance, speed
        result = swe.calc_ut(jd, planet_id, swe.FLG_SIDEREAL)
        lon = result[0][0]           # Sidereal longitude
        speed = result[0][3]         # Speed (negative = retrograde)

        rashi_data = longitude_to_rashi(lon)

        positions[planet_name] = {
            "longitude": round(lon, 4),
            "rashi": rashi_data["name"],
            "rashi_english": rashi_data["english"],
            "degree_in_rashi": rashi_data["degree"],
            "element": rashi_data["element"],
            "retrograde": speed < 0,
            "speed": round(speed, 4),
        }

    # Calculate Ketu = exactly opposite Rahu (180° away)
    rahu_lon = positions["Rahu"]["longitude"]
    ketu_lon = (rahu_lon + 180) % 360
    ketu_rashi = longitude_to_rashi(ketu_lon)
    positions["Ketu"] = {
        "longitude": round(ketu_lon, 4),
        "rashi": ketu_rashi["name"],
        "rashi_english": ketu_rashi["english"],
        "degree_in_rashi": ketu_rashi["degree"],
        "element": ketu_rashi["element"],
        "retrograde": True,    # Ketu is always retrograde
        "speed": 0,
    }

    return positions

def calculate_lagna(jd: float, lat: float, lon: float) -> dict:
    """
    Calculate Lagna (Ascendant) - the rising sign at birth time/location.
    This is the most personal point in the chart.
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    # Calculate house cusps using Placidus system
    cusps, ascmc = swe.houses(jd, lat, lon, b'P')
    ayanamsa = swe.get_ayanamsa(jd)

    # Apply ayanamsa correction to get sidereal ascendant
    lagna_lon = (ascmc[0] - ayanamsa) % 360
    return longitude_to_rashi(lagna_lon)

def calculate_house_positions(planetary_positions: dict, lagna: dict) -> dict:
    """
    Calculate which house each planet is in (1-12).
    House 1 starts at Lagna Rashi.
    """
    # Find which Rashi index the Lagna is in
    lagna_rashi_names = [r["name"] for r in RASHIS]
    try:
        lagna_index = lagna_rashi_names.index(lagna["name"])
    except ValueError:
        lagna_index = 0

    house_map = {}
    for planet, data in planetary_positions.items():
        try:
            planet_rashi_index = lagna_rashi_names.index(data["rashi"])
        except ValueError:
            planet_rashi_index = 0

        # House = (planet rashi - lagna rashi) mod 12 + 1
        house = ((planet_rashi_index - lagna_index) % 12) + 1
        house_map[planet] = house

    return house_map


def calculate_navamsa_longitude(longitude: float) -> float:
    """
    Calculate the D9 (Navamsa) longitude for a given sidereal longitude.
    Each rashi (30°) is divided into 9 navamsas of 3°20' each.
    Starting sign depends on the element group of the source rashi:
    - Fire (Aries, Leo, Sagittarius): start from Aries (0)
    - Earth (Taurus, Virgo, Capricorn): start from Capricorn (9)
    - Air (Gemini, Libra, Aquarius): start from Libra (6)
    - Water (Cancer, Scorpio, Pisces): start from Cancer (3)
    """
    rashi_index = int(longitude / 30) % 12
    degree_in_rashi = longitude % 30
    navamsa_within_rashi = int(degree_in_rashi / (10 / 3))  # 0-8
    # Element-based starting signs
    start_signs = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3]
    navamsa_sign = (start_signs[rashi_index] + navamsa_within_rashi) % 12
    navamsa_degree = (degree_in_rashi % (10 / 3)) * (30 / (10 / 3))
    return navamsa_sign * 30 + navamsa_degree


def calculate_dasamsa_longitude(longitude: float) -> float:
    """
    Calculate the D10 (Dasamsa) longitude for a given sidereal longitude.
    Each rashi (30°) is divided into 10 dasamsa parts of 3° each.
    Odd-indexed signs (0,2,4,6,8,10) start from same sign.
    Even-indexed signs (1,3,5,7,9,11) start from 9th sign counted from same sign.
    """
    rashi_index = int(longitude / 30) % 12
    degree_in_rashi = longitude % 30
    dasamsa_within_rashi = int(degree_in_rashi / 3)  # 0-9
    if rashi_index % 2 == 0:  # odd signs (Aries=0, Gemini=2, Leo=4, Libra=6, Sagittarius=8, Aquarius=10)
        dasamsa_sign = (rashi_index + dasamsa_within_rashi) % 12
    else:  # even signs (Taurus=1, Cancer=3, Virgo=5, Scorpio=7, Capricorn=9, Pisces=11)
        dasamsa_sign = (rashi_index + 8 + dasamsa_within_rashi) % 12
    dasamsa_degree = (degree_in_rashi % 3) * 10
    return dasamsa_sign * 30 + dasamsa_degree


def calculate_divisional_chart(planetary_positions: dict, lagna: dict, transform_fn) -> dict:
    """
    Build a divisional chart (D9, D10, etc.) from D1 positions.
    Applies a transformation function to each planet's and lagna's longitude,
    then recalculates house positions relative to the new lagna.

    Args:
        planetary_positions: D1 planetary_positions dict
        lagna: D1 lagna dict
        transform_fn: callable(longitude: float) -> float

    Returns: dict with 'lagna', 'planetary_positions', 'house_positions'
    """
    div_planets = {}
    for planet_name, data in planetary_positions.items():
        new_lon = transform_fn(data["longitude"])
        rashi_data = longitude_to_rashi(new_lon)
        div_planets[planet_name] = {
            "longitude": round(new_lon, 4),
            "rashi": rashi_data["name"],
            "rashi_english": rashi_data["english"],
            "degree_in_rashi": rashi_data["degree"],
            "element": rashi_data["element"],
            "retrograde": data["retrograde"],
            "speed": data["speed"],
        }

    # Transform lagna: reconstruct absolute longitude from rashi index + degree
    lagna_rashi_names = [r["name"] for r in RASHIS]
    lagna_rashi_index = lagna_rashi_names.index(lagna["name"])
    lagna_absolute_lon = lagna_rashi_index * 30 + lagna["degree"]
    new_lagna_lon = transform_fn(lagna_absolute_lon)
    div_lagna = longitude_to_rashi(new_lagna_lon)

    # Calculate houses relative to new lagna
    div_houses = calculate_house_positions(div_planets, div_lagna)

    return {
        "lagna": div_lagna,
        "planetary_positions": div_planets,
        "house_positions": div_houses,
    }

# ---------------------------------------------------
# MASTER FUNCTION - generates complete Kundli
# ---------------------------------------------------

def generate_kundli(date: str, time: str, lat: float, lon: float,
                    timezone: str = "Asia/Kolkata") -> dict:
    """
    Master function: generates complete Vedic birth chart.

    Input:  date (YYYY-MM-DD), time (HH:MM), lat/lon, timezone
    Output: Complete kundli with all astrological data
    """
    if not SWE_AVAILABLE:
        raise ImportError(
            "Swiss Ephemeris (pyswisseph) is not installed. "
            "Astrology calculations are unavailable."
        )

    # Step 1: Convert to Julian Day
    jd = datetime_to_julian(date, time, timezone)

    # Step 2: Calculate planetary positions
    planets = calculate_planetary_positions(jd)

    # Step 3: Calculate Lagna
    lagna = calculate_lagna(jd, lat, lon)

    # Step 4: Get Nakshatra from Moon's position
    moon_longitude = planets["Moon"]["longitude"]
    nakshatra = longitude_to_nakshatra(moon_longitude)

    # Step 5: Calculate house positions
    houses = calculate_house_positions(planets, lagna)

    # Step 6: Calculate divisional charts
    d9 = calculate_divisional_chart(planets, lagna, calculate_navamsa_longitude)
    d10 = calculate_divisional_chart(planets, lagna, calculate_dasamsa_longitude)

    # Step 7: Return complete chart
    return {
        "lagna": lagna,
        "nakshatra": nakshatra,
        "moon_rashi": planets["Moon"]["rashi"],
        "sun_rashi": planets["Sun"]["rashi"],
        "planetary_positions": planets,
        "house_positions": houses,
        "d9": d9,
        "d10": d10,
        "julian_day": jd,
        "ayanamsa": "Lahiri",
    }
