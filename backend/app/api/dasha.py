# app/api/dasha.py
# Vimshottari Dasha Calculator

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/dasha", tags=["Dasha"])

# Vimshottari dasha sequence and years
DASHA_SEQUENCE = [
    {'planet': 'Ketu',    'years': 7,  'color': '#fb923c', 'emoji': '☋'},
    {'planet': 'Venus',   'years': 20, 'color': '#f472b6', 'emoji': '♀'},
    {'planet': 'Sun',     'years': 6,  'color': '#f59e0b', 'emoji': '☀️'},
    {'planet': 'Moon',    'years': 10, 'color': '#60a5fa', 'emoji': '🌙'},
    {'planet': 'Mars',    'years': 7,  'color': '#f87171', 'emoji': '♂'},
    {'planet': 'Rahu',    'years': 18, 'color': '#818cf8', 'emoji': '☊'},
    {'planet': 'Jupiter', 'years': 16, 'color': '#c084fc', 'emoji': '♃'},
    {'planet': 'Saturn',  'years': 19, 'color': '#94a3b8', 'emoji': '♄'},
    {'planet': 'Mercury', 'years': 17, 'color': '#34d399', 'emoji': '☿'},
]
TOTAL_YEARS = 120

# Nakshatra to dasha lord mapping (index = nakshatra number 0-26)
NAKSHATRA_LORDS = [
    'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',  # 0-8
    'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',  # 9-17
    'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',  # 18-26
]

# Nakshatra spans 13°20' = 13.333°
NAK_SIZE = 360 / 27

DASHA_DESCRIPTIONS = {
    'Ketu': {
        'theme': 'Spiritual awakening, detachment, past karma',
        'positive': 'Spiritual growth, moksha orientation, intuition, liberation from material desires',
        'challenging': 'Confusion, isolation, sudden losses, health concerns, identity crisis',
        'advice': 'Focus on spiritual practices, meditation, and releasing attachments. This is a period of karmic completion.'
    },
    'Venus': {
        'theme': 'Pleasure, relationships, creativity, abundance',
        'positive': 'Romance, marriage, wealth, artistic success, luxury, charm and social grace',
        'challenging': 'Overindulgence, relationship complications, financial excess, vanity',
        'advice': 'Enjoy life\'s pleasures mindfully. Excellent for marriage, creative projects, and building wealth.'
    },
    'Sun': {
        'theme': 'Authority, career, father, self-expression',
        'positive': 'Career advancement, government recognition, leadership, confidence and vitality',
        'challenging': 'Ego conflicts, health issues related to heart/eyes, problems with authority',
        'advice': 'Assert yourself confidently. Good time for career moves and taking leadership positions.'
    },
    'Moon': {
        'theme': 'Mind, emotions, mother, public, travel',
        'positive': 'Emotional richness, public popularity, travel, home comforts, mother\'s support',
        'challenging': 'Emotional instability, mood swings, excessive worry, change and uncertainty',
        'advice': 'Nurture yourself and relationships. Travel is favored. Work on emotional intelligence.'
    },
    'Mars': {
        'theme': 'Energy, courage, action, property, siblings',
        'positive': 'Physical vitality, career drive, property gains, athletic success, bold decisions',
        'challenging': 'Aggression, accidents, conflicts, haste, injuries, disputes over property',
        'advice': 'Channel your energy productively. Good for sports, business, and property. Avoid recklessness.'
    },
    'Rahu': {
        'theme': 'Ambition, foreign lands, technology, illusion',
        'positive': 'Sudden rise, foreign opportunities, technological success, breaking conventions',
        'challenging': 'Obsession, deception, confusion, unconventional risks, karmic turbulence',
        'advice': 'Think big and embrace change. Foreign connections and technology sectors are favored. Stay grounded.'
    },
    'Jupiter': {
        'theme': 'Wisdom, expansion, dharma, children, fortune',
        'positive': 'Prosperity, spiritual growth, education, children, marriage, divine grace',
        'challenging': 'Overexpansion, complacency, weight gain, excessive optimism, legal issues',
        'advice': 'Expand your horizons through education and travel. Excellent for marriage, children, and spiritual growth.'
    },
    'Saturn': {
        'theme': 'Discipline, karma, hard work, delays, longevity',
        'positive': 'Lasting achievements through discipline, career stability, wisdom through hardship',
        'challenging': 'Delays, restrictions, health challenges, depression, isolation, heavy responsibilities',
        'advice': 'Work hard and be patient. Everything earned now will last. Avoid shortcuts. Health vigilance needed.'
    },
    'Mercury': {
        'theme': 'Intellect, communication, business, education',
        'positive': 'Business success, communication skills, education, writing, media, travel',
        'challenging': 'Overthinking, scattered energy, nervous tension, communication misunderstandings',
        'advice': 'Excellent for business, writing, and education. Use your analytical mind. Multiple projects work well.'
    },
}

ANTARDASHA_DAYS = {
    ('Ketu','Ketu'):138,'Ketu_Venus':480,'Ketu_Sun':108,'Ketu_Moon':210,
    'Ketu_Mars':138,'Ketu_Rahu':378,'Ketu_Jupiter':336,'Ketu_Saturn':420,
    'Ketu_Mercury':354,
}

