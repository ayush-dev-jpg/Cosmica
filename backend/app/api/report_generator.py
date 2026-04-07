# app/api/report_generator.py
# Full Life Report PDF Generator — 30-40 pages using DB knowledge + AI

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import db
from app.core.config import settings
import asyncio
import httpx
import io
from datetime import datetime

# ReportLab imports
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus.flowables import Flowable

router = APIRouter(prefix="/report", tags=["Report"])

# ── Color palette ─────────────────────────────────────────────
DEEP_NAVY   = HexColor('#0a0618')
DARK_PURPLE = HexColor('#1a0f35')
PURPLE      = HexColor('#7c3aed')
LIGHT_PURPLE= HexColor('#c084fc')
GOLD        = HexColor('#f59e0b')
TEAL        = HexColor('#14b8a6')
ROSE        = HexColor('#f43f5e')
SLATE       = HexColor('#64748b')
LIGHT_GRAY  = HexColor('#e2e8f0')
OFF_WHITE   = HexColor('#f8fafc')
CREAM       = HexColor('#fdf8f0')
BORDER      = HexColor('#e2e8f0')

PLANET_COLORS = {
    'Sun':HexColor('#f59e0b'),'Moon':HexColor('#60a5fa'),'Mars':HexColor('#f87171'),
    'Mercury':HexColor('#34d399'),'Jupiter':HexColor('#c084fc'),'Venus':HexColor('#f472b6'),
    'Saturn':HexColor('#94a3b8'),'Rahu':HexColor('#818cf8'),'Ketu':HexColor('#fb923c'),
}

RASHIS_SA = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
             'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']
RASHIS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
             'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
ORDINALS = {1:'1st',2:'2nd',3:'3rd',4:'4th',5:'5th',6:'6th',
            7:'7th',8:'8th',9:'9th',10:'10th',11:'11th',12:'12th'}

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

HOUSE_THEMES = {
    1:'Self & Personality',2:'Wealth & Family',3:'Courage & Siblings',
    4:'Home & Mother',5:'Intelligence & Children',6:'Health & Enemies',
    7:'Marriage & Partnerships',8:'Longevity & Occult',9:'Luck & Dharma',
    10:'Career & Status',11:'Gains & Aspirations',12:'Spirituality & Liberation',
}

# ── Custom Flowables ──────────────────────────────────────────

class ColoredRect(Flowable):
    def __init__(self, w, h, color, radius=4):
        Flowable.__init__(self)
        self.w, self.h, self.color, self.radius = w, h, color, radius
    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.roundRect(0, 0, self.w, self.h, self.radius, fill=1, stroke=0)

class PlanetBadge(Flowable):
    def __init__(self, name, rashi, house, deg, color):
        Flowable.__init__(self)
        self.name, self.rashi, self.house = name, rashi, house
        self.deg, self.color = deg, color
        self.width, self.height = 165, 52
    def draw(self):
        c = self.canv
        c.setFillColor(HexColor('#f8fafc'))
        c.roundRect(0, 0, self.width, self.height, 6, fill=1, stroke=0)
        c.setStrokeColor(self.color)
        c.setLineWidth(1.5)
        c.roundRect(0, 0, self.width, self.height, 6, fill=0, stroke=1)
        # Color accent bar
        c.setFillColor(self.color)
        c.roundRect(0, 0, 5, self.height, 3, fill=1, stroke=0)
        # Planet name
        c.setFillColor(self.color)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(12, 33, self.name)
        # Details
        c.setFillColor(HexColor('#374151'))
        c.setFont('Helvetica', 8)
        c.drawString(12, 22, f"House {self.house}  ·  {self.rashi}")
        c.drawString(12, 12, f"{self.deg}° in sign")

