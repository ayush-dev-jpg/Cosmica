# app/api/synastry.py — v2 with full interpretations
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
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

VARNA  = {'Mesha':'Kshatriya','Vrishabha':'Vaishya','Mithuna':'Shudra','Karka':'Brahmin',
          'Simha':'Kshatriya','Kanya':'Vaishya','Tula':'Shudra','Vrishchika':'Brahmin',
          'Dhanu':'Kshatriya','Makara':'Vaishya','Kumbha':'Shudra','Meena':'Brahmin'}
GANA   = {'Ashwini':'Deva','Bharani':'Manav','Krittika':'Raksha','Rohini':'Manav',
          'Mrigashira':'Deva','Ardra':'Manav','Punarvasu':'Deva','Pushya':'Deva',
          'Ashlesha':'Raksha','Magha':'Raksha','Purva Phalguni':'Manav',
          'Uttara Phalguni':'Manav','Hasta':'Deva','Chitra':'Raksha','Swati':'Deva',
          'Vishakha':'Raksha','Anuradha':'Deva','Jyeshtha':'Raksha','Mula':'Raksha',
          'Purva Ashadha':'Manav','Uttara Ashadha':'Manav','Shravana':'Deva',
          'Dhanishta':'Raksha','Shatabhisha':'Raksha','Purva Bhadra':'Manav',
          'Uttara Bhadra':'Manav','Revati':'Deva'}
NADI   = {'Ashwini':'Aadi','Bharani':'Madhya','Krittika':'Antya','Rohini':'Antya',
          'Mrigashira':'Madhya','Ardra':'Aadi','Punarvasu':'Aadi','Pushya':'Madhya',
          'Ashlesha':'Antya','Magha':'Aadi','Purva Phalguni':'Madhya',
          'Uttara Phalguni':'Antya','Hasta':'Antya','Chitra':'Madhya','Swati':'Aadi',
          'Vishakha':'Aadi','Anuradha':'Madhya','Jyeshtha':'Antya','Mula':'Aadi',
          'Purva Ashadha':'Madhya','Uttara Ashadha':'Antya','Shravana':'Antya',
          'Dhanishta':'Madhya','Shatabhisha':'Aadi','Purva Bhadra':'Aadi',
          'Uttara Bhadra':'Madhya','Revati':'Antya'}
YONI   = {'Ashwini':'Horse','Bharani':'Elephant','Krittika':'Goat','Rohini':'Serpent',
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

HOUSE_MEANINGS = {
    1:'Identity & self — deeply personal connection',2:'Wealth & family — financial and family ties',
    3:'Communication — mental bond and sibling-like connection',4:'Home & heart — domestic happiness',
    5:'Romance & creativity — love, playfulness and children',6:'Daily life & service — practical support',
    7:'Partnership — direct marriage connection',8:'Transformation — deep intimacy and shared secrets',
    9:'Philosophy & growth — shared beliefs and adventures',10:'Career & status — shared ambitions',
    11:'Friendship & gains — social life and mutual gains',12:'Spirituality — hidden past life bond',
}

# Import interpretations
from app.data.synastry_interpretations import SYNASTRY_INTERP

SYNASTRY_ASPECTS = {
    'conjunction':{'orb':8,'degrees':0,'nature':'Intense'},
    'trine':      {'orb':7,'degrees':120,'nature':'Harmonious'},
    'sextile':    {'orb':5,'degrees':60,'nature':'Supportive'},
    'square':     {'orb':7,'degrees':90,'nature':'Challenging'},
    'opposition': {'orb':8,'degrees':180,'nature':'Polarizing'},
}

def geocode_place(city, country):
    try:
        from geopy.geocoders import Nominatim
        import timezonefinder, pytz
        from datetime import datetime
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

def get_chart(date_str, time_str, city, country):
    import swisseph as swe
    from datetime import datetime
    lat, lon, tz_off = geocode_place(city, country)
    dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    jd = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60 - tz_off)
    swe.set_sid_mode(swe.SIDM_LAHIRI)

    planets = {}
    for pid, name in [(swe.SUN,'Sun'),(swe.MOON,'Moon'),(swe.MARS,'Mars'),
                      (swe.MERCURY,'Mercury'),(swe.JUPITER,'Jupiter'),
                      (swe.VENUS,'Venus'),(swe.SATURN,'Saturn')]:
        pos = swe.calc_ut(jd, pid, swe.FLG_SIDEREAL)[0][0]
        ri  = int(pos/30) % 12
        nak_idx = int(pos / (360/27))
        planets[name] = {
            'longitude':round(pos,3),'rashi':RASHIS_SA[ri],'rashi_en':RASHIS_EN[ri],
            'degree':round(pos%30,2),'nakshatra':NAKSHATRAS[nak_idx%27],
        }
    rahu = swe.calc_ut(jd, swe.TRUE_NODE, swe.FLG_SIDEREAL)[0][0]
    ri = int(rahu/30)%12
    planets['Rahu'] = {'longitude':round(rahu,3),'rashi':RASHIS_SA[ri],'rashi_en':RASHIS_EN[ri],
                       'degree':round(rahu%30,2),'nakshatra':NAKSHATRAS[int(rahu/(360/27))%27]}
    ketu = (rahu+180)%360
    ki = int(ketu/30)%12
    planets['Ketu'] = {'longitude':round(ketu,3),'rashi':RASHIS_SA[ki],'rashi_en':RASHIS_EN[ki],
                       'degree':round(ketu%30,2),'nakshatra':NAKSHATRAS[int(ketu/(360/27))%27]}

    asc = swe.houses(jd, lat, lon, b'P')[1][0]
    asc_sid = (asc - swe.get_ayanamsa(jd)) % 360
    lagna_idx = int(asc_sid/30)%12

    moon = planets['Moon']
    moon_nak = moon['nakshatra']
    return {
        'planets':planets,
        'lagna':{'name':RASHIS_SA[lagna_idx],'en':RASHIS_EN[lagna_idx],'index':lagna_idx},
        'moon_rashi':moon['rashi'],'moon_rashi_en':moon['rashi_en'],
        'nakshatra':moon_nak,
        'nakshatra_lord':NAK_LORDS[NAKSHATRAS.index(moon_nak)],
        'gana':GANA.get(moon_nak,''),'nadi':NADI.get(moon_nak,''),
        'yoni':YONI.get(moon_nak,''),'varna':VARNA.get(moon['rashi'],''),
    }

