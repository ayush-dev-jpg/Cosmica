# app/api/yoga_calculator.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import db

router = APIRouter(prefix="/yogas", tags=["Yoga Calculator"])

RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
          'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']

KENDRAS      = [1,4,7,10]
TRIKONAS     = [1,5,9]
DUSTHANAS    = [6,8,12]
UPACHAYAS    = [3,6,10,11]

# Natural benefics / malefics (planet's inherent nature, independent of chart)
NAT_BENEFICS  = {'Jupiter','Venus','Mercury','Moon'}
NAT_MALEFICS  = {'Sun','Mars','Saturn','Rahu','Ketu'}

EXALTATION   = {'Sun':'Mesha','Moon':'Vrishabha','Mars':'Makara','Mercury':'Kanya',
                'Jupiter':'Karka','Venus':'Meena','Saturn':'Tula'}
DEBILITATION = {'Sun':'Tula','Moon':'Vrishchika','Mars':'Karka','Mercury':'Meena',
                'Jupiter':'Makara','Venus':'Kanya','Saturn':'Mesha'}
OWN_SIGNS    = {
    'Sun':['Simha'],'Moon':['Karka'],
    'Mars':['Mesha','Vrishchika'],'Mercury':['Mithuna','Kanya'],
    'Jupiter':['Dhanu','Meena'],'Venus':['Vrishabha','Tula'],
    'Saturn':['Makara','Kumbha']
}