class SectionDivider(Flowable):
    def __init__(self, title, color=None, width=170*mm):
        Flowable.__init__(self)
        self.title = title
        self.color = color or PURPLE
        self.width = width
        self.height = 28
    def draw(self):
        c = self.canv
        c.setFillColor(self.color)
        c.roundRect(0, 4, self.width, 24, 4, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(12, 10, self.title)

class MiniChart(Flowable):
    """Draws a simplified North Indian Kundli chart"""
    def __init__(self, lagna_idx, planet_positions, size=130):
        Flowable.__init__(self)
        self.lagna_idx = lagna_idx
        self.planets = planet_positions
        self.size = size
        self.width = size
        self.height = size

    def draw(self):
        c = self.canv
        s = self.size
        cx, cy = s/2, s/2

        # Background
        c.setFillColor(HexColor('#f8f4ff'))
        c.rect(0, 0, s, s, fill=1, stroke=0)

        # Outer border
        c.setStrokeColor(HexColor('#7c3aed'))
        c.setLineWidth(1.5)
        c.rect(2, 2, s-4, s-4, fill=0, stroke=1)

        # Inner diamond
        c.setStrokeColor(HexColor('#c084fc'))
        c.setLineWidth(0.8)
        pts = [(cx, s-4),(s-4, cy),(cx, 4),(4, cy)]
        c.lines([(pts[0][0],pts[0][1],pts[1][0],pts[1][1]),
                 (pts[1][0],pts[1][1],pts[2][0],pts[2][1]),
                 (pts[2][0],pts[2][1],pts[3][0],pts[3][1]),
                 (pts[3][0],pts[3][1],pts[0][0],pts[0][1])])

        # Diagonals
        c.line(2, s-2, s-2, 2)
        c.line(2, 2, s-2, s-2)

        # House numbers and planet abbreviations
        house_centers = [
            (cx, s*0.82), (s*0.15, s*0.87), (s*0.08, cy),
            (s*0.15, s*0.13), (cx, s*0.18), (s*0.85, s*0.13),
            (s*0.92, cy), (s*0.85, s*0.87), (cx, s*0.5),
            (s*0.5, s*0.5), (s*0.5, s*0.5), (cx, s*0.5),
        ]
        # Recalculate proper centers
        house_centers = [
            (cx, s-16),       # H1 top
            (14, s-10),        # H2 top-left
            (8, cy),           # H3 left
            (14, 10),          # H4 bottom-left
            (cx, 16),          # H5 bottom
            (s-14, 10),        # H6 bottom-right
            (s-8, cy),         # H7 right
            (s-14, s-10),      # H8 top-right
            # Inner 4 — central diamond
            (cx, cy+18),       # H9
            (cx+18, cy),       # H10
            (cx, cy-18),       # H11
            (cx-18, cy),       # H12
        ]

        # Group planets by house
        house_planets = {h:[] for h in range(1,13)}
        for pname, pdata in self.planets.items():
            rashi = pdata.get('rashi','')
            if rashi in RASHIS_SA:
                ri = RASHIS_SA.index(rashi)
                house = (ri - self.lagna_idx) % 12 + 1
                abbr = pname[:2]
                house_planets[house].append(abbr)

        # Draw house numbers and planets
        for h in range(1, 13):
            if h-1 < len(house_centers):
                hx, hy = house_centers[h-1]
                rashi_num = (self.lagna_idx + h - 1) % 12 + 1

                c.setFillColor(HexColor('#7c3aed'))
                c.setFont('Helvetica-Bold', 6)
                c.drawCentredString(hx, hy+3, str(rashi_num))

                plist = house_planets.get(h, [])
                if plist:
                    c.setFillColor(HexColor('#1e1048'))
                    c.setFont('Helvetica', 5)
                    c.drawCentredString(hx, hy-5, ' '.join(plist[:3]))

PS_ABBR = {'Sun':'Su','Moon':'Mo','Mars':'Ma','Mercury':'Me','Jupiter':'Ju','Venus':'Ve','Saturn':'Sa','Rahu':'Ra','Ketu':'Ke'}

# ── Style builder ─────────────────────────────────────────────

def build_styles():
    base = getSampleStyleSheet()
    styles = {}

    styles['cover_title'] = ParagraphStyle('cover_title', fontName='Helvetica-Bold',
        fontSize=32, leading=40, textColor=white, alignment=TA_CENTER, spaceAfter=8)

    styles['cover_sub'] = ParagraphStyle('cover_sub', fontName='Helvetica',
        fontSize=14, leading=20, textColor=HexColor('#c084fc'), alignment=TA_CENTER, spaceAfter=4)

    styles['cover_detail'] = ParagraphStyle('cover_detail', fontName='Helvetica',
        fontSize=11, leading=16, textColor=HexColor('#e2e8f0'), alignment=TA_CENTER)

    styles['chapter_title'] = ParagraphStyle('chapter_title', fontName='Helvetica-Bold',
        fontSize=20, leading=26, textColor=PURPLE, spaceBefore=12, spaceAfter=10)

    styles['section_title'] = ParagraphStyle('section_title', fontName='Helvetica-Bold',
        fontSize=14, leading=18, textColor=DARK_PURPLE, spaceBefore=10, spaceAfter=6)

    styles['planet_title'] = ParagraphStyle('planet_title', fontName='Helvetica-Bold',
        fontSize=12, leading=16, textColor=PURPLE, spaceBefore=8, spaceAfter=4)

    styles['body'] = ParagraphStyle('body', fontName='Helvetica',
        fontSize=10, leading=16, textColor=HexColor('#1f2937'),
        alignment=TA_JUSTIFY, spaceAfter=8)

    styles['body_italic'] = ParagraphStyle('body_italic', fontName='Helvetica-Oblique',
        fontSize=10, leading=16, textColor=HexColor('#374151'),
        alignment=TA_JUSTIFY, spaceAfter=6)

    styles['callout'] = ParagraphStyle('callout', fontName='Helvetica',
        fontSize=10, leading=16, textColor=HexColor('#1f2937'),
        alignment=TA_JUSTIFY, spaceAfter=6,
        leftIndent=14, borderPadding=(8, 8, 8, 14))

    styles['label'] = ParagraphStyle('label', fontName='Helvetica-Bold',
        fontSize=8, leading=10, textColor=SLATE, spaceAfter=2)

    styles['value'] = ParagraphStyle('value', fontName='Helvetica-Bold',
        fontSize=11, leading=14, textColor=DARK_PURPLE, spaceAfter=4)

    styles['footer'] = ParagraphStyle('footer', fontName='Helvetica',
        fontSize=8, leading=10, textColor=SLATE, alignment=TA_CENTER)

    styles['toc_entry'] = ParagraphStyle('toc_entry', fontName='Helvetica',
        fontSize=11, leading=18, textColor=HexColor('#374151'))

    styles['toc_chapter'] = ParagraphStyle('toc_chapter', fontName='Helvetica-Bold',
        fontSize=12, leading=20, textColor=PURPLE)

    styles['quote'] = ParagraphStyle('quote', fontName='Helvetica-Oblique',
        fontSize=11, leading=18, textColor=HexColor('#4b5563'),
        alignment=TA_CENTER, spaceAfter=8)

    return styles

# ── Page templates ────────────────────────────────────────────

class CosmicaPageTemplate:
    def __init__(self, person_name, lagna, report_type="Full Life Report"):
        self.person_name = person_name
        self.lagna = lagna
        self.report_type = report_type

    def on_first_page(self, c, doc):
        pass  # Cover page handled separately

    def on_later_pages(self, c, doc):
        W, H = A4
        # Header bar
        c.setFillColor(DARK_PURPLE)
        c.rect(0, H-18*mm, W, 18*mm, fill=1, stroke=0)
        # Header text
        c.setFillColor(LIGHT_PURPLE)
        c.setFont('Helvetica', 8)
        c.drawString(15*mm, H-11*mm, f"COSMICA · {self.report_type.upper()}")
        c.setFillColor(white)
        c.setFont('Helvetica-Bold', 8)
        c.drawRightString(W-15*mm, H-11*mm, self.person_name.upper())

        # Footer
        c.setFillColor(HexColor('#f1f5f9'))
        c.rect(0, 0, W, 12*mm, fill=1, stroke=0)
        c.setFillColor(SLATE)
        c.setFont('Helvetica', 7)
        c.drawString(15*mm, 4*mm, f"Generated by Cosmica · {datetime.now().strftime('%B %d, %Y')} · Confidential")
        c.drawRightString(W-15*mm, 4*mm, f"Page {doc.page}")
        # Footer line
        c.setStrokeColor(HexColor('#e2e8f0'))
        c.setLineWidth(0.5)
        c.line(15*mm, 12*mm, W-15*mm, 12*mm)

# ── Content builder helpers ───────────────────────────────────

def info_table(data, styles, col_widths=None):
    """2-column info table"""
    tdata = [[Paragraph(f'<b>{k}</b>', styles['label']),
              Paragraph(str(v), styles['value'])] for k,v in data.items()]
    t = Table(tdata, colWidths=col_widths or [55*mm, 100*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), HexColor('#f8f4ff')),
        ('BACKGROUND', (1,0), (1,-1), white),
        ('GRID',       (0,0), (-1,-1), 0.4, BORDER),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [HexColor('#f8f4ff'), white]),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0),(-1,-1), 5),
        ('LEFTPADDING',(0,0), (-1,-1), 8),
        ('RIGHTPADDING',(0,0),(-1,-1), 8),
        ('FONTNAME',   (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (0,-1), 8),
        ('TEXTCOLOR',  (0,0), (0,-1), SLATE),
        ('FONTNAME',   (1,0), (1,-1), 'Helvetica-Bold'),
        ('FONTSIZE',   (1,0), (1,-1), 11),
        ('TEXTCOLOR',  (1,0), (1,-1), DARK_PURPLE),
    ]))
    return t

