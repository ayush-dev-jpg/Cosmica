# app/api/synastry.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import swisseph as swe
import pytz
from geopy.geocoders import Nominatim
import timezonefinder
import asyncio

router = APIRouter(prefix="/synastry", tags=["Synastry"])

RASHIS_SA = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
             'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']
RASHIS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
             'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
NAKSHATRAS = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
    'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
    'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
    'Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadra',
    'Uttara Bhadra','Revati'
]
NAK_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'] * 3

PLANET_LORDS_MAP = {
    'Mesha':{'Sun':5,'Moon':4,'Mars':[1,8],'Mercury':[3,6],'Jupiter':[9,12],'Venus':[2,7],'Saturn':[10,11]},
    'Vrishabha':{'Sun':4,'Moon':3,'Mars':[7,12],'Mercury':[2,5],'Jupiter':[8,11],'Venus':[1,6],'Saturn':[9,10]},
    'Mithuna':{'Sun':3,'Moon':2,'Mars':[6,11],'Mercury':[1,4],'Jupiter':[7,10],'Venus':[5,12],'Saturn':[8,9]},
    'Karka':{'Sun':2,'Moon':1,'Mars':[5,10],'Mercury':[3,12],'Jupiter':[6,9],'Venus':[4,11],'Saturn':[7,8]},
    'Simha':{'Sun':1,'Moon':12,'Mars':[4,9],'Mercury':[2,11],'Jupiter':[5,8],'Venus':[3,10],'Saturn':[6,7]},
    'Kanya':{'Sun':12,'Moon':11,'Mars':[3,8],'Mercury':[1,10],'Jupiter':[4,7],'Venus':[2,9],'Saturn':[5,6]},
    'Tula':{'Sun':11,'Moon':10,'Mars':[2,7],'Mercury':[9,12],'Jupiter':[3,6],'Venus':[1,8],'Saturn':[4,5]},
    'Vrishchika':{'Sun':10,'Moon':9,'Mars':[1,6],'Mercury':[8,11],'Jupiter':[2,5],'Venus':[7,12],'Saturn':[3,4]},
    'Dhanu':{'Sun':9,'Moon':8,'Mars':[5,12],'Mercury':[7,10],'Jupiter':[1,4],'Venus':[6,11],'Saturn':[2,3]},
    'Makara':{'Sun':8,'Moon':7,'Mars':[4,11],'Mercury':[6,9],'Jupiter':[3,12],'Venus':[5,10],'Saturn':[1,2]},
    'Kumbha':{'Sun':7,'Moon':6,'Mars':[3,10],'Mercury':[5,8],'Jupiter':[2,11],'Venus':[4,9],'Saturn':[1,12]},
    'Meena':{'Sun':6,'Moon':5,'Mars':[2,9],'Mercury':[4,7],'Jupiter':[1,10],'Venus':[3,8],'Saturn':[11,12]},
}

# Tithi/Tara/Nadi/Varna/Gana tables
TITHIS = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi',
          'Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi',
          'Trayodashi','Chaturdashi','Purnima',
          'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi',
          'Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi',
          'Trayodashi','Chaturdashi','Amavasya']

YOGAS_27 = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda',
            'Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata',
            'Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva',
            'Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti']

VARNA = {'Mesha':'Kshatriya','Vrishabha':'Vaishya','Mithuna':'Shudra','Karka':'Brahmin',
         'Simha':'Kshatriya','Kanya':'Vaishya','Tula':'Shudra','Vrishchika':'Brahmin',
         'Dhanu':'Kshatriya','Makara':'Vaishya','Kumbha':'Shudra','Meena':'Brahmin'}

GANA = {'Ashwini':'Deva','Bharani':'Manav','Krittika':'Raksha','Rohini':'Manav',
        'Mrigashira':'Deva','Ardra':'Manav','Punarvasu':'Deva','Pushya':'Deva',
        'Ashlesha':'Raksha','Magha':'Raksha','Purva Phalguni':'Manav',
        'Uttara Phalguni':'Manav','Hasta':'Deva','Chitra':'Raksha','Swati':'Deva',
        'Vishakha':'Raksha','Anuradha':'Deva','Jyeshtha':'Raksha','Mula':'Raksha',
        'Purva Ashadha':'Manav','Uttara Ashadha':'Manav','Shravana':'Deva',
        'Dhanishta':'Raksha','Shatabhisha':'Raksha','Purva Bhadra':'Manav',
        'Uttara Bhadra':'Manav','Revati':'Deva'}

