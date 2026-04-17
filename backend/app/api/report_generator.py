# app/api/report_generator.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.core import database as _db_module
from app.core.config import settings
import asyncio, httpx, io
from datetime import datetime

def get_db():
    """Lazy db getter — always uses current connection"""
    return _db_module.db

router = APIRouter(prefix="/report", tags=["Report"])

RASHIS_SA = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
             'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']
RASHIS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
             'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
ORDINALS  = {1:'1st',2:'2nd',3:'3rd',4:'4th',5:'5th',6:'6th',
             7:'7th',8:'8th',9:'9th',10:'10th',11:'11th',12:'12th'}

PLANET_LORDS_MAP = {
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

HOUSE_THEMES = {
    1:'Self & Personality',2:'Wealth & Family',3:'Courage & Siblings',
    4:'Home & Mother',5:'Intelligence & Children',6:'Health & Enemies',
    7:'Marriage & Partnerships',8:'Longevity & Occult',9:'Luck & Dharma',
    10:'Career & Status',11:'Gains & Aspirations',12:'Spirituality & Liberation',
}

# Plain English section titles for non-astrologers
SECTION_PLAIN_TITLES = {
    '1st House — Self & Personality': 'Who You Are at Your Core',
    '2nd House — Wealth & Family':    'Your Money & Family Life',
    '4th House — Home & Mother':      'Your Home, Roots & Inner Peace',
    '5th House — Intelligence & Children': 'Your Mind, Creativity & Children',
    '7th House — Marriage & Partnerships': 'Love, Marriage & Partnerships',
    '9th House — Luck & Dharma':      'Your Luck, Purpose & Spirituality',
    '10th House — Career & Public Status': 'Your Career & Life Achievement',
    '11th House — Gains & Network':   'Your Wealth Goals & Social Circle',
    'Sun — Soul & Vitality':          'Your Inner Power & Leadership',
    'Moon — Mind & Emotions':         'Your Emotional World & Instincts',
    'Jupiter — Wisdom & Blessings':   'Where Life Blesses You Most',
    'Saturn — Karma & Discipline':    'Your Life Lessons & Hidden Strength',
    # Marriage report
    '7th House — Spouse & Marriage':  'Your Future Spouse & Marriage',
    'Venus — Love & Romance':         'How You Love & Are Loved',
    '2nd House — Family Life':        'Family Life After Marriage',
    '5th House — Romance & Children': 'Romance, Passion & Children',
    '8th House — Deep Intimacy':      'Deep Bonds & Transformation',
    'Moon — Emotional Patterns':      'Your Emotional Needs in Love',
    'Jupiter — Marriage Blessings':   'Blessings in Your Marriage',
    'Mars — Energy & Passion':        'Passion, Drive & Conflict',
    # Career report
    '10th House — Profession & Status': 'Your Career Calling',
    '6th House — Work & Service':       'Your Work Environment',
    '2nd House — Income & Speech':      'How You Earn & Communicate',
    '11th House — Gains & Ambitions':   'Your Ambitions & Gains',
    'Saturn — Discipline & Hard Work':  'What Makes You Unstoppable',
    'Sun — Authority & Recognition':    'Leadership & Recognition',
    'Mercury — Business & Communication': 'Your Business Mind',
    'Jupiter — Wisdom & Expansion':    'Career Growth & Expansion',
}

SECTION_ICONS = {
    '1st House': '☀', '2nd House': '💰', '4th House': '🏠', '5th House': '🎨',
    '7th House': '💑', '9th House': '🌟', '10th House': '🏆', '11th House': '🌐',
    'Sun': '☀', 'Moon': '🌙', 'Jupiter': '⚡', 'Saturn': '⏳',
    'Venus': '💖', 'Mars': '🔥', 'Mercury': '💬', '6th House': '⚔', '8th House': '🔮',
}

class ReportRequest(BaseModel):
    kundli:      dict
    lagna:       str
    person_name: Optional[str] = 'Native'
    birth_date:  Optional[str] = ''
    birth_time:  Optional[str] = ''
    birth_place: Optional[str] = ''
    report_type: Optional[str] = 'full_life'

def get_planet_house(planet_name, pp, lagna_idx):
    pdata = pp.get(planet_name, {})
    rashi = pdata.get('rashi', '')
    if rashi not in RASHIS_SA:
        return None, None, None
    ri    = RASHIS_SA.index(rashi)
    house = (ri - lagna_idx) % 12 + 1
    return house, rashi, pdata.get('rashi_en', RASHIS_EN[ri])

def get_lord_of_house(house_num, lagna, lords_map):
    for planet, owned in lords_map.items():
        if isinstance(owned, int):
            if owned == house_num: return planet
        elif isinstance(owned, list):
            if house_num in owned: return planet
    return None

async def ai_text(prompt, key):
    if not key or not key.startswith('sk-'):
        return None
    try:
        async with httpx.AsyncClient() as c:
            r = await c.post("https://api.openai.com/v1/chat/completions",
                headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},
                json={"model":"gpt-4o-mini","messages":[
                    {"role":"system","content":(
                        "You are an expert Vedic astrologer writing a personalized report for someone "
                        "who knows nothing about astrology. Write 2 flowing paragraphs (no bullet points, "
                        "no jargon like 'lord', 'house', 'lagna', 'dasha'). Speak directly to the person "
                        "using 'you' and 'your'. Make it warm, insightful and practical — like a wise friend "
                        "giving life advice based on their birth chart."
                    )},
                    {"role":"user","content":prompt}
                ],"max_tokens":400,"temperature":0.7},
                timeout=20.0)
            return r.json()["choices"][0]["message"]["content"]
    except: return None

