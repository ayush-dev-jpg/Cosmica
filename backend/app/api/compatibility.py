# app/api/compatibility.py
# 36 Guna (Ashtakoot) Marriage Compatibility Calculator

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/compatibility", tags=["Compatibility"])

# ── Nakshatra data ────────────────────────────────────────────
NAKSHATRAS = [
    {"name":"Ashwini",         "ruler":"Ketu",    "gana":"Deva",  "yoni":"Horse",    "varna":"Shudra",   "nadi":"Aadi"},
    {"name":"Bharani",         "ruler":"Venus",   "gana":"Manav", "yoni":"Elephant", "varna":"Mleccha",  "nadi":"Madhya"},
    {"name":"Krittika",        "ruler":"Sun",     "gana":"Raksha","yoni":"Goat",     "varna":"Brahmin",  "nadi":"Antya"},
    {"name":"Rohini",          "ruler":"Moon",    "gana":"Manav", "yoni":"Serpent",  "varna":"Shudra",   "nadi":"Antya"},
    {"name":"Mrigashira",      "ruler":"Mars",    "gana":"Deva",  "yoni":"Serpent",  "varna":"Vaishya",  "nadi":"Madhya"},
    {"name":"Ardra",           "ruler":"Rahu",    "gana":"Manav", "yoni":"Dog",      "varna":"Mleccha",  "nadi":"Aadi"},
    {"name":"Punarvasu",       "ruler":"Jupiter", "gana":"Deva",  "yoni":"Cat",      "varna":"Vaishya",  "nadi":"Aadi"},
    {"name":"Pushya",          "ruler":"Saturn",  "gana":"Deva",  "yoni":"Goat",     "varna":"Kshatriya","nadi":"Madhya"},
    {"name":"Ashlesha",        "ruler":"Mercury", "gana":"Raksha","yoni":"Cat",      "varna":"Mleccha",  "nadi":"Antya"},
    {"name":"Magha",           "ruler":"Ketu",    "gana":"Raksha","yoni":"Rat",      "varna":"Shudra",   "nadi":"Aadi"},
    {"name":"Purva Phalguni",  "ruler":"Venus",   "gana":"Manav", "yoni":"Rat",      "varna":"Brahmin",  "nadi":"Madhya"},
    {"name":"Uttara Phalguni", "ruler":"Sun",     "gana":"Manav", "yoni":"Cow",      "varna":"Kshatriya","nadi":"Antya"},
    {"name":"Hasta",           "ruler":"Moon",    "gana":"Deva",  "yoni":"Buffalo",  "varna":"Vaishya",  "nadi":"Antya"},
    {"name":"Chitra",          "ruler":"Mars",    "gana":"Raksha","yoni":"Tiger",    "varna":"Mleccha",  "nadi":"Madhya"},
    {"name":"Swati",           "ruler":"Rahu",    "gana":"Deva",  "yoni":"Buffalo",  "varna":"Mleccha",  "nadi":"Aadi"},
    {"name":"Vishakha",        "ruler":"Jupiter", "gana":"Raksha","yoni":"Tiger",    "varna":"Mleccha",  "nadi":"Aadi"},
    {"name":"Anuradha",        "ruler":"Saturn",  "gana":"Deva",  "yoni":"Hare",     "varna":"Shudra",   "nadi":"Madhya"},
    {"name":"Jyeshtha",        "ruler":"Mercury", "gana":"Raksha","yoni":"Hare",     "varna":"Mleccha",  "nadi":"Antya"},
    {"name":"Mula",            "ruler":"Ketu",    "gana":"Raksha","yoni":"Dog",      "varna":"Mleccha",  "nadi":"Aadi"},
    {"name":"Purva Ashadha",   "ruler":"Venus",   "gana":"Manav", "yoni":"Monkey",   "varna":"Brahmin",  "nadi":"Madhya"},
    {"name":"Uttara Ashadha",  "ruler":"Sun",     "gana":"Manav", "yoni":"Mongoose", "varna":"Kshatriya","nadi":"Antya"},
    {"name":"Shravana",        "ruler":"Moon",    "gana":"Deva",  "yoni":"Monkey",   "varna":"Mleccha",  "nadi":"Antya"},
    {"name":"Dhanishta",       "ruler":"Mars",    "gana":"Raksha","yoni":"Lion",     "varna":"Shudra",   "nadi":"Madhya"},
    {"name":"Shatabhisha",     "ruler":"Rahu",    "gana":"Raksha","yoni":"Horse",    "varna":"Mleccha",  "nadi":"Aadi"},
    {"name":"Purva Bhadra",    "ruler":"Jupiter", "gana":"Manav", "yoni":"Lion",     "varna":"Brahmin",  "nadi":"Aadi"},
    {"name":"Uttara Bhadra",   "ruler":"Saturn",  "gana":"Manav", "yoni":"Cow",      "varna":"Kshatriya","nadi":"Madhya"},
    {"name":"Revati",          "ruler":"Mercury", "gana":"Deva",  "yoni":"Elephant", "varna":"Shudra",   "nadi":"Antya"},
]

RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
          'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']

# Vashya groups
VASHYA = {
    'Mesha':'Chatushpad','Vrishabha':'Chatushpad','Mithuna':'Nara',
    'Karka':'Jalachara','Simha':'Vanachara','Kanya':'Nara',
    'Tula':'Nara','Vrishchika':'Keeta','Dhanu':'Chatushpad',
    'Makara':'Jalachara','Kumbha':'Nara','Meena':'Jalachara'
}

# Yoni compatibility (same=4, friendly=3, neutral=2, enemy=1, worst=0)
YONI_PAIRS = {
    frozenset(['Horse','Horse']):4, frozenset(['Elephant','Elephant']):4,
    frozenset(['Goat','Goat']):4, frozenset(['Serpent','Serpent']):4,
    frozenset(['Dog','Dog']):4, frozenset(['Cat','Cat']):4,
    frozenset(['Rat','Rat']):4, frozenset(['Cow','Cow']):4,
    frozenset(['Buffalo','Buffalo']):4, frozenset(['Tiger','Tiger']):4,
    frozenset(['Hare','Hare']):4, frozenset(['Monkey','Monkey']):4,
    frozenset(['Mongoose','Mongoose']):4, frozenset(['Lion','Lion']):4,
    # Enemies
    frozenset(['Horse','Buffalo']):0, frozenset(['Elephant','Lion']):0,
    frozenset(['Goat','Monkey']):0, frozenset(['Serpent','Mongoose']):0,
    frozenset(['Dog','Hare']):0, frozenset(['Cat','Rat']):0,
    frozenset(['Cow','Tiger']):0,
    # Friendly pairs
    frozenset(['Horse','Cat']):3, frozenset(['Elephant','Goat']):3,
    frozenset(['Dog','Monkey']):3, frozenset(['Serpent','Serpent']):4,
}

# Planet friendship for Graha Maitri
PLANET_FRIENDS = {
    'Sun':    ['Moon','Mars','Jupiter'],
    'Moon':   ['Sun','Mercury'],
    'Mars':   ['Sun','Moon','Jupiter'],
    'Mercury':['Sun','Venus'],
    'Jupiter':['Sun','Moon','Mars'],
    'Venus':  ['Mercury','Saturn'],
    'Saturn': ['Mercury','Venus'],
    'Rahu':   ['Venus','Saturn'],
    'Ketu':   ['Mars','Venus','Saturn'],
}

PLANET_ENEMIES = {
    'Sun':    ['Venus','Saturn'],
    'Moon':   ['None'],
    'Mars':   ['Mercury'],
    'Mercury':['Moon'],
    'Jupiter':['Mercury','Venus'],
    'Venus':  ['Sun','Moon'],
    'Saturn': ['Sun','Moon','Mars'],
    'Rahu':   ['Sun','Moon','Mars'],
    'Ketu':   ['Sun','Moon'],
}

# Varna order (higher = better)
VARNA_ORDER = {'Brahmin':4,'Kshatriya':3,'Vaishya':2,'Shudra':1,'Mleccha':1}

# Rajju groups
RAJJU_GROUPS = {
    'Siro':  [0,8,9,17,18,26],  # Ashwini,Ashlesha,Magha,Jyeshtha,Mula,Revati
    'Kantha':[2,6,11,15,20,24], # Krittika,Punarvasu,Uttara Phalguni,Vishakha,Uttara Ashadha,Purva Bhadra
    'Udara': [3,5,12,14,21,23], # Rohini,Ardra,Hasta,Swati,Shravana,Shatabhisha
    'Kati':  [1,7,10,16,19,25], # Bharani,Pushya,Purva Phalguni,Anuradha,Purva Ashadha,Uttara Bhadra
    'Pada':  [4,13,22],         # Mrigashira,Chitra,Dhanishta (+ their pairs)
}

# Vedha pairs (nakshatras that harm each other)
VEDHA_PAIRS = [
    (0,17),(1,11),(2,9),(3,22),(4,14),(5,15),(6,20),
    (7,23),(8,18),(10,24),(12,26),(13,25),(16,19),(21,21)
]