def days_in_years(years): return years * 365.25

def get_dasha_start_planet_and_elapsed(moon_longitude: float, birth_date: datetime):
    """Calculate which dasha planet is active at birth and how much has elapsed"""
    nak_index = int(moon_longitude / NAK_SIZE)
    nak_pos   = moon_longitude % NAK_SIZE
    elapsed_fraction = nak_pos / NAK_SIZE  # 0-1, how much of nakshatra is done

    lord = NAKSHATRA_LORDS[nak_index]

    # Find this lord in dasha sequence
    lord_index = next(i for i, d in enumerate(DASHA_SEQUENCE) if d['planet'] == lord)
    lord_years = DASHA_SEQUENCE[lord_index]['years']

    elapsed_years = elapsed_fraction * lord_years

    return lord_index, elapsed_years

def calculate_dashas(moon_longitude: float, birth_date: datetime):
    """Calculate full Vimshottari dasha timeline"""
    lord_index, elapsed_years = get_dasha_start_planet_and_elapsed(moon_longitude, birth_date)

    dashas = []
    current_date = birth_date

    # First dasha — partially elapsed
    first = DASHA_SEQUENCE[lord_index]
    remaining_years = first['years'] - elapsed_years
    end_date = current_date + timedelta(days=days_in_years(remaining_years))

    dashas.append({
        **first,
        'start': current_date.strftime('%Y-%m-%d'),
        'end':   end_date.strftime('%Y-%m-%d'),
        'start_age': 0,
        'end_age': round(remaining_years, 1),
        'duration_years': round(remaining_years, 1),
        'description': DASHA_DESCRIPTIONS.get(first['planet'], {}),
        'antardasha': calculate_antardasha(first['planet'], current_date, remaining_years),
    })
    current_date = end_date

    # Remaining dashas in sequence
    age = remaining_years
    idx = (lord_index + 1) % 9
    while age < TOTAL_YEARS:
        d = DASHA_SEQUENCE[idx]
        years = min(d['years'], TOTAL_YEARS - age)
        end_date = current_date + timedelta(days=days_in_years(years))
        dashas.append({
            **d,
            'start': current_date.strftime('%Y-%m-%d'),
            'end':   end_date.strftime('%Y-%m-%d'),
            'start_age': round(age, 1),
            'end_age':   round(age + years, 1),
            'duration_years': round(years, 1),
            'description': DASHA_DESCRIPTIONS.get(d['planet'], {}),
            'antardasha': calculate_antardasha(d['planet'], current_date, years),
        })
        current_date = end_date
        age += years
        idx = (idx + 1) % 9

    return dashas

def calculate_antardasha(maha_planet: str, start_date: datetime, maha_years: float):
    """Calculate Antardasha (sub-periods) within a Mahadasha"""
    # Find maha planet index in sequence
    maha_idx = next(i for i, d in enumerate(DASHA_SEQUENCE) if d['planet'] == maha_planet)
    antardasha = []
    current = start_date
    total_maha_days = days_in_years(maha_years)

    for i in range(9):
        idx = (maha_idx + i) % 9
        sub = DASHA_SEQUENCE[idx]
        # Antardasha duration = (maha_years * sub_years / 120) years
        sub_days = (maha_years * sub['years'] / 120) * 365.25
        if sub_days > total_maha_days: sub_days = total_maha_days
        end = current + timedelta(days=sub_days)
        antardasha.append({
            'planet': sub['planet'],
            'color':  sub['color'],
            'emoji':  sub['emoji'],
            'start':  current.strftime('%Y-%m-%d'),
            'end':    end.strftime('%Y-%m-%d'),
            'duration_months': round(sub_days / 30.44, 1),
        })
        current = end
        total_maha_days -= sub_days
        if total_maha_days <= 0: break

    return antardasha

def find_current_dasha(dashas: list, today: datetime):
    """Find which mahadasha and antardasha is currently active"""
    today_str = today.strftime('%Y-%m-%d')
    for d in dashas:
        if d['start'] <= today_str <= d['end']:
            # Find antardasha
            current_antardasha = None
            for a in d.get('antardasha', []):
                if a['start'] <= today_str <= a['end']:
                    current_antardasha = a
                    break
            return d, current_antardasha
    return None, None

# ── API ───────────────────────────────────────────────────────

class DashaRequest(BaseModel):
    birth_date:    str   # YYYY-MM-DD
    moon_longitude: float  # absolute sidereal longitude of Moon (0-360)
    name:          Optional[str] = None

@router.post("/calculate")
async def calculate_dasha(req: DashaRequest):
    birth_date = datetime.strptime(req.birth_date, '%Y-%m-%d')
    today      = datetime.now()

    dashas = calculate_dashas(req.moon_longitude, birth_date)
    current_maha, current_antar = find_current_dasha(dashas, today)

    # Current age
    age_days  = (today - birth_date).days
    age_years = round(age_days / 365.25, 1)

    return {
        'name':              req.name,
        'birth_date':        req.birth_date,
        'age':               age_years,
        'dashas':            dashas,
        'current_mahadasha': current_maha,
        'current_antardasha':current_antar,
        'today':             today.strftime('%Y-%m-%d'),
    }