async def fetch_section_knowledge(sdef, pp, lagna, lagna_idx, lords_map):
    db_knowledge = []
    houses_info  = []

    if 'houses' in sdef:
        for h in sdef['houses']:
            ri       = (lagna_idx + h - 1) % 12
            rashi    = RASHIS_SA[ri]
            rashi_en = RASHIS_EN[ri]
            house_planets = []
            for pname, pdata in pp.items():
                pr = pdata.get('rashi', '')
                if pr in RASHIS_SA:
                    ph = (RASHIS_SA.index(pr) - lagna_idx) % 12 + 1
                    if ph == h:
                        house_planets.append(pname)
            lord = get_lord_of_house(h, lagna, lords_map)
            houses_info.append({'house':h,'rashi':rashi,'rashi_en':rashi_en,'lord':lord or '','planets':house_planets})
            for pname in house_planets:
                pdata = pp.get(pname, {})
                d = await get_db().planet_house_knowledge.find_one({"planet":pname,"house":h,"lagna":lagna})
                if not d: d = await get_db().planet_house_knowledge.find_one({"planet":pname,"house":h,"lagna":None})
                if d and d.get('text'):
                    db_knowledge.append({'type':'planet_house','title':f"{pname} in House {h}",'text':d['text']})
                d2 = await get_db().planet_sign_knowledge.find_one({"planet":pname,"rashi":pdata.get('rashi','')})
                if d2 and d2.get('text'):
                    db_knowledge.append({'type':'planet_sign','title':f"{pname} in {pdata.get('rashi_en','')}",'text':d2['text']})
            if lord:
                lord_actual_house, _, _ = get_planet_house(lord, pp, lagna_idx)
                if lord_actual_house:
                    owned = lords_map.get(lord, [])
                    if isinstance(owned, int): owned = [owned]
                    for oh in owned:
                        d3 = await get_db().lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":lord_actual_house,"lagna":lagna})
                        if not d3: d3 = await get_db().lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":lord_actual_house,"lagna":None})
                        if d3 and d3.get('text'):
                            db_knowledge.append({'type':'lord_house','title':f"{ORDINALS[oh]} Lord ({lord}) in House {lord_actual_house}",'text':d3['text']})

    if 'planets' in sdef:
        for pname in sdef['planets']:
            actual_house, rashi, rashi_en = get_planet_house(pname, pp, lagna_idx)
            if not actual_house: continue
            pdata = pp.get(pname, {})
            d = await get_db().planet_house_knowledge.find_one({"planet":pname,"house":actual_house,"lagna":lagna})
            if not d: d = await get_db().planet_house_knowledge.find_one({"planet":pname,"house":actual_house,"lagna":None})
            if d and d.get('text'):
                db_knowledge.append({'type':'planet_house','title':f"{pname} in House {actual_house}",'text':d['text']})
            d2 = await get_db().planet_sign_knowledge.find_one({"planet":pname,"rashi":rashi})
            if d2 and d2.get('text'):
                db_knowledge.append({'type':'planet_sign','title':f"{pname} in {rashi_en}",'text':d2['text']})
            owned = lords_map.get(pname, [])
            if isinstance(owned, int): owned = [owned]
            for oh in (owned or []):
                d3 = await get_db().lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":actual_house,"lagna":lagna})
                if not d3: d3 = await get_db().lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":actual_house,"lagna":None})
                if d3 and d3.get('text'):
                    db_knowledge.append({'type':'lord_house','title':f"{ORDINALS[oh]} Lord ({pname}) in House {actual_house}",'text':d3['text']})

    return db_knowledge, houses_info

def get_section_defs(report_type):
    if report_type == 'marriage':
        return [
            {'name':'7th House — Spouse & Marriage','description':'Characteristics of spouse, timing and nature of marriage','houses':[7]},
            {'name':'Venus — Love & Romance','description':'Venus placement and its effect on love and relationships','planets':['Venus']},
            {'name':'2nd House — Family Life','description':'Family happiness and domestic environment after marriage','houses':[2]},
            {'name':'5th House — Romance & Children','description':'Love affairs, romantic inclinations and children','houses':[5]},
            {'name':'8th House — Deep Intimacy','description':'Transformation and deep bonding through relationships','houses':[8]},
            {'name':'Moon — Emotional Patterns','description':'Emotional needs and patterns in all relationships','planets':['Moon']},
            {'name':'Jupiter — Marriage Blessings','description':'Jupiter\'s role in marriage luck and family expansion','planets':['Jupiter']},
            {'name':'Mars — Energy & Passion','description':'Mars influence on passion, drive and conflict in relationships','planets':['Mars']},
        ]
    elif report_type == 'career':
        return [
            {'name':'10th House — Profession & Status','description':'Career, vocation, public image and professional achievements','houses':[10]},
            {'name':'6th House — Work & Service','description':'Daily work environment, colleagues and competition','houses':[6]},
            {'name':'2nd House — Income & Speech','description':'Primary income sources, financial speech and accumulated wealth','houses':[2]},
            {'name':'11th House — Gains & Ambitions','description':'Professional gains, networking and fulfillment of ambitions','houses':[11]},
            {'name':'Saturn — Discipline & Hard Work','description':'Saturn\'s influence on career, obstacles and lasting achievements','planets':['Saturn']},
            {'name':'Sun — Authority & Recognition','description':'Leadership potential and government/authority connections','planets':['Sun']},
            {'name':'Mercury — Business & Communication','description':'Communication skills, business acumen and analytical work','planets':['Mercury']},
            {'name':'Jupiter — Wisdom & Expansion','description':'Higher education, teaching, consulting and career expansion','planets':['Jupiter']},
        ]
    else:
        return [
            {'name':'1st House — Self & Personality','description':'Overall personality, physical body, health and life approach','houses':[1]},
            {'name':'2nd House — Wealth & Family','description':'Finances, family relations, speech and accumulated assets','houses':[2]},
            {'name':'4th House — Home & Mother','description':'Home life, property, vehicles, mother and inner happiness','houses':[4]},
            {'name':'5th House — Intelligence & Children','description':'Education, intelligence, children, past life merit and creativity','houses':[5]},
            {'name':'7th House — Marriage & Partnerships','description':'Spouse, business partnerships and all one-on-one relationships','houses':[7]},
            {'name':'9th House — Luck & Dharma','description':'Fortune, father, higher education, religion and spirituality','houses':[9]},
            {'name':'10th House — Career & Public Status','description':'Profession, public life, achievements and government connections','houses':[10]},
            {'name':'11th House — Gains & Network','description':'Income, fulfillment of desires and social connections','houses':[11]},
            {'name':'Sun — Soul & Vitality','description':'Vitality, father, ego and leadership potential','planets':['Sun']},
            {'name':'Moon — Mind & Emotions','description':'Mental patterns, mother, public life and emotional intelligence','planets':['Moon']},
            {'name':'Jupiter — Wisdom & Blessings','description':'Fortune, children, higher wisdom, expansion and divine grace','planets':['Jupiter']},
            {'name':'Saturn — Karma & Discipline','description':'Karmic lessons, hard work, longevity and life obstacles','planets':['Saturn']},
        ]

