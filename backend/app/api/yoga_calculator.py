# app/api/yoga_calculator.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import db

router = APIRouter(prefix="/yogas", tags=["Yoga Calculator"])

RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
          'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']

KENDRAS   = [1,4,7,10]
TRIKONAS  = [1,5,9]
DUSTHANAS = [6,8,12]

EXALTATION   = {'Sun':'Mesha','Moon':'Vrishabha','Mars':'Makara','Mercury':'Kanya',
                'Jupiter':'Karka','Venus':'Meena','Saturn':'Tula'}
DEBILITATION = {'Sun':'Tula','Moon':'Vrishchika','Mars':'Karka','Mercury':'Meena',
                'Jupiter':'Makara','Venus':'Kanya','Saturn':'Mesha'}
OWN_SIGNS    = {
    'Sun':['Simha'], 'Moon':['Karka'],
    'Mars':['Mesha','Vrishchika'], 'Mercury':['Mithuna','Kanya'],
    'Jupiter':['Dhanu','Meena'], 'Venus':['Vrishabha','Tula'],
    'Saturn':['Makara','Kumbha']
}

# House lordship for each lagna
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

# ── Core helpers ──────────────────────────────────────────────

def get_house(rashi_name: str, lagna: str) -> int:
    li = RASHIS.index(lagna)   if lagna      in RASHIS else 0
    ri = RASHIS.index(rashi_name) if rashi_name in RASHIS else 0
    return (ri - li) % 12 + 1

def build_hp(pp: dict, lagna: str) -> dict:
    """planet → house number"""
    return {p: get_house(d['rashi'], lagna) for p, d in pp.items() if 'rashi' in d}

def lords_of(house: int, lagna: str) -> list:
    result = []
    for planet, houses in LORDS.get(lagna, {}).items():
        if isinstance(houses, int):
            if houses == house: result.append(planet)
        else:
            if house in houses: result.append(planet)
    return result

def houses_of(planet: str, lagna: str) -> list:
    v = LORDS.get(lagna, {}).get(planet)
    if v is None: return []
    return [v] if isinstance(v, int) else v

def is_exalted(planet, rashi):  return EXALTATION.get(planet)   == rashi
def is_own(planet, rashi):      return rashi in OWN_SIGNS.get(planet, [])
def is_debilitated(planet, rashi): return DEBILITATION.get(planet) == rashi
def is_strong(planet, pp):
    rashi = pp.get(planet, {}).get('rashi','')
    return is_exalted(planet, rashi) or is_own(planet, rashi)
def is_weak(planet, pp):
    rashi = pp.get(planet, {}).get('rashi','')
    return is_debilitated(planet, rashi)

def conjunct(p1, p2, hp):
    """Same house"""
    return p1 in hp and p2 in hp and hp[p1] == hp[p2]

def aspects(p1, p2, hp):
    if p1 not in hp or p2 not in hp:
        return False

    h1 = hp[p1]
    h2 = hp[p2]

    # distance from p1 to p2 (0–11)
    diff = (h2 - h1) % 12

    # universal 7th aspect
    if diff == 6:
        return True

    # special aspects
    if p1 == 'Mars' and diff in [3, 7]:   # 4th & 8th
        return True
    if p1 == 'Jupiter' and diff in [4, 8]:  # 5th & 9th
        return True
    if p1 == 'Saturn' and diff in [2, 9]:  # 3rd & 10th
        return True

    return False

def related(p1, p2, hp):
    return (
        conjunct(p1, p2, hp) or
        aspects(p1, p2, hp) or
        aspects(p2, p1, hp)
    )

def in_kendra(planet, hp):    return hp.get(planet) in KENDRAS
def in_trikona(planet, hp):   return hp.get(planet) in TRIKONAS
def in_dusthana(planet, hp):  return hp.get(planet) in DUSTHANAS

# ── Individual yoga checks ────────────────────────────────────