NADI = {'Ashwini':'Aadi','Bharani':'Madhya','Krittika':'Antya','Rohini':'Antya',
        'Mrigashira':'Madhya','Ardra':'Aadi','Punarvasu':'Aadi','Pushya':'Madhya',
        'Ashlesha':'Antya','Magha':'Aadi','Purva Phalguni':'Madhya',
        'Uttara Phalguni':'Antya','Hasta':'Antya','Chitra':'Madhya','Swati':'Aadi',
        'Vishakha':'Aadi','Anuradha':'Madhya','Jyeshtha':'Antya','Mula':'Aadi',
        'Purva Ashadha':'Madhya','Uttara Ashadha':'Antya','Shravana':'Antya',
        'Dhanishta':'Madhya','Shatabhisha':'Aadi','Purva Bhadra':'Aadi',
        'Uttara Bhadra':'Madhya','Revati':'Antya'}

YONI = {'Ashwini':'Horse','Bharani':'Elephant','Krittika':'Goat','Rohini':'Serpent',
        'Mrigashira':'Serpent','Ardra':'Dog','Punarvasu':'Cat','Pushya':'Goat',
        'Ashlesha':'Cat','Magha':'Rat','Purva Phalguni':'Rat','Uttara Phalguni':'Cow',
        'Hasta':'Buffalo','Chitra':'Tiger','Swati':'Buffalo','Vishakha':'Tiger',
        'Anuradha':'Hare','Jyeshtha':'Hare','Mula':'Dog','Purva Ashadha':'Monkey',
        'Uttara Ashadha':'Mongoose','Shravana':'Monkey','Dhanishta':'Lion',
        'Shatabhisha':'Horse','Purva Bhadra':'Lion','Uttara Bhadra':'Cow','Revati':'Elephant'}

YONI_ENEMIES = [('Horse','Buffalo'),('Elephant','Lion'),('Goat','Monkey'),
                ('Serpent','Mongoose'),('Dog','Hare'),('Cat','Rat'),('Cow','Tiger')]

PLANET_FRIENDS = {
    'Sun':['Moon','Mars','Jupiter'],'Moon':['Sun','Mercury'],
    'Mars':['Sun','Moon','Jupiter'],'Mercury':['Sun','Venus'],
    'Jupiter':['Sun','Moon','Mars'],'Venus':['Mercury','Saturn'],
    'Saturn':['Mercury','Venus'],'Rahu':['Venus','Saturn'],'Ketu':['Mars','Venus'],
}
PLANET_ENEMIES = {
    'Sun':['Venus','Saturn'],'Moon':[],'Mars':['Mercury'],
    'Mercury':['Moon'],'Jupiter':['Mercury','Venus'],'Venus':['Sun','Moon'],
    'Saturn':['Sun','Moon','Mars'],'Rahu':['Sun','Moon','Mars'],'Ketu':['Sun','Moon'],
}

# Synastry aspect interpretations
SYNASTRY_ASPECTS = {
    'conjunction': {
        'orb':8, 'degrees':0, 'nature':'Intense',
        'desc':'Planets merge energies — very powerful, can be positive or challenging depending on planets',
    },
    'trine': {
        'orb':7, 'degrees':120, 'nature':'Harmonious',
        'desc':'Natural flow and ease — these areas of life support each other beautifully',
    },
    'sextile': {
        'orb':5, 'degrees':60, 'nature':'Supportive',
        'desc':'Opportunities and gentle support — these energies work well together with effort',
    },
    'square': {
        'orb':7, 'degrees':90, 'nature':'Challenging',
        'desc':'Friction and growth — challenging but creates dynamic energy and motivation',
    },
    'opposition': {
        'orb':8, 'degrees':180, 'nature':'Polarizing',
        'desc':'Attraction of opposites — magnetic pull but also tension needing balance',
    },
}