def get_interpretation(p1, p2, aspect):
    # Try both orderings
    key1 = (p1, p2, aspect)
    key2 = (p2, p1, aspect)
    return SYNASTRY_INTERP.get(key1) or SYNASTRY_INTERP.get(key2)

def calc_aspects(planets1, planets2):
    aspects = []
    ALL_PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']
    for p1 in ALL_PLANETS:
        if p1 not in planets1: continue
        lon1 = planets1[p1]['longitude']
        for p2 in ALL_PLANETS:
            if p2 not in planets2: continue
            lon2 = planets2[p2]['longitude']
            diff = abs(lon1-lon2)%360
            if diff>180: diff=360-diff
            for asp, data in SYNASTRY_ASPECTS.items():
                orb = data['orb']
                actual = abs(diff-data['degrees'])
                if actual<=orb:
                    interp = get_interpretation(p1,p2,asp)
                    aspects.append({
                        'planet1':p1,'planet2':p2,'aspect':asp,
                        'nature':data['nature'],'orb':round(actual,2),
                        'p1_rashi':planets1[p1]['rashi_en'],
                        'p2_rashi':planets2[p2]['rashi_en'],
                        'score':round((orb-actual)/orb*10,1),
                        # Full interpretation
                        'title':    interp['title']    if interp else f"{p1} {asp.capitalize()} {p2}",
                        'summary':  interp['summary']  if interp else '',
                        'detailed': interp['detailed'] if interp else '',
                        'positives':interp.get('positives',[]) if interp else [],
                        'challenges':interp.get('challenges',[]) if interp else [],
                        'romance':  interp.get('romance','')  if interp else '',
                        'marriage': interp.get('marriage','') if interp else '',
                        'friendship':interp.get('friendship','') if interp else '',
                    })
    nature_order={'Harmonious':0,'Supportive':1,'Intense':2,'Polarizing':3,'Challenging':4}
    aspects.sort(key=lambda x:(nature_order.get(x['nature'],5),x['orb']))
    return aspects