def yoga(name, sanskrit, category, strength, planets, description, effects, remedies=None):
    return {"name":name,"sanskrit":sanskrit,"category":category,"strength":strength,
            "planets":planets,"description":description,"effects":effects,
            **({"remedies":remedies} if remedies else {})}

def check_panch_mahapurusha(pp, hp, lagna):
    results = []
    configs = {
        'Mars':    ('Ruchaka Yoga',  'रूचक योग',  'very_strong' if is_exalted('Mars',pp.get('Mars',{}).get('rashi','')) else 'strong',
                    "Mars in own sign or exaltation in a Kendra. The native has the power of a military commander — bold, physically powerful, courageous, and victorious. They achieve great status through courage and decisive action.",
                    ["Exceptional courage","Physical strength","Military/leadership success","Victory over enemies","Commanding personality"]),
        'Mercury': ('Bhadra Yoga',   'भद्र योग',   'very_strong' if is_exalted('Mercury',pp.get('Mercury',{}).get('rashi','')) else 'strong',
                    "Mercury in own sign or exaltation in a Kendra. The native is extraordinarily intelligent, eloquent, and skilled in commerce and communication. They achieve great success through intellect, writing, and analytical abilities.",
                    ["Exceptional intelligence","Eloquent speech","Business success","Analytical mastery","Literary talent"]),
        'Jupiter': ('Hamsa Yoga',    'हंस योग',    'very_strong' if is_exalted('Jupiter',pp.get('Jupiter',{}).get('rashi','')) else 'strong',
                    "Jupiter in own sign or exaltation in a Kendra. The native is deeply wise, spiritual, and respected. They are noble in character, blessed with fortune, and achieve great success through dharmic living and wisdom.",
                    ["Deep wisdom","Spiritual fortune","Noble character","Teacher/guru qualities","Respected in society"]),
        'Venus':   ('Malavya Yoga',  'मालव्य योग', 'very_strong' if is_exalted('Venus',pp.get('Venus',{}).get('rashi','')) else 'strong',
                    "Venus in own sign or exaltation in a Kendra. The native is beautiful, charming, artistic, and blessed with all comforts. They are naturally magnetic and enjoy luxury, beauty, and the finest things in life.",
                    ["Beauty and elegance","Artistic brilliance","Luxury and comfort","Magnetic personality","Blessed with pleasure"]),
        'Saturn':  ('Sasa Yoga',     'शश योग',     'very_strong' if is_exalted('Saturn',pp.get('Saturn',{}).get('rashi','')) else 'strong',
                    "Saturn in own sign or exaltation in a Kendra. The native rises to great authority and power through discipline, hard work, and patience. They become prominent figures in administration, mass organizations, or governance.",
                    ["Great authority","Administrative power","Disciplined success","Mass leadership","Lasting achievement"]),
    }
    for planet, (name, skt, strength, desc, effects) in configs.items():
        if planet not in pp: continue
        rashi = pp[planet].get('rashi','')
        house = hp.get(planet)
        if house in KENDRAS and (is_own(planet, rashi) or is_exalted(planet, rashi)):
            results.append(yoga(name, skt, 'panch_mahapurusha', strength, [planet], desc, effects))
    return results

def check_gajkeshari(pp, hp, lagna):
    if 'Jupiter' not in hp or 'Moon' not in hp: return None
    jh, mh = hp['Jupiter'], hp['Moon']
    diff = (jh - mh) % 12
    if diff in [0, 3, 6, 9]:
        strength = 'strong' if is_strong('Jupiter', pp) else 'medium'
        return yoga("Gaja Keshari Yoga","गजकेसरी योग","raj",strength,["Jupiter","Moon"],
            "Jupiter and Moon are in mutual Kendra from each other. One of the most celebrated Raj Yogas — the native is intelligent, wise, eloquent, and commands great respect. They leave a lasting impression on society through their wisdom and noble character.",
            ["Intelligence and wisdom","Fame and recognition","Noble character","Respected in society","Eloquent speech"])
    return None