def get_nakshatra_from_degree(rashi_name: str, degree_in_rashi: float) -> dict:
    rashi_index = RASHIS.index(rashi_name) if rashi_name in RASHIS else 0
    absolute_deg = rashi_index * 30 + degree_in_rashi
    nak_size = 360 / 27
    nak_index = int(absolute_deg / nak_size) % 27
    deg_in_nak = absolute_deg % nak_size
    pada = min(int(deg_in_nak / (nak_size / 4)) + 1, 4)
    return {**NAKSHATRAS[nak_index], 'index': nak_index, 'pada': pada,
            'rashi': rashi_name, 'absolute_deg': absolute_deg}

# ── Koota calculations ────────────────────────────────────────

def calc_varna(n1, n2):
    """Max 1 point"""
    v1 = VARNA_ORDER.get(n1['varna'], 1)
    v2 = VARNA_ORDER.get(n2['varna'], 1)
    score = 1 if v1 >= v2 else 0
    return {
        'name': 'Varna', 'max': 1, 'score': score,
        'boy': n1['varna'], 'girl': n2['varna'],
        'description': 'Spiritual compatibility and ego levels',
        'result': 'Compatible' if score == 1 else 'Needs attention'
    }

def calc_vashya(n1, n2, rashi1, rashi2):
    """Max 2 points"""
    v1 = VASHYA.get(rashi1, 'Nara')
    v2 = VASHYA.get(rashi2, 'Nara')
    if v1 == v2:
        score = 2
    elif (v1 == 'Jalachara' and v2 == 'Nara') or (v2 == 'Jalachara' and v1 == 'Nara'):
        score = 1
    elif (v1 == 'Chatushpad' and v2 == 'Vanachara') or (v2 == 'Chatushpad' and v1 == 'Vanachara'):
        score = 1
    else:
        score = 0
    return {
        'name': 'Vashya', 'max': 2, 'score': score,
        'boy': v1, 'girl': v2,
        'description': 'Mutual attraction and power dynamic',
        'result': 'Excellent' if score==2 else 'Average' if score==1 else 'Low attraction'
    }

def calc_tara(n1_idx, n2_idx):
    """Max 3 points — count from boy's nakshatra to girl's"""
    tara = (n2_idx - n1_idx) % 27
    tara_num = (tara % 9) + 1
    good_taras = [1, 2, 4, 6, 8]  # Janma, Sampat, Kshema, Sadhana, Mitra
    score = 3 if tara_num in good_taras else 0
    tara_names = {1:'Janma',2:'Sampat',3:'Vipat',4:'Kshema',5:'Pratyak',
                  6:'Sadhana',7:'Naidhana',8:'Mitra',9:'Paramamitra'}
    return {
        'name': 'Tara', 'max': 3, 'score': score,
        'boy': NAKSHATRAS[n1_idx]['name'], 'girl': NAKSHATRAS[n2_idx]['name'],
        'tara_name': tara_names.get(tara_num, ''),
        'description': 'Health, wellbeing and destiny compatibility',
        'result': f"{'Auspicious' if score==3 else 'Inauspicious'} ({tara_names.get(tara_num,'')})"
    }

def calc_yoni(n1, n2):
    """Max 4 points"""
    y1, y2 = n1['yoni'], n2['yoni']
    key = frozenset([y1, y2])
    score = YONI_PAIRS.get(key, 2)  # default neutral=2
    if y1 == y2:
        score = 4
    return {
        'name': 'Yoni', 'max': 4, 'score': score,
        'boy': y1, 'girl': y2,
        'description': 'Physical and sexual compatibility',
        'result': 'Excellent' if score>=4 else 'Good' if score>=3 else 'Average' if score>=2 else 'Incompatible'
    }

def calc_graha_maitri(n1, n2):
    """Max 5 points"""
    r1, r2 = n1['ruler'], n2['ruler']
    if r1 == r2:
        score = 5
    elif r2 in PLANET_FRIENDS.get(r1, []) and r1 in PLANET_FRIENDS.get(r2, []):
        score = 5
    elif r2 in PLANET_FRIENDS.get(r1, []) or r1 in PLANET_FRIENDS.get(r2, []):
        score = 4
    elif r2 in PLANET_ENEMIES.get(r1, []) and r1 in PLANET_ENEMIES.get(r2, []):
        score = 0
    elif r2 in PLANET_ENEMIES.get(r1, []) or r1 in PLANET_ENEMIES.get(r2, []):
        score = 1
    else:
        score = 3  # neutral
    return {
        'name': 'Graha Maitri', 'max': 5, 'score': score,
        'boy': r1, 'girl': r2,
        'description': 'Mental compatibility and friendship between ruling planets',
        'result': 'Excellent' if score>=5 else 'Good' if score>=4 else 'Average' if score>=3 else 'Needs work'
    }