def planet_table(planets, lagna_idx, styles):
    """Full planet positions table"""
    headers = ['Planet','Sign','Degree','House','Nature']
    data = [headers]
    planet_order = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']
    for pname in planet_order:
        if pname not in planets: continue
        p = planets[pname]
        rashi = p.get('rashi', '')
        rashi_en = p.get('rashi_en', '')
        ri = RASHIS_SA.index(rashi) if rashi in RASHIS_SA else 0
        house = (ri - lagna_idx) % 12 + 1
        deg = p.get('degree', 0)
        nature = 'Malefic' if pname in ['Saturn','Mars','Rahu','Ketu'] else 'Benefic'
        data.append([pname, f"{rashi} ({rashi_en})", f"{deg:.1f}°", str(house), nature])

    col_widths = [30*mm, 52*mm, 26*mm, 22*mm, 28*mm]
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND',  (0,0), (-1,0), DARK_PURPLE),
        ('TEXTCOLOR',   (0,0), (-1,0), white),
        ('FONTNAME',    (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',    (0,0), (-1,-1), 9),
        ('ALIGN',       (0,0), (-1,-1), 'CENTER'),
        ('VALIGN',      (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[HexColor('#faf9ff'),white]),
        ('GRID',        (0,0), (-1,-1), 0.4, BORDER),
        ('TOPPADDING',  (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),
    ]))
    # Color planet names
    for i, pname in enumerate(planet_order, 1):
        if i < len(data):
            col = PLANET_COLORS.get(pname, PURPLE)
            t.setStyle(TableStyle([('TEXTCOLOR',(0,i),(0,i), col),
                                    ('FONTNAME', (0,i),(0,i),'Helvetica-Bold')]))
    return t

def callout_box(text, color, styles, title=None):
    """Highlighted callout box"""
    items = []
    if title:
        items.append(Paragraph(f'<b>{title}</b>', ParagraphStyle('ct', fontName='Helvetica-Bold',
            fontSize=10, textColor=color, spaceAfter=4)))
    items.append(Paragraph(text, styles['callout']))
    t = Table([[items]], colWidths=[158*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor(f'{color.hexval()}18') if hasattr(color,'hexval') else HexColor('#7c3aed18')),
        ('LEFTPADDING',(0,0),(-1,-1), 14),
        ('RIGHTPADDING',(0,0),(-1,-1),10),
        ('TOPPADDING', (0,0),(-1,-1), 10),
        ('BOTTOMPADDING',(0,0),(-1,-1),10),
        ('LINEAFTER', (0,0),(0,-1), 4, color),
        ('ROUNDEDCORNERS',[4]),
    ]))
    return t