def check_budha_aditya(pp, hp, lagna):
    if conjunct('Sun','Mercury',hp) and hp.get('Sun') not in DUSTHANAS:
        s = 'strong' if is_strong('Sun',pp) else 'medium'
        return yoga("Budha Aditya Yoga","बुधादित्य योग","raj",s,["Sun","Mercury"],
            "Sun and Mercury are conjunct. The native is sharp-minded, skilled in communication, and achieves great success in intellectual and governmental pursuits. Leadership and administrative success come naturally.",
            ["Sharp intellect","Excellent communication","Government/administrative success","Leadership ability","Respected by authority"])
    return None

def check_dharma_karmadhipati(pp, hp, lagna):
    for nl in lords_of(9, lagna):
        for tl in lords_of(10, lagna):
            if nl == tl: continue
            if nl not in hp or tl not in hp: continue
            if in_dusthana(nl, hp) and in_dusthana(tl, hp): continue
            if related(nl, tl, hp):
                s = 'very_strong' if (is_strong(nl,pp) or is_strong(tl,pp)) else 'strong'
                return yoga(
                    "Dharma Karmadhipati Raj Yoga","धर्म कर्माधिपति राजयोग","raj",s,[nl,tl],
                    f"The 9th lord ({nl}) and 10th lord ({tl}) are connected, forming this supreme Raj Yoga. This is one of the most powerful combinations for career success, fame, and dharmic achievement. The native rises to great heights and leaves a meaningful legacy.",
                    ["Outstanding career success","Fame and public recognition","Dharmic profession","Legacy achievement","Fortune through karma"])
    return None

def check_kendra_trikona(pp, hp, lagna):
    results = []
    seen = set()
    for kendra in [4,7,10]:
        for trikona in [5,9]:
            for kl in lords_of(kendra, lagna):
                for tl in lords_of(trikona, lagna):
                    if kl == tl: continue
                    if kl not in hp or tl not in hp: continue
                    if in_dusthana(kl, hp) or in_dusthana(tl, hp): continue
                    if related(kl, tl, hp):
                        key = tuple(sorted([kl,tl]))
                        if key in seen: continue
                        seen.add(key)
                        s = 'strong' if (is_strong(kl,pp) or is_strong(tl,pp)) else 'medium'
                        results.append(yoga(
                            f"Raj Yoga ({ORDINALS[kendra]}-{ORDINALS[trikona]} lords)",
                            "राजयोग","raj",s,[kl,tl],
                            f"The {ORDINALS[kendra]} lord ({kl}) and {ORDINALS[trikona]} lord ({tl}) are connected, forming a classic Kendra-Trikona Raj Yoga. This powerful combination gives authority, success, and prosperity. The native rises to positions of prominence and earns recognition.",
                            ["High social status","Authority and power","Career success","Recognition","Prosperity"]))
    return results[:4]

def check_vipreet_raj(pp, hp, lagna):
    results = []
    combos = [(6,8,"Harsha Yoga","हर्ष योग"),(6,12,"Harsha Yoga","हर्ष योग"),
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
                    f"The lord of the {ORDINALS[lord_house]} house ({lord}) is placed in another dusthana, forming {name}. Enemies, obstacles, and adversaries destroy themselves. The native triumphs over all opposition and rises powerfully after periods of difficulty.",
                    ["Victory over enemies","Rise after difficulties","Unexpected success","Resilience","Triumph over adversity"]))
    return results

