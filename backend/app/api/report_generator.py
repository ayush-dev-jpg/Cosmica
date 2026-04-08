# app/api/report_generator.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import db
from app.core.config import settings
import asyncio, httpx, io
from datetime import datetime

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

class ReportRequest(BaseModel):
    kundli:      dict
    lagna:       str
    person_name: Optional[str] = 'Native'
    birth_date:  Optional[str] = ''
    birth_time:  Optional[str] = ''
    birth_place: Optional[str] = ''
    report_type: Optional[str] = 'full_life'

async def ai_text(prompt, key):
    if not key or not key.startswith('sk-'):
        return None
    try:
        async with httpx.AsyncClient() as c:
            r = await c.post("https://api.openai.com/v1/chat/completions",
                headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},
                json={"model":"gpt-4o-mini","messages":[
                    {"role":"system","content":"You are an expert Vedic astrologer. Write 2 short insightful paragraphs (no bullet points) for this report section based on the chart context given."},
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
            ri      = (lagna_idx + h - 1) % 12
            rashi   = RASHIS_SA[ri]
            rashi_en= RASHIS_EN[ri]

            house_planets = [p for p,d in pp.items()
                if d.get('rashi','') in RASHIS_SA and
                (RASHIS_SA.index(d['rashi'])-lagna_idx)%12+1==h]

            lord = next((p for p,v in lords_map.items()
                if (isinstance(v,int) and v==h) or (isinstance(v,list) and h in v)), None)

            houses_info.append({'house':h,'rashi':rashi,'rashi_en':rashi_en,
                                'lord':lord or '','planets':house_planets})

            for pname in house_planets:
                pdata = pp.get(pname,{})
                d = await db.planet_house_knowledge.find_one({"planet":pname,"house":h,"lagna":lagna})
                if not d: d = await db.planet_house_knowledge.find_one({"planet":pname,"house":h,"lagna":None})
                if d and d.get('text'):
                    db_knowledge.append({'type':'planet_house','title':f"{pname} in House {h}",'text':d['text']})

                d2 = await db.planet_sign_knowledge.find_one({"planet":pname,"rashi":pdata.get('rashi','')})
                if d2 and d2.get('text'):
                    db_knowledge.append({'type':'planet_sign','title':f"{pname} in {pdata.get('rashi_en','')}",'text':d2['text']})

            if lord:
                owned = lords_map.get(lord,[])
                if isinstance(owned,int): owned=[owned]
                for oh in owned:
                    d3 = await db.lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":h,"lagna":lagna})
                    if not d3: d3 = await db.lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":h,"lagna":None})
                    if d3 and d3.get('text'):
                        db_knowledge.append({'type':'lord_house','title':f"{ORDINALS[oh]} Lord ({lord}) in House {h}",'text':d3['text']})

    if 'planets' in sdef:
        for pname in sdef['planets']:
            if pname not in pp: continue
            pdata = pp[pname]; rashi = pdata.get('rashi','')
            if rashi not in RASHIS_SA: continue
            ri    = RASHIS_SA.index(rashi)
            house = (ri-lagna_idx)%12+1

            d = await db.planet_house_knowledge.find_one({"planet":pname,"house":house,"lagna":lagna})
            if not d: d = await db.planet_house_knowledge.find_one({"planet":pname,"house":house,"lagna":None})
            if d and d.get('text'):
                db_knowledge.append({'type':'planet_house','title':f"{pname} in House {house}",'text':d['text']})

            d2 = await db.planet_sign_knowledge.find_one({"planet":pname,"rashi":rashi})
            if d2 and d2.get('text'):
                db_knowledge.append({'type':'planet_sign','title':f"{pname} in {pdata.get('rashi_en',rashi)}",'text':d2['text']})

            owned = lords_map.get(pname,[])
            if isinstance(owned,int): owned=[owned]
            for oh in (owned or []):
                d3 = await db.lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":house,"lagna":lagna})
                if not d3: d3 = await db.lord_in_house_knowledge.find_one({"lord_house":oh,"placed_in_house":house,"lagna":None})
                if d3 and d3.get('text'):
                    db_knowledge.append({'type':'lord_house','title':f"{ORDINALS[oh]} Lord ({pname}) in House {house}",'text':d3['text']})

    return db_knowledge, houses_info

def get_section_defs(report_type):
    if report_type == 'marriage':
        return [
            {'name':'7th House — Spouse & Marriage','description':'Characteristics of spouse, timing and nature of marriage','houses':[7]},
            {'name':'Venus — Love & Romance','description':'Venus placement and its effect on love and relationships','planets':['Venus']},
            {'name':'2nd House — Family Life','description':'Family happiness and domestic environment','houses':[2]},
            {'name':'5th House — Romance & Children','description':'Love affairs and romantic inclinations','houses':[5]},
            {'name':'8th House — Deep Intimacy','description':'Transformation and deep bonding through relationships','houses':[8]},
            {'name':'Moon — Emotional Patterns','description':'Emotional needs and patterns in relationships','planets':['Moon']},
            {'name':'Jupiter — Marriage Blessings','description':'Jupiter\'s role in marriage luck and family expansion','planets':['Jupiter']},
        ]
    elif report_type == 'career':
        return [
            {'name':'10th House — Profession & Status','description':'Career, vocation, public image','houses':[10]},
            {'name':'6th House — Work & Service','description':'Daily work environment and colleagues','houses':[6]},
            {'name':'2nd House — Income','description':'Primary income sources and financial speech','houses':[2]},
            {'name':'11th House — Gains','description':'Professional gains and fulfillment of ambitions','houses':[11]},
            {'name':'Saturn — Discipline & Karma','description':'Career obstacles, hard work and lasting achievements','planets':['Saturn']},
            {'name':'Sun — Authority & Recognition','description':'Leadership potential and government/authority connections','planets':['Sun']},
            {'name':'Mercury — Business Skills','description':'Communication, business acumen and analytical work','planets':['Mercury']},
        ]
    else:  # full_life
        return [
            {'name':'1st House — Self & Personality','description':'Overall personality, health and life approach','houses':[1]},
            {'name':'2nd House — Wealth & Family','description':'Finances, family relations and accumulated assets','houses':[2]},
            {'name':'4th House — Home & Mother','description':'Home life, property, mother and inner happiness','houses':[4]},
            {'name':'5th House — Intelligence & Children','description':'Education, children and creative potential','houses':[5]},
            {'name':'7th House — Marriage & Partners','description':'Spouse, partnerships and business relationships','houses':[7]},
            {'name':'9th House — Luck & Dharma','description':'Fortune, father, higher education and spirituality','houses':[9]},
            {'name':'10th House — Career & Status','description':'Profession, achievements and public life','houses':[10]},
            {'name':'11th House — Gains & Network','description':'Income, desires and social connections','houses':[11]},
            {'name':'Sun — Soul & Vitality','description':'Vitality, father, ego and leadership','planets':['Sun']},
            {'name':'Moon — Mind & Emotions','description':'Mental patterns, mother and emotional intelligence','planets':['Moon']},
            {'name':'Jupiter — Wisdom & Blessings','description':'Fortune, children, higher wisdom and expansion','planets':['Jupiter']},
            {'name':'Saturn — Karma & Lessons','description':'Karmic work, discipline, longevity and transformation','planets':['Saturn']},
        ]

@router.post("/preview-status")
async def report_preview(req: ReportRequest):
    """Full report data — sections, DB knowledge, AI insights"""
    kundli    = req.kundli
    lagna     = req.lagna
    lagna_idx = RASHIS_SA.index(lagna) if lagna in RASHIS_SA else 0
    lords_map = PLANET_LORDS_MAP.get(lagna, {})
    pp        = kundli.get('planetary_positions', {})
    nakshatra = kundli.get('nakshatra',{}).get('name','') if isinstance(kundli.get('nakshatra'),dict) else ''
    moon_rashi= pp.get('Moon',{}).get('rashi_en','')

    section_defs = get_section_defs(req.report_type or 'full_life')

    # Fetch all sections in parallel
    tasks = [fetch_section_knowledge(s, pp, lagna, lagna_idx, lords_map) for s in section_defs]
    results = await asyncio.gather(*tasks)

    total_db   = 0
    sections   = []
    ai_tasks   = []

    for sdef, (db_knowledge, houses_info) in zip(section_defs, results):
        total_db += len(db_knowledge)
        db_text   = '\n'.join([f"{k['title']}: {k['text'][:200]}" for k in db_knowledge[:4]])
        prompt    = f"Report section: {sdef['name']}. {sdef['description']}. {lagna} Lagna. Chart context: {db_text}"
        ai_tasks.append(ai_text(prompt, settings.OPENAI_API_KEY))
        sections.append({'sdef':sdef,'db_knowledge':db_knowledge,'houses_info':houses_info})

    ai_results = await asyncio.gather(*ai_tasks, return_exceptions=True)

    sections_out = []
    for i, (sec, ai_r) in enumerate(zip(sections, ai_results)):
        sections_out.append({
            'name':        sec['sdef']['name'],
            'description': sec['sdef']['description'],
            'houses':      sec['houses_info'],
            'db_knowledge':sec['db_knowledge'],
            'db_count':    len(sec['db_knowledge']),
            'ai_insight':  str(ai_r) if ai_r and not isinstance(ai_r, Exception) else None,
        })

    # Base knowledge
    base_knowledge = []
    r = await db.rashi_knowledge.find_one({"rashi":lagna})
    if r and r.get('text'): base_knowledge.append({'type':'rashi','title':f"Lagna: {lagna}",'text':r['text']})
    n = await db.nakshatra_knowledge.find_one({"nakshatra":nakshatra})
    if n and n.get('text'): base_knowledge.append({'type':'nakshatra','title':f"Nakshatra: {nakshatra}",'text':n['text']})

    return {
        'ready':True,'person_name':req.person_name,'lagna':lagna,
        'moon_rashi':moon_rashi,'nakshatra':nakshatra,
        'report_type':req.report_type,
        'total_db_entries':total_db,'total_sections':len(sections_out),
        'sections':sections_out,'base_knowledge':base_knowledge,
        'estimated_pages':max(15,min(40,5+total_db*2)),
    }

@router.post("/generate")
async def generate_pdf(req: ReportRequest):
    """Generate and stream PDF"""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm
        from reportlab.lib.colors import HexColor, white
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT

        # Get full report data first
        report_data = await report_preview(req)

        buf  = io.BytesIO()
        W, H = A4
        PURPLE = HexColor('#7c3aed')
        GOLD   = HexColor('#f59e0b')
        DARK   = HexColor('#1a0f35')
        SLATE  = HexColor('#64748b')

        def later_pages(c, doc):
            c.saveState()
            c.setFillColor(DARK); c.rect(0,H-14*mm,W,14*mm,fill=1,stroke=0)
            c.setFillColor(HexColor('#c084fc')); c.setFont('Helvetica',7)
            c.drawString(15*mm,H-9*mm,'COSMICA · VEDIC ASTROLOGY REPORT')
            c.setFillColor(white); c.setFont('Helvetica-Bold',7)
            c.drawRightString(W-15*mm,H-9*mm,req.person_name.upper())
            c.setFillColor(HexColor('#f1f5f9')); c.rect(0,0,W,10*mm,fill=1,stroke=0)
            c.setFillColor(SLATE); c.setFont('Helvetica',7)
            c.drawString(15*mm,3*mm,f"Generated by Cosmica · {datetime.now().strftime('%B %d, %Y')}")
            c.drawRightString(W-15*mm,3*mm,f"Page {doc.page}")
            c.restoreState()

        def first_page(c, doc):
            c.saveState()
            c.setFillColor(HexColor('#080614')); c.rect(0,0,W,H,fill=1,stroke=0)
            c.setFillColor(HexColor('#1a0f35')); c.rect(0,H*0.6,W,H*0.4,fill=1,stroke=0)
            c.setFillColor(GOLD); c.rect(0,H*0.6-3,W,3,fill=1,stroke=0)
            import random; random.seed(99)
            c.setFillColor(white)
            for _ in range(80):
                c.circle(random.uniform(0,W),random.uniform(0,H),random.uniform(0.4,1.5),fill=1,stroke=0)
            c.setFillColor(HexColor('#c084fc')); c.setFont('Helvetica',10)
            c.drawCentredString(W/2,H-25*mm,'✦  C O S M I C A  ✦')
            c.setFillColor(HexColor('#94a3b8')); c.setFont('Helvetica',8)
            c.drawCentredString(W/2,H-33*mm,'VEDIC ASTROLOGY REPORT')
            c.setFillColor(white); c.setFont('Helvetica-Bold',24)
            c.drawCentredString(W/2,H-58*mm,(req.report_type or 'FULL LIFE REPORT').upper().replace('_',' '))
            c.setFillColor(GOLD); c.rect(W/2-25*mm,H-63*mm,50*mm,1.5,fill=1,stroke=0)
            c.setFillColor(GOLD); c.setFont('Helvetica-Bold',32)
            c.drawCentredString(W/2,H/2+15*mm,req.person_name)
            c.setFillColor(HexColor('#c084fc')); c.setFont('Helvetica',12)
            c.drawCentredString(W/2,H/2-2*mm,f"{req.lagna} Lagna  ·  {report_data.get('nakshatra','')} Nakshatra")
            c.setFillColor(HexColor('#1a1040'))
            c.roundRect(W/2-50*mm,H/2-38*mm,100*mm,25*mm,4*mm,fill=1,stroke=0)
            c.setStrokeColor(PURPLE); c.setLineWidth(1)
            c.roundRect(W/2-50*mm,H/2-38*mm,100*mm,25*mm,4*mm,fill=0,stroke=1)
            c.setFillColor(HexColor('#94a3b8')); c.setFont('Helvetica',8)
            c.drawCentredString(W/2,H/2-18*mm,f"Date: {req.birth_date}  ·  Time: {req.birth_time}")
            c.drawCentredString(W/2,H/2-27*mm,f"Place: {req.birth_place}")
            c.setFillColor(HexColor('#475569')); c.setFont('Helvetica',7)
            c.drawCentredString(W/2,12*mm,'This report is confidential and prepared exclusively for the native.')
            c.restoreState()

        BODY  = ParagraphStyle('body',fontName='Helvetica',fontSize=10,leading=16,textColor=HexColor('#1f2937'),alignment=TA_JUSTIFY,spaceAfter=8)
        TITLE = ParagraphStyle('title',fontName='Helvetica-Bold',fontSize=16,leading=22,textColor=PURPLE,spaceBefore=10,spaceAfter=6)
        STITLE= ParagraphStyle('stitle',fontName='Helvetica-Bold',fontSize=12,leading=16,textColor=HexColor('#374151'),spaceBefore=8,spaceAfter=4)
        LABEL = ParagraphStyle('label',fontName='Helvetica-Bold',fontSize=8,leading=10,textColor=SLATE)
        ITALIC= ParagraphStyle('italic',fontName='Helvetica-Oblique',fontSize=10,leading=16,textColor=HexColor('#6b7280'),alignment=TA_JUSTIFY,spaceAfter=6)

        def section_header(title, color_hex='#7c3aed'):
            col = HexColor(color_hex)
            t = Table([[Paragraph(f'<font color="white"><b>{title}</b></font>',
                ParagraphStyle('sh',fontName='Helvetica-Bold',fontSize=11,textColor=white))]], colWidths=[170*mm])
            t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),col),
                ('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),
                ('LEFTPADDING',(0,0),(-1,-1),12),('ROUNDEDCORNERS',[4])]))
            return t

        story = []

        # Cover placeholder
        story.append(Spacer(1, H-40*mm))
        story.append(PageBreak())

        # TOC
        story.append(Paragraph('Table of Contents', TITLE))
        story.append(HRFlowable(width='100%',thickness=1,color=PURPLE,spaceAfter=10))
        toc = [(s['name'],'') for s in report_data['sections']]
        for i,(name,_) in enumerate(toc,1):
            t=Table([[Paragraph(f'<b>{i}.</b> {name}',BODY),Paragraph('',BODY)]],colWidths=[150*mm,18*mm])
            t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),0.3,HexColor('#e2e8f0')),
                ('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
            story.append(t)
        story.append(PageBreak())

        # Birth details
        story.append(section_header('Chapter 1 · Birth Details'))
        story.append(Spacer(1,8))
        bd=[['Full Name',req.person_name],['Lagna',req.lagna],['Moon Rashi',report_data.get('moon_rashi','')],
            ['Nakshatra',report_data.get('nakshatra','')],['Date',req.birth_date],['Time',req.birth_time],['Place',req.birth_place]]
        bt=Table([[Paragraph(f'<b>{k}</b>',LABEL),Paragraph(v,BODY)] for k,v in bd],colWidths=[50*mm,120*mm])
        bt.setStyle(TableStyle([('GRID',(0,0),(-1,-1),0.3,HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS',(0,0),(-1,-1),[HexColor('#f8f4ff'),white]),
            ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
            ('LEFTPADDING',(0,0),(-1,-1),8)]))
        story.append(bt)

        if report_data.get('base_knowledge'):
            story.append(Spacer(1,10))
            story.append(Paragraph('Foundation — Lagna & Nakshatra', STITLE))
            for bk in report_data['base_knowledge']:
                story.append(Paragraph(f"<b>{bk['title']}</b>", STITLE))
                story.append(Paragraph(bk['text'][:800], BODY))
        story.append(PageBreak())

        # All sections
        SECTION_COLORS = ['#7c3aed','#0f766e','#b45309','#be185d','#1d4ed8','#065f46','#7e22ce','#c2410c','#0369a1','#15803d','#9333ea','#dc2626']
        for i, sec in enumerate(report_data['sections']):
            col = SECTION_COLORS[i % len(SECTION_COLORS)]
            story.append(section_header(f"Chapter {i+2} · {sec['name']}", col))
            story.append(Spacer(1,6))
            story.append(Paragraph(sec['description'], ITALIC))
            story.append(Spacer(1,4))

            if sec['db_knowledge']:
                story.append(Paragraph('<b><font color="#065f46">Astrologer\'s Knowledge</font></b>', STITLE))
                for k in sec['db_knowledge']:
                    story.append(Paragraph(f"<b>{k['title']}</b>", ParagraphStyle('kt',fontName='Helvetica-Bold',fontSize=10,textColor=HexColor(col),spaceAfter=2)))
                    story.append(Paragraph(k['text'], BODY))
                    story.append(Spacer(1,4))

            if sec['ai_insight']:
                ai_box = Table([[Paragraph(f"<b><font color='#7c3aed'>AI Insight</font></b><br/><br/>{sec['ai_insight']}",BODY)]],colWidths=[160*mm])
                ai_box.setStyle(TableStyle([
                    ('BACKGROUND',(0,0),(-1,-1),HexColor('#f5f3ff')),
                    ('LINEAFTER',(0,0),(0,-1),4,HexColor('#7c3aed')),
                    ('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),
                    ('LEFTPADDING',(0,0),(-1,-1),14),('RIGHTPADDING',(0,0),(-1,-1),10),
                ]))
                story.append(ai_box)
            story.append(PageBreak())

        # Closing
        story.append(section_header('Closing Notes', '#475569'))
        story.append(Spacer(1,10))
        story.append(Paragraph(
            'This report has been generated by Cosmica using a combination of the astrologer\'s personal '
            'knowledge base and AI synthesis. All readings are based on your exact birth data calculated '
            'using Swiss Ephemeris with Lahiri ayanamsa. May your cosmic journey be filled with wisdom, '
            'purpose, and abundant blessings.', BODY))
        story.append(Spacer(1,10))
        story.append(Paragraph('<i>"The stars incline, they do not compel. The chart is the map — you are the traveller."</i>',
            ParagraphStyle('q',fontName='Helvetica-Oblique',fontSize=11,leading=18,textColor=HexColor('#6b7280'),alignment=TA_CENTER)))

        doc = SimpleDocTemplate(buf,pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=18*mm,bottomMargin=14*mm)
        doc.build(story,onFirstPage=first_page,onLaterPages=later_pages)

        pdf = buf.getvalue()
        fname = f"Cosmica_{req.person_name.replace(' ','_')}_Report.pdf"
        return StreamingResponse(io.BytesIO(pdf),media_type="application/pdf",
            headers={"Content-Disposition":f'attachment; filename="{fname}"'})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))