def reading_block(title, reading_type, text, planet_color, styles):
    """A single reading entry"""
    items = []
    type_colors = {'planet_house': PURPLE, 'planet_sign': TEAL, 'lord_house': GOLD}
    type_labels = {'planet_house': 'Planet in House', 'planet_sign': 'Planet in Sign', 'lord_house': 'Lord in House'}
    tc = type_colors.get(reading_type, PURPLE)
    tl = type_labels.get(reading_type, reading_type)

    # Title row
    title_para = Paragraph(
        f'<font color="#{tc.hexval() if hasattr(tc,"hexval") else "7c3aed"}"><b>{title}</b></font>'
        f'  <font size="7" color="#64748b"><i>— {tl}</i></font>',
        styles['planet_title'])
    items.append(title_para)

    # Clean text
    clean_text = text.replace('<','&lt;').replace('>','&gt;')
    items.append(Paragraph(clean_text, styles['body']))
    items.append(Spacer(1, 4))
    return items

# ── AI content generator ──────────────────────────────────────

async def generate_ai_section(section_name, context, openai_key):
    """Generate AI text for a specific report section"""
    if not openai_key or not openai_key.startswith('sk-'):
        return f"[AI content for {section_name} — configure OpenAI key to enable]"
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization":f"Bearer {openai_key}","Content-Type":"application/json"},
                json={
                    "model":"gpt-4o-mini",
                    "messages":[
                        {"role":"system","content":"You are an expert Vedic astrologer writing a detailed professional astrology report. Write in flowing paragraphs, specific, insightful, and personal. No bullet points. 2-3 paragraphs per section."},
                        {"role":"user","content":context}
                    ],
                    "temperature":0.7,"max_tokens":600
                },
                timeout=25.0
            )
            return res.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"AI synthesis unavailable for this section. ({str(e)[:50]})"

# ── Main PDF builder ──────────────────────────────────────────