def check_neech_bhanga(pp, hp, lagna):
    results = []
    for planet in ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']:
        if planet not in pp: continue
        rashi = pp[planet].get('rashi','')
        if not is_debilitated(planet, rashi): continue
        # Condition 1: Lord of debilitation sign in kendra from lagna or moon
        deb_rashi_lord = lords_of(RASHIS.index(rashi)+1, lagna)
        # Condition 2: Exaltation sign lord in kendra
        exalt_rashi = EXALTATION.get(planet,'')
        if not exalt_rashi: continue
        exalt_lords = lords_of(RASHIS.index(exalt_rashi)+1, lagna)
        cancellers = deb_rashi_lord + exalt_lords
        for cl in cancellers:
            if cl not in hp: continue
            if hp[cl] in KENDRAS:
                results.append(yoga(
                    f"Neech Bhanga Raj Yoga ({planet})","नीच भंग राजयोग","raj","strong",[planet,cl],
                    f"{planet} is debilitated but the cancellation is provided by {cl} in a Kendra, creating Neech Bhanga Raj Yoga. The debilitation transforms into power stronger than exaltation. The native rises powerfully after initial struggles and achieves remarkable success.",
                    ["Rise from difficulties","Stronger than exaltation","Exceptional achievement","Overcoming adversity","Late but lasting success"]))
                break
    return results

def check_gajkeshari_extended(pp, hp, lagna):
    """Jupiter aspecting Moon even if not mutual kendra"""
    if aspects('Jupiter','Moon',hp) and not related('Jupiter','Moon',hp):
        # Already caught in check_gajkeshari if in kendra
        pass
    return None

def check_amala(pp, hp, lagna):
    benefics = ['Jupiter','Venus','Mercury']
    tenth = [p for p,h in hp.items() if h==10 and p not in ['Rahu','Ketu']]
    if tenth and all(p in benefics for p in tenth):
        return yoga("Amala Yoga","अमल योग","raj","medium",tenth,
            "Only benefic planets occupy the 10th house. The native achieves lasting fame through virtuous and righteous deeds. Their professional reputation is spotless and they are remembered long after their time for noble contributions.",
            ["Spotless reputation","Fame through virtue","Righteous profession","Lasting legacy","Noble character"])
    return None

def check_chandra_mangala(pp, hp, lagna):
    if related('Moon','Mars',hp):
        return yoga("Chandra Mangala Yoga","चन्द्र मंगल योग","dhana","medium",["Moon","Mars"],
            "Moon and Mars are conjunct or aspecting each other. The native earns significant wealth through courage, emotional intelligence, and bold action. They have the drive to take calculated risks and the instinct to know when to act decisively.",
            ["Wealth through courage","Emotional strength","Bold decision-making","Business acumen","Physical vitality"])
    return None

def check_lakshmi(pp, hp, lagna):
    if not is_strong('Venus', pp): return None
    vh = hp.get('Venus')
    if vh not in KENDRAS + TRIKONAS: return None
    for nl in lords_of(9, lagna):
        nh = hp.get(nl)
        if nh and nh in KENDRAS + TRIKONAS:
            return yoga("Lakshmi Yoga","लक्ष्मी योग","dhana","strong",["Venus",nl],
                "Venus is strong and the 9th lord is well-placed, forming Lakshmi Yoga. The native is blessed with abundant wealth, beauty, and divine grace. Goddess Lakshmi's blessings flow continuously and the native lives in abundance throughout life.",
                ["Abundant wealth","Beauty and elegance","Luxurious lifestyle","Divine grace","Comfort and happiness"])
    return None