def calc_gana(n1, n2):
    """Max 6 points"""
    g1, g2 = n1['gana'], n2['gana']
    if g1 == g2:
        score = 6
    elif (g1 == 'Deva' and g2 == 'Manav') or (g1 == 'Manav' and g2 == 'Deva'):
        score = 5
    elif (g1 == 'Deva' and g2 == 'Raksha') or (g1 == 'Raksha' and g2 == 'Deva'):
        score = 0
    elif (g1 == 'Manav' and g2 == 'Raksha') or (g1 == 'Raksha' and g2 == 'Manav'):
        score = 0
    else:
        score = 6
    return {
        'name': 'Gana', 'max': 6, 'score': score,
        'boy': g1, 'girl': g2,
        'description': 'Temperament and nature compatibility',
        'result': 'Excellent' if score==6 else 'Good' if score==5 else 'Incompatible temperaments'
    }

def calc_bhakoot(n1_rashi_idx, n2_rashi_idx):
    """Max 7 points"""
    diff = abs(n1_rashi_idx - n2_rashi_idx) + 1
    if diff > 12: diff = 25 - diff
    inauspicious = [6, 8, 12]  # 6-8 and 12-2 Bhakoot doshas
    score = 0 if diff in inauspicious else 7
    return {
        'name': 'Bhakoot', 'max': 7, 'score': score,
        'description': 'Love, health, family and prosperity',
        'result': 'Excellent — no Bhakoot dosha' if score==7 else f'Bhakoot Dosha ({diff} relationship) — needs remedy'
    }

def calc_nadi(n1, n2):
    """Max 8 points — most important koota"""
    nadi1, nadi2 = n1['nadi'], n2['nadi']
    if nadi1 == nadi2:
        score = 0  # Nadi dosha — very bad
        result = f'⚠️ NADI DOSHA — Both have {nadi1} Nadi. Serious concern for health and progeny.'
    else:
        score = 8
        result = 'Excellent — No Nadi Dosha'
    return {
        'name': 'Nadi', 'max': 8, 'score': score,
        'boy': nadi1, 'girl': nadi2,
        'description': 'Health, progeny and genetics — most important koota',
        'result': result
    }

def calc_rajju(n1_idx, n2_idx):
    """Rajju Dosha — not scored but checked"""
    g1 = g2 = None
    for group, indices in RAJJU_GROUPS.items():
        if n1_idx in indices: g1 = group
        if n2_idx in indices: g2 = group
    dosha = g1 == g2 and g1 is not None
    severity = {'Siro':'Very severe — danger to life','Kantha':'Severe — danger to husband',
                'Udara':'Moderate — danger to children','Kati':'Mild — financial issues',
                'Pada':'Mild — travel and instability'}
    return {
        'name': 'Rajju', 'dosha': dosha,
        'boy_rajju': g1, 'girl_rajju': g2,
        'description': 'Longevity of the couple',
        'result': f"⚠️ Rajju Dosha — {severity.get(g1,'')}. Perform remedies." if dosha else '✅ No Rajju Dosha'
    }

def calc_vedha(n1_idx, n2_idx):
    """Vedha Dosha — nakshatras that harm each other"""
    dosha = False
    for pair in VEDHA_PAIRS:
        if (n1_idx == pair[0] and n2_idx == pair[1]) or \
           (n1_idx == pair[1] and n2_idx == pair[0]):
            dosha = True
            break
    return {
        'name': 'Vedha', 'dosha': dosha,
        'description': 'Obstruction dosha between nakshatras',
        'result': '⚠️ Vedha Dosha present — consider remedies' if dosha else '✅ No Vedha Dosha'
    }

def calc_mangal_dosha(boy_planets: dict, girl_planets: dict):
    """Check Mangal Dosha for both"""
    def check(planets):
        mars_h = planets.get('Mars', {}).get('house')
        if mars_h in [1, 2, 4, 7, 8, 12]:
            return True, mars_h
        return False, None

    boy_dosha, boy_house  = check(boy_planets)
    girl_dosha, girl_house = check(girl_planets)

    both = boy_dosha and girl_dosha
    result = ''
    if both:
        result = '✅ Both are Manglik — Doshas cancel each other. Compatible.'
    elif boy_dosha:
        result = f'⚠️ Boy has Mangal Dosha (Mars in H{boy_house}). Girl should ideally be Manglik.'
    elif girl_dosha:
        result = f'⚠️ Girl has Mangal Dosha (Mars in H{girl_house}). Boy should ideally be Manglik.'
    else:
        result = '✅ Neither person has Mangal Dosha.'

    return {
        'name': 'Mangal Dosha',
        'boy_manglik': boy_dosha, 'boy_house': boy_house,
        'girl_manglik': girl_dosha, 'girl_house': girl_house,
        'both_manglik': both,
        'result': result
    }