async def build_pdf(req_data: dict) -> bytes:
    kundli      = req_data['kundli']
    lagna       = req_data['lagna']
    person_name = req_data.get('person_name','Native')
    birth_date  = req_data.get('birth_date','')
    birth_time  = req_data.get('birth_time','')
    birth_place = req_data.get('birth_place','')
    report_type = req_data.get('report_type','Full Life Report')
    openai_key  = settings.OPENAI_API_KEY

    pp          = kundli.get('planetary_positions', {})
    lagna_idx   = RASHIS_SA.index(lagna) if lagna in RASHIS_SA else 0
    lords_map   = PLANET_LORDS_MAP.get(lagna, {})

    styles = build_styles()
    W, H   = A4

    # ── Pull ALL knowledge from DB in parallel ─────────────────
    async def fetch_planet_data(pname):
        pdata = pp.get(pname, {})
        rashi = pdata.get('rashi','')
        if rashi not in RASHIS_SA: return pname, []
        ri    = RASHIS_SA.index(rashi)
        house = (ri - lagna_idx) % 12 + 1
        readings = []
        # Planet in house
        ph = await db.planet_house_knowledge.find_one({"planet":pname,"house":house,"lagna":lagna})
        if not ph: ph = await db.planet_house_knowledge.find_one({"planet":pname,"house":house,"lagna":None})
        if ph and ph.get('text'): readings.append(('planet_house', f"{pname} in House {house}", ph['text']))
        # Planet in sign
        ps = await db.planet_sign_knowledge.find_one({"planet":pname,"rashi":rashi})
        if ps and ps.get('text'): readings.append(('planet_sign', f"{pname} in {rashi}", ps['text']))
        # Lord readings
        owned = lords_map.get(pname)
        if owned:
            if isinstance(owned, int): owned = [owned]
            for oh in owned:
                lh = await db.lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":house,"lagna":lagna})
                if not lh: lh = await db.lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":house,"lagna":None})
                if lh and lh.get('text'): readings.append(('lord_house', f"{ORDINALS[oh]} Lord in House {house}", lh['text']))
        return pname, readings

    planet_order = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']
    tasks        = [fetch_planet_data(p) for p in planet_order if p in pp]
    all_readings = dict(await asyncio.gather(*tasks))

    # ── Build AI sections (parallel) ──────────────────────────
    chart_summary = f"{person_name}, {lagna} Lagna. Born: {birth_date} {birth_time} at {birth_place}.\n"
    for pname, readings in all_readings.items():
        if readings:
            pdata = pp.get(pname,{})
            chart_summary += f"{pname} in {pdata.get('rashi_en','')} (House {(RASHIS_SA.index(pdata.get('rashi','Mesha'))-lagna_idx)%12+1 if pdata.get('rashi','') in RASHIS_SA else '?'}). "

    ai_tasks = {
        'overview': generate_ai_section('Chart Overview',
            f"Write a compelling 2-paragraph introduction for {person_name}'s astrological report. {lagna} Lagna. {chart_summary} Focus on overall life themes, soul purpose, and dominant planetary energies.", openai_key),
        'personality': generate_ai_section('Personality',
            f"Describe {person_name}'s personality, physical appearance, and life approach. {lagna} Lagna rising. Lagna lord placement: {pp.get('Mars',pp.get('Venus',pp.get('Mercury',{})))}. Write 2-3 detailed paragraphs.", openai_key),
        'career': generate_ai_section('Career',
            f"Describe career, profession, and public life for {person_name}. 10th house from {lagna}. 10th lord and planets in 10th house based on {chart_summary}. Write 2-3 detailed paragraphs.", openai_key),
        'relationships': generate_ai_section('Relationships',
            f"Describe love, marriage, and partnership for {person_name}. 7th house from {lagna}. Venus placement: {pp.get('Venus',{}).get('rashi','')}. Write 2-3 detailed paragraphs.", openai_key),
        'wealth': generate_ai_section('Wealth',
            f"Describe financial prospects and wealth patterns for {person_name}. 2nd and 11th houses from {lagna}. Jupiter placement: {pp.get('Jupiter',{}).get('rashi','')}. Write 2-3 detailed paragraphs.", openai_key),
        'health': generate_ai_section('Health',
            f"Describe health patterns, constitution, and areas of attention for {person_name}. {lagna} Lagna. Moon placement: {pp.get('Moon',{}).get('rashi','')}. Write 2 detailed paragraphs.", openai_key),
        'spirituality': generate_ai_section('Spirituality',
            f"Describe spiritual path, dharma, and higher purpose for {person_name}. 9th and 12th houses from {lagna}. Jupiter and Ketu placements. Write 2 detailed paragraphs.", openai_key),
        'remedies': generate_ai_section('Remedies',
            f"Suggest specific Vedic remedies for {person_name} with {lagna} Lagna. Include gemstones, mantras, charitable activities, and lifestyle recommendations based on {chart_summary}. Be specific.", openai_key),
    }

    ai_results = {}
    ai_gathered = await asyncio.gather(*ai_tasks.values(), return_exceptions=True)
    for key, result in zip(ai_tasks.keys(), ai_gathered):
        ai_results[key] = str(result) if isinstance(result, Exception) else result

    # ── Build PDF document ────────────────────────────────────
    buf      = io.BytesIO()
    template = CosmicaPageTemplate(person_name, lagna, report_type)

    doc = SimpleDocTemplate(buf, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm,
        topMargin=22*mm, bottomMargin=18*mm,
        title=f"{person_name} — {report_type}",
        author="Cosmica Vedic Astrology",
    )

    story = []

    # ══════════════════════════════════════════════════════════
    # PAGE 1: COVER
    # ══════════════════════════════════════════════════════════
    def draw_cover(canvas, doc):
        canvas.saveState()
        # Deep background
        canvas.setFillColor(DEEP_NAVY)
        canvas.rect(0, 0, W, H, fill=1, stroke=0)
        # Top gradient band
        canvas.setFillColor(DARK_PURPLE)
        canvas.rect(0, H-80*mm, W, 80*mm, fill=1, stroke=0)
        # Gold accent line
        canvas.setFillColor(GOLD)
        canvas.rect(0, H-82*mm, W, 2*mm, fill=1, stroke=0)
        # Purple accent line at bottom
        canvas.setFillColor(PURPLE)
        canvas.rect(0, 25*mm, W, 1.5*mm, fill=1, stroke=0)
        canvas.setFillColor(DEEP_NAVY)
        canvas.rect(0, 0, W, 25*mm, fill=1, stroke=0)

        # Stars pattern
        import random; random.seed(42)
        canvas.setFillColor(white)
        for _ in range(120):
            sx = random.uniform(0, W)
            sy = random.uniform(0, H)
            sr = random.uniform(0.3, 1.2)
            canvas.circle(sx, sy, sr, fill=1, stroke=0)

        # Cosmica logo text
        canvas.setFillColor(LIGHT_PURPLE)
        canvas.setFont('Helvetica', 10)
        canvas.drawCentredString(W/2, H-22*mm, '✦  C O S M I C A  ✦')
        # Subtitle
        canvas.setFillColor(HexColor('#94a3b8'))
        canvas.setFont('Helvetica', 9)
        canvas.drawCentredString(W/2, H-30*mm, 'VEDIC ASTROLOGY REPORT')

        # Report type
        canvas.setFillColor(white)
        canvas.setFont('Helvetica-Bold', 28)
        canvas.drawCentredString(W/2, H-58*mm, report_type.upper())

        # Gold line under title
        canvas.setFillColor(GOLD)
        canvas.rect(W/2-30*mm, H-63*mm, 60*mm, 0.8*mm, fill=1, stroke=0)

        # Person name - large
        canvas.setFillColor(GOLD)
        canvas.setFont('Helvetica-Bold', 36)
        canvas.drawCentredString(W/2, H/2+10*mm, person_name)

        # Divider
        canvas.setFillColor(LIGHT_PURPLE)
        canvas.setFont('Helvetica', 11)
        canvas.drawCentredString(W/2, H/2-5*mm, f'{lagna} Lagna  ·  {kundli.get("nakshatra",{}).get("name","") if isinstance(kundli.get("nakshatra"),dict) else ""} Nakshatra')

        # Birth details box
        canvas.setFillColor(HexColor('#1a1040'))
        canvas.roundRect(W/2-55*mm, H/2-42*mm, 110*mm, 28*mm, 4*mm, fill=1, stroke=0)
        canvas.setStrokeColor(PURPLE)
        canvas.setLineWidth(1)
        canvas.roundRect(W/2-55*mm, H/2-42*mm, 110*mm, 28*mm, 4*mm, fill=0, stroke=1)
        canvas.setFillColor(HexColor('#94a3b8'))
        canvas.setFont('Helvetica', 8)
        canvas.drawCentredString(W/2, H/2-18*mm, f"Date: {birth_date}  ·  Time: {birth_time}")
        canvas.drawCentredString(W/2, H/2-26*mm, f"Place: {birth_place}")
        canvas.setFillColor(LIGHT_PURPLE)
        canvas.setFont('Helvetica', 9)
        canvas.drawCentredString(W/2, H/2-34*mm, f"Prepared by Cosmica  ·  {datetime.now().strftime('%B %d, %Y')}")

        # Bottom watermark
        canvas.setFillColor(HexColor('#1a1040'))
        canvas.setFont('Helvetica', 8)
        canvas.drawCentredString(W/2, 10*mm, 'This report is confidential and prepared exclusively for the native.')

        canvas.restoreState()

    story.append(NextPageTemplate('normal'))
    story.append(FrameBreak_or_NextPage())

    # We'll use a simpler approach — build cover as first page manually
    # then add rest with normal template

    # ══════════════════════════════════════════════════════════
    # PAGE 2: TABLE OF CONTENTS
    # ══════════════════════════════════════════════════════════
    story = []  # Reset — cover will be drawn via onFirstPage
    chapters = [
        ('1', 'Birth Details & Chart Overview', 3),
        ('2', 'Planetary Positions & Chart', 5),
        ('3', 'Personality & Physical Constitution', 7),
        ('4', 'Career, Profession & Public Life', 9),
        ('5', 'Wealth, Finance & Prosperity', 11),
        ('6', 'Love, Marriage & Relationships', 13),
        ('7', 'Health & Longevity', 15),
        ('8', 'Spirituality & Higher Purpose', 17),
        ('9', 'Detailed Planetary Readings', 19),
        ('10', 'Yogas & Special Combinations', 28),
        ('11', 'Remedies & Recommendations', 32),
        ('12', 'Closing Notes', 35),
    ]

    story.append(Paragraph('Table of Contents', styles['chapter_title']))
    story.append(HRFlowable(width='100%', thickness=1, color=PURPLE, spaceAfter=12))
    for num, title, pg in chapters:
        toc_row = Table([
            [Paragraph(f'<b>{num}.</b> {title}', styles['toc_entry']),
             Paragraph(str(pg), ParagraphStyle('pgnum', fontName='Helvetica',
                fontSize=11, alignment=TA_RIGHT, textColor=PURPLE))]
        ], colWidths=[140*mm, 18*mm])
        toc_row.setStyle(TableStyle([
            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
            ('TOPPADDING',(0,0),(-1,-1),4),
            ('BOTTOMPADDING',(0,0),(-1,-1),4),
            ('LINEBELOW',(0,0),(-1,-1),0.3,HexColor('#e2e8f0')),
        ]))
        story.append(toc_row)

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 1: BIRTH DETAILS
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 1 · Birth Details & Chart Overview', PURPLE))
    story.append(Spacer(1, 8))

    birth_info = {
        'Full Name': person_name,
        'Date of Birth': birth_date,
        'Time of Birth': birth_time,
        'Place of Birth': birth_place,
        'Lagna (Ascendant)': f"{lagna} ({RASHIS_EN[lagna_idx]})",
        'Moon Sign (Rashi)': f"{pp.get('Moon',{}).get('rashi','')} ({pp.get('Moon',{}).get('rashi_en','')})",
        'Nakshatra': kundli.get('nakshatra',{}).get('name','') if isinstance(kundli.get('nakshatra'),dict) else '',
        'Ayanamsa': 'Lahiri (Chitrapaksha)',
        'Chart System': 'North Indian, Sidereal',
    }
    story.append(info_table(birth_info, styles))
    story.append(Spacer(1, 12))

    story.append(Paragraph('Chart Overview', styles['section_title']))
    story.append(Paragraph(ai_results.get('overview', ''), styles['body']))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 2: PLANETARY POSITIONS
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 2 · Planetary Positions', TEAL))
    story.append(Spacer(1, 8))

    # Mini chart + planet badges side by side
    chart_flow = MiniChart(lagna_idx, pp, size=130)

    # Planet badges
    badge_items = []
    for pname in planet_order:
        if pname not in pp: continue
        pdata = pp[pname]
        rashi = pdata.get('rashi','')
        ri    = RASHIS_SA.index(rashi) if rashi in RASHIS_SA else 0
        house = (ri - lagna_idx) % 12 + 1
        deg   = pdata.get('degree', 0)
        col   = PLANET_COLORS.get(pname, PURPLE)
        badge_items.append(PlanetBadge(pname, pdata.get('rashi_en',rashi), house, deg, col))

    story.append(Paragraph('Kundli Chart (North Indian)', styles['section_title']))
    story.append(chart_flow)
    story.append(Spacer(1, 10))
    story.append(Paragraph('Planetary Positions Table', styles['section_title']))
    story.append(planet_table(pp, lagna_idx, styles))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 3: PERSONALITY
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 3 · Personality & Physical Constitution', PURPLE))
    story.append(Spacer(1, 8))
    story.append(Paragraph(ai_results.get('personality',''), styles['body']))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 4: CAREER
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 4 · Career, Profession & Public Life', HexColor('#0f766e')))
    story.append(Spacer(1, 8))
    story.append(Paragraph(ai_results.get('career',''), styles['body']))

    # Career readings from DB
    tenth_house_planets = [p for p,d in pp.items() if d.get('rashi','') in RASHIS_SA and
                           (RASHIS_SA.index(d['rashi'])-lagna_idx)%12+1 == 10]
    if tenth_house_planets:
        story.append(Paragraph(f'Planets in 10th House: {", ".join(tenth_house_planets)}', styles['section_title']))
        for pname in tenth_house_planets:
            if pname in all_readings:
                for rtype, rtitle, rtext in all_readings[pname]:
                    if rtype == 'planet_house':
                        for item in reading_block(rtitle, rtype, rtext, PLANET_COLORS.get(pname,PURPLE), styles):
                            story.append(item)
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 5: WEALTH
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 5 · Wealth, Finance & Prosperity', GOLD))
    story.append(Spacer(1, 8))
    story.append(Paragraph(ai_results.get('wealth',''), styles['body']))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 6: RELATIONSHIPS
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 6 · Love, Marriage & Relationships', ROSE))
    story.append(Spacer(1, 8))
    story.append(Paragraph(ai_results.get('relationships',''), styles['body']))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 7: HEALTH
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 7 · Health & Longevity', HexColor('#16a34a')))
    story.append(Spacer(1, 8))
    story.append(Paragraph(ai_results.get('health',''), styles['body']))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 8: SPIRITUALITY
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 8 · Spirituality & Higher Purpose', HexColor('#7c3aed')))
    story.append(Spacer(1, 8))
    story.append(Paragraph(ai_results.get('spirituality',''), styles['body']))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 9: DETAILED PLANETARY READINGS (the meat)
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 9 · Detailed Planetary Readings', PURPLE))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'This chapter contains detailed readings for each planet based on its position in your chart. '
        'These readings come directly from the astrologer\'s personal knowledge base.',
        styles['body_italic']))
    story.append(Spacer(1, 8))

    for pname in planet_order:
        if pname not in pp or pname not in all_readings: continue
        readings = all_readings[pname]
        if not readings: continue

        pdata  = pp[pname]
        rashi  = pdata.get('rashi','')
        ri     = RASHIS_SA.index(rashi) if rashi in RASHIS_SA else 0
        house  = (ri - lagna_idx) % 12 + 1
        pcol   = PLANET_COLORS.get(pname, PURPLE)

        # Planet header
        story.append(Spacer(1, 6))
        story.append(SectionDivider(
            f'{pname}  ·  House {house}  ·  {pdata.get("rashi_en", rashi)}  ·  {pdata.get("degree",0):.1f}°',
            pcol))
        story.append(Spacer(1, 6))
        story.append(Paragraph(HOUSE_THEMES.get(house,''), styles['body_italic']))
        story.append(Spacer(1, 4))

        for rtype, rtitle, rtext in readings:
            for item in reading_block(rtitle, rtype, rtext, pcol, styles):
                story.append(item)

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # CHAPTER 11: REMEDIES
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Chapter 11 · Remedies & Recommendations', GOLD))
    story.append(Spacer(1, 8))
    story.append(Paragraph(ai_results.get('remedies',''), styles['body']))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════
    # FINAL PAGE: CLOSING
    # ══════════════════════════════════════════════════════════
    story.append(SectionDivider('Closing Notes', SLATE))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        'This report has been generated by Cosmica using a combination of traditional Vedic astrology knowledge '
        'from the expert knowledge base and AI-assisted synthesis. The interpretations are based on your exact '
        'birth data calculated using the Swiss Ephemeris with Lahiri (Chitrapaksha) ayanamsa.',
        styles['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        '<i>"Jyotish is the lamp that illuminates the path — the journey is yours to walk."</i>',
        styles['quote']))
    story.append(Spacer(1, 12))
    disclaimer = [
        ['Disclaimer'],
        ['Vedic astrology is an ancient system of guidance, not a deterministic science. '
         'The readings in this report are meant to provide insight and perspective, not to '
         'predict the future with certainty. Use this report as a tool for self-understanding '
         'and spiritual growth. Always consult qualified professionals for medical, legal, '
         'financial, and other important decisions.']
    ]
    dt = Table(disclaimer, colWidths=[158*mm])
    dt.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),DARK_PURPLE),
        ('TEXTCOLOR', (0,0),(-1,0),white),
        ('FONTNAME',  (0,0),(-1,0),'Helvetica-Bold'),
        ('FONTSIZE',  (0,0),(-1,-1),9),
        ('BACKGROUND',(0,1),(-1,-1),HexColor('#f8f4ff')),
        ('TEXTCOLOR', (0,1),(-1,-1),SLATE),
        ('PADDING',   (0,0),(-1,-1),8),
        ('ALIGN',     (0,0),(-1,-1),'LEFT'),
    ]))
    story.append(dt)

    # ── Build the PDF ─────────────────────────────────────────
    def make_first_page(canvas, doc):
        draw_cover(canvas, doc)

    def make_later_pages(canvas, doc):
        template.on_later_pages(canvas, doc)

    doc.build(story,
              onFirstPage=make_first_page,
              onLaterPages=make_later_pages)

    return buf.getvalue()