PLANET_SYNASTRY_MEANINGS = {
    ('Sun','Moon'):   'Core soul connection — vitality meets emotion. One of the most important synastry aspects.',
    ('Sun','Venus'):  'Love and admiration — strong romantic attraction and appreciation.',
    ('Sun','Mars'):   'Magnetic attraction and dynamic energy — passion but also potential conflict.',
    ('Sun','Jupiter'):'Mutual inspiration and growth — one uplifts the other, very fortunate.',
    ('Moon','Venus'): 'Emotional harmony and affection — tender, nurturing love connection.',
    ('Moon','Mars'):  'Emotional passion — intense attraction with possible volatility.',
    ('Moon','Saturn'):'Emotional stability and structure — serious commitment but possible restriction.',
    ('Venus','Mars'): 'Passionate attraction — the classic romantic and physical chemistry aspect.',
    ('Venus','Jupiter'):'Joyful love — abundance, generosity and expansion in the relationship.',
    ('Venus','Saturn'):'Lasting commitment — serious love that endures, karmic bond.',
    ('Mars','Jupiter'):'Shared ambition and enthusiasm — motivating and energizing for each other.',
    ('Saturn','Saturn'):'Generational karma — shared life lessons and responsibilities.',
    ('Jupiter','Jupiter'):'Shared philosophy and vision — mutual growth and good fortune.',
}

def geocode_place(city, country):
    try:
        g = Nominatim(user_agent="cosmica-synastry")
        l = g.geocode(f"{city}, {country}", timeout=5)
        if l:
            tf = timezonefinder.TimezoneFinder()
            tz_str = tf.timezone_at(lat=l.latitude, lng=l.longitude) or 'Asia/Kolkata'
            tz = pytz.timezone(tz_str)
            off = datetime.now(tz).utcoffset().total_seconds() / 3600
            return l.latitude, l.longitude, off
    except: pass
    return 20.5937, 78.9629, 5.5

def get_planet_positions(date_str, time_str, city, country):
    lat, lon, tz_off = geocode_place(city, country)
    dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    jd = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60 - tz_off)
    swe.set_sid_mode(swe.SIDM_LAHIRI)

    planets = {}
    planet_ids = [
        (swe.SUN,'Sun'),(swe.MOON,'Moon'),(swe.MARS,'Mars'),
        (swe.MERCURY,'Mercury'),(swe.JUPITER,'Jupiter'),
        (swe.VENUS,'Venus'),(swe.SATURN,'Saturn'),
    ]
    for pid, name in planet_ids:
        pos = swe.calc_ut(jd, pid, swe.FLG_SIDEREAL)[0][0]
        ri  = int(pos/30) % 12
        deg = pos % 30
        nak_idx = int(pos / (360/27))
        nak_deg = pos % (360/27)
        pada = int(nak_deg / ((360/27)/4)) + 1
        planets[name] = {
            'longitude': round(pos, 3),
            'rashi': RASHIS_SA[ri],
            'rashi_en': RASHIS_EN[ri],
            'degree': round(deg, 2),
            'nakshatra': NAKSHATRAS[nak_idx % 27],
            'pada': min(pada, 4),
        }

    # Rahu/Ketu
    rahu = swe.calc_ut(jd, swe.TRUE_NODE, swe.FLG_SIDEREAL)[0][0]
    ri = int(rahu/30) % 12
    planets['Rahu'] = {'longitude':round(rahu,3),'rashi':RASHIS_SA[ri],'rashi_en':RASHIS_EN[ri],'degree':round(rahu%30,2),'nakshatra':NAKSHATRAS[int(rahu/(360/27))%27],'pada':1}
    ketu = (rahu + 180) % 360
    ki = int(ketu/30) % 12
    planets['Ketu'] = {'longitude':round(ketu,3),'rashi':RASHIS_SA[ki],'rashi_en':RASHIS_EN[ki],'degree':round(ketu%30,2),'nakshatra':NAKSHATRAS[int(ketu/(360/27))%27],'pada':1}

    # Lagna
    asc = swe.houses(jd, lat, lon, b'P')[1][0]
    asc_sid = (asc - swe.get_ayanamsa(jd)) % 360
    lagna_idx = int(asc_sid/30) % 12

    # Moon sign
    moon = planets['Moon']
    moon_nak = moon['nakshatra']
    moon_ri = RASHIS_SA.index(moon['rashi'])

    return {
        'planets': planets,
        'lagna': {'name': RASHIS_SA[lagna_idx], 'en': RASHIS_EN[lagna_idx], 'index': lagna_idx},
        'moon_rashi': moon['rashi'],
        'moon_rashi_en': moon['rashi_en'],
        'nakshatra': moon_nak,
        'nakshatra_lord': NAK_LORDS[NAKSHATRAS.index(moon_nak)],
        'gana': GANA.get(moon_nak, ''),
        'nadi': NADI.get(moon_nak, ''),
        'yoni': YONI.get(moon_nak, ''),
        'varna': VARNA.get(moon['rashi'], ''),
    }