def calc_ashtakoot(c1, c2):
    nak1,nak2 = c1['nakshatra'],c2['nakshatra']
    n1i = NAKSHATRAS.index(nak1); n2i = NAKSHATRAS.index(nak2)
    varna_order={'Brahmin':4,'Kshatriya':3,'Vaishya':2,'Shudra':1}
    v1=varna_order.get(c1['varna'],1); v2=varna_order.get(c2['varna'],1)
    varna_score=1 if v1>=v2 else 0
    vashya_map={'Mesha':'Chatushpad','Vrishabha':'Chatushpad','Mithuna':'Nara','Karka':'Jalachara',
                'Simha':'Vanachara','Kanya':'Nara','Tula':'Nara','Vrishchika':'Keeta',
                'Dhanu':'Chatushpad','Makara':'Jalachara','Kumbha':'Nara','Meena':'Jalachara'}
    va1=vashya_map.get(c1['moon_rashi'],''); va2=vashya_map.get(c2['moon_rashi'],'')
    vashya_score=2 if va1==va2 else 1 if {va1,va2} in [{'Jalachara','Nara'},{'Chatushpad','Vanachara'}] else 0
    diff=((n2i-n1i)+27)%27; tara_num=(diff%9)+1
    tara_names={1:'Janma',2:'Sampat',3:'Vipat',4:'Kshema',5:'Pratyak',6:'Sadhana',7:'Naidhana',8:'Mitra',9:'Parama Mitra'}
    tara_score=3 if tara_num in [1,2,4,6,8,9] else 0
    y1,y2=c1['yoni'],c2['yoni']
    yoni_score=4 if y1==y2 else 0 if frozenset([y1,y2]) in [frozenset(e) for e in YONI_ENEMIES] else 2
    r1,r2=c1['nakshatra_lord'],c2['nakshatra_lord']
    if r1==r2: gm=5
    elif r2 in PLANET_FRIENDS.get(r1,[]) and r1 in PLANET_FRIENDS.get(r2,[]): gm=5
    elif r2 in PLANET_FRIENDS.get(r1,[]) or r1 in PLANET_FRIENDS.get(r2,[]): gm=4
    elif r2 in PLANET_ENEMIES.get(r1,[]) and r1 in PLANET_ENEMIES.get(r2,[]): gm=0
    elif r2 in PLANET_ENEMIES.get(r1,[]) or r1 in PLANET_ENEMIES.get(r2,[]): gm=1
    else: gm=3
    g1,g2=c1['gana'],c2['gana']
    gana_score=6 if g1==g2 else 5 if {g1,g2}=={'Deva','Manav'} else 0
    lagna_diff=abs(RASHIS_SA.index(c1['moon_rashi'])-RASHIS_SA.index(c2['moon_rashi']))+1
    if lagna_diff>12: lagna_diff=25-lagna_diff
    bhakoot_score=0 if lagna_diff in [6,8,12] else 7
    na1,na2=c1['nadi'],c2['nadi']
    nadi_score=0 if na1==na2 else 8
    total=varna_score+vashya_score+tara_score+yoni_score+gm+gana_score+bhakoot_score+nadi_score
    grade='A+' if total>=28 else 'A' if total>=24 else 'B' if total>=18 else 'C' if total>=12 else 'D'
    verdicts={'A+':'Exceptional match — rare divine connection. Highly auspicious for marriage.',
              'A':'Very good match — strong compatibility with mutual support and harmony.',
              'B':'Good match — above average compatibility. A successful marriage with effort.',
              'C':'Average match — challenges exist but can be overcome with understanding.',
              'D':'Difficult match — significant incompatibilities. Consult an astrologer.'}
    return {'kootas':[
        {'name':'Varna','max':1,'score':varna_score,'p1':c1['varna'],'p2':c2['varna'],'meaning':'Spiritual compatibility'},
        {'name':'Vashya','max':2,'score':vashya_score,'p1':va1,'p2':va2,'meaning':'Mutual attraction'},
        {'name':'Tara','max':3,'score':tara_score,'p1':nak1,'p2':nak2,'tara_name':tara_names.get(tara_num,''),'meaning':'Health & destiny'},
        {'name':'Yoni','max':4,'score':yoni_score,'p1':y1,'p2':y2,'meaning':'Physical compatibility'},
        {'name':'Graha Maitri','max':5,'score':gm,'p1':r1,'p2':r2,'meaning':'Mental friendship'},
        {'name':'Gana','max':6,'score':gana_score,'p1':g1,'p2':g2,'meaning':'Temperament'},
        {'name':'Bhakoot','max':7,'score':bhakoot_score,'p1':c1['moon_rashi'],'p2':c2['moon_rashi'],'meaning':'Love & prosperity'},
        {'name':'Nadi','max':8,'score':nadi_score,'p1':na1,'p2':na2,'meaning':'Health & progeny','dosha':na1==na2},
    ],'total':total,'max':36,'grade':grade,'verdict':verdicts[grade]}