def check_dhana_yogas(pp, hp, lagna):
    results = []
    # 2nd lord + 11th lord related
    for sl in lords_of(2, lagna):
        for el in lords_of(11, lagna):
            if sl == el: continue
            if sl not in hp or el not in hp: continue
            if related(sl, el, hp):
                results.append(yoga("Dhana Yoga (2-11)","धन योग","dhana","medium",[sl,el],
                    f"The 2nd lord ({sl}) and 11th lord ({el}) are connected, forming Dhana Yoga. Both houses of wealth are linked, indicating significant accumulation of money, assets, and fulfillment of material desires.",
                    ["Wealth accumulation","Multiple income streams","Financial stability","Fulfilled desires","Prosperous life"]))
    # 5th lord + 9th lord (Poorva Punya + Bhagya)
    for fl in lords_of(5, lagna):
        for nl in lords_of(9, lagna):
            if fl == nl: continue
            if fl not in hp or nl not in hp: continue
            if related(fl, nl, hp):
                results.append(yoga("Dhana Yoga (5-9)","धन योग","dhana","strong",[fl,nl],
                    f"The 5th lord ({fl}) and 9th lord ({nl}) are connected. Past life merit (5th) aligns with fortune (9th), creating great wealth through intelligence, speculation, and fortunate circumstances.",
                    ["Fortune through merit","Speculative gains","Fortunate investments","Past life blessings","Prosperity through wisdom"]))
    # Jupiter aspecting 2nd house
    j_h = hp.get('Jupiter')
    if j_h:
        aspected_houses = [j_h, (j_h+4)%12 or 12, (j_h+6)%12 or 12, (j_h+8)%12 or 12]
        if 2 in aspected_houses:
            results.append(yoga("Jupiter Aspects 2nd House","गुरु धन दृष्टि","dhana","medium",["Jupiter"],
                "Jupiter aspects the 2nd house of wealth, blessing it with abundance. The native earns through wisdom, teaching, and noble means. Family wealth grows steadily and speech is respected.",
                ["Blessed wealth","Wisdom-based income","Family prosperity","Respected speech","Growing assets"]))
    return results[:3]

def check_mangal_dosha(pp, hp, lagna):
    mh = hp.get('Mars')
    if mh in [1,2,4,7,8,12]:
        severity = "high" if mh in [7,8] else "medium" if mh in [1,4,12] else "low"
        house_meanings = {1:"1st house (self)",2:"2nd house (family)",4:"4th house (home)",
                         7:"7th house (marriage)",8:"8th house (longevity)",12:"12th house (bed pleasures)"}
        return yoga("Mangal Dosha","मंगल दोष","dosha",severity,["Mars"],
            f"Mars is placed in the {house_meanings.get(mh,str(mh)+'th house')}, creating Mangal Dosha. This can cause delays in marriage, conflicts in marital life, and aggressive energy in relationships. Matching with another Manglik native significantly reduces the effects. However, it also gives tremendous courage, drive, and the power to overcome all obstacles.",
            ["Delays in marriage","Marital tensions possible","Strong willpower","Courage and boldness","Need Manglik matching"],
            ["Marry a Manglik partner","Kumbh Vivah remedy before marriage","Tuesday fasts","Recite Hanuman Chalisa daily","Donate red items on Tuesdays","Offer sindoor to Hanuman"])
    return None

def check_kaal_sarp(pp, hp, lagna):
    rh = hp.get('Rahu')
    kh = hp.get('Ketu')
    if not rh or not kh: return None
    check_planets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
    phs = [hp[p] for p in check_planets if p in hp]
    if not phs: return None
    # Build arc from Rahu to Ketu going forward
    arc = []
    h = rh % 12 + 1
    while h != kh:
        arc.append(h)
        h = h % 12 + 1
    if all(ph in arc or ph == rh for ph in phs):
        return yoga("Kaal Sarp Dosha","काल सर्प दोष","dosha","high",["Rahu","Ketu"],
            "All planets are hemmed between Rahu and Ketu, forming Kaal Sarp Dosha. The native faces obstacles, delays, and karmic struggles in various life areas. However, many great leaders, saints, and achievers have this yoga — it creates intense focus and the potential for extraordinary achievement after overcoming initial hurdles.",
            ["Obstacles and delays","Intense karmic journey","Spiritual inclination","Eventual great achievement","Need for remedies"],
            ["Kaal Sarp Puja at Trimbakeshwar","Nag Panchami worship","Recite Mahamrityunjaya mantra","Feed snakes milk on Nag Panchami","Visit Ujjain for remedy","Wear Nag devata silver pendant"])
    return None