# ── Ashtakoot calculation ─────────────────────────────────────
def calc_ashtakoot(p1, p2):
    nak1, nak2 = p1['nakshatra'], p2['nakshatra']
    n1i = NAKSHATRAS.index(nak1)
    n2i = NAKSHATRAS.index(nak2)

    # 1. Varna (1)
    varna_order = {'Brahmin':4,'Kshatriya':3,'Vaishya':2,'Shudra':1}
    v1 = varna_order.get(p1['varna'],1)
    v2 = varna_order.get(p2['varna'],1)
    varna_score = 1 if v1 >= v2 else 0

    # 2. Vashya (2)
    vashya_map = {'Mesha':'Chatushpad','Vrishabha':'Chatushpad','Mithuna':'Nara',
                  'Karka':'Jalachara','Simha':'Vanachara','Kanya':'Nara',
                  'Tula':'Nara','Vrishchika':'Keeta','Dhanu':'Chatushpad',
                  'Makara':'Jalachara','Kumbha':'Nara','Meena':'Jalachara'}
    va1 = vashya_map.get(p1['moon_rashi'],'')
    va2 = vashya_map.get(p2['moon_rashi'],'')
    vashya_score = 2 if va1==va2 else 1 if {va1,va2} in [{'Jalachara','Nara'},{'Chatushpad','Vanachara'}] else 0

    # 3. Tara (3)
    diff = ((n2i - n1i) + 27) % 27
    tara_num = (diff % 9) + 1
    tara_score = 3 if tara_num in [1,2,4,6,8,9] else 0
    tara_names = {1:'Janma',2:'Sampat',3:'Vipat',4:'Kshema',5:'Pratyak',6:'Sadhana',7:'Naidhana',8:'Mitra',9:'Parama Mitra'}

    # 4. Yoni (4)
    y1, y2 = p1['yoni'], p2['yoni']
    yoni_enemies_flat = [x for pair in YONI_ENEMIES for x in pair]
    yoni_score = 4 if y1==y2 else 0 if frozenset([y1,y2]) in [frozenset(e) for e in YONI_ENEMIES] else 2

    # 5. Graha Maitri (5)
    r1 = p1['nakshatra_lord']
    r2 = p2['nakshatra_lord']
    if r1 == r2: gm_score = 5
    elif r2 in PLANET_FRIENDS.get(r1,[]) and r1 in PLANET_FRIENDS.get(r2,[]): gm_score = 5
    elif r2 in PLANET_FRIENDS.get(r1,[]) or r1 in PLANET_FRIENDS.get(r2,[]): gm_score = 4
    elif r2 in PLANET_ENEMIES.get(r1,[]) and r1 in PLANET_ENEMIES.get(r2,[]): gm_score = 0
    elif r2 in PLANET_ENEMIES.get(r1,[]) or r1 in PLANET_ENEMIES.get(r2,[]): gm_score = 1
    else: gm_score = 3

    # 6. Gana (6)
    g1, g2 = p1['gana'], p2['gana']
    gana_score = 6 if g1==g2 else 5 if {g1,g2}=={'Deva','Manav'} else 0

    # 7. Bhakoot (7)
    lagna_diff = abs(RASHIS_SA.index(p1['moon_rashi']) - RASHIS_SA.index(p2['moon_rashi'])) + 1
    if lagna_diff > 12: lagna_diff = 25 - lagna_diff
    bhakoot_score = 0 if lagna_diff in [6,8,12] else 7

    # 8. Nadi (8)
    na1, na2 = p1['nadi'], p2['nadi']
    nadi_score = 0 if na1==na2 else 8

    total = varna_score+vashya_score+tara_score+yoni_score+gm_score+gana_score+bhakoot_score+nadi_score

    kootas = [
        {'name':'Varna', 'max':1, 'score':varna_score, 'p1':p1['varna'], 'p2':p2['varna'], 'meaning':'Spiritual compatibility'},
        {'name':'Vashya','max':2, 'score':vashya_score,'p1':va1,'p2':va2,'meaning':'Mutual attraction'},
        {'name':'Tara',  'max':3, 'score':tara_score,  'p1':nak1,'p2':nak2,'tara_name':tara_names.get(tara_num,''),'meaning':'Health & destiny'},
        {'name':'Yoni',  'max':4, 'score':yoni_score,  'p1':y1, 'p2':y2, 'meaning':'Physical compatibility'},
        {'name':'Graha Maitri','max':5,'score':gm_score,'p1':r1,'p2':r2,'meaning':'Mental friendship'},
        {'name':'Gana',  'max':6, 'score':gana_score,  'p1':g1, 'p2':g2, 'meaning':'Temperament'},
        {'name':'Bhakoot','max':7,'score':bhakoot_score,'p1':p1['moon_rashi'],'p2':p2['moon_rashi'],'meaning':'Love & prosperity'},
        {'name':'Nadi',  'max':8, 'score':nadi_score,  'p1':na1,'p2':na2,'meaning':'Health & progeny','dosha': na1==na2},
    ]

    grade = 'A+' if total>=28 else 'A' if total>=24 else 'B' if total>=18 else 'C' if total>=12 else 'D'
    verdict = {
        'A+':'Exceptional match — rare divine connection. Highly auspicious for marriage.',
        'A': 'Very good match — strong compatibility with mutual support and harmony.',
        'B': 'Good match — above average compatibility. A successful marriage with effort.',
        'C': 'Average match — challenges exist but can be overcome with understanding.',
        'D': 'Difficult match — significant incompatibilities. Consult an astrologer before proceeding.',
    }

    return {'kootas':kootas,'total':total,'max':36,'grade':grade,'verdict':verdict[grade]}