# ─────────────────────────────────────────────
# Extract remedies from knowledge text
# ─────────────────────────────────────────────
def extract_remedy(text):
    """Pull remedy sentences out of knowledge text."""
    import re
    lines = text.replace('\n', ' ').split('.')
    remedies = []
    keywords = ['remedy', 'remedies', 'worship', 'donate', 'chant', 'feed', 'mantra', 'avoid', 'temple', 'prayer']
    for line in lines:
        if any(kw in line.lower() for kw in keywords):
            cleaned = line.strip()
            if len(cleaned) > 15:
                remedies.append(cleaned)
    return remedies[:3]  # max 3 per entry

# ─────────────────────────────────────────────
# preview-status endpoint (unchanged logic)
# ─────────────────────────────────────────────
@router.post("/preview-status")
async def report_preview(req: ReportRequest):
    kundli    = req.kundli
    lagna     = req.lagna
    lagna_idx = RASHIS_SA.index(lagna) if lagna in RASHIS_SA else 0
    lords_map = PLANET_LORDS_MAP.get(lagna, {})
    pp        = kundli.get('planetary_positions', {})
    nakshatra = kundli.get('nakshatra',{}).get('name','') if isinstance(kundli.get('nakshatra'),dict) else ''
    moon_data = pp.get('Moon', {})
    moon_rashi= moon_data.get('rashi_en', moon_data.get('rashi', ''))

    section_defs = get_section_defs(req.report_type or 'full_life')
    tasks   = [fetch_section_knowledge(s, pp, lagna, lagna_idx, lords_map) for s in section_defs]
    results = await asyncio.gather(*tasks)

    total_db = 0
    sections = []
    ai_tasks = []

    for sdef, (db_knowledge, houses_info) in zip(section_defs, results):
        total_db += len(db_knowledge)
        db_text   = '\n'.join([f"{k['title']}: {k['text'][:200]}" for k in db_knowledge[:4]])
        prompt    = (f"Vedic astrology report section: {sdef['name']}. {sdef['description']}. "
                     f"{lagna} Lagna. {req.person_name}. Context: {db_text}")
        ai_tasks.append(ai_text(prompt, settings.OPENAI_API_KEY))
        sections.append({'sdef':sdef,'db_knowledge':db_knowledge,'houses_info':houses_info})

    ai_results = await asyncio.gather(*ai_tasks, return_exceptions=True)

    sections_out = []
    for sec, ai_r in zip(sections, ai_results):
        sections_out.append({
            'name':        sec['sdef']['name'],
            'description': sec['sdef']['description'],
            'houses':      sec['houses_info'],
            'db_knowledge':sec['db_knowledge'],
            'db_count':    len(sec['db_knowledge']),
            'ai_insight':  str(ai_r) if ai_r and not isinstance(ai_r, Exception) else None,
        })

    base_knowledge = []
    r = await get_db().rashi_knowledge.find_one({"rashi": lagna})
    if r and r.get('text'): base_knowledge.append({'type':'rashi','title':f"Lagna: {lagna}",'text':r['text']})
    n = await get_db().nakshatra_knowledge.find_one({"nakshatra": nakshatra})
    if n and n.get('text'): base_knowledge.append({'type':'nakshatra','title':f"Nakshatra: {nakshatra}",'text':n['text']})

    return {
        'ready':           True,
        'person_name':     req.person_name,
        'lagna':           lagna,
        'moon_rashi':      moon_rashi,
        'nakshatra':       nakshatra,
        'birth_date':      req.birth_date,
        'birth_time':      req.birth_time,
        'birth_place':     req.birth_place,
        'report_type':     req.report_type,
        'total_db_entries':total_db,
        'total_sections':  len(sections_out),
        'sections':        sections_out,
        'base_knowledge':  base_knowledge,
        'estimated_pages': max(15, min(40, 5 + total_db * 2)),
    }


