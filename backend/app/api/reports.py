# app/api/reports.py
# Marriage, Career, and Full Life reports — 70% DB knowledge, 30% AI enrichment

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import db
from app.core.config import settings
import asyncio
import httpx
import io
import textwrap
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm, inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

router = APIRouter(prefix="/reports", tags=["Reports"])

RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
          'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']
RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
            'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
RASHI_LORD = ['Mars','Venus','Mercury','Moon','Sun','Mercury',
              'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter']

PLANET_LORDS = {
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

HOUSE_THEMES = {
    1:'Self, personality, body, appearance and life direction',
    2:'Wealth, family, speech and accumulated assets',
    3:'Courage, siblings, communication and short travels',
    4:'Mother, home, vehicles, property and happiness',
    5:'Children, intelligence, past life merit and creativity',
    6:'Enemies, diseases, debts, service and daily work',
    7:'Spouse, partnerships, business and marriage',
    8:'Longevity, occult, inheritance and transformation',
    9:'Luck, dharma, father, higher learning and fortune',
    10:'Career, profession, public status and authority',
    11:'Gains, elder siblings, social networks and aspirations',
    12:'Expenses, foreign lands, spirituality and liberation',
}

# Which houses and planets matter for each report type
REPORT_CONFIG = {
    'marriage': {
        'title': 'Marriage & Relationships Report',
        'key_houses': [1, 2, 4, 5, 7, 8, 12],
        'key_planets': ['Venus', 'Jupiter', 'Moon', 'Mars', 'Rahu', 'Ketu', 'Saturn'],
        'sections': [
            {'name': 'Marriage Prospects', 'houses': [7], 'desc': '7th house — the house of marriage, spouse, and partnerships'},
            {'name': 'Nature of Spouse', 'houses': [7, 1], 'desc': 'How 7th house and Lagna influence the type of spouse'},
            {'name': 'Family & Domestic Life', 'houses': [2, 4], 'desc': '2nd house (family) and 4th house (home happiness)'},
            {'name': 'Love & Romance', 'houses': [5], 'desc': '5th house — romance, love affairs, and emotional expression'},
            {'name': 'Physical Compatibility', 'houses': [8, 12], 'desc': '8th house (intimacy) and 12th house (bed pleasures)'},
            {'name': 'Manglik & Dosha Analysis', 'houses': [1, 2, 4, 7, 8, 12], 'desc': 'Mars placement analysis for Manglik Dosha'},
        ],
    },
    'career': {
        'title': 'Career & Profession Report',
        'key_houses': [1, 2, 6, 7, 10, 11, 3, 9],
        'key_planets': ['Sun', 'Saturn', 'Mercury', 'Mars', 'Jupiter', 'Rahu', 'Moon'],
        'sections': [
            {'name': 'Career & Profession', 'houses': [10], 'desc': '10th house — the house of career, karma, and public status'},
            {'name': 'Wealth & Income', 'houses': [2, 11], 'desc': '2nd house (wealth) and 11th house (gains)'},
            {'name': 'Work Environment', 'houses': [6], 'desc': '6th house — daily work, service, competition, and colleagues'},
            {'name': 'Business & Partnerships', 'houses': [7], 'desc': '7th house — business partnerships and collaborations'},
            {'name': 'Initiative & Communication', 'houses': [3], 'desc': '3rd house — courage, efforts, and communication skills'},
            {'name': 'Luck & Higher Purpose', 'houses': [9, 1], 'desc': '9th house (fortune/dharma) and 1st house (self-drive)'},
        ],
    },
    'full_life': {
        'title': 'Complete Life Report',
        'key_houses': [1,2,3,4,5,6,7,8,9,10,11,12],
        'key_planets': ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'],
        'sections': [
            {'name': 'Personality & Self', 'houses': [1], 'desc': '1st house — your identity, body, and life path'},
            {'name': 'Wealth & Family', 'houses': [2], 'desc': '2nd house — wealth, speech, and family values'},
            {'name': 'Courage & Siblings', 'houses': [3], 'desc': '3rd house — courage, siblings, and short journeys'},
            {'name': 'Home & Happiness', 'houses': [4], 'desc': '4th house — mother, property, and inner peace'},
            {'name': 'Children & Intelligence', 'houses': [5], 'desc': '5th house — creativity, children, and past life merit'},
            {'name': 'Health & Service', 'houses': [6], 'desc': '6th house — health, enemies, debts, and daily work'},
            {'name': 'Marriage & Partnerships', 'houses': [7], 'desc': '7th house — spouse, partnerships, and public dealings'},
            {'name': 'Longevity & Transformation', 'houses': [8], 'desc': '8th house — longevity, inheritance, and occult'},
            {'name': 'Luck & Dharma', 'houses': [9], 'desc': '9th house — fortune, father, and higher learning'},
            {'name': 'Career & Status', 'houses': [10], 'desc': '10th house — profession, authority, and public status'},
            {'name': 'Gains & Aspirations', 'houses': [11], 'desc': '11th house — income, elder siblings, and social network'},
            {'name': 'Spirituality & Liberation', 'houses': [12], 'desc': '12th house — expenses, foreign lands, and moksha'},
        ],
    },
}


def get_house(rashi_name, lagna):
    li = RASHIS.index(lagna) if lagna in RASHIS else 0
    ri = RASHIS.index(rashi_name) if rashi_name in RASHIS else 0
    return (ri - li) % 12 + 1


class ReportRequest(BaseModel):
    kundli:      dict
    lagna:       str
    report_type: str   # marriage, career, full_life
    person_name: Optional[str] = None


async def fetch_knowledge_for_house(house: int, lagna: str, planets_in_house: list, lords: dict):
    """Fetch all DB knowledge relevant to a specific house."""
    parts = []

    for planet in planets_in_house:
        # Planet in house knowledge
        doc = await db.planet_house_knowledge.find_one({"planet": planet, "house": house, "lagna": lagna})
        if not doc:
            doc = await db.planet_house_knowledge.find_one({"planet": planet, "house": house, "lagna": None})
        if not doc:
            doc = await db.planet_house_knowledge.find_one({"planet": planet, "house": house})
        if doc and doc.get("text"):
            lagna_label = f"for {doc['lagna']} Lagna" if doc.get("lagna") else "(general)"
            parts.append({
                "type": "planet_house",
                "title": f"{planet} in House {house} {lagna_label}",
                "text": doc["text"],
                "planet": planet,
            })

        # Planet in sign knowledge
        li = RASHIS.index(lagna) if lagna in RASHIS else 0
        rashi = RASHIS[(li + house - 1) % 12]
        rashi_en = RASHI_EN[(li + house - 1) % 12]
        ps = await db.planet_sign_knowledge.find_one({"planet": planet, "rashi": rashi})
        if ps and ps.get("text"):
            parts.append({
                "type": "planet_sign",
                "title": f"{planet} in {rashi} ({rashi_en})",
                "text": ps["text"],
                "planet": planet,
            })

        # Lord in house knowledge
        owned = lords.get(planet)
        if owned:
            if isinstance(owned, int):
                owned = [owned]
            for oh in owned:
                lh = await db.lord_in_house_knowledge.find_one(
                    {"lord_house": oh, "placed_in_house": house, "lagna": lagna})
                if not lh:
                    lh = await db.lord_in_house_knowledge.find_one(
                        {"lord_house": oh, "placed_in_house": house, "lagna": None})
                if not lh:
                    lh = await db.lord_in_house_knowledge.find_one(
                        {"lord_house": oh, "placed_in_house": house})
                if lh and lh.get("text"):
                    parts.append({
                        "type": "lord_house",
                        "title": f"{ORDINALS[oh]} Lord ({planet}) in House {house}",
                        "text": lh["text"],
                        "planet": planet,
                    })

    return parts


async def fetch_nakshatra_rashi_knowledge(kundli: dict):
    """Fetch nakshatra and rashi descriptions from DB."""
    parts = []
    lagna_name = kundli.get("lagna", {}).get("name", "")
    nakshatra_name = kundli.get("nakshatra", {}).get("name", "")
    moon_rashi = kundli.get("moon_rashi", "")

    rashi_doc = await db.rashi_knowledge.find_one({"rashi": lagna_name})
    if rashi_doc and rashi_doc.get("text"):
        parts.append({"type": "rashi", "title": f"{lagna_name} Lagna", "text": rashi_doc["text"]})

    if moon_rashi and moon_rashi != lagna_name:
        moon_doc = await db.rashi_knowledge.find_one({"rashi": moon_rashi})
        if moon_doc and moon_doc.get("text"):
            parts.append({"type": "rashi", "title": f"Moon in {moon_rashi}", "text": moon_doc["text"]})

    nak_doc = await db.nakshatra_knowledge.find_one({"nakshatra": nakshatra_name})
    if nak_doc and nak_doc.get("text"):
        parts.append({"type": "nakshatra", "title": f"{nakshatra_name} Nakshatra", "text": nak_doc["text"]})

    return parts


@router.post("/generate")
async def generate_report(req: ReportRequest):
    """Generate a report (marriage/career/full_life) with 70% DB + 30% AI."""

    if req.report_type not in REPORT_CONFIG:
        raise HTTPException(status_code=400, detail="Invalid report type. Use: marriage, career, full_life")

    config = REPORT_CONFIG[req.report_type]
    lagna = req.lagna
    pp = req.kundli.get("planetary_positions", {})
    lords = PLANET_LORDS.get(lagna, {})

    # Build planet-to-house mapping
    planet_houses = {}
    for planet, data in pp.items():
        rashi = data.get("rashi", "")
        house = get_house(rashi, lagna)
        planet_houses[planet] = house

    # Reverse: house-to-planets
    house_planets = {}
    for planet, house in planet_houses.items():
        house_planets.setdefault(house, []).append(planet)

    # Fetch nakshatra/rashi knowledge
    base_knowledge = await fetch_nakshatra_rashi_knowledge(req.kundli)

    # Fetch knowledge for each section in parallel
    report_sections = []

    for section_cfg in config['sections']:
        section_knowledge = []

        for house in section_cfg['houses']:
            planets_here = house_planets.get(house, [])
            # Filter to only key planets for this report type
            relevant_planets = [p for p in planets_here if p in config['key_planets']]
            # Also check if any key planet is lord of this house
            for planet in config['key_planets']:
                if planet not in relevant_planets and planet in pp:
                    owned = lords.get(planet)
                    if owned:
                        if isinstance(owned, int):
                            owned = [owned]
                        if house in owned:
                            relevant_planets.append(planet)

            # If no key planets here, still check all planets in house
            if not relevant_planets:
                relevant_planets = planets_here

            knowledge = await fetch_knowledge_for_house(house, lagna, relevant_planets, lords)
            section_knowledge.extend(knowledge)

        # House info
        li = RASHIS.index(lagna) if lagna in RASHIS else 0
        house_info = []
        for house in section_cfg['houses']:
            rashi_idx = (li + house - 1) % 12
            planets_here = house_planets.get(house, [])
            house_info.append({
                "house": house,
                "rashi": RASHIS[rashi_idx],
                "rashi_en": RASHI_EN[rashi_idx],
                "lord": RASHI_LORD[rashi_idx],
                "planets": planets_here,
                "theme": HOUSE_THEMES.get(house, ""),
            })

        report_sections.append({
            "name": section_cfg['name'],
            "description": section_cfg['desc'],
            "houses": house_info,
            "db_knowledge": section_knowledge,
            "db_count": len(section_knowledge),
            "ai_insight": None,  # filled below
        })

    # Count total DB entries
    total_db = sum(s['db_count'] for s in report_sections)

    # Build DB knowledge text for AI prompt
    db_text_parts = []
    for s in report_sections:
        if s['db_knowledge']:
            db_text_parts.append(f"\n=== {s['name']} ===")
            for k in s['db_knowledge']:
                db_text_parts.append(f"[{k['type']}] {k['title']}:\n{k['text']}")
    db_text = "\n".join(db_text_parts)

    # Also add nakshatra/rashi
    if base_knowledge:
        base_text = "\n=== Foundation (Lagna, Moon, Nakshatra) ===\n"
        for k in base_knowledge:
            base_text += f"{k['title']}:\n{k['text']}\n"
        db_text = base_text + db_text

    # Planet positions summary
    planet_lines = []
    for planet, data in pp.items():
        retro = " (R)" if data.get("retrograde") else ""
        house = planet_houses.get(planet, "?")
        planet_lines.append(f"  {planet}: {data['rashi']} H{house} {data.get('degree_in_rashi',0):.1f}{retro}")
    chart_summary = f"Lagna: {lagna}, Moon: {req.kundli.get('moon_rashi','?')}, Nakshatra: {req.kundli.get('nakshatra',{}).get('name','?')}\n" + "\n".join(planet_lines)

    # Generate AI insights — one per section
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            ai_tasks = []
            for s in report_sections:
                ai_tasks.append(_generate_section_ai(
                    section_name=s['name'],
                    section_desc=s['description'],
                    db_knowledge=s['db_knowledge'],
                    chart_summary=chart_summary,
                    report_type=req.report_type,
                    person_name=req.person_name,
                    lagna=lagna,
                    houses=s['houses'],
                ))
            ai_results = await asyncio.gather(*ai_tasks)
            for i, ai_text in enumerate(ai_results):
                report_sections[i]['ai_insight'] = ai_text
        except Exception as e:
            print(f"AI report error: {e}")

    return {
        "report_type": req.report_type,
        "title": config['title'],
        "person_name": req.person_name,
        "lagna": lagna,
        "moon_rashi": req.kundli.get("moon_rashi"),
        "nakshatra": req.kundli.get("nakshatra", {}).get("name"),
        "base_knowledge": base_knowledge,
        "sections": report_sections,
        "total_db_entries": total_db,
        "total_sections": len(report_sections),
    }


# ── PDF Generation ────────────────────────────────────────────

REPORT_COLORS = {
    'marriage':  {'primary': '#ec4899', 'light': '#fdf2f8', 'dark': '#9d174d'},
    'career':    {'primary': '#f59e0b', 'light': '#fffbeb', 'dark': '#92400e'},
    'full_life': {'primary': '#8b5cf6', 'light': '#f5f3ff', 'dark': '#5b21b6'},
}

REPORT_EMOJIS = {
    'marriage': 'Marriage & Relationships',
    'career': 'Career & Profession',
    'full_life': 'Complete Life',
}


def _build_pdf_styles(colors):
    """Build all paragraph styles for the PDF."""
    styles = getSampleStyleSheet()
    primary = HexColor(colors['primary'])
    dark = HexColor(colors['dark'])

    styles.add(ParagraphStyle(
        'CoverTitle', parent=styles['Title'],
        fontSize=28, leading=34, textColor=dark,
        spaceAfter=6, alignment=TA_CENTER, fontName='Helvetica-Bold',
    ))
    styles.add(ParagraphStyle(
        'CoverSubtitle', parent=styles['Normal'],
        fontSize=14, leading=18, textColor=HexColor('#6b7280'),
        alignment=TA_CENTER, spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        'CoverName', parent=styles['Normal'],
        fontSize=20, leading=26, textColor=primary,
        alignment=TA_CENTER, fontName='Helvetica-Bold', spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        'SectionHeading', parent=styles['Heading1'],
        fontSize=16, leading=22, textColor=dark,
        fontName='Helvetica-Bold', spaceBefore=18, spaceAfter=4,
        borderPadding=(0, 0, 4, 0),
    ))
    styles.add(ParagraphStyle(
        'SectionDesc', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=HexColor('#6b7280'),
        spaceAfter=10,
    ))
    styles.add(ParagraphStyle(
        'KnowledgeTitle', parent=styles['Normal'],
        fontSize=11, leading=15, textColor=HexColor('#1f2937'),
        fontName='Helvetica-Bold', spaceBefore=8, spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        'KnowledgeBody', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=HexColor('#374151'),
        spaceAfter=6, alignment=TA_JUSTIFY,
    ))
    styles.add(ParagraphStyle(
        'AILabel', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=primary,
        fontName='Helvetica-Bold', spaceBefore=10, spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        'AIBody', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=HexColor('#4b5563'),
        spaceAfter=8, alignment=TA_JUSTIFY,
        leftIndent=8, borderPadding=(4, 4, 4, 4),
    ))
    styles.add(ParagraphStyle(
        'BadgeText', parent=styles['Normal'],
        fontSize=9, leading=12, textColor=primary,
        fontName='Helvetica-Bold',
    ))
    styles.add(ParagraphStyle(
        'HouseInfo', parent=styles['Normal'],
        fontSize=9, leading=13, textColor=HexColor('#6b7280'),
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        'FooterNote', parent=styles['Normal'],
        fontSize=8, leading=11, textColor=HexColor('#9ca3af'),
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        'DBLabel', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=HexColor('#059669'),
        fontName='Helvetica-Bold', spaceBefore=6, spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        'TypeBadge', parent=styles['Normal'],
        fontSize=8, leading=10, textColor=HexColor('#8b5cf6'),
        fontName='Helvetica-Bold',
    ))
    return styles


def _add_header_footer(canvas, doc, report_title, person_name, colors):
    """Draw header line and footer on every page."""
    canvas.saveState()
    width, height = A4
    primary = HexColor(colors['primary'])

    # Header line
    canvas.setStrokeColor(primary)
    canvas.setLineWidth(1.5)
    canvas.line(30, height - 40, width - 30, height - 40)

    # Header text
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(HexColor('#9ca3af'))
    canvas.drawString(30, height - 35, f"COSMICA  •  {report_title.upper()}")
    canvas.drawRightString(width - 30, height - 35, person_name or "")

    # Footer
    canvas.setStrokeColor(HexColor('#e5e7eb'))
    canvas.setLineWidth(0.5)
    canvas.line(30, 35, width - 30, 35)
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(HexColor('#9ca3af'))
    canvas.drawString(30, 22, f"Generated by Cosmica  •  {datetime.now().strftime('%d %b %Y, %I:%M %p')}")
    canvas.drawRightString(width - 30, 22, f"Page {doc.page}")

    canvas.restoreState()


TYPE_BADGE_LABELS = {
    'planet_house': 'Planet in House',
    'planet_sign':  'Planet in Sign',
    'lord_house':   'Lord in House',
    'rashi':        'Rashi',
    'nakshatra':    'Nakshatra',
}

TYPE_BADGE_COLORS = {
    'planet_house': '#8b5cf6',
    'planet_sign':  '#3b82f6',
    'lord_house':   '#f59e0b',
    'rashi':        '#10b981',
    'nakshatra':    '#f97316',
}


def _generate_pdf_bytes(report_data: dict, report_type: str) -> bytes:
    """Generate a styled PDF from report data and return bytes."""
    colors = REPORT_COLORS.get(report_type, REPORT_COLORS['full_life'])
    styles = _build_pdf_styles(colors)
    primary = HexColor(colors['primary'])
    dark = HexColor(colors['dark'])

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=50, bottomMargin=50,
        leftMargin=35, rightMargin=35,
        title=f"Cosmica - {report_data.get('title', 'Report')}",
        author="Cosmica Vedic Astrology",
    )

    story = []
    report_title = report_data.get('title', 'Vedic Report')
    person = report_data.get('person_name', 'Native')
    lagna = report_data.get('lagna', '')
    moon = report_data.get('moon_rashi', '')
    nakshatra = report_data.get('nakshatra', '')

    # ── Cover Page ─────────────────────────────────
    story.append(Spacer(1, 80))
    story.append(Paragraph("✦ COSMICA ✦", styles['CoverSubtitle']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(report_title, styles['CoverTitle']))
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="40%", thickness=2, color=primary, spaceAfter=16, spaceBefore=0, hAlign='CENTER'))
    story.append(Paragraph(person, styles['CoverName']))
    story.append(Spacer(1, 12))

    # Badges row
    badge_data = []
    if lagna:
        badge_data.append(f"Lagna: {lagna}")
    if moon:
        badge_data.append(f"Moon: {moon}")
    if nakshatra:
        badge_data.append(f"Nakshatra: {nakshatra}")
    if badge_data:
        story.append(Paragraph("  •  ".join(badge_data), styles['CoverSubtitle']))
    story.append(Spacer(1, 20))

    # Stats
    total_db = report_data.get('total_db_entries', 0)
    total_sections = report_data.get('total_sections', 0)
    sections = report_data.get('sections', [])
    ai_count = sum(1 for s in sections if s.get('ai_insight'))

    stats_text = f"{total_db} Knowledge Entries  •  {ai_count} AI Insights  •  {total_sections} Sections"
    story.append(Paragraph(stats_text, styles['CoverSubtitle']))
    story.append(Spacer(1, 8))
    story.append(Paragraph("70% Astrologer's Knowledge  •  30% AI Insights", styles['CoverSubtitle']))
    story.append(Spacer(1, 30))
    story.append(Paragraph(
        f"Generated on {datetime.now().strftime('%d %B %Y at %I:%M %p')}",
        styles['CoverSubtitle']
    ))

    story.append(PageBreak())

    # ── Foundation Section (Lagna, Moon, Nakshatra) ─────
    base_knowledge = report_data.get('base_knowledge', [])
    if base_knowledge:
        story.append(Paragraph("Foundation — Lagna, Moon & Nakshatra", styles['SectionHeading']))
        story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#e5e7eb'), spaceAfter=10))
        for item in base_knowledge:
            badge_label = TYPE_BADGE_LABELS.get(item.get('type', ''), item.get('type', ''))
            badge_color = TYPE_BADGE_COLORS.get(item.get('type', ''), '#8b5cf6')
            story.append(Paragraph(
                f'<font color="{badge_color}" size="8"><b>[{badge_label}]</b></font>  '
                f'<b>{item.get("title", "")}</b>',
                styles['KnowledgeTitle']
            ))
            text = item.get('text', '').replace('\n', '<br/>')
            story.append(Paragraph(text, styles['KnowledgeBody']))
        story.append(Spacer(1, 10))

    # ── Report Sections ────────────────────────────────
    for idx, section in enumerate(sections):
        # Section header
        section_block = []
        section_block.append(Paragraph(
            f"{idx + 1}.  {section.get('name', '')}",
            styles['SectionHeading']
        ))
        section_block.append(Paragraph(section.get('description', ''), styles['SectionDesc']))
        section_block.append(HRFlowable(width="100%", thickness=1, color=primary, spaceAfter=8))

        # House info pills
        houses = section.get('houses', [])
        if houses:
            for h in houses:
                planets_str = ", ".join(h.get('planets', [])) if h.get('planets') else "Empty"
                lord = h.get('lord', '?')
                rashi = h.get('rashi', '?')
                rashi_en = h.get('rashi_en', '?')
                house_num = h.get('house', '?')
                section_block.append(Paragraph(
                    f'<font color="{colors["primary"]}"><b>House {house_num}</b></font>'
                    f'  {rashi_en} ({rashi})  •  Lord: {lord}  •  Planets: {planets_str}',
                    styles['HouseInfo']
                ))
            section_block.append(Spacer(1, 6))

        story.extend(section_block)

        # DB Knowledge entries
        db_knowledge = section.get('db_knowledge', [])
        db_count = section.get('db_count', 0)
        if db_knowledge:
            story.append(Paragraph(
                f"Astrologer's Knowledge ({db_count} entries)",
                styles['DBLabel']
            ))
            for item in db_knowledge:
                badge_label = TYPE_BADGE_LABELS.get(item.get('type', ''), '')
                badge_color = TYPE_BADGE_COLORS.get(item.get('type', ''), '#8b5cf6')
                story.append(Paragraph(
                    f'<font color="{badge_color}" size="8"><b>[{badge_label}]</b></font>  '
                    f'<b>{item.get("title", "")}</b>',
                    styles['KnowledgeTitle']
                ))
                text = item.get('text', '').replace('\n', '<br/>')
                story.append(Paragraph(text, styles['KnowledgeBody']))
        else:
            story.append(Paragraph(
                '<i>No database knowledge for this section yet.</i>',
                styles['KnowledgeBody']
            ))

        # AI Insight
        ai_insight = section.get('ai_insight')
        if ai_insight:
            story.append(Paragraph("AI Supplementary Insight", styles['AILabel']))
            ai_text = ai_insight.replace('\n', '<br/>')
            story.append(Paragraph(ai_text, styles['AIBody']))

        story.append(Spacer(1, 12))

    # ── Footer Note ────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor('#e5e7eb'), spaceAfter=10, spaceBefore=10))
    story.append(Paragraph(
        f"This report contains {total_db} entries from the astrologer's curated knowledge base (70% weight). "
        f"AI supplements each section with brief classical context and practical guidance (30% weight). "
        f"For richer reports, add more knowledge in the My Knowledge page.",
        styles['FooterNote']
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Generated by Cosmica — Vedic Astrology Platform  •  cosmica.app",
        styles['FooterNote']
    ))

    # Build
    doc.build(
        story,
        onFirstPage=lambda c, d: _add_header_footer(c, d, report_title, person, colors),
        onLaterPages=lambda c, d: _add_header_footer(c, d, report_title, person, colors),
    )
    buffer.seek(0)
    return buffer.getvalue()