# Helper classes needed
class NextPageTemplate(Flowable):
    def __init__(self, pt): self.pt = pt; self.width=self.height=0
    def draw(self): pass

class FrameBreak_or_NextPage(Flowable):
    def __init__(self): self.width=self.height=0
    def draw(self): pass

# Fix: use proper PageBreak for cover separation
def get_story_with_cover():
    pass  # handled inline

# ── API endpoint ──────────────────────────────────────────────

class ReportRequest(BaseModel):
    kundli:       dict
    lagna:        str
    person_name:  str
    birth_date:   str
    birth_time:   str
    birth_place:  str
    report_type:  Optional[str] = "Full Life Report"

@router.post("/generate")
async def generate_report(req: ReportRequest):
    try:
        pdf_bytes = await build_pdf(req.dict())
        filename  = f"Cosmica_{req.person_name.replace(' ','_')}_Report.pdf"
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.post("/preview-status")
async def check_preview(req: ReportRequest):
    """Quick check — returns estimated pages and sections available"""
    kundli      = req.kundli
    lagna       = req.lagna
    lagna_idx   = RASHIS_SA.index(lagna) if lagna in RASHIS_SA else 0
    pp          = kundli.get('planetary_positions', {})
    lords_map   = PLANET_LORDS_MAP.get(lagna, {})
    planet_order= ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']

    total_readings = 0
    for pname in planet_order:
        if pname not in pp: continue
        pdata = pp[pname]
        rashi = pdata.get('rashi','')
        if rashi not in RASHIS_SA: continue
        ri    = RASHIS_SA.index(rashi)
        house = (ri - lagna_idx) % 12 + 1
        ph = await db.planet_house_knowledge.find_one({"planet":pname,"house":house})
        if ph: total_readings += 1
        ps = await db.planet_sign_knowledge.find_one({"planet":pname,"rashi":rashi})
        if ps: total_readings += 1

    return {
        "ready": True,
        "estimated_pages": max(15, min(40, 5 + total_readings * 2)),
        "db_readings": total_readings,
        "ai_sections": 8,
        "chapters": 12,
        "person_name": req.person_name,
    }