def get_verdict(total, max_score=36):
    pct = (total / max_score) * 100
    if total >= 28:
        return {'grade':'A+','label':'Excellent Match','color':'#10b981',
                'description':'This is a highly auspicious match with strong compatibility across all areas of life. The couple will enjoy a harmonious, prosperous, and loving relationship.'}
    elif total >= 24:
        return {'grade':'A','label':'Very Good Match','color':'#34d399',
                'description':'A very good match with strong compatibility. Minor differences exist but they complement each other well. A happy and stable marriage is indicated.'}
    elif total >= 18:
        return {'grade':'B','label':'Good Match','color':'#f59e0b',
                'description':'An average to good match. With mutual understanding, communication, and respect, this couple can build a happy marriage. Some areas may need conscious effort.'}
    elif total >= 12:
        return {'grade':'C','label':'Average Match','color':'#f97316',
                'description':'Below average compatibility. The couple will need to work harder on their relationship. Consulting an astrologer for remedies is recommended.'}
    else:
        return {'grade':'D','label':'Difficult Match','color':'#ef4444',
                'description':'Low compatibility. Significant challenges may arise. Strong remedies and counseling are recommended before proceeding.'}

# ── API ───────────────────────────────────────────────────────

class PersonInput(BaseModel):
    rashi:          str
    degree_in_rashi: float
    name:           Optional[str] = None
    # Optional — for Mangal Dosha check
    planets:        Optional[dict] = None

class CompatibilityRequest(BaseModel):
    boy:  PersonInput
    girl: PersonInput

@router.post("/calculate")
async def calculate_compatibility(req: CompatibilityRequest):
    # Get nakshatra info
    n1 = get_nakshatra_from_degree(req.boy.rashi,  req.boy.degree_in_rashi)
    n2 = get_nakshatra_from_degree(req.girl.rashi, req.girl.degree_in_rashi)

    rashi1_idx = RASHIS.index(req.boy.rashi)  if req.boy.rashi  in RASHIS else 0
    rashi2_idx = RASHIS.index(req.girl.rashi) if req.girl.rashi in RASHIS else 0

    # Calculate all 8 kootas
    varna       = calc_varna(n1, n2)
    vashya      = calc_vashya(n1, n2, req.boy.rashi, req.girl.rashi)
    tara        = calc_tara(n1['index'], n2['index'])
    yoni        = calc_yoni(n1, n2)
    graha_maitri= calc_graha_maitri(n1, n2)
    gana        = calc_gana(n1, n2)
    bhakoot     = calc_bhakoot(rashi1_idx, rashi2_idx)
    nadi        = calc_nadi(n1, n2)

    kootas = [varna, vashya, tara, yoni, graha_maitri, gana, bhakoot, nadi]
    total  = sum(k['score'] for k in kootas)

    # Additional doshas
    rajju  = calc_rajju(n1['index'], n2['index'])
    vedha  = calc_vedha(n1['index'], n2['index'])

    # Mangal Dosha (if planet data provided)
    mangal = None
    if req.boy.planets and req.girl.planets:
        mangal = calc_mangal_dosha(req.boy.planets, req.girl.planets)

    return {
        'boy':   {'name': req.boy.name,  'nakshatra': n1['name'], 'pada': n1['pada'], 'rashi': n1['rashi'], 'gana': n1['gana'], 'nadi': n1['nadi'], 'ruler': n1['ruler']},
        'girl':  {'name': req.girl.name, 'nakshatra': n2['name'], 'pada': n2['pada'], 'rashi': n2['rashi'], 'gana': n2['gana'], 'nadi': n2['nadi'], 'ruler': n2['ruler']},
        'kootas': kootas,
        'total':  total,
        'max':    36,
        'percentage': round((total/36)*100, 1),
        'verdict': get_verdict(total),
        'doshas': {
            'rajju': rajju,
            'vedha': vedha,
            'mangal': mangal,
        }
    }

@router.get("/nakshatras")
async def get_nakshatras():
    return {'nakshatras': [n['name'] for n in NAKSHATRAS], 'rashis': RASHIS}