def calc_overlays(chart1, chart2):
    lagna1_idx=chart1['lagna']['index']
    overlays=[]
    for pname in ['Sun','Moon','Venus','Mars','Jupiter','Saturn','Rahu','Ketu']:
        if pname not in chart2['planets']: continue
        rashi=chart2['planets'][pname]['rashi']
        if rashi not in RASHIS_SA: continue
        ri=RASHIS_SA.index(rashi)
        house=(ri-lagna1_idx)%12+1
        overlays.append({'planet':pname,'house':house,'rashi':chart2['planets'][pname]['rashi_en'],
                         'meaning':HOUSE_MEANINGS.get(house,'')})
    return sorted(overlays,key=lambda x:x['house'])

def calc_dasha(c1,c2):
    l1,l2=c1['nakshatra_lord'],c2['nakshatra_lord']
    compatible=l2 in PLANET_FRIENDS.get(l1,[]) or l1 in PLANET_FRIENDS.get(l2,[])
    enemy=l2 in PLANET_ENEMIES.get(l1,[]) or l1 in PLANET_ENEMIES.get(l2,[])
    rel='Friendly' if compatible else 'Unfriendly' if enemy else 'Neutral'
    descs={'Friendly':f'{l1} and {l2} are friendly — dasha periods support each other and bring mutual benefit.',
           'Neutral': f'{l1} and {l2} are neutral — dasha periods have mixed results.',
           'Unfriendly':f'{l1} and {l2} have tension — extra effort needed during simultaneous dashas.'}
    return {'lord1':l1,'lord2':l2,'relation':rel,'desc':descs[rel],'nak1':c1['nakshatra'],'nak2':c2['nakshatra']}

def calc_overall(ashtakoot, aspects):
    ast_pct=(ashtakoot['total']/36)*60
    harmonious=len([a for a in aspects if a['nature'] in ['Harmonious','Supportive']])
    challenging=len([a for a in aspects if a['nature'] in ['Challenging','Polarizing']])
    total_asp=max(len(aspects),1)
    syn_pct=max(0,((harmonious-challenging*0.5)/total_asp))*40
    total=round(min(100,max(0,ast_pct+syn_pct)),1)
    if total>=80:   label,color='Soulmate Connection','#10b981'
    elif total>=65: label,color='Deeply Compatible','#34d399'
    elif total>=50: label,color='Good Compatibility','#f59e0b'
    elif total>=35: label,color='Average Compatibility','#f97316'
    else:           label,color='Challenging Match','#ef4444'
    return {'score':total,'label':label,'color':color}

class PersonInput(BaseModel):
    name:str; date:str; time:str; city:str; country:str

class SynastryRequest(BaseModel):
    person1:PersonInput; person2:PersonInput

@router.post("/calculate")
async def calculate_synastry(req: SynastryRequest):
    chart1,chart2 = await asyncio.gather(
        asyncio.to_thread(get_chart,req.person1.date,req.person1.time,req.person1.city,req.person1.country),
        asyncio.to_thread(get_chart,req.person2.date,req.person2.time,req.person2.city,req.person2.country),
    )
    ashtakoot = calc_ashtakoot(chart1,chart2)
    aspects   = calc_aspects(chart1['planets'],chart2['planets'])
    overlays1 = calc_overlays(chart1,chart2)
    overlays2 = calc_overlays(chart2,chart1)
    dasha     = calc_dasha(chart1,chart2)
    overall   = calc_overall(ashtakoot,aspects)
    return {
        'person1':{'name':req.person1.name,**{k:chart1[k] for k in ['moon_rashi','moon_rashi_en','nakshatra','nakshatra_lord','gana','nadi','yoni','varna','lagna']}},
        'person2':{'name':req.person2.name,**{k:chart2[k] for k in ['moon_rashi','moon_rashi_en','nakshatra','nakshatra_lord','gana','nadi','yoni','varna','lagna']}},
        'planets1':chart1['planets'],'planets2':chart2['planets'],
        'ashtakoot':ashtakoot,'aspects':aspects,
        'overlays_p2_in_p1':overlays1,'overlays_p1_in_p2':overlays2,
        'dasha_compatibility':dasha,'overall':overall,
    }