# ── Synastry aspects ──────────────────────────────────────────
def calc_synastry_aspects(planets1, planets2):
    aspects = []
    key_planets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']

    for p1_name in key_planets:
        if p1_name not in planets1: continue
        lon1 = planets1[p1_name]['longitude']

        for p2_name in key_planets:
            if p2_name not in planets2: continue
            lon2 = planets2[p2_name]['longitude']

            diff = abs(lon1 - lon2) % 360
            if diff > 180: diff = 360 - diff

            for asp_name, asp_data in SYNASTRY_ASPECTS.items():
                orb = asp_data['orb']
                target = asp_data['degrees']
                actual_diff = abs(diff - target)
                if actual_diff <= orb:
                    pair_key = tuple(sorted([p1_name, p2_name]))
                    meaning = PLANET_SYNASTRY_MEANINGS.get(pair_key, '')
                    if not meaning:
                        meaning = PLANET_SYNASTRY_MEANINGS.get((p2_name, p1_name), '')

                    aspects.append({
                        'planet1': p1_name,
                        'planet2': p2_name,
                        'aspect': asp_name,
                        'nature': asp_data['nature'],
                        'orb': round(actual_diff, 2),
                        'desc': asp_data['desc'],
                        'meaning': meaning,
                        'p1_rashi': planets1[p1_name]['rashi_en'],
                        'p2_rashi': planets2[p2_name]['rashi_en'],
                        'score': max(0, round((orb - actual_diff) / orb * 10, 1)),
                    })

    # Sort: harmonious first, then by orb tightness
    nature_order = {'Harmonious':0,'Supportive':1,'Intense':2,'Polarizing':3,'Challenging':4}
    aspects.sort(key=lambda x: (nature_order.get(x['nature'],5), x['orb']))
    return aspects

# ── House overlays ────────────────────────────────────────────
def calc_house_overlays(chart1, chart2):
    """Where do person2's planets fall in person1's houses?"""
    overlays = []
    lagna1_idx = chart1['lagna']['index']

    house_meanings = {
        1:'Identity & self — deeply personal connection',
        2:'Wealth & family — financial and family ties',
        3:'Communication — mental bond and sibling-like connection',
        4:'Home & heart — domestic happiness, emotional security',
        5:'Romance & creativity — love, playfulness and children',
        6:'Daily life & service — practical support and challenges',
        7:'Partnership — direct marriage and business connection',
        8:'Transformation — deep intimacy and shared secrets',
        9:'Philosophy & growth — shared beliefs and adventures',
        10:'Career & status — public life and shared ambitions',
        11:'Friendship & gains — social life and mutual gains',
        12:'Spirituality — hidden bond, past life connection',
    }

    key_planets = ['Sun','Moon','Venus','Mars','Jupiter','Saturn']
    for pname in key_planets:
        if pname not in chart2['planets']: continue
        p2_rashi = chart2['planets'][pname]['rashi']
        if p2_rashi not in RASHIS_SA: continue
        p2_ri = RASHIS_SA.index(p2_rashi)
        house_in_p1 = (p2_ri - lagna1_idx) % 12 + 1
        overlays.append({
            'planet': pname,
            'house': house_in_p1,
            'rashi': chart2['planets'][pname]['rashi_en'],
            'meaning': house_meanings.get(house_in_p1, ''),
        })

    return sorted(overlays, key=lambda x: x['house'])