def check_pitru_dosha(pp, hp, lagna):
    sh  = hp.get('Sun')
    rh  = hp.get('Rahu')
    kh  = hp.get('Ketu')
    sath= hp.get('Saturn')
    if sh == 9 and (rh==9 or kh==9 or sath==9):
        return yoga("Pitru Dosha","पितृ दोष","dosha","medium",["Sun"],
            "The Sun in the 9th house is afflicted by a malefic planet, indicating ancestral karmic debt. The native may face obstacles from unexpected sources. Performing ancestral rites (Shraddha) and pind daan brings ancestral blessings and relief.",
            ["Ancestral karma","Obstacles from unseen sources","Father-related challenges","Need for ancestral rites","Spiritual debts"],
            ["Perform Shraddha on Amavasya","Feed crows on Amavasya","Pind Daan at Gaya","Donate on Saturdays","Recite Pitru Stotra","Offer water to ancestors"])
    # Also check Sun conjunct Rahu/Ketu (Grahan Dosha)
    if sh and (sh == rh or sh == kh):
        return yoga("Surya Grahan Dosha","सूर्य ग्रहण दोष","dosha","medium",["Sun","Rahu" if sh==rh else "Ketu"],
            "Sun is conjunct with Rahu or Ketu forming Surya Grahan Dosha. This creates obstacles related to father, authority figures, career recognition, and vitality. The native must consciously build confidence and self-identity.",
            ["Father-related challenges","Career obstacles","Authority issues","Health vigilance","Identity confusion"],
            ["Recite Aditya Hridayam","Offer water to Sun daily","Donate copper/wheat on Sundays","Strengthen Sun with Ruby gemstone","Avoid conflicts with authority figures"])
    return None

def check_guru_chandal(pp, hp, lagna):
    jh = hp.get('Jupiter')
    rh = hp.get('Rahu')
    kh = hp.get('Ketu')
    if jh and (jh == rh or jh == kh):
        node = 'Rahu' if jh == rh else 'Ketu'
        return yoga("Guru Chandal Yoga","गुरु चाण्डाल योग","dosha","medium",["Jupiter",node],
            f"Jupiter is conjunct with {node} forming Guru Chandal Yoga. The native's wisdom is coloured by unconventional, rebellious, or foreign influences. While this can confuse ethics or spiritual values, it also gives extraordinary unconventional intelligence and the ability to think outside established boundaries.",
            ["Unconventional wisdom","Rebellious intellect","Foreign connections","Moral questioning","Unique philosophical path"],
            ["Recite Guru Beej Mantra (Om Graam Greem Graum Sah Gurave Namah)","Worship Lord Vishnu on Thursdays","Donate yellow items","Offer turmeric to Shivling","Fast on Thursdays"])
    return None

def check_kemadrum(pp, hp, lagna):
    mh = hp.get('Moon')
    if not mh: return None
    prev_h = (mh-2)%12+1
    next_h = mh%12+1
    check_p = ['Sun','Mars','Mercury','Jupiter','Venus','Saturn']
    adjacent = [p for p in check_p if hp.get(p) in [prev_h, next_h, mh]]
    # Also check if Moon is aspected by any benefic
    benefics = ['Jupiter','Venus','Mercury']
    aspected_by_benefic = any(aspects(b, 'Moon', hp) for b in benefics if b in hp)
    if not adjacent and not aspected_by_benefic:
        return yoga("Kemadrum Dosha","केमद्रुम दोष","dosha","medium",["Moon"],
            "The Moon has no planets in adjacent houses and no benefic aspect, creating Kemadrum Dosha. The mind may feel emotionally isolated, unsupported, or prone to instability. Financial fluctuations and lack of support from others may be felt at various life stages.",
            ["Emotional isolation","Mental instability","Financial fluctuations","Lack of support","Need for inner strength"],
            ["Strengthen Moon — wear Pearl (Moti)","Monday fasts","Offer water and milk to Shivling","Recite Chandra mantra (Om Shraam Shreem Shraum Sah Chandraya Namah)","Feed white foods (rice, milk) to poor","Keep fast on Mondays"])
    return None