# ─────────────────────────────────────────────
# GENERATE PDF — completely redesigned
# ─────────────────────────────────────────────
@router.post("/generate")
async def generate_pdf(req: ReportRequest):
    try:
        import traceback
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm
        from reportlab.lib.colors import HexColor, white, black
        from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
            PageBreak, Table, TableStyle, HRFlowable, KeepTogether)
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
        from reportlab.pdfgen import canvas as rl_canvas

        report_data = await report_preview(req)
        buf  = io.BytesIO()
        W, H = A4

        # ── Colour palette ──────────────────────────────────────
        C_DEEP      = HexColor('#0d0820')   # near-black bg
        C_PURPLE    = HexColor('#7c3aed')   # primary accent
        C_PURPLE_LT = HexColor('#a78bfa')   # light purple
        C_PURPLE_XL = HexColor('#ede9fe')   # very light purple tint
        C_GOLD      = HexColor('#f59e0b')   # gold accent
        C_GOLD_LT   = HexColor('#fef3c7')   # light gold tint
        C_TEAL      = HexColor('#0f766e')   # teal accent
        C_TEAL_LT   = HexColor('#ccfbf1')   # light teal
        C_ROSE      = HexColor('#be185d')   # rose accent
        C_ROSE_LT   = HexColor('#fce7f3')   # light rose
        C_SLATE     = HexColor('#475569')
        C_SLATE_LT  = HexColor('#f1f5f9')
        C_TEXT      = HexColor('#1e1b4b')   # dark text
        C_MUTED     = HexColor('#64748b')
        C_WHITE     = white
        C_GREEN     = HexColor('#065f46')
        C_GREEN_LT  = HexColor('#d1fae5')
        C_AMBER     = HexColor('#92400e')
        C_AMBER_LT  = HexColor('#fef3c7')
        C_BLUE      = HexColor('#1e40af')
        C_BLUE_LT   = HexColor('#dbeafe')

        # Section accent colours cycling
        SEC_COLORS = [
            (C_PURPLE, C_PURPLE_XL, HexColor('#7c3aed')),
            (C_TEAL,   C_TEAL_LT,   HexColor('#0f766e')),
            (C_ROSE,   C_ROSE_LT,   HexColor('#be185d')),
            (HexColor('#1d4ed8'), C_BLUE_LT,  HexColor('#1d4ed8')),
            (HexColor('#b45309'), C_AMBER_LT, HexColor('#b45309')),
            (HexColor('#7e22ce'), HexColor('#f3e8ff'), HexColor('#7e22ce')),
            (C_TEAL,   C_TEAL_LT,   HexColor('#0f766e')),
            (C_ROSE,   C_ROSE_LT,   HexColor('#be185d')),
            (C_PURPLE, C_PURPLE_XL, HexColor('#7c3aed')),
            (HexColor('#1d4ed8'), C_BLUE_LT,  HexColor('#1d4ed8')),
            (HexColor('#065f46'), C_GREEN_LT, HexColor('#065f46')),
            (HexColor('#c2410c'), HexColor('#ffedd5'), HexColor('#c2410c')),
        ]

        lagna_idx = RASHIS_SA.index(req.lagna) if req.lagna in RASHIS_SA else 0

        # ── Text styles ─────────────────────────────────────────
        def S(name, **kw):
            defaults = dict(fontName='Helvetica', fontSize=10, leading=15,
                            textColor=C_TEXT, spaceAfter=4)
            defaults.update(kw)
            return ParagraphStyle(name, **defaults)

        sBody    = S('body',   fontSize=10, leading=16, alignment=TA_JUSTIFY, spaceAfter=8)
        sBodySm  = S('bodysm', fontSize=9,  leading=14, alignment=TA_JUSTIFY, spaceAfter=6, textColor=C_SLATE)
        sLabel   = S('label',  fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=C_MUTED)
        sCaption = S('cap',    fontSize=8,  leading=11, textColor=C_MUTED, alignment=TA_CENTER)
        sItalic  = S('ital',   fontName='Helvetica-Oblique', fontSize=10, leading=16,
                     textColor=C_MUTED, alignment=TA_JUSTIFY)
        sPlain   = S('plain',  fontSize=10, leading=15)
        sWhite   = S('wh',     fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=C_WHITE)
        sWhiteSm = S('whsm',   fontSize=9, leading=13, textColor=HexColor('#e2e8f0'))
        sBig     = S('big',    fontName='Helvetica-Bold', fontSize=14, leading=20,
                     textColor=C_PURPLE, spaceBefore=6, spaceAfter=4)
        sMed     = S('med',    fontName='Helvetica-Bold', fontSize=11, leading=16,
                     textColor=C_TEXT, spaceBefore=4, spaceAfter=3)
        sTag     = S('tag',    fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=C_WHITE)
        sTakeaway= S('take',   fontName='Helvetica-Bold', fontSize=10, leading=15,
                     textColor=C_GREEN, spaceBefore=2)

        # ── Header / footer callbacks ────────────────────────────
        def first_page(c, doc):
            c.saveState()
            # Deep space background
            c.setFillColor(C_DEEP)
            c.rect(0, 0, W, H, fill=1, stroke=0)

            # Subtle gradient bands
            for i, alpha in enumerate([0.04, 0.03, 0.02]):
                c.setFillColorRGB(0.48, 0.23, 0.93, alpha=alpha)
                c.rect(0, H * (0.25 * i), W, H * 0.3, fill=1, stroke=0)

            # Stars
            import random; random.seed(42)
            c.setFillColor(C_WHITE)
            for _ in range(120):
                x, y = random.uniform(0, W), random.uniform(0, H)
                r = random.uniform(0.3, 1.8)
                c.setFillColorRGB(1, 1, 1, alpha=random.uniform(0.3, 0.9))
                c.circle(x, y, r, fill=1, stroke=0)

            # Top brand bar
            c.setFillColor(HexColor('#1a0a3d'))
            c.rect(0, H - 18*mm, W, 18*mm, fill=1, stroke=0)
            c.setFillColor(C_GOLD)
            c.rect(0, H - 18*mm, W, 1, fill=1, stroke=0)
            c.setFillColor(C_PURPLE_LT)
            c.setFont('Helvetica', 9)
            c.drawCentredString(W/2, H - 12*mm, '✦   C O S M I C A   ✦')

            # Report type badge
            rt_text = (req.report_type or 'full_life').upper().replace('_', ' ') + ' REPORT'
            badge_w = len(rt_text) * 5.5 + 20
            bx = W/2 - badge_w/2
            c.setFillColor(C_PURPLE)
            c.roundRect(bx, H - 36*mm, badge_w, 10*mm, 3*mm, fill=1, stroke=0)
            c.setFillColor(C_WHITE)
            c.setFont('Helvetica-Bold', 9)
            c.drawCentredString(W/2, H - 30*mm, rt_text)

            # Name — large centred
            c.setFillColor(C_GOLD)
            c.setFont('Helvetica-Bold', 36)
            c.drawCentredString(W/2, H/2 + 22*mm, req.person_name)

            # Gold divider
            c.setFillColor(C_GOLD)
            c.rect(W/2 - 30*mm, H/2 + 16*mm, 60*mm, 1.5, fill=1, stroke=0)

            # Lagna · Nakshatra · Moon
            c.setFillColor(C_PURPLE_LT)
            c.setFont('Helvetica', 12)
            c.drawCentredString(W/2, H/2 + 8*mm,
                f"{req.lagna} Lagna  ·  {report_data.get('nakshatra','')} Nakshatra")
            c.setFillColor(HexColor('#94a3b8'))
            c.setFont('Helvetica', 10)
            c.drawCentredString(W/2, H/2, f"Moon in {report_data.get('moon_rashi','')}")

            # Birth details card
            card_y = H/2 - 42*mm
            c.setFillColor(HexColor('#1a1040'))
            c.roundRect(W/2 - 55*mm, card_y, 110*mm, 32*mm, 4*mm, fill=1, stroke=0)
            c.setStrokeColor(C_PURPLE)
            c.setLineWidth(0.8)
            c.roundRect(W/2 - 55*mm, card_y, 110*mm, 32*mm, 4*mm, fill=0, stroke=1)

            c.setFillColor(HexColor('#94a3b8'))
            c.setFont('Helvetica', 8)
            c.drawCentredString(W/2, card_y + 22*mm, 'DATE OF BIRTH')
            c.setFillColor(C_WHITE)
            c.setFont('Helvetica-Bold', 10)
            c.drawCentredString(W/2, card_y + 15*mm, req.birth_date or '—')
            c.setFillColor(HexColor('#94a3b8'))
            c.setFont('Helvetica', 8)
            c.drawCentredString(W/2, card_y + 9*mm,
                f"{req.birth_time or '—'}  ·  {req.birth_place or '—'}")

            # Footer note
            c.setFillColor(HexColor('#475569'))
            c.setFont('Helvetica', 7)
            c.drawCentredString(W/2, 12*mm,
                'This report is confidential and prepared exclusively for the native.')
            c.restoreState()

        def later_pages(c, doc):
            c.saveState()
            # Header bar
            c.setFillColor(HexColor('#1a0a3d'))
            c.rect(0, H - 13*mm, W, 13*mm, fill=1, stroke=0)
            c.setFillColor(C_PURPLE)
            c.rect(0, H - 13*mm, W, 1.5, fill=1, stroke=0)
            c.setFillColor(C_PURPLE_LT)
            c.setFont('Helvetica', 7)
            c.drawString(15*mm, H - 8.5*mm, 'COSMICA · VEDIC ASTROLOGY REPORT')
            c.setFillColor(C_GOLD)
            c.setFont('Helvetica-Bold', 7)
            c.drawRightString(W - 15*mm, H - 8.5*mm, req.person_name.upper())
            # Footer bar
            c.setFillColor(C_SLATE_LT)
            c.rect(0, 0, W, 10*mm, fill=1, stroke=0)
            c.setFillColor(C_MUTED)
            c.setFont('Helvetica', 7)
            c.drawString(15*mm, 3.5*mm,
                f"Generated by Cosmica  ·  {datetime.now().strftime('%B %d, %Y')}")
            c.drawRightString(W - 15*mm, 3.5*mm, f"Page {doc.page}")
            c.restoreState()

        # ── Helper: coloured pill tag ────────────────────────────
        def pill_table(items):
            """items = list of (label, bg_color, text_color)"""
            cells = []
            for label, bg, fg in items:
                p = Paragraph(f'<b>{label}</b>',
                    ParagraphStyle('pt', fontName='Helvetica-Bold', fontSize=8,
                                   textColor=fg, leading=10))
                cells.append(p)
            if not cells: return None
            col_w = min(45*mm, 160*mm / len(cells))
            t = Table([cells], colWidths=[col_w]*len(cells))
            style_cmds = [
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
                ('RIGHTPADDING', (0,0), (-1,-1), 6),
                ('ROUNDEDCORNERS', [3]),
            ]
            for i, (_, bg, _) in enumerate(items):
                style_cmds.append(('BACKGROUND', (i,0), (i,0), bg))
            t.setStyle(TableStyle(style_cmds))
            return t

        # ── Helper: info card table ──────────────────────────────
        def info_card(rows, col_widths=None):
            if not col_widths:
                col_widths = [52*mm, 108*mm]
            data = []
            for k, v in rows:
                data.append([
                    Paragraph(f'<b>{k}</b>', sLabel),
                    Paragraph(str(v), sPlain),
                ])
            t = Table(data, colWidths=col_widths)
            t.setStyle(TableStyle([
                ('GRID',          (0,0), (-1,-1), 0.3, HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS',(0,0), (-1,-1), [C_PURPLE_XL, C_WHITE]),
                ('TOPPADDING',    (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING',   (0,0), (-1,-1), 9),
                ('RIGHTPADDING',  (0,0), (-1,-1), 9),
                ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
            ]))
            return t

        # ── Helper: section header banner ────────────────────────
        def section_banner(chapter_num, title, plain_title, accent, light, description):
            # Full-width coloured banner with chapter number + titles
            inner = [
                Paragraph(
                    f'<font color="#ffffff"><b>Chapter {chapter_num}</b></font>  '
                    f'<font color="#e2e8f0">·  {title}</font>',
                    ParagraphStyle('bh', fontName='Helvetica-Bold', fontSize=10,
                                   textColor=C_WHITE, leading=14)),
                Spacer(1, 3),
                Paragraph(
                    f'<font color="#fef3c7"><b>{plain_title}</b></font>',
                    ParagraphStyle('bpt', fontName='Helvetica-Bold', fontSize=16,
                                   textColor=C_GOLD, leading=20)),
                Spacer(1, 2),
                Paragraph(description,
                    ParagraphStyle('bd', fontName='Helvetica-Oblique', fontSize=9,
                                   textColor=HexColor('#c4b5fd'), leading=13)),
            ]
            t = Table([[inner]], colWidths=[170*mm])
            t.setStyle(TableStyle([
                ('BACKGROUND',    (0,0), (-1,-1), accent),
                ('TOPPADDING',    (0,0), (-1,-1), 12),
                ('BOTTOMPADDING', (0,0), (-1,-1), 12),
                ('LEFTPADDING',   (0,0), (-1,-1), 14),
                ('RIGHTPADDING',  (0,0), (-1,-1), 14),
            ]))
            return t

        # ── Helper: AI insight card ──────────────────────────────
        def ai_card(text, accent):
            header = Paragraph(
                '<font color="#7c3aed"><b>✦  Your Personal Reading</b></font>',
                ParagraphStyle('aih', fontName='Helvetica-Bold', fontSize=10,
                               textColor=C_PURPLE, leading=14, spaceAfter=6))
            body = Paragraph(text, sBody)
            t = Table([[header], [body]], colWidths=[160*mm])
            t.setStyle(TableStyle([
                ('BACKGROUND',    (0,0), (-1,-1), C_PURPLE_XL),
                ('LINEAFTER',     (0,0), (0,-1),  4, accent),
                ('LINEBEFORE',    (0,0), (0,-1),  4, accent),
                ('TOPPADDING',    (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('LEFTPADDING',   (0,0), (-1,-1), 14),
                ('RIGHTPADDING',  (0,0), (-1,-1), 14),
                ('ROUNDEDCORNERS', [4]),
            ]))
            return t

        # ── Helper: knowledge entry card ────────────────────────
        def knowledge_card(title, text, accent, light):
            try:
                accent_hex = '#%02x%02x%02x' % (int(accent.red*255), int(accent.green*255), int(accent.blue*255))
            except Exception:
                accent_hex = '#7c3aed'
            hdr = Paragraph(
                f'<font color="{accent_hex}"><b>{title}</b></font>',
                ParagraphStyle('kh', fontName='Helvetica-Bold', fontSize=10,
                               textColor=accent, leading=14, spaceAfter=4))
            body = Paragraph(text, sBodySm)
            t = Table([[hdr], [body]], colWidths=[160*mm])
            t.setStyle(TableStyle([
                ('BACKGROUND',    (0,0), (-1,-1), light),
                ('LINEBEFORE',    (0,0), (0,-1),  3, accent),
                ('TOPPADDING',    (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING',   (0,0), (-1,-1), 12),
                ('RIGHTPADDING',  (0,0), (-1,-1), 12),
            ]))
            return t

        # ── Helper: takeaway strip ──────────────────────────────
        def takeaway_strip(items_green, items_amber, items_blue):
            """
            items_green = strengths, items_amber = watch out, items_blue = remedy
            Each item is a short string.
            """
            rows = []
            for label, color, bg, items in [
                ('STRENGTHS',  C_GREEN,  C_GREEN_LT,  items_green),
                ('WATCH OUT',  C_AMBER,  C_AMBER_LT,  items_amber),
                ('REMEDY',     C_BLUE,   C_BLUE_LT,   items_blue),
            ]:
                if not items: continue
                bullet_text = '<br/>'.join([f'• {i}' for i in items])
                header_cell = Paragraph(
                    f'<b>{label}</b>',
                    ParagraphStyle('tsh', fontName='Helvetica-Bold', fontSize=7,
                                   textColor=C_WHITE, leading=10))
                body_cell   = Paragraph(bullet_text,
                    ParagraphStyle('tsb', fontName='Helvetica', fontSize=9,
                                   textColor=color, leading=14))
                rows.append([header_cell, body_cell])

            if not rows: return None

            col_widths_ts = [22*mm, 138*mm]
            t = Table(rows, colWidths=col_widths_ts)
            bg_colors = [C_GREEN, C_AMBER, C_BLUE]
            style_cmds = [
                ('VALIGN',       (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING',   (0,0), (-1,-1), 7),
                ('BOTTOMPADDING',(0,0), (-1,-1), 7),
                ('LEFTPADDING',  (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
                ('GRID',         (0,0), (-1,-1), 0.3, HexColor('#e2e8f0')),
            ]
            for i in range(len(rows)):
                style_cmds.append(('BACKGROUND', (0,i), (0,i), bg_colors[i]))
                style_cmds.append(('BACKGROUND', (1,i), (1,i),
                    [C_GREEN_LT, C_AMBER_LT, C_BLUE_LT][i]))
            t.setStyle(TableStyle(style_cmds))
            return t

        # ── Helper: planet positions overview table ──────────────
        def planet_positions_table(pp, lagna_idx):
            headers = ['Planet', 'Sign', 'House', 'Strength']
            planets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']
            strength_map = {
                'Sun': {'Simha':5,'Mesha':4,'Karka':1},
                'Moon':{'Karka':5,'Vrishabha':4,'Vrishchika':1},
                'Mars':{'Mesha':5,'Vrishchika':5,'Makara':4,'Karka':1},
                'Mercury':{'Kanya':5,'Mithuna':4,'Meena':1},
                'Jupiter':{'Karka':5,'Dhanu':5,'Meena':5,'Makara':1},
                'Venus':{'Vrishabha':5,'Tula':5,'Meena':4,'Kanya':1},
                'Saturn':{'Makara':5,'Kumbha':5,'Tula':4,'Mesha':1},
            }
            rows = [headers]
            for pname in planets:
                pdata = pp.get(pname, {})
                rashi = pdata.get('rashi', '—')
                rashi_en = pdata.get('rashi_en', rashi)
                if rashi in RASHIS_SA:
                    ri = RASHIS_SA.index(rashi)
                    house = (ri - lagna_idx) % 12 + 1
                    house_str = ORDINALS.get(house, str(house))
                else:
                    house_str = '—'
                sm = strength_map.get(pname, {})
                strength = sm.get(rashi, 3)
                stars = '★' * strength + '☆' * (5 - strength)
                rows.append([pname, rashi_en, house_str, stars])

            col_w = [30*mm, 42*mm, 30*mm, 58*mm]
            t = Table(rows, colWidths=col_w)
            t.setStyle(TableStyle([
                ('BACKGROUND',    (0,0), (-1,0),  C_DEEP),
                ('TEXTCOLOR',     (0,0), (-1,0),  C_GOLD),
                ('FONTNAME',      (0,0), (-1,0),  'Helvetica-Bold'),
                ('FONTSIZE',      (0,0), (-1,0),  9),
                ('FONTSIZE',      (0,1), (-1,-1), 9),
                ('ROWBACKGROUNDS',(0,1), (-1,-1), [C_WHITE, C_PURPLE_XL]),
                ('GRID',          (0,0), (-1,-1), 0.3, HexColor('#d1d5db')),
                ('ALIGN',         (0,0), (-1,-1), 'CENTER'),
                ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING',    (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING',   (0,0), (-1,-1), 6),
                ('RIGHTPADDING',  (0,0), (-1,-1), 6),
            ]))
            return t

        # ── Helper: cosmic snapshot cards ───────────────────────
        def snapshot_table(sections):
            """Top-level life summary: one card per life area."""
            areas = [
                ('Personality',  '☀', 0),
                ('Wealth',       '💰', 1),
                ('Home',         '🏠', 2),
                ('Creativity',   '🎨', 3),
                ('Marriage',     '💑', 4),
                ('Luck',         '🌟', 5),
                ('Career',       '🏆', 6),
                ('Gains',        '🌐', 7),
            ]
            sec_map = {s['name']: s for s in sections}
            cards = []
            sec_list = list(sec_map.values())

            for i, (area, icon, idx) in enumerate(areas):
                if idx >= len(sec_list): break
                sec = sec_list[idx]
                # Get plain title
                plain = SECTION_PLAIN_TITLES.get(sec['name'], sec['name'])
                # Short summary from ai_insight (first sentence)
                ai = sec.get('ai_insight') or ''
                if ai:
                    first_sent = ai.split('.')[0]
                    summary = (first_sent[:150] + '.') if len(first_sent) > 150 else (first_sent + '.')
                else:
                    summary = sec['description']
                accent, light, _ = SEC_COLORS[i % len(SEC_COLORS)]
                try:
                    accent_hex = '#%02x%02x%02x' % (int(accent.red*255), int(accent.green*255), int(accent.blue*255))
                except Exception:
                    accent_hex = '#7c3aed'
                cell = [
                    Paragraph(f'<b><font color="{accent_hex}">{area}</font></b>',
                        ParagraphStyle('sna', fontName='Helvetica-Bold', fontSize=10,
                                       textColor=accent, leading=14, spaceAfter=3)),
                    Paragraph(summary,
                        ParagraphStyle('snb', fontSize=8, leading=12,
                                       textColor=C_TEXT, spaceAfter=0)),
                ]
                cards.append(cell)

            # 2-column grid
            rows = []
            for j in range(0, len(cards), 2):
                row = [cards[j], cards[j+1] if j+1 < len(cards) else [Paragraph('', sBody)]]
                rows.append(row)

            t = Table(rows, colWidths=[82*mm, 82*mm], spaceBefore=4, spaceAfter=4)
            style_cmds = [
                ('VALIGN',        (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING',    (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('LEFTPADDING',   (0,0), (-1,-1), 10),
                ('RIGHTPADDING',  (0,0), (-1,-1), 10),
                ('GRID',          (0,0), (-1,-1), 0.5, HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS',(0,0), (-1,-1), [C_PURPLE_XL, C_WHITE]),
            ]
            t.setStyle(TableStyle(style_cmds))
            return t

        # ════════════════════════════════════════════════════════
        # BUILD STORY
        # ════════════════════════════════════════════════════════
        story = []
        sections = report_data['sections']

        # ── PAGE 1: Cover (drawn by first_page callback) ─────────
        story.append(Spacer(1, H - 40*mm))
        story.append(PageBreak())

        # ── PAGE 2: Birth Details + Cosmic Snapshot ──────────────
        # Chapter header
        hdr_tbl = Table([[
            Paragraph('<font color="white"><b>Chapter 1  ·  Your Birth Details</b></font>',
                ParagraphStyle('ch', fontName='Helvetica-Bold', fontSize=13,
                               textColor=C_WHITE, leading=18))
        ]], colWidths=[170*mm])
        hdr_tbl.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), C_DEEP),
            ('TOPPADDING',    (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ]))
        story.append(hdr_tbl)
        story.append(Spacer(1, 8))

        birth_rows = [
            ('Full Name',       req.person_name or '—'),
            ('Lagna (Rising)',  f"{req.lagna} — {RASHIS_EN[lagna_idx]}"),
            ('Moon Sign',       report_data.get('moon_rashi', '—')),
            ('Birth Star',      report_data.get('nakshatra', '—')),
            ('Date of Birth',   req.birth_date  or '—'),
            ('Time of Birth',   req.birth_time  or '—'),
            ('Place of Birth',  req.birth_place or '—'),
            ('Ayanamsa',        'Lahiri (Chitrapaksha)'),
        ]
        story.append(info_card(birth_rows))
        story.append(Spacer(1, 14))

        # Nakshatra description (first 400 chars)
        for bk in report_data.get('base_knowledge', []):
            story.append(Paragraph(f"<b>{bk['title']}</b>", sMed))
            story.append(Paragraph(bk['text'][:400] + '...', sBodySm))
            story.append(Spacer(1, 6))

        story.append(PageBreak())

        # ── PAGE 3: Planetary Positions Overview ─────────────────
        hdr_tbl2 = Table([[
            Paragraph('<font color="white"><b>Planetary Positions at Your Birth</b></font>',
                ParagraphStyle('ph', fontName='Helvetica-Bold', fontSize=13,
                               textColor=C_WHITE, leading=18))
        ]], colWidths=[170*mm])
        hdr_tbl2.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), C_PURPLE),
            ('TOPPADDING',    (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ]))
        story.append(hdr_tbl2)
        story.append(Spacer(1, 6))
        story.append(Paragraph(
            'Every planet was at a specific position in the sky when you were born. '
            'These positions shape your personality, relationships, and life path. '
            'The table below shows where each planet was placed.',
            sBodySm))
        story.append(Spacer(1, 8))
        story.append(planet_positions_table(
            req.kundli.get('planetary_positions', {}),
            lagna_idx))
        story.append(Spacer(1, 14))

        # ── PAGE 4: Cosmic Snapshot ──────────────────────────────
        story.append(PageBreak())
        hdr_tbl3 = Table([[
            Paragraph('<font color="white"><b>Your Cosmic Snapshot</b></font>',
                ParagraphStyle('csh', fontName='Helvetica-Bold', fontSize=13,
                               textColor=C_WHITE, leading=18))
        ]], colWidths=[170*mm])
        hdr_tbl3.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), C_TEAL),
            ('TOPPADDING',    (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ]))
        story.append(hdr_tbl3)
        story.append(Spacer(1, 6))
        story.append(Paragraph(
            'A quick overview of all major life areas from your chart at a glance.',
            sBodySm))
        story.append(Spacer(1, 8))
        story.append(snapshot_table(sections))
        story.append(PageBreak())

        # ── SECTION PAGES ────────────────────────────────────────
        all_remedies = []  # collect for final page

        for i, sec in enumerate(sections):
            accent, light, acc_hex = SEC_COLORS[i % len(SEC_COLORS)]
            plain_title = SECTION_PLAIN_TITLES.get(sec['name'], sec['name'])

            # Section banner
            story.append(section_banner(
                i + 2, sec['name'], plain_title, accent, light, sec['description']))
            story.append(Spacer(1, 10))

            # ── AI Personal Reading (prominent, first) ──────────
            if sec.get('ai_insight'):
                story.append(ai_card(sec['ai_insight'], accent))
                story.append(Spacer(1, 10))

            # ── Astrologer Knowledge ────────────────────────────
            if sec['db_knowledge']:
                story.append(Paragraph(
                    '<b><font color="#1e1b4b">Detailed Astrologer Analysis</font></b>',
                    ParagraphStyle('dah', fontName='Helvetica-Bold', fontSize=11,
                                   textColor=C_TEXT, leading=15, spaceBefore=4, spaceAfter=6)))

                # Deduplicate by title
                seen_titles = set()
                for k in sec['db_knowledge']:
                    if k['title'] in seen_titles:
                        continue
                    seen_titles.add(k['title'])
                    story.append(knowledge_card(k['title'], k['text'], accent, light))
                    story.append(Spacer(1, 5))

                    # Collect remedies
                    remedies = extract_remedy(k['text'])
                    for rem in remedies:
                        all_remedies.append({'section': plain_title, 'remedy': rem})

            else:
                story.append(Paragraph(
                    'Detailed readings will be available as the knowledge base grows.',
                    sItalic))

            # ── Takeaway strip ──────────────────────────────────
            # Auto-extract strengths/watch-outs/remedies from knowledge text
            strengths, watchouts, rems = [], [], []
            for k in sec['db_knowledge'][:6]:
                txt = k['text']
                # Positive signals
                for kw in ['good for', 'positive:', 'success', 'beneficial', 'excellent', 'strong']:
                    idx_kw = txt.lower().find(kw)
                    if idx_kw != -1:
                        snippet = txt[idx_kw:idx_kw+80].split('.')[0].strip()
                        if snippet and snippet not in strengths:
                            strengths.append(snippet[:70])
                            break
                # Negative signals
                for kw in ['negative:', 'challenges:', 'caution', 'avoid', 'difficult', 'problem']:
                    idx_kw = txt.lower().find(kw)
                    if idx_kw != -1:
                        snippet = txt[idx_kw:idx_kw+80].split('.')[0].strip()
                        if snippet and snippet not in watchouts:
                            watchouts.append(snippet[:70])
                            break
                # Remedies
                for rem in extract_remedy(txt):
                    if rem not in rems:
                        rems.append(rem[:70])

            ts = takeaway_strip(strengths[:2], watchouts[:2], rems[:2])
            if ts:
                story.append(Spacer(1, 8))
                story.append(Paragraph(
                    '<b>Key Takeaways</b>',
                    ParagraphStyle('kt', fontName='Helvetica-Bold', fontSize=10,
                                   textColor=C_TEXT, spaceBefore=4, spaceAfter=4)))
                story.append(ts)

            story.append(PageBreak())

        # ── REMEDIES SUMMARY PAGE ────────────────────────────────
        rem_hdr = Table([[
            Paragraph('<font color="white"><b>Remedies &amp; Action Plan</b></font>',
                ParagraphStyle('rh', fontName='Helvetica-Bold', fontSize=13,
                               textColor=C_WHITE, leading=18))
        ]], colWidths=[170*mm])
        rem_hdr.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), C_GOLD),
            ('TOPPADDING',    (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ]))
        story.append(rem_hdr)
        story.append(Spacer(1, 8))
        story.append(Paragraph(
            'All recommended remedies from your reading, collected in one place for easy reference.',
            sBodySm))
        story.append(Spacer(1, 10))

        if all_remedies:
            seen_rem = set()
            for item in all_remedies:
                rem_key = item['remedy'][:50]
                if rem_key in seen_rem: continue
                seen_rem.add(rem_key)
                row = Table([[
                    Paragraph(f"<b><font color='#92400e'>{item['section']}</font></b>",
                        ParagraphStyle('rs', fontName='Helvetica-Bold', fontSize=9,
                                       textColor=C_AMBER, leading=12)),
                    Paragraph(f"• {item['remedy']}",
                        ParagraphStyle('rb', fontSize=9, textColor=C_TEXT, leading=14)),
                ]], colWidths=[48*mm, 112*mm])
                row.setStyle(TableStyle([
                    ('BACKGROUND',    (0,0), (-1,-1), C_GOLD_LT),
                    ('LINEBELOW',     (0,0), (-1,-1), 0.3, HexColor('#fcd34d')),
                    ('TOPPADDING',    (0,0), (-1,-1), 6),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                    ('LEFTPADDING',   (0,0), (-1,-1), 8),
                    ('RIGHTPADDING',  (0,0), (-1,-1), 8),
                    ('VALIGN',        (0,0), (-1,-1), 'TOP'),
                ]))
                story.append(row)
                story.append(Spacer(1, 2))
        else:
            story.append(Paragraph('No specific remedies noted in this report.', sItalic))

        story.append(PageBreak())

        # ── CLOSING PAGE ─────────────────────────────────────────
        closing_hdr = Table([[
            Paragraph('<font color="white"><b>A Note from Cosmica</b></font>',
                ParagraphStyle('cl', fontName='Helvetica-Bold', fontSize=13,
                               textColor=C_WHITE, leading=18))
        ]], colWidths=[170*mm])
        closing_hdr.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), C_SLATE),
            ('TOPPADDING',    (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ]))
        story.append(closing_hdr)
        story.append(Spacer(1, 16))
        story.append(Paragraph(
            'This report was prepared by Cosmica using a combination of traditional Vedic astrology '
            'knowledge and AI synthesis. All calculations are based on your exact birth data using '
            'Swiss Ephemeris with Lahiri ayanamsa — the same system used by classical Vedic astrologers.',
            sBody))
        story.append(Spacer(1, 10))
        story.append(Paragraph(
            'Remember that your birth chart shows your tendencies and potential — not a fixed destiny. '
            'You always have the power to grow, choose, and transcend. Use this report as a mirror, '
            'not a cage. May your cosmic journey be filled with wisdom and blessings.',
            sBody))
        story.append(Spacer(1, 20))
        quote_tbl = Table([[
            Paragraph(
                '<i>"The stars incline, they do not compel.<br/>The chart is the map — you are the traveller."</i>',
                ParagraphStyle('qt', fontName='Helvetica-Oblique', fontSize=13, leading=20,
                               textColor=C_PURPLE, alignment=TA_CENTER))
        ]], colWidths=[160*mm])
        quote_tbl.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), C_PURPLE_XL),
            ('TOPPADDING',    (0,0), (-1,-1), 16),
            ('BOTTOMPADDING', (0,0), (-1,-1), 16),
            ('ALIGN',         (0,0), (-1,-1), 'CENTER'),
            ('LINEBEFORE',    (0,0), (0,-1),  4, C_GOLD),
            ('LINEAFTER',     (0,0), (0,-1),  4, C_GOLD),
        ]))
        story.append(quote_tbl)

        # ── BUILD ────────────────────────────────────────────────
        doc = SimpleDocTemplate(buf, pagesize=A4,
            leftMargin=18*mm, rightMargin=18*mm,
            topMargin=17*mm, bottomMargin=14*mm)
        doc.build(story, onFirstPage=first_page, onLaterPages=later_pages)

        pdf   = buf.getvalue()
        fname = f"Cosmica_{req.person_name.replace(' ','_')}_Report.pdf"
        return StreamingResponse(io.BytesIO(pdf), media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{fname}"'})

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


lagna_idx = 0