# ── Dasha compatibility ───────────────────────────────────────
def check_dasha_compatibility(chart1, chart2):
    nak1 = chart1['nakshatra']
    nak2 = chart2['nakshatra']
    lord1 = chart1['nakshatra_lord']
    lord2 = chart2['nakshatra_lord']

    compatible = lord2 in PLANET_FRIENDS.get(lord1, []) or lord1 in PLANET_FRIENDS.get(lord2, [])
    neutral    = not compatible and lord2 not in PLANET_ENEMIES.get(lord1, [])
    enemy      = lord2 in PLANET_ENEMIES.get(lord1, []) or lord1 in PLANET_ENEMIES.get(lord2, [])

    if compatible:
        relation = 'Friendly'
        desc = f'{lord1} and {lord2} are friendly planets — dasha periods will support each other and bring mutual benefit.'
    elif neutral:
        relation = 'Neutral'
        desc = f'{lord1} and {lord2} are neutral — dasha periods will have mixed results, neither strongly supportive nor obstructive.'
    else:
        relation = 'Unfriendly'
        desc = f'{lord1} and {lord2} have tension — when both are running their dashas, extra effort and communication is needed.'

    return {'lord1':lord1,'lord2':lord2,'relation':relation,'desc':desc,'nak1':nak1,'nak2':nak2}

# ── Overall score ─────────────────────────────────────────────
def calc_overall_score(ashtakoot, aspects):
    # Ashtakoot: 60% weight
    ast_pct = (ashtakoot['total'] / 36) * 60

    # Synastry aspects: 40% weight
    harmonious = len([a for a in aspects if a['nature'] in ['Harmonious','Supportive']])
    challenging = len([a for a in aspects if a['nature'] in ['Challenging','Polarizing']])
    total_asp   = max(len(aspects), 1)
    syn_pct = max(0, ((harmonious - challenging*0.5) / total_asp)) * 40

    total = round(ast_pct + syn_pct, 1)
    total = max(0, min(100, total))

    if total >= 80:   label,color = 'Soulmate Connection','#10b981'
    elif total >= 65: label,color = 'Deeply Compatible','#34d399'
    elif total >= 50: label,color = 'Good Compatibility','#f59e0b'
    elif total >= 35: label,color = 'Average Compatibility','#f97316'
    else:             label,color = 'Challenging Match','#ef4444'

    return {'score':total,'label':label,'color':color}

# ── API ───────────────────────────────────────────────────────
class PersonInput(BaseModel):
    name:    str
    date:    str
    time:    str
    city:    str
    country: str

class SynastryRequest(BaseModel):
    person1: PersonInput
    person2: PersonInput

@router.post("/calculate")
async def calculate_synastry(req: SynastryRequest):
    # Calculate both charts in parallel
    chart1, chart2 = await asyncio.gather(
        asyncio.to_thread(get_planet_positions, req.person1.date, req.person1.time, req.person1.city, req.person1.country),
        asyncio.to_thread(get_planet_positions, req.person2.date, req.person2.time, req.person2.city, req.person2.country),
    )

    ashtakoot = calc_ashtakoot(chart1, chart2)
    aspects   = calc_synastry_aspects(chart1['planets'], chart2['planets'])
    overlays1 = calc_house_overlays(chart1, chart2)  # P2 planets in P1 houses
    overlays2 = calc_house_overlays(chart2, chart1)  # P1 planets in P2 houses
    dasha     = check_dasha_compatibility(chart1, chart2)
    overall   = calc_overall_score(ashtakoot, aspects)

    return {
        'person1': {'name':req.person1.name, **{k:chart1[k] for k in ['moon_rashi','moon_rashi_en','nakshatra','nakshatra_lord','gana','nadi','yoni','varna','lagna']}},
        'person2': {'name':req.person2.name, **{k:chart2[k] for k in ['moon_rashi','moon_rashi_en','nakshatra','nakshatra_lord','gana','nadi','yoni','varna','lagna']}},
        'planets1': chart1['planets'],
        'planets2': chart2['planets'],
        'ashtakoot': ashtakoot,
        'aspects':   aspects,
        'overlays_p2_in_p1': overlays1,
        'overlays_p1_in_p2': overlays2,
        'dasha_compatibility': dasha,
        'overall': overall,
    }