@router.post("/download-pdf")
async def download_report_pdf(req: ReportRequest):
    """Generate a report and return it as a downloadable PDF."""

    if req.report_type not in REPORT_CONFIG:
        raise HTTPException(status_code=400, detail="Invalid report type. Use: marriage, career, full_life")

    # Re-use the same generate logic
    report_data = await generate_report(req)

    # Generate PDF bytes
    pdf_bytes = _generate_pdf_bytes(report_data, req.report_type)

    person_slug = (req.person_name or "report").replace(" ", "_").lower()
    filename = f"cosmica_{req.report_type}_{person_slug}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


async def _generate_section_ai(section_name, section_desc, db_knowledge, chart_summary,
                                 report_type, person_name, lagna, houses):
    """Generate a SHORT AI insight for one report section. AI is only 30%."""

    db_text = ""
    if db_knowledge:
        for k in db_knowledge:
            db_text += f"{k['title']}:\n{k['text']}\n\n"

    house_details = ""
    for h in houses:
        planets_str = ", ".join(h['planets']) if h['planets'] else "Empty"
        house_details += f"  House {h['house']} ({h['rashi']}/{h['rashi_en']}), Lord: {h['lord']}, Planets: {planets_str}\n"

    system_prompt = f"""You are Cosmica, an expert Vedic astrologer writing a {report_type.replace('_',' ')} report.
You are writing ONLY a brief supplementary insight for the "{section_name}" section.

CRITICAL RULES:
- The astrologer's database knowledge is the PRIMARY content (70% of the report). It has ALREADY been shown to the user.
- Your job is ONLY to add a brief supplementary insight (30%) — connecting the dots, adding classical context, or practical advice.
- Keep your response to 3-5 sentences MAX.
- Be specific to this {lagna} Lagna chart. Reference actual planets and houses.
- Do NOT repeat what the database knowledge already says.
- Be warm, personal, and actionable."""

    user_prompt = f"""Section: {section_name}
About: {section_desc}

Chart: {chart_summary}

Houses involved:
{house_details}

{"Database knowledge already shown to user:" if db_text else "No database knowledge for this section."}
{db_text if db_text else ""}

Write a brief supplementary Vedic insight (3-5 sentences) for {person_name or 'the native'} that ADDS to the database knowledge above. Do not repeat it. Focus on practical guidance and connecting different planetary influences."""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 300
                },
                timeout=25.0
            )
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"AI section error ({section_name}): {e}")
        return None