LORDS = {
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

# ══════════════════════════════════════════════════════════════
# CORE HELPERS
# ══════════════════════════════════════════════════════════════

def get_house(rashi_name, lagna):
    li = RASHIS.index(lagna)      if lagna      in RASHIS else 0
    ri = RASHIS.index(rashi_name) if rashi_name in RASHIS else 0
    return (ri - li) % 12 + 1

def build_hp(pp, lagna):
    return {p: get_house(d['rashi'], lagna) for p, d in pp.items() if 'rashi' in d}

def lords_of(house, lagna):
    result = []
    for planet, houses in LORDS.get(lagna, {}).items():
        hs = [houses] if isinstance(houses, int) else houses
        if house in hs:
            result.append(planet)
    return result

def houses_of(planet, lagna):
    v = LORDS.get(lagna, {}).get(planet)
    if v is None: return []
    return [v] if isinstance(v, int) else list(v)

def sign_lord(rashi):
    for planet, signs in OWN_SIGNS.items():
        if rashi in signs: return planet
    return ''

def is_exalted(planet, rashi):     return EXALTATION.get(planet)    == rashi
def is_own(planet, rashi):         return rashi in OWN_SIGNS.get(planet, [])
def is_debilitated(planet, rashi): return DEBILITATION.get(planet)  == rashi

def is_strong(planet, pp):
    r = pp.get(planet, {}).get('rashi','')
    return is_exalted(planet, r) or is_own(planet, r)

def is_weak(planet, pp):
    return is_debilitated(planet, pp.get(planet, {}).get('rashi',''))

# ── Functional nature of a planet for a given lagna ──────────

def functional_nature(planet, lagna):
    """
    Returns 'yogakaraka', 'benefic', 'mixed', 'neutral', or 'malefic'
    based on Parashari house lordship rules for the given lagna.

    Key rules:
    - Yogakaraka:  lords BOTH a kendra (1/4/7/10) AND a trikona (1/5/9)
    - Benefic:     lords a trikona (5 or 9) without also lording a dusthana,
                   OR lagna lord without dusthana
    - Mixed:       lords a trikona AND a dusthana (e.g. Jupiter for Leo: 5+8)
                   Still auspicious via trikona but tainted — allowed in yogas
                   as conjunction partner or natural-benefic aspector
    - Neutral:     lords only kendras (4/7/10, not 1) or 2nd/11th/3rd
    - Malefic:     lords a dusthana (6/8/12) WITHOUT any trikona lordship
                   (e.g. Saturn for Leo: 6+7 — the 6th taints, 7th is kendra
                    but no trikona → pure malefic for Leo)
    """
    house_list = houses_of(planet, lagna)
    if not house_list:
        return 'neutral'

    is_trikona   = any(h in TRIKONAS  for h in house_list)  # 1,5,9
    is_kendra    = any(h in KENDRAS   for h in house_list)  # 1,4,7,10
    is_dusthana  = any(h in DUSTHANAS for h in house_list)  # 6,8,12
    is_lagna_lord= 1 in house_list

    # Yogakaraka: kendra + trikona lordship (house 1 counts for both)
    if is_trikona and is_kendra:
        return 'yogakaraka'

    # Trikona lord that also lords a dusthana → mixed (not pure malefic)
    if is_trikona and is_dusthana:
        return 'mixed'

    # Pure trikona lord (5 or 9 only, no dusthana)
    if is_trikona and not is_dusthana:
        return 'benefic'

    # Lagna lord not also dusthana
    if is_lagna_lord and not is_dusthana:
        return 'benefic'

    # Dusthana lord WITHOUT trikona → malefic
    # (includes lords of 6, 7+6, 8, 12, 7+8, etc.)
    if is_dusthana and not is_trikona:
        return 'malefic'

    # Pure kendra lord (4/7/10, not 1) — Kendradhipati rule: neutral
    if is_kendra and not is_dusthana and not is_trikona:
        return 'neutral'

    # 2nd, 3rd, 11th lords — artha/upachaya; neutral
    return 'neutral'


def is_functionally_benefic(planet, lagna):
    return functional_nature(planet, lagna) in ('benefic', 'yogakaraka', 'mixed')

def is_functionally_malefic(planet, lagna):
    return functional_nature(planet, lagna) == 'malefic'

# ── Aspect / conjunction primitives ──────────────────────────

def conjunct(p1, p2, hp):
    return p1 in hp and p2 in hp and hp[p1] == hp[p2]

def aspects(p1, p2, hp):
    """
    True if p1 casts an aspect on the house containing p2.
    Universal 7th aspect (diff=6) for all planets.
    Special: Mars 4th(3)/8th(7), Jupiter 5th(4)/9th(8), Saturn 3rd(2)/10th(9).
    diff = (h_p2 - h_p1) % 12, 0 = same house (not an aspect).
    """
    if p1 not in hp or p2 not in hp: return False
    diff = (hp[p2] - hp[p1]) % 12
    if diff == 0: return False
    if diff == 6: return True
    if p1 == 'Mars'    and diff in (3, 7): return True
    if p1 == 'Jupiter' and diff in (4, 8): return True
    if p1 == 'Saturn'  and diff in (2, 9): return True
    return False

def aspects_house(planet, house_num, hp):
    """True if planet occupies or aspects the given house number."""
    if planet not in hp: return False
    diff = (house_num - hp[planet]) % 12
    if diff == 0: return True
    if diff == 6: return True
    if planet == 'Mars'    and diff in (3, 7): return True
    if planet == 'Jupiter' and diff in (4, 8): return True
    if planet == 'Saturn'  and diff in (2, 9): return True
    return False

def related(p1, p2, hp):
    """Any connection: conjunction or aspect in either direction."""
    return conjunct(p1,p2,hp) or aspects(p1,p2,hp) or aspects(p2,p1,hp)

def benefic_related(p1, p2, hp, lagna):
    """
    True only when the connection between p1 and p2 is auspicious enough
    to form a positive Raj/Dhana yoga.

    CONJUNCTION rule:
      Both planets must not be pure functional malefics (i.e. neither should
      be 'malefic' functional nature — dusthana lord without trikona).
      Mixed, neutral, benefic, yogakaraka all allowed.

    ASPECT rule:
      The ASPECTING planet must be a NATURAL benefic (Jupiter, Venus, Mercury, Moon).
      A natural malefic (Sun, Mars, Saturn, Rahu, Ketu) casting an aspect does NOT
      form a positive yoga — it AFFLICTS the aspected planet.
      This is the core classical principle: benefic aspect = blessing; malefic aspect = pressure.
    """
    if not related(p1, p2, hp):
        return False

    fn1 = functional_nature(p1, lagna)
    fn2 = functional_nature(p2, lagna)

    # Conjunction — reject only if either is a pure functional malefic
    if conjunct(p1, p2, hp):
        if fn1 == 'malefic' or fn2 == 'malefic':
            return False
        return True

    # Aspect — aspector must be a NATURAL benefic
    p1ap2 = aspects(p1, p2, hp)
    p2ap1 = aspects(p2, p1, hp)

    def _aspector_ok(aspector):
        return aspector in NAT_BENEFICS   # Jupiter, Venus, Mercury, Moon only

    if p1ap2 and p2ap1:
        return _aspector_ok(p1) or _aspector_ok(p2)
    if p1ap2:
        return _aspector_ok(p1)
    if p2ap1:
        return _aspector_ok(p2)

    return False

def parivartana(p1, p2, pp, hp):
    """Mutual sign exchange."""
    r1 = pp.get(p1,{}).get('rashi','')
    r2 = pp.get(p2,{}).get('rashi','')
    return is_own(p2, r1) and is_own(p1, r2)

def in_kendra(planet, hp):    return hp.get(planet) in KENDRAS
def in_trikona(planet, hp):   return hp.get(planet) in TRIKONAS
def in_dusthana(planet, hp):  return hp.get(planet) in DUSTHANAS

# ══════════════════════════════════════════════════════════════
# CONNECTION DESCRIPTION HELPER
# ══════════════════════════════════════════════════════════════

def connection_desc(p1, p2, hp):
    if conjunct(p1, p2, hp):
        return f"{p1} and {p2} are conjunct in the {ORDINALS[hp[p1]]} house"

    p1ap2 = aspects(p1, p2, hp)
    p2ap1 = aspects(p2, p1, hp)

    def _lbl(asp, asd):
        diff = (hp[asd] - hp[asp]) % 12
        if diff == 6:
            return f"{asp} (H{hp[asp]}) aspects {asd} (H{hp[asd]}) via 7th aspect"
        m = {2:'3rd',3:'4th',4:'5th',7:'8th',8:'9th',9:'10th'}
        return f"{asp} (H{hp[asp]}) aspects {asd} (H{hp[asd]}) via special {m.get(diff,str(diff+1)+'th')} aspect"

    if p1ap2 and p2ap1:
        return f"{_lbl(p1,p2)} — and {_lbl(p2,p1)} (mutual)"
    if p1ap2: return _lbl(p1, p2)
    if p2ap1: return _lbl(p2, p1)
    return f"{p1} and {p2} are related"

# ── yoga() factory ────────────────────────────────────────────

def yoga(name, sanskrit, category, strength, planets, description, effects, remedies=None):
    return {"name":name,"sanskrit":sanskrit,"category":category,"strength":strength,
            "planets":planets,"description":description,"effects":effects,
            **({"remedies":remedies} if remedies else {})}

# ══════════════════════════════════════════════════════════════
# SATURN / MALEFIC INFLUENCE DOSHAS (newly added checks)
# ══════════════════════════════════════════════════════════════

def check_saturn_moon_affliction(pp, hp, lagna):
    """
    Saturn-Moon conjunction or mutual aspect creates Visha Yoga (poison yoga)
    — depression, chronic anxiety, emotional burden, persistent stress.
    Saturn's aspect on Moon or conjunction suppresses the mind.
    """
    if 'Saturn' not in hp or 'Moon' not in hp: return None
    if not related('Saturn','Moon',hp):         return None

    conn = connection_desc('Saturn','Moon',hp)
    if conjunct('Saturn','Moon',hp):
        mode = f"conjunct in the {ORDINALS[hp['Moon']]} house"
        sev  = "high"
    elif aspects('Saturn','Moon',hp) and aspects('Moon','Saturn',hp):
        mode = f"in mutual aspect ({conn})"
        sev  = "high"
    else:
        mode = f"in aspect — {conn}"
        sev  = "medium"

    return yoga("Visha Yoga (Saturn-Moon)","विष योग","dosha",sev,["Saturn","Moon"],
        f"Saturn and Moon are {mode}, forming Visha Yoga. Saturn's cold, restrictive energy directly suppresses the Moon (mind, emotions, happiness). The native experiences chronic mental stress, anxiety, emotional heaviness, and a persistent feeling of burden. Life feels like a continuous uphill struggle emotionally, even when external circumstances improve.",
        ["Chronic stress and anxiety","Emotional heaviness","Depression tendency","Mental burden","Difficulty finding joy","Persistent worry"],
        ["Recite Chandra mantra (Om Shraam Shreem Shraum Sah Chandraya Namah) 108x daily",
         "Offer milk to Shivling every Monday",
         "Wear Pearl (Moti) after consulting an astrologer",
         "Meditate and practise pranayama daily",
         "Recite Shani Shanti mantra on Saturdays",
         "Serve the elderly and underprivileged — Saturn softens through service",
         "Avoid negative thinking; build a strong spiritual routine"])

def check_saturn_lagna_affliction(pp, hp, lagna):
    """
    Saturn aspecting the Lagna (house 1) with its 3rd, 7th, or 10th aspect
    creates persistent hardship, restriction, and delay in life in general.
    The 3rd aspect (two houses ahead) is particularly harsh — it brings
    obstacles, pessimism, and suppression of vitality.
    Saturn conjunct lagna lord also noted here.
    """
    if 'Saturn' not in hp: return None
    sh = hp['Saturn']

    asp_lagna = aspects_house('Saturn', 1, hp)
    conj_ll   = False
    ll_list   = lords_of(1, lagna)
    for ll in ll_list:
        if ll in hp and conjunct('Saturn', ll, hp):
            conj_ll = True

    if not asp_lagna and not conj_ll: return None

    diff = (1 - sh) % 12   # how far is lagna from Saturn
    if diff == 2:   aspect_type = "3rd (harshest — restriction, pessimism, chronic obstacles)"
    elif diff == 6: aspect_type = "7th (direct opposition — delays and pressure)"
    elif diff == 9: aspect_type = "10th (work-related pressure, discipline through hardship)"
    else:           aspect_type = "special"

    return yoga("Saturn Afflicts Lagna","शनि लग्न पीड़ा","dosha","medium",["Saturn"],
        f"Saturn (in {ORDINALS[sh]} house) aspects the Lagna via its {aspect_type} aspect. Saturn's malefic energy falls directly on the self, health, and overall life vitality. The native may experience a delayed start in life, chronic obstacles, pessimism, or a heavy sense of responsibility from a young age. However, Saturn also builds immense endurance — those who persevere are rewarded with lasting achievement in the second half of life.",
        ["Delayed start in life","Chronic obstacles","Pessimism tendency","Heavy responsibilities early","Strong endurance","Late but lasting success"],
        ["Recite Shani Beej Mantra (Om Praam Preem Praum Sah Shanaischaraya Namah)",
         "Donate black sesame (til), iron, and oil on Saturdays",
         "Serve the poor and elderly sincerely",
         "Offer mustard oil to Shani deity on Saturdays",
         "Wear Blue Sapphire (Neelam) ONLY after thorough astrological consultation",
         "Practise patience and disciplined routine — Saturn rewards persistence"])

def check_saturn_jupiter_aspect(pp, hp, lagna):
    """
    Saturn aspecting Jupiter afflicts wisdom, fortune, and spiritual growth.
    This is NOT a raj yoga — it is an affliction of Jupiter by a malefic.
    Note: For Leo lagna, Saturn lords 6th and 7th — both dusthana/maraka houses.
    """
    if 'Saturn' not in hp or 'Jupiter' not in hp: return None
    if not aspects('Saturn','Jupiter',hp):         return None

    sh  = hp['Saturn']
    jh  = hp['Jupiter']
    fn  = functional_nature('Saturn', lagna)
    conn= connection_desc('Saturn','Jupiter',hp)

    # Only flag if Saturn is functionally malefic for this lagna
    if fn != 'malefic': return None

    return yoga("Saturn Afflicts Jupiter","शनि गुरु पीड़ा","dosha","medium",["Saturn","Jupiter"],
        f"Saturn ({conn}) afflicts Jupiter. Saturn (lord of dusthana houses for this lagna) casts its malefic aspect on Jupiter, suppressing wisdom, fortune, children, and spiritual growth. The native may face obstacles related to education, children, wealth, and dharmic pursuits. Jupiter's natural expansiveness is restricted by Saturn's constricting energy.",
        ["Obstacles in education/wisdom","Delays related to children","Fortune restricted by hardship","Spiritual confusion","Dharmic struggles","Need for patience in growth"],
        ["Strengthen Jupiter — recite Guru Beej Mantra (Om Graam Greem Graum Sah Gurave Namah)",
         "Offer yellow flowers and turmeric to Jupiter on Thursdays",
         "Donate yellow items on Thursdays",
         "Recite Vishnu Sahasranama",
         "Serve teachers and the learned"])

def check_mars_malefic_aspects(pp, hp, lagna):
    """
    Mars aspecting benefic planets or sensitive houses creates aggression,
    conflict, and cutting energy in those life areas.
    Only flagged when Mars is functionally malefic for the lagna.
    """
    if 'Mars' not in hp: return []
    fn = functional_nature('Mars', lagna)
    if fn not in ('malefic',): return []

    results = []
    mh = hp['Mars']

    # Mars aspecting Moon — anger/emotional volatility
    if 'Moon' in hp and aspects('Mars','Moon',hp) and not conjunct('Mars','Moon',hp):
        results.append(yoga("Mars Afflicts Moon","मंगल चन्द्र पीड़ा","dosha","low",["Mars","Moon"],
            f"Mars (H{mh}) aspects Moon (H{hp['Moon']}) via its special aspect. Mars casts aggressive, fiery energy on the mind (Moon), causing emotional volatility, short temper, impulsive decisions, and difficulty with patience.",
            ["Emotional volatility","Short temper","Impulsive decisions","Mother-related tension","Restless mind"],
            ["Recite Chandra mantra on Mondays",
             "Practise cooling breathing (Sheetali pranayama)",
             "Offer water to Moon on Mondays",
             "Avoid anger and impulsive reactions deliberately"]))

    return results

# ══════════════════════════════════════════════════════════════
# PANCH MAHAPURUSHA
# ══════════════════════════════════════════════════════════════

def check_panch_mahapurusha(pp, hp, lagna):
    results = []
    configs = {
        'Mars':    ('Ruchaka Yoga','रूचक योग',
                    "Mars in own sign or exaltation in a Kendra. The native has the power of a military commander — bold, physically powerful, courageous, and victorious. They achieve great status through courage and decisive action.",
                    ["Exceptional courage","Physical strength","Military/leadership success","Victory over enemies","Commanding personality"]),
        'Mercury': ('Bhadra Yoga','भद्र योग',
                    "Mercury in own sign or exaltation in a Kendra. The native is extraordinarily intelligent, eloquent, and skilled in commerce and communication.",
                    ["Exceptional intelligence","Eloquent speech","Business success","Analytical mastery","Literary talent"]),
        'Jupiter': ('Hamsa Yoga','हंस योग',
                    "Jupiter in own sign or exaltation in a Kendra. The native is deeply wise, spiritual, and respected. They are noble in character, blessed with fortune, and achieve great success through dharmic living.",
                    ["Deep wisdom","Spiritual fortune","Noble character","Teacher/guru qualities","Respected in society"]),
        'Venus':   ('Malavya Yoga','मालव्य योग',
                    "Venus in own sign or exaltation in a Kendra. The native is beautiful, charming, artistic, and blessed with all comforts.",
                    ["Beauty and elegance","Artistic brilliance","Luxury and comfort","Magnetic personality","Blessed with pleasure"]),
        'Saturn':  ('Sasa Yoga','शश योग',
                    "Saturn in own sign or exaltation in a Kendra. The native rises to great authority through discipline, hard work, and patience.",
                    ["Great authority","Administrative power","Disciplined success","Mass leadership","Lasting achievement"]),
    }
    for planet, (name, skt, desc, effects) in configs.items():
        if planet not in pp: continue
        rashi = pp[planet].get('rashi','')
        house = hp.get(planet)
        if house in KENDRAS and (is_own(planet,rashi) or is_exalted(planet,rashi)):
            strength = 'very_strong' if is_exalted(planet,rashi) else 'strong'
            results.append(yoga(name, skt, 'panch_mahapurusha', strength, [planet], desc, effects))
    return results

# ══════════════════════════════════════════════════════════════
# RAJ YOGAS
# ══════════════════════════════════════════════════════════════

def check_gajkeshari(pp, hp, lagna):
    """
    Gaja Keshari: Jupiter in Kendra from Moon (diff 0/3/6/9).
    Jupiter must be a natural benefic — always is. But check it's not
    severely afflicted (in dusthana and aspected by malefic).
    """
    if 'Jupiter' not in hp or 'Moon' not in hp: return None
    jh, mh = hp['Jupiter'], hp['Moon']
    if (jh - mh) % 12 not in [0,3,6,9]:        return None

    # Gajkeshari weakened if Jupiter in dusthana AND afflicted
    jup_in_dusthana = jh in DUSTHANAS
    malefic_on_jup  = any(
        aspects(m,'Jupiter',hp)
        for m in ['Saturn','Mars','Rahu','Ketu'] if m in hp
    )
    if jup_in_dusthana and malefic_on_jup:
        return None   # too afflicted to give yoga

    conn     = connection_desc('Jupiter','Moon',hp)
    strength = 'strong' if is_strong('Jupiter',pp) else 'medium'
    return yoga("Gaja Keshari Yoga","गजकेसरी योग","raj",strength,["Jupiter","Moon"],
        f"Jupiter and Moon are in mutual Kendra ({conn}). One of the most celebrated Raj Yogas — the native is intelligent, wise, eloquent, and commands great respect. They leave a lasting impression on society through their wisdom and noble character.",
        ["Intelligence and wisdom","Fame and recognition","Noble character","Respected in society","Eloquent speech"])

def check_budha_aditya(pp, hp, lagna):
    """Budha Aditya: Sun+Mercury conjunct. Weakened in dusthana."""
    if not conjunct('Sun','Mercury',hp): return None
    sh   = hp.get('Sun')
    conn = connection_desc('Sun','Mercury',hp)
    s    = 'strong' if (is_strong('Sun',pp) and sh not in DUSTHANAS) \
           else 'medium' if sh not in DUSTHANAS else 'low'
    return yoga("Budha Aditya Yoga","बुधादित्य योग","raj",s,["Sun","Mercury"],
        f"Sun and Mercury are conjunct ({conn}). The native is sharp-minded, skilled in communication, and achieves success in intellectual and governmental pursuits.",
        ["Sharp intellect","Excellent communication","Government/administrative success","Leadership ability","Respected by authority"])

def check_dharma_karmadhipati(pp, hp, lagna):
    """9th lord + 10th lord connected — supreme Raj Yoga.
    Connection must be benefic (not a malefic aspecting a benefic)."""
    for nl in lords_of(9, lagna):
        for tl in lords_of(10, lagna):
            if nl == tl: continue
            if nl not in hp or tl not in hp: continue
            if in_dusthana(nl,hp) and in_dusthana(tl,hp): continue
            if not benefic_related(nl, tl, hp, lagna): continue
            conn = connection_desc(nl, tl, hp)
            s    = 'very_strong' if (is_strong(nl,pp) or is_strong(tl,pp)) else 'strong'
            return yoga("Dharma Karmadhipati Raj Yoga","धर्म कर्माधिपति राजयोग","raj",s,[nl,tl],
                f"The 9th lord ({nl}) and 10th lord ({tl}) are auspiciously connected — {conn} — forming this supreme Raj Yoga. One of the most powerful combinations for career success, fame, and dharmic achievement.",
                ["Outstanding career success","Fame and public recognition","Dharmic profession","Legacy achievement","Fortune through karma"])
    return None

def check_kendra_trikona(pp, hp, lagna):
    """
    Classic Kendra-Trikona Raj Yoga.

    STRICT RULES applied here:
    1. Both lords must be functionally benefic or yogakaraka for this lagna.
    2. If the connection is an aspect, the ASPECTING planet must be a
       NATURAL benefic (Jupiter, Venus, Mercury, Moon) — a malefic planet
       aspecting does NOT form a positive yoga regardless of lordship.
    3. Neither lord should be in a dusthana (or at least not both).
    4. A malefic planet (Saturn, Mars, Rahu, Ketu) aspecting a benefic lord
       does NOT create a Raj Yoga — it AFFLICTS that lord instead.
    """
    results = []
    seen    = set()

    for kendra in KENDRAS:
        for trikona in TRIKONAS:
            if kendra == trikona: continue
            for kl in lords_of(kendra, lagna):
                for tl in lords_of(trikona, lagna):
                    if kl == tl:                      continue
                    if kl not in hp or tl not in hp:  continue
                    if in_dusthana(kl,hp) and in_dusthana(tl,hp): continue

                    fn_kl = functional_nature(kl, lagna)
                    fn_tl = functional_nature(tl, lagna)
                    # Reject only if either lord is a pure functional malefic
                    if fn_kl == 'malefic' or fn_tl == 'malefic': continue

                    # Use benefic_related — enforces aspector-must-be-benefic rule
                    if not benefic_related(kl, tl, hp, lagna): continue

                    key = tuple(sorted([kl, tl]))
                    if key in seen: continue
                    seen.add(key)

                    conn = connection_desc(kl, tl, hp)
                    s    = 'strong' if (is_strong(kl,pp) or is_strong(tl,pp)) else 'medium'
                    results.append(yoga(
                        f"Raj Yoga ({ORDINALS[kendra]}-{ORDINALS[trikona]} lords)",
                        "राजयोग","raj",s,[kl,tl],
                        f"The {ORDINALS[kendra]} lord ({kl}) and {ORDINALS[trikona]} lord ({tl}) are auspiciously connected — {conn} — forming a classic Kendra-Trikona Raj Yoga. This combination gives authority, success, and prosperity.",
                        ["High social status","Authority and power","Career success","Recognition","Prosperity"]))

    return results[:4]

def check_parivartana_raj(pp, hp, lagna):
    """Sign exchange Raj Yoga — both lords must be functionally benefic."""
    results = []
    seen    = set()

    for kendra in KENDRAS:
        for trikona in TRIKONAS:
            if kendra == trikona: continue
            for kl in lords_of(kendra, lagna):
                for tl in lords_of(trikona, lagna):
                    if kl == tl: continue
                    if kl not in pp or tl not in pp: continue
                    if not parivartana(kl, tl, pp, hp): continue
                    fn_kl = functional_nature(kl, lagna)
                    fn_tl = functional_nature(tl, lagna)
                    if fn_kl == 'malefic' or fn_tl == 'malefic': continue
                    key = tuple(sorted([kl, tl]))
                    if key in seen: continue
                    seen.add(key)
                    r1, r2 = pp[kl]['rashi'], pp[tl]['rashi']
                    results.append(yoga(
                        f"Parivartana Raj Yoga ({ORDINALS[kendra]}-{ORDINALS[trikona]})",
                        "परिवर्तन राजयोग","raj","strong",[kl,tl],
                        f"{kl} (lord of {ORDINALS[kendra]}) is in {r1} — {tl}'s sign — and {tl} (lord of {ORDINALS[trikona]}) is in {r2} — {kl}'s sign. This mutual sign exchange (Parivartana) between a Kendra and Trikona lord is equivalent to conjunction and forms a powerful Raj Yoga.",
                        ["Authority through exchange","Double-strength Raj Yoga","Career and fortune together","Mutual empowerment","Prominent success"]))

    for nl in lords_of(9, lagna):
        for tl in lords_of(10, lagna):
            if nl == tl: continue
            if nl not in pp or tl not in pp: continue
            if not parivartana(nl, tl, pp, hp): continue
            fn_nl = functional_nature(nl, lagna)
            fn_tl = functional_nature(tl, lagna)
            if fn_nl == 'malefic' or fn_tl == 'malefic': continue
            key = tuple(sorted([nl, tl]))
            if key in seen: continue
            seen.add(key)
            results.append(yoga(
                "Dharma-Karma Parivartana Yoga","धर्म-कर्म परिवर्तन योग","raj","very_strong",[nl,tl],
                f"{nl} (9th lord) and {tl} (10th lord) are in mutual sign exchange — the most powerful form of Dharma-Karmadhipati Raj Yoga. Dharma and Karma are completely interlinked.",
                ["Supreme career success","Dharmic vocation","Extraordinary fame","Fortune through profession","Legacy achievement"]))

    return results[:3]

def check_vipreet_raj(pp, hp, lagna):
    """Viparita Raja Yoga: lord of 6/8/12 placed in another dusthana."""
    results = []
    combos  = [(6,8,"Harsha Yoga","हर्ष योग"),(6,12,"Harsha Yoga","हर्ष योग"),
               (8,6,"Sarala Yoga","सरल योग"),(8,12,"Sarala Yoga","सरल योग"),
               (12,6,"Vimala Yoga","विमल योग"),(12,8,"Vimala Yoga","विमल योग")]
    seen = set()
    for lord_house, placed_in, name, skt in combos:
        if name in seen: continue
        for lord in lords_of(lord_house, lagna):
            if lord not in hp: continue
            if hp[lord] == placed_in:
                seen.add(name)
                results.append(yoga(name,skt,"raj","medium",[lord],
                    f"The lord of the {ORDINALS[lord_house]} house ({lord}) is placed in the {ORDINALS[placed_in]} house (another dusthana), forming {name}. Enemies and adversaries destroy themselves. The native triumphs over opposition and rises after periods of difficulty.",
                    ["Victory over enemies","Rise after difficulties","Unexpected success","Resilience","Triumph over adversity"]))
    return results

def check_neech_bhanga(pp, hp, lagna):
    """Neecha Bhanga Raja Yoga: debilitation cancelled by planet in Kendra."""
    results = []
    for planet in ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']:
        if planet not in pp: continue
        rashi = pp[planet].get('rashi','')
        if not is_debilitated(planet, rashi): continue
        exalt_rashi = EXALTATION.get(planet,'')
        if not exalt_rashi: continue
        deb_lords   = lords_of(RASHIS.index(rashi)+1, lagna)
        exalt_lords = lords_of(RASHIS.index(exalt_rashi)+1, lagna)
        for cl in deb_lords + exalt_lords:
            if cl not in hp: continue
            if hp[cl] in KENDRAS:
                results.append(yoga(
                    f"Neech Bhanga Raj Yoga ({planet})","नीच भंग राजयोग","raj","strong",[planet,cl],
                    f"{planet} is debilitated in {rashi} but the cancellation is provided by {cl} in a Kendra ({ORDINALS[hp[cl]]} house), creating Neech Bhanga Raj Yoga. The native rises powerfully after initial struggles.",
                    ["Rise from difficulties","Stronger than exaltation","Exceptional achievement","Overcoming adversity","Late but lasting success"]))
                break
    return results

def check_amala(pp, hp, lagna):
    """Amala Yoga: only natural benefics in 10th from Lagna."""
    nat_bens = {'Jupiter','Venus','Mercury'}
    tenth    = [p for p,h in hp.items() if h==10 and p not in ('Rahu','Ketu','Sun','Moon','Mars','Saturn')]
    if tenth and all(p in nat_bens for p in tenth):
        return yoga("Amala Yoga","अमल योग","raj","medium",tenth,
            "Only natural benefic planets occupy the 10th house. The native achieves lasting fame through virtuous and righteous deeds. Their professional reputation is spotless.",
            ["Spotless reputation","Fame through virtue","Righteous profession","Lasting legacy","Noble character"])
    return None

def check_pushkala(pp, hp, lagna):
    """Pushkala Yoga: Lagna lord conjunct Moon, Moon's dispositor aspects Lagna."""
    ll_list = lords_of(1, lagna)
    mh      = hp.get('Moon')
    if not mh or not ll_list: return None
    for ll in ll_list:
        if ll not in hp: continue
        if not conjunct(ll,'Moon',hp): continue
        moon_rashi = pp.get('Moon',{}).get('rashi','')
        moon_disp  = sign_lord(moon_rashi)
        if moon_disp and aspects_house(moon_disp, 1, hp):
            conn = connection_desc(ll,'Moon',hp)
            return yoga("Pushkala Yoga","पुष्कल योग","raj","strong",[ll,'Moon'],
                f"The Lagna lord ({ll}) is conjunct Moon ({conn}), and the Moon's dispositor ({moon_disp}) aspects the Lagna, forming Pushkala Yoga. The native is endowed with wealth, status, fame, and a strong personality.",
                ["Wealth and status","Strong personality","Fame and respect","Prosperous life","Blessed by fortune"])
    return None

# ══════════════════════════════════════════════════════════════
# DHANA YOGAS
# ══════════════════════════════════════════════════════════════

def check_lakshmi(pp, hp, lagna):
    if not is_strong('Venus',pp): return None
    vh = hp.get('Venus')
    if vh not in KENDRAS + TRIKONAS: return None
    for nl in lords_of(9, lagna):
        nh = hp.get(nl)
        if nh and nh in KENDRAS + TRIKONAS:
            return yoga("Lakshmi Yoga","लक्ष्मी योग","dhana","strong",["Venus",nl],
                f"Venus is strong and the 9th lord ({nl}) is well-placed in the {ORDINALS[nh]} house, forming Lakshmi Yoga. The native is blessed with abundant wealth, beauty, and divine grace.",
                ["Abundant wealth","Beauty and elegance","Luxurious lifestyle","Divine grace","Comfort and happiness"])
    return None

def check_chandra_mangala(pp, hp, lagna):
    """
    Chandra Mangala: Moon and Mars conjunct or in mutual aspect.
    This is primarily a Dhana yoga (wealth through courage/enterprise).
    Even with one-way Mars aspect it counts — but we note the direction.
    """
    if 'Moon' not in hp or 'Mars' not in hp: return None
    if not related('Moon','Mars',hp):         return None
    conn = connection_desc('Moon','Mars',hp)
    if conjunct('Moon','Mars',hp):
        how = f"Moon and Mars are conjunct ({conn})"
    elif aspects('Moon','Mars',hp) and aspects('Mars','Moon',hp):
        how = f"Moon and Mars mutually aspect each other ({conn})"
    else:
        how = f"Connected by aspect — {conn}"
    return yoga("Chandra Mangala Yoga","चन्द्र मंगल योग","dhana","medium",["Moon","Mars"],
        f"{how}. The native earns significant wealth through courage, emotional intelligence, and bold action. Note: If Mars is a malefic lord for the lagna, this connection also brings emotional volatility alongside the material drive.",
        ["Wealth through courage","Emotional strength","Bold decision-making","Business acumen","Physical vitality"])

def check_guru_mangala(pp, hp, lagna):
    """
    Guru Mangala: Jupiter and Mars conjunct or in mutual aspect.
    Jupiter must be the benefic here — if the connection is an aspect,
    Jupiter should be the one aspecting for it to be fully auspicious.
    """
    if 'Jupiter' not in hp or 'Mars' not in hp: return None
    if not related('Jupiter','Mars',hp):         return None

    # The yoga is stronger when Jupiter aspects Mars (Jupiter's benefic energy on Mars's drive)
    # If only Mars aspects Jupiter, it afflicts Jupiter more than it blesses Mars
    j_asp_m = aspects('Jupiter','Mars',hp)
    m_asp_j = aspects('Mars','Jupiter',hp)
    conj    = conjunct('Jupiter','Mars',hp)

    if conj or j_asp_m:
        strength = 'strong'
        note     = "Jupiter's expansive wisdom blesses Mars's courageous drive"
    elif m_asp_j:
        # Mars aspecting Jupiter is an affliction of Jupiter, not a pure benefic yoga
        fn_mars = functional_nature('Mars', lagna)
        if fn_mars == 'malefic':
            return None   # Mars (malefic lord) aspecting Jupiter = affliction not yoga
        strength = 'medium'
        note     = "Mars energises Jupiter — primarily Dhana yoga through enterprise"

    conn = connection_desc('Jupiter','Mars',hp)
    return yoga("Guru Mangala Yoga","गुरु मंगल योग","dhana",strength,["Jupiter","Mars"],
        f"Jupiter and Mars are connected — {conn}. {note}. The native combines bold action with sound judgment, achieving wealth and status through enterprise, leadership, and ethical ambition.",
        ["Wealth through enterprise","Courageous wisdom","Leadership and authority","Ethical ambition","Prosperous ventures"])

def check_vasumati(pp, hp, lagna):
    """Vasumati Yoga: 2+ natural benefics in Upachaya houses from Moon."""
    mh = hp.get('Moon')
    if not mh: return None
    nat_bens = ['Jupiter','Venus','Mercury']
    bens_up  = [b for b in nat_bens if b in hp and (hp[b]-mh)%12+1 in UPACHAYAS]
    if len(bens_up) >= 2:
        return yoga("Vasumati Yoga","वसुमति योग","dhana","medium",bens_up,
            f"Natural benefics ({', '.join(bens_up)}) are in Upachaya houses (3/6/10/11) from the Moon, forming Vasumati Yoga. The native accumulates wealth steadily through persistent effort.",
            ["Steady wealth accumulation","Growing prosperity","Material success","Persistent gains","Comfortable lifestyle"])
    return None

def check_dhana_yogas(pp, hp, lagna):
    results = []

    # 2nd lord + 11th lord — both must be benefic for auspicious connection
    for sl in lords_of(2, lagna):
        for el in lords_of(11, lagna):
            if sl == el: continue
            if sl not in hp or el not in hp: continue
            if not related(sl, el, hp): continue
            # For dhana yoga, connection quality matters less strictly than raj yoga
            # but still require no pure malefic aspecting
            conn = connection_desc(sl, el, hp)
            results.append(yoga("Dhana Yoga (2-11)","धन योग","dhana","medium",[sl,el],
                f"The 2nd lord ({sl}) and 11th lord ({el}) are connected — {conn} — forming Dhana Yoga. Both houses of wealth are linked, indicating significant accumulation of money and assets.",
                ["Wealth accumulation","Multiple income streams","Financial stability","Fulfilled desires","Prosperous life"]))

    # 5th lord + 9th lord
    for fl in lords_of(5, lagna):
        for nl in lords_of(9, lagna):
            if fl == nl: continue
            if fl not in hp or nl not in hp: continue
            fn_fl = functional_nature(fl, lagna)
            fn_nl = functional_nature(nl, lagna)
            if fn_fl == 'malefic' or fn_nl == 'malefic': continue
            if not benefic_related(fl, nl, hp, lagna): continue
            conn = connection_desc(fl, nl, hp)
            results.append(yoga("Dhana Yoga (5-9)","धन योग","dhana","strong",[fl,nl],
                f"The 5th lord ({fl}) and 9th lord ({nl}) are auspiciously connected — {conn} — forming Trikona Dhana Yoga. Past life merit aligns with fortune, creating great wealth.",
                ["Fortune through merit","Speculative gains","Fortunate investments","Past life blessings","Prosperity through wisdom"]))

    # Jupiter aspecting 2nd house
    jh = hp.get('Jupiter')
    if jh:
        asp = [(jh-1+d)%12+1 for d in [4,6,8]]
        asp.append(jh)
        if 2 in asp:
            results.append(yoga("Jupiter Aspects 2nd House","गुरु धन दृष्टि","dhana","medium",["Jupiter"],
                f"Jupiter (in {ORDINALS[jh]} house) aspects the 2nd house of wealth, blessing it with abundance. The native earns through wisdom and noble means.",
                ["Blessed wealth","Wisdom-based income","Family prosperity","Respected speech","Growing assets"]))

    return results[:3]

# ══════════════════════════════════════════════════════════════
# CHANDRA YOGAS
# ══════════════════════════════════════════════════════════════

def check_adhi(pp, hp, lagna):
    """Adhi Yoga: benefics in 6th, 7th, and/or 8th from Moon (2+ positions)."""
    mh = hp.get('Moon')
    if not mh: return None
    nat_bens = ['Jupiter','Venus','Mercury']
    def h_from_moon(off): return (mh-1+off)%12+1
    h6,h7,h8 = h_from_moon(5), h_from_moon(6), h_from_moon(7)
    in6 = [b for b in nat_bens if hp.get(b)==h6]
    in7 = [b for b in nat_bens if hp.get(b)==h7]
    in8 = [b for b in nat_bens if hp.get(b)==h8]
    occupied = [x for x in [in6,in7,in8] if x]
    if len(occupied) >= 2:
        all_bens = list({b for g in occupied for b in g})
        return yoga("Adhi Yoga","आधि योग","dhana","strong",all_bens,
            f"Natural benefics are placed in the 6th/7th/8th from Moon, forming Adhi Yoga. The native rises to great authority and lives a long, healthy, prosperous life defeating all enemies.",
            ["Authority and leadership","Defeat of enemies","Long prosperous life","Political success","Abundant wealth"])
    return None

def check_sunapha_anapha(pp, hp, lagna):
    """Sunapha/Anapha/Durudhara: planets in 2nd/12th from Moon."""
    mh = hp.get('Moon')
    if not mh: return None
    exclude = {'Sun','Moon','Rahu','Ketu'}
    h2  = mh%12+1
    h12 = (mh-2)%12+1
    in2  = [p for p,h in hp.items() if h==h2  and p not in exclude]
    in12 = [p for p,h in hp.items() if h==h12 and p not in exclude]
    results = []
    if in2 and in12:
        results.append(yoga("Durudhara Yoga","दुरुधरा योग","dhana","strong",
            list(set(in2+in12)),
            f"Planets {in2} in 2nd from Moon and {in12} in 12th from Moon form Durudhara Yoga. The native enjoys wealth from all directions — income and savings both strong. They are generous and prosperous.",
            ["Wealth from all directions","Generosity","Surrounded by supporters","Prosperous life","Income and savings both strong"]))
    elif in2:
        results.append(yoga("Sunapha Yoga","सुनफा योग","dhana","medium",in2,
            f"{in2} in 2nd from Moon forms Sunapha Yoga. The native is self-made, earns well through their own efforts, and possesses intelligence and physical strength.",
            ["Self-made wealth","Intelligence","Independent enterprise","Physical vitality","Steady income"]))
    elif in12:
        results.append(yoga("Anapha Yoga","अनफा योग","dhana","medium",in12,
            f"{in12} in 12th from Moon forms Anapha Yoga. The native is gracious, healthy, and lives a comfortable life known for their character.",
            ["Gracious living","Good health","Comfortable lifestyle","Strong character","Pleasures and comforts"]))
    return results

# ══════════════════════════════════════════════════════════════
# SURYA YOGAS
# ══════════════════════════════════════════════════════════════

def check_vesi_vasi_ubhayachari(pp, hp, lagna):
    """Vesi/Vasi/Ubhayachari: planets in 2nd/12th from Sun."""
    sh = hp.get('Sun')
    if not sh: return None
    exclude = {'Sun','Moon','Rahu','Ketu'}
    h2  = sh%12+1
    h12 = (sh-2)%12+1
    in2  = [p for p,h in hp.items() if h==h2  and p not in exclude]
    in12 = [p for p,h in hp.items() if h==h12 and p not in exclude]
    if in2 and in12:
        return yoga("Ubhayachari Yoga","उभयचारी योग","raj","strong",
            list(set(in2+in12)),
            f"Planets present both in the 2nd ({in2}) and 12th ({in12}) from the Sun, forming Ubhayachari Yoga. Commanding presence, great authority, and skill in resources.",
            ["Supreme authority","Commanding presence","Skill in resources","Fame and respect","Royal bearing"])
    if in2:
        return yoga("Vesi Yoga","वेसी योग","raj","medium",in2,
            f"{in2} in 2nd from Sun forms Vesi Yoga. The native is eloquent, prosperous, and skilled with an influential personality.",
            ["Eloquence","Prosperity","Respected character","Influential personality","Skilled and learned"])
    if in12:
        return yoga("Vasi Yoga","वासी योग","raj","medium",in12,
            f"{in12} in 12th from Sun forms Vasi Yoga. The native is virtuous, happy, and known for charitable and kind nature.",
            ["Virtue and happiness","Good physique","Charitable nature","Kind personality","Contented life"])
    return None

# ══════════════════════════════════════════════════════════════
# DOSHAS
# ══════════════════════════════════════════════════════════════

def check_mangal_dosha(pp, hp, lagna):
    mh = hp.get('Mars')
    if mh in [1,2,4,7,8,12]:
        sev    = "high" if mh in [7,8] else "medium" if mh in [1,4,12] else "low"
        labels = {1:"1st (self)",2:"2nd (family/speech)",4:"4th (home/mother)",
                  7:"7th (marriage/partner)",8:"8th (longevity)",12:"12th (bed pleasures)"}
        return yoga("Mangal Dosha","मंगल दोष","dosha",sev,["Mars"],
            f"Mars is placed in the {labels.get(mh,ORDINALS[mh]+' house')}, creating Mangal Dosha. This can cause delays in marriage, conflicts in marital life, and aggressive energy in relationships.",
            ["Delays in marriage","Marital tensions possible","Strong willpower","Courage and boldness","Need Manglik matching"],
            ["Marry a Manglik partner","Kumbh Vivah remedy before marriage","Tuesday fasts",
             "Recite Hanuman Chalisa daily","Donate red items on Tuesdays","Offer sindoor to Hanuman"])
    return None

def check_kaal_sarp(pp, hp, lagna):
    rh = hp.get('Rahu')
    kh = hp.get('Ketu')
    if not rh or not kh: return None
    classics = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
    phs      = [hp[p] for p in classics if p in hp]
    if not phs: return None
    arc, h = [], rh%12+1
    while h != kh:
        arc.append(h)
        h = h%12+1
    if all(ph in arc or ph==rh for ph in phs):
        return yoga("Kaal Sarp Dosha","काल सर्प दोष","dosha","high",["Rahu","Ketu"],
            f"All planets are hemmed between Rahu ({ORDINALS[rh]}) and Ketu ({ORDINALS[kh]}), forming Kaal Sarp Dosha. The native faces obstacles, delays, and karmic struggles — but also intense focus and potential for extraordinary achievement after overcoming initial hurdles.",
            ["Obstacles and delays","Intense karmic journey","Spiritual inclination","Eventual great achievement","Need for remedies"],
            ["Kaal Sarp Puja at Trimbakeshwar","Nag Panchami worship","Recite Mahamrityunjaya mantra",
             "Feed snakes milk on Nag Panchami","Visit Ujjain for remedy","Wear Nag devata silver pendant"])
    return None

def check_pitru_dosha(pp, hp, lagna):
    sh  = hp.get('Sun')
    rh  = hp.get('Rahu')
    kh  = hp.get('Ketu')
    sth = hp.get('Saturn')

    if sh == 9 and any(h==9 for h in [rh,kh,sth]):
        return yoga("Pitru Dosha","पितृ दोष","dosha","medium",["Sun"],
            "Sun in the 9th house is afflicted by a malefic, indicating ancestral karmic debt. Performing Shraddha and pind daan brings ancestral blessings.",
            ["Ancestral karma","Obstacles from unseen sources","Father-related challenges","Need for ancestral rites","Spiritual debts"],
            ["Perform Shraddha on Amavasya","Feed crows on Amavasya","Pind Daan at Gaya",
             "Donate on Saturdays","Recite Pitru Stotra","Offer water to ancestors"])

    if sh and (sh==rh or sh==kh):
        node = 'Rahu' if sh==rh else 'Ketu'
        return yoga("Surya Grahan Dosha","सूर्य ग्रहण दोष","dosha","medium",["Sun",node],
            f"Sun is conjunct with {node} in the {ORDINALS[sh]} house, forming Surya Grahan Dosha. Obstacles related to father, authority figures, and career recognition.",
            ["Father-related challenges","Career obstacles","Authority issues","Health vigilance","Identity confusion"],
            ["Recite Aditya Hridayam","Offer water to Sun daily","Donate copper/wheat on Sundays",
             "Strengthen Sun with Ruby gemstone","Avoid conflicts with authority figures"])

    if sh in DUSTHANAS:
        mal_with_sun = [p for p in ['Mars','Saturn','Rahu','Ketu'] if hp.get(p)==sh]
        if mal_with_sun:
            return yoga("Pitru Dosha (Partial)","पितृ दोष (आंशिक)","dosha","low",
                ["Sun"]+mal_with_sun,
                f"Sun in the {ORDINALS[sh]} house (dusthana) conjunct with {mal_with_sun} creates partial Pitru Dosha. Mild ancestral karmic debts may create obstacles related to father and career.",
                ["Mild ancestral karma","Father-related challenges","Career obstacles possible","Need for spiritual practice"],
                ["Offer water to Sun daily","Recite Gayatri Mantra","Donate on Sundays","Perform Shraddha rituals"])
    return None

def check_guru_chandal(pp, hp, lagna):
    jh = hp.get('Jupiter')
    rh = hp.get('Rahu')
    kh = hp.get('Ketu')
    if jh and (jh==rh or jh==kh):
        node = 'Rahu' if jh==rh else 'Ketu'
        return yoga("Guru Chandal Yoga","गुरु चाण्डाल योग","dosha","medium",["Jupiter",node],
            f"Jupiter is conjunct with {node} in the {ORDINALS[jh]} house, forming Guru Chandal Yoga. The native's wisdom is coloured by unconventional influences — can give extraordinary unconventional intelligence but confuses ethics.",
            ["Unconventional wisdom","Rebellious intellect","Foreign connections","Moral questioning","Unique philosophical path"],
            ["Recite Guru Beej Mantra (Om Graam Greem Graum Sah Gurave Namah)",
             "Worship Lord Vishnu on Thursdays","Donate yellow items","Offer turmeric to Shivling","Fast on Thursdays"])
    return None

def check_mangal_chandal(pp, hp, lagna):
    """Mangal Chandal Dosha: Mars conjunct Rahu or Ketu — aggression, accidents, conflicts."""
    mh = hp.get('Mars')
    rh = hp.get('Rahu')
    kh = hp.get('Ketu')
    if mh and (mh==rh or mh==kh):
        node = 'Rahu' if mh==rh else 'Ketu'
        return yoga("Mangal Chandal Dosha","मंगल चाण्डाल दोष","dosha","medium",["Mars",node],
            f"Mars is conjunct with {node} in the {ORDINALS[mh]} house, forming Mangal Chandal Dosha. Rahu/Ketu amplify Mars's aggressive energy, causing impulsive behaviour, accidents, legal conflicts, and volatile relationships. The native has immense raw energy that needs disciplined channelling.",
            ["Impulsive aggression","Accident-prone","Legal conflicts possible","Volatile relationships","Raw energy needing discipline"],
            ["Recite Hanuman Chalisa daily","Tuesday fasts","Donate red items on Tuesdays",
             "Recite Mars mantra (Om Kraam Kreem Kraum Sah Bhaumaya Namah)",
             "Practise physical discipline (martial arts, yoga) to channel Mars energy"])
    return None

def check_shrapit_dosha(pp, hp, lagna):
    """Shrapit Dosha: Saturn + Rahu conjunct."""
    rh  = hp.get('Rahu')
    sth = hp.get('Saturn')
    if rh and sth and rh==sth:
        return yoga("Shrapit Dosha","शापित दोष","dosha","high",["Rahu","Saturn"],
            f"Rahu and Saturn are conjunct in the {ORDINALS[rh]} house, forming Shrapit Dosha. This indicates heavy karmic burden from past lives, bringing unexpected misfortunes, prolonged delays, and chronic obstacles. Sincere spiritual effort significantly reduces these effects.",
            ["Heavy karmic burden","Unexpected misfortunes","Prolonged delays","Chronic obstacles","Potential for deep wisdom through struggle"],
            ["Recite Shani Mantra (Om Shanaishcharaya Namah)",
             "Recite Rahu Mantra (Om Rahave Namah)",
             "Visit Shani temple on Saturdays",
             "Donate black sesame, iron, and blue items on Saturdays",
             "Recite Mahamrityunjaya Mantra 108 times daily",
             "Perform Shrapit Dosha Nivaran Puja"])
    return None

def check_kemadrum(pp, hp, lagna):
    mh = hp.get('Moon')
    if not mh: return None
    prev_h = (mh-2)%12+1
    next_h = mh%12+1
    check_p = ['Sun','Mars','Mercury','Jupiter','Venus','Saturn']
    adjacent = [p for p in check_p if hp.get(p) in [prev_h,next_h,mh]]
    aspected_by_benefic = any(aspects(b,'Moon',hp) for b in ['Jupiter','Venus','Mercury'] if b in hp)
    if not adjacent and not aspected_by_benefic:
        return yoga("Kemadrum Dosha","केमद्रुम दोष","dosha","medium",["Moon"],
            f"Moon (in {ORDINALS[mh]}) has no planets in adjacent houses and no benefic aspect, creating Kemadrum Dosha. The mind feels emotionally isolated and unstable. Financial fluctuations and lack of support may be felt at various life stages.",
            ["Emotional isolation","Mental instability","Financial fluctuations","Lack of support","Need for inner strength"],
            ["Wear Pearl (Moti)","Monday fasts","Offer water and milk to Shivling",
             "Recite Chandra mantra (Om Shraam Shreem Shraum Sah Chandraya Namah)",
             "Feed white foods (rice, milk) to poor"])
    return None

def check_shakat(pp, hp, lagna):
    mh = hp.get('Moon')
    jh = hp.get('Jupiter')
    if mh and jh:
        diff = (mh-jh)%12
        if diff in [5,7]:
            pos = '6th' if diff==5 else '8th'
            return yoga("Shakata Yoga","शकट योग","dosha","medium",["Moon","Jupiter"],
                f"Moon ({ORDINALS[mh]}) is in the {pos} from Jupiter ({ORDINALS[jh]}), forming Shakata Yoga. Fortune fluctuates — periods of great success alternate with setbacks. The native always recovers and fortune stabilises in the latter half of life.",
                ["Fluctuating fortune","Ups and downs in life","Recovery ability","Eventual stability"],
                ["Worship Vishnu on Thursdays","Offer yellow flowers to Vishnu",
                 "Recite Vishnu Sahasranama","Donate yellow items on Thursdays"])
    return None

def check_grahan_yoga(pp, hp, lagna):
    mh = hp.get('Moon')
    rh = hp.get('Rahu')
    kh = hp.get('Ketu')
    if mh and (mh==rh or mh==kh):
        node = 'Rahu' if mh==rh else 'Ketu'
        return yoga("Chandra Grahan Dosha","चन्द्र ग्रहण दोष","dosha","medium",["Moon",node],
            f"Moon conjunct {node} in {ORDINALS[mh]} house creates Chandra Grahan Dosha. The mind is restless, emotionally unpredictable, and prone to unusual fears. Spiritual practices greatly help stabilise the mind.",
            ["Emotional restlessness","Mental confusion","Relationship instability","Unusual fears","Spiritual sensitivity"],
            ["Recite Chandra mantra","Offer milk to Shivling on Mondays",
             "Wear Pearl (consult astrologer)","Practise meditation and mindfulness"])
    return None

def check_sakata(pp, hp, lagna):
    jh = hp.get('Jupiter')
    mh = hp.get('Moon')
    if jh and mh:
        diff = (mh-jh)%12+1
        if diff in [6,8,12]:
            return yoga("Sakata Yoga","साकट योग","dosha","low",["Moon","Jupiter"],
                f"Moon ({ORDINALS[mh]}) is in {ORDINALS[diff]} from Jupiter ({ORDINALS[jh]}), creating Sakata Yoga. Good fortune may come and go. The native overcomes difficulties through persistence.",
                ["Variable fortune","Overcoming obstacles","Need for persistence","Late success"],
                ["Worship Jupiter","Offer yellow flowers on Thursdays","Recite Guru Stotram"])
    return None

def check_papakartari(pp, hp, lagna):
    nat_malefics = ['Sun','Mars','Saturn','Rahu','Ketu']
    results      = []
    mal_12 = [p for p in nat_malefics if hp.get(p)==12]
    mal_2  = [p for p in nat_malefics if hp.get(p)==2]
    if mal_12 and mal_2:
        results.append(yoga("Papakartari Dosha (Lagna)","पापकर्तरी दोष","dosha","medium",
            mal_12+mal_2,
            f"Malefics {mal_12} in 12th and {mal_2} in 2nd hem in the Lagna, creating Papakartari Dosha. The native's vitality and personal power are squeezed by adverse influences.",
            ["Squeezed personal power","Health vigilance","Self-confidence challenges","Need for spiritual protection"],
            ["Recite Maha Mrityunjaya Mantra","Worship Ganesha daily","Recite Hanuman Chalisa","Wear protective gemstone (consult astrologer)"]))
    mh = hp.get('Moon')
    if mh:
        prev_h = (mh-2)%12+1
        next_h = mh%12+1
        mal_prev = [p for p in nat_malefics if hp.get(p)==prev_h]
        mal_next = [p for p in nat_malefics if hp.get(p)==next_h]
        if mal_prev and mal_next:
            results.append(yoga("Chandra Papakartari","चन्द्र पापकर्तरी","dosha","medium",
                mal_prev+mal_next,
                f"Malefics hem in Moon from both sides (H{prev_h} and H{next_h}), forming Chandra Papakartari. The mind is under pressure from adverse influences causing emotional stress and mental instability.",
                ["Mental pressure","Emotional instability","Difficulty finding peace","Stress from environment"],
                ["Strengthen Moon — wear Pearl","Monday fasts","Recite Chandra mantra","Meditate daily"]))
    return results

# ══════════════════════════════════════════════════════════════
# MAIN CALCULATION
# ══════════════════════════════════════════════════════════════

def calculate_yogas(kundli):
    lagna = kundli.get('lagna',{}).get('name','Mesha')
    pp    = kundli.get('planetary_positions',{})
    if not pp or lagna not in RASHIS: return []

    hp = build_hp(pp, lagna)

    all_yogas = []

    # Panch Mahapurusha (placement-based, no aspect issues)
    all_yogas.extend(check_panch_mahapurusha(pp, hp, lagna))

    # Raj Yogas (strict benefic_related filter)
    for fn in [check_gajkeshari, check_budha_aditya, check_dharma_karmadhipati,
               check_amala, check_pushkala]:
        r = fn(pp, hp, lagna)
        if r: all_yogas.append(r)
    all_yogas.extend(check_kendra_trikona(pp, hp, lagna))
    all_yogas.extend(check_parivartana_raj(pp, hp, lagna))
    all_yogas.extend(check_vipreet_raj(pp, hp, lagna))
    all_yogas.extend(check_neech_bhanga(pp, hp, lagna))

    # Surya Yogas
    r = check_vesi_vasi_ubhayachari(pp, hp, lagna)
    if r: all_yogas.append(r)

    # Dhana Yogas
    for fn in [check_lakshmi, check_chandra_mangala, check_guru_mangala,
               check_vasumati]:
        r = fn(pp, hp, lagna)
        if r: all_yogas.append(r)
    all_yogas.extend(check_dhana_yogas(pp, hp, lagna))

    # Chandra Yogas
    r = check_adhi(pp, hp, lagna)
    if r: all_yogas.append(r)
    all_yogas.extend(check_sunapha_anapha(pp, hp, lagna))

    # Doshas — existing
    for fn in [check_mangal_dosha, check_kaal_sarp, check_pitru_dosha,
               check_guru_chandal, check_mangal_chandal, check_shrapit_dosha,
               check_kemadrum, check_shakat, check_grahan_yoga, check_sakata]:
        r = fn(pp, hp, lagna)
        if r: all_yogas.append(r)
    all_yogas.extend(check_papakartari(pp, hp, lagna))

    # Malefic influence doshas (new)
    for fn in [check_saturn_moon_affliction, check_saturn_lagna_affliction,
               check_saturn_jupiter_aspect]:
        r = fn(pp, hp, lagna)
        if r: all_yogas.append(r)
    all_yogas.extend(check_mars_malefic_aspects(pp, hp, lagna))

    # Deduplicate
    seen, final = set(), []
    for y in all_yogas:
        if y['name'] not in seen:
            seen.add(y['name'])
            final.append(y)
    return final

# ── API ───────────────────────────────────────────────────────

class YogaRequest(BaseModel):
    kundli: dict

@router.post("/calculate")
async def calculate_yogas_endpoint(req: YogaRequest):
    yogas = calculate_yogas(req.kundli)
    raj   = [y for y in yogas if y['category'] in ['raj','panch_mahapurusha']]
    dhana = [y for y in yogas if y['category'] == 'dhana']
    dosha = [y for y in yogas if y['category'] == 'dosha']
    return {
        "total":       len(yogas),
        "raj_yogas":   raj,
        "dhana_yogas": dhana,
        "doshas":      dosha,
        "all":         yogas,
        "summary":     {"raj_count":len(raj),"dhana_count":len(dhana),"dosha_count":len(dosha)},
    }