def check_shakat(pp, hp, lagna):
    mh = hp.get('Moon')
    jh = hp.get('Jupiter')
    if mh and jh:
        diff = (mh - jh) % 12
        if diff in [5, 7]:  # 6th or 8th from Jupiter
            return yoga("Shakat Yoga","शकट योग","dosha","medium",["Moon","Jupiter"],
                "Moon and Jupiter are in the 6th/8th axis forming Shakat Yoga. The native's fortune fluctuates like a wheel — periods of great success alternate with setbacks. However, they always recover and fortune stabilizes in the latter half of life.",
                ["Fluctuating fortune","Ups and downs in life","Wheel of fortune effect","Recovery ability","Eventual stability"],
                ["Worship Vishnu on Thursdays","Offer yellow flowers to Vishnu","Recite Vishnu Sahasranama","Donate yellow items on Thursdays","Keep fast on Thursdays"])
    return None

def check_grahan_yoga(pp, hp, lagna):
    """Moon conjunct Rahu or Ketu"""
    mh = hp.get('Moon')
    rh = hp.get('Rahu')
    kh = hp.get('Ketu')
    if mh and (mh == rh or mh == kh):
        node = 'Rahu' if mh == rh else 'Ketu'
        return yoga("Chandra Grahan Dosha","चन्द्र ग्रहण दोष","dosha","medium",["Moon",node],
            f"Moon is conjunct with {node} creating Chandra Grahan Dosha. The mind is restless, emotionally unpredictable, and prone to unusual fears or obsessions. Confusion in thinking and relationship instability may arise. Spiritual practices greatly help stabilize the mind.",
            ["Emotional restlessness","Mental confusion","Relationship instability","Unusual fears","Spiritual sensitivity"],
            ["Recite Chandra mantra","Offer milk to Shivling on Mondays","Wear Pearl (consult astrologer first)","Practice meditation and mindfulness","Avoid negative thinking and company"])
    return None

def check_sakata(pp, hp, lagna):
    """Moon in 6, 8, or 12 from Jupiter"""
    jh = hp.get('Jupiter')
    mh = hp.get('Moon')
    if jh and mh:
        diff = (mh - jh) % 12 + 1
        if diff in [6, 8, 12]:
            return yoga("Sakata Yoga","साकट योग","dosha","low",["Moon","Jupiter"],
                "Moon is in the 6th, 8th, or 12th from Jupiter creating Sakata Yoga. Good fortune may come and go. The native overcomes difficulties through persistence and divine grace eventually prevails.",
                ["Variable fortune","Overcoming obstacles","Need for persistence","Divine intervention","Late success"],
                ["Worship Jupiter (Guru)","Offer yellow flowers on Thursdays","Keep Thursdays sacred","Recite Guru Stotram"])
    return None

# ── Main calculation ──────────────────────────────────────────

def calculate_yogas(kundli: dict) -> list:
    lagna = kundli.get('lagna', {}).get('name', 'Mesha')
    pp    = kundli.get('planetary_positions', {})

    if not pp or lagna not in RASHIS:
        return []

    hp = build_hp(pp, lagna)

    all_yogas = []

    # Panch Mahapurusha — checked first
    all_yogas.extend(check_panch_mahapurusha(pp, hp, lagna))

    # Raj Yogas
    for fn in [check_gajkeshari, check_budha_aditya, check_dharma_karmadhipati, check_amala]:
        r = fn(pp, hp, lagna)
        if r: all_yogas.append(r)
    all_yogas.extend(check_kendra_trikona(pp, hp, lagna))
    all_yogas.extend(check_vipreet_raj(pp, hp, lagna))
    all_yogas.extend(check_neech_bhanga(pp, hp, lagna))

    # Dhana Yogas
    for fn in [check_lakshmi, check_chandra_mangala]:
        r = fn(pp, hp, lagna)
        if r: all_yogas.append(r)
    all_yogas.extend(check_dhana_yogas(pp, hp, lagna))

    # Doshas
    for fn in [check_mangal_dosha, check_kaal_sarp, check_pitru_dosha,
               check_guru_chandal, check_kemadrum, check_shakat,
               check_grahan_yoga, check_sakata]:
        r = fn(pp, hp, lagna)
        if r: all_yogas.append(r)

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