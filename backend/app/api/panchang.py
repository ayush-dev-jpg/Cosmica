# app/api/panchang.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import swisseph as swe
import pytz
from geopy.geocoders import Nominatim
import timezonefinder

router = APIRouter(prefix="/panchang", tags=["Panchang"])

TITHIS = [
    "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi",
    "Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi",
    "Trayodashi","Chaturdashi","Purnima",
    "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi",
    "Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi",
    "Trayodashi","Chaturdashi","Amavasya",
]
TITHI_LORDS = [
    "Moon","Sun","Jupiter","Ganesh","Naga","Kartikeya","Indra","Shiva",
    "Durga","Yama","Vishnu","Vishnu","Kamdeva","Shiva","Chandra",
    "Moon","Sun","Jupiter","Ganesh","Naga","Kartikeya","Indra","Shiva",
    "Durga","Yama","Vishnu","Vishnu","Kamdeva","Shiva","Pitru",
]
TITHI_NATURE = ["Nanda","Bhadra","Jaya","Rikta","Purna"] * 6

NAKSHATRAS = [
    {"name":"Ashwini","ruler":"Ketu","deity":"Ashwini Kumaras","gana":"Deva","nature":"Laghu","symbol":"Horse Head","quality":"Swift, healing, initiation","syllables":["Chu","Che","Cho","La"]},
    {"name":"Bharani","ruler":"Venus","deity":"Yama","gana":"Manav","nature":"Ugra","symbol":"Yoni","quality":"Determined, transformative","syllables":["Li","Lu","Le","Lo"]},
    {"name":"Krittika","ruler":"Sun","deity":"Agni","gana":"Raksha","nature":"Mishra","symbol":"Razor/Flame","quality":"Sharp, purifying, critical","syllables":["A","I","U","E"]},
    {"name":"Rohini","ruler":"Moon","deity":"Brahma","gana":"Manav","nature":"Sthira","symbol":"Ox Cart","quality":"Creative, sensual, fertile","syllables":["O","Va","Vi","Vu"]},
    {"name":"Mrigashira","ruler":"Mars","deity":"Soma","gana":"Deva","nature":"Mridu","symbol":"Deer Head","quality":"Gentle, searching, curious","syllables":["Ve","Vo","Ka","Ki"]},
    {"name":"Ardra","ruler":"Rahu","deity":"Rudra","gana":"Manav","nature":"Tikshna","symbol":"Teardrop","quality":"Intense, transformative, stormy","syllables":["Ku","Gha","Na","Chha"]},
    {"name":"Punarvasu","ruler":"Jupiter","deity":"Aditi","gana":"Deva","nature":"Chara","symbol":"Quiver of Arrows","quality":"Renewal, restoration, optimism","syllables":["Ke","Ko","Ha","Hi"]},
    {"name":"Pushya","ruler":"Saturn","deity":"Brihaspati","gana":"Deva","nature":"Laghu","symbol":"Udder/Lotus","quality":"Nourishing, protective, prosperous","syllables":["Hu","He","Ho","Da"]},
    {"name":"Ashlesha","ruler":"Mercury","deity":"Nagas","gana":"Raksha","nature":"Tikshna","symbol":"Serpent","quality":"Mystical, shrewd, possessive","syllables":["Di","Du","De","Do"]},
    {"name":"Magha","ruler":"Ketu","deity":"Pitrus","gana":"Raksha","nature":"Ugra","symbol":"Royal Throne","quality":"Regal, ancestral, powerful","syllables":["Ma","Mi","Mu","Me"]},
    {"name":"Purva Phalguni","ruler":"Venus","deity":"Bhaga","gana":"Manav","nature":"Ugra","symbol":"Hammock","quality":"Pleasure, creativity, romance","syllables":["Mo","Ta","Ti","Tu"]},
    {"name":"Uttara Phalguni","ruler":"Sun","deity":"Aryaman","gana":"Manav","nature":"Sthira","symbol":"Bed","quality":"Generous, social, accomplished","syllables":["Te","To","Pa","Pi"]},
    {"name":"Hasta","ruler":"Moon","deity":"Savitar","gana":"Deva","nature":"Laghu","symbol":"Hand","quality":"Skillful, crafty, healing","syllables":["Pu","Sha","Na","Tha"]},
    {"name":"Chitra","ruler":"Mars","deity":"Vishwakarma","gana":"Raksha","nature":"Tikshna","symbol":"Bright Jewel","quality":"Artistic, brilliant, attractive","syllables":["Pe","Po","Ra","Ri"]},
    {"name":"Swati","ruler":"Rahu","deity":"Vayu","gana":"Deva","nature":"Chara","symbol":"Young Sprout","quality":"Independent, flexible, intelligent","syllables":["Ru","Re","Ro","Ta"]},
    {"name":"Vishakha","ruler":"Jupiter","deity":"Indragni","gana":"Raksha","nature":"Mishra","symbol":"Triumphal Arch","quality":"Purposeful, ambitious, determined","syllables":["Ti","Tu","Te","To"]},
    {"name":"Anuradha","ruler":"Saturn","deity":"Mitra","gana":"Deva","nature":"Mridu","symbol":"Lotus","quality":"Devoted, organized, balanced","syllables":["Na","Ni","Nu","Ne"]},
    {"name":"Jyeshtha","ruler":"Mercury","deity":"Indra","gana":"Raksha","nature":"Tikshna","symbol":"Umbrella/Ring","quality":"Protective, eldest, powerful","syllables":["No","Ya","Yi","Yu"]},
    {"name":"Mula","ruler":"Ketu","deity":"Niritti","gana":"Raksha","nature":"Tikshna","symbol":"Roots Tied","quality":"Investigative, deep-rooted, destabilizing","syllables":["Ye","Yo","Bha","Bhi"]},
    {"name":"Purva Ashadha","ruler":"Venus","deity":"Apas","gana":"Manav","nature":"Ugra","symbol":"Fan/Winnow","quality":"Invincible, proud, purifying","syllables":["Bhu","Dha","Pha","Da"]},
    {"name":"Uttara Ashadha","ruler":"Sun","deity":"Vishwadevas","gana":"Manav","nature":"Sthira","symbol":"Elephant Tusk","quality":"Virtuous, responsible, determined","syllables":["Bhe","Bho","Ja","Ji"]},
    {"name":"Shravana","ruler":"Moon","deity":"Vishnu","gana":"Deva","nature":"Chara","symbol":"Ear/3 Footprints","quality":"Listening, learning, connecting","syllables":["Khi","Khu","Khe","Kho"]},
    {"name":"Dhanishta","ruler":"Mars","deity":"Eight Vasus","gana":"Raksha","nature":"Chara","symbol":"Drum","quality":"Wealthy, musical, ambitious","syllables":["Ga","Gi","Gu","Ge"]},
    {"name":"Shatabhisha","ruler":"Rahu","deity":"Varuna","gana":"Raksha","nature":"Chara","symbol":"Empty Circle","quality":"Healing, secretive, philosophical","syllables":["Go","Sa","Si","Su"]},
    {"name":"Purva Bhadra","ruler":"Jupiter","deity":"Aja Ekapada","gana":"Manav","nature":"Ugra","symbol":"Sword/Two Faces","quality":"Fierce, eccentric, spiritual","syllables":["Se","So","Da","Di"]},
    {"name":"Uttara Bhadra","ruler":"Saturn","deity":"Ahir Budhnya","gana":"Manav","nature":"Sthira","symbol":"Snake in Water","quality":"Deep, wise, serpentine power","syllables":["Du","Tha","Jha","Na"]},
    {"name":"Revati","ruler":"Mercury","deity":"Pushan","gana":"Deva","nature":"Mridu","symbol":"Fish/Drum","quality":"Nourishing, guiding, compassionate","syllables":["De","Do","Cha","Chi"]},
]

YOGAS = [
    "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda",
    "Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata",
    "Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva",
    "Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti",
]
YOGA_NATURE = [
    "Inauspicious","Auspicious","Auspicious","Auspicious","Auspicious","Inauspicious",
    "Auspicious","Auspicious","Inauspicious","Inauspicious","Auspicious","Auspicious","Inauspicious",
    "Auspicious","Inauspicious","Auspicious","Inauspicious","Auspicious","Inauspicious","Auspicious",
    "Auspicious","Auspicious","Auspicious","Auspicious","Auspicious","Auspicious","Inauspicious",
]
YOGA_DESC = {
    "Vishkambha":"Obstacles and struggles may arise. Avoid major decisions.",
    "Priti":"Love, friendship, and harmony prevail. Excellent for relationships.",
    "Ayushman":"Health and longevity are favored. Auspicious for medical treatments.",
    "Saubhagya":"Fortune smiles today. Excellent for new beginnings and ventures.",
    "Shobhana":"Brilliance and beauty. Favored for arts, beauty, and creativity.",
    "Atiganda":"Difficulties and dangers. Proceed with caution.",
    "Sukarma":"Good deeds bear fruit. Ideal for charitable work and dharmic activities.",
    "Dhriti":"Steadiness and determination. Good for long-term commitments.",
    "Shula":"Pain and conflict possible. Avoid surgery and confrontations.",
    "Ganda":"Unstable energy. Delays and obstacles likely.",
    "Vriddhi":"Growth and expansion. Excellent for starting new ventures.",
    "Dhruva":"Stability and permanence. Ideal for foundations, property, long-term work.",
    "Vyaghata":"Sudden setbacks possible. Stay vigilant.",
    "Harshana":"Joy and celebration. Excellent for social events and festivities.",
    "Vajra":"Double-edged — can be both auspicious and harsh. Use wisdom.",
    "Siddhi":"Success and accomplishment guaranteed. Excellent for all activities.",
    "Vyatipata":"Calamitous energy. Avoid important decisions and travel.",
    "Variyana":"Comfort and pleasure. Good for rest, recreation, enjoyment.",
    "Parigha":"Obstructions and boundaries. Introspection rather than action.",
    "Shiva":"Auspicious and divine. Excellent for spiritual practices and worship.",
    "Siddha":"Accomplishment and perfection. Highly auspicious.",
    "Sadhya":"Goals and aspirations are within reach. Take action today.",
    "Shubha":"Pure auspiciousness. Ideal for all important matters.",
    "Shukla":"Brightness and clarity. Excellent for learning and new beginnings.",
    "Brahma":"Divine creation energy. Ideal for creative and spiritual work.",
    "Indra":"Victory and power. Excellent for competitions and challenges.",
    "Vaidhriti":"Separation and endings. Avoid new beginnings.",
}

KARANAS = ["Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti",
           "Shakuni","Chatushpada","Naga","Kimstughna"]
KARANA_NATURE = {
    "Bava":"Auspicious","Balava":"Auspicious","Kaulava":"Auspicious",
    "Taitila":"Auspicious","Garaja":"Auspicious","Vanija":"Auspicious",
    "Vishti":"Inauspicious (Bhadra — avoid new work)",
    "Shakuni":"Neutral","Chatushpada":"Neutral","Naga":"Neutral","Kimstughna":"Neutral",
}

VARAS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
VARA_LORDS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"]
VARA_NATURE = ["Auspicious","Auspicious","Mixed","Auspicious","Auspicious","Auspicious","Mixed"]
VARA_GOOD_FOR = [
    "Government work, authority, medicine",
    "Travel, trade, public dealings, emotions",
    "Courage, surgery, competition, property",
    "Education, writing, business, communication",
    "Finance, teaching, spiritual work, expansion",
    "Marriage, romance, luxury, arts, beauty",
    "Farming, construction, service, discipline",
]

RASHIS_SA = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
             'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']
RASHIS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
             'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

RAHU_KALA = {0:(16.5,18),1:(7.5,9),2:(15,16.5),3:(12,13.5),4:(13.5,15),5:(10.5,12),6:(9,10.5)}
GULIKA_KALA = {0:(15,16.5),1:(13.5,15),2:(12,13.5),3:(10.5,12),4:(9,10.5),5:(7.5,9),6:(6,7.5)}
YAMAGANDA = {0:(12,13.5),1:(10.5,12),2:(9,10.5),3:(7.5,9),4:(6,7.5),5:(15,16.5),6:(13.5,15)}

def hhmm(h):
    h=h%24; return f"{int(h):02d}:{int((h-int(h))*60):02d}"

def geocode(city, country):
    try:
        g = Nominatim(user_agent="cosmica")
        l = g.geocode(f"{city}, {country}", timeout=5)
        if l:
            tf = timezonefinder.TimezoneFinder()
            tz_str = tf.timezone_at(lat=l.latitude,lng=l.longitude) or 'Asia/Kolkata'
            tz = pytz.timezone(tz_str)
            off = datetime.now(tz).utcoffset().total_seconds()/3600
            return l.latitude, l.longitude, off, tz_str
    except: pass
    return 28.6139, 77.2090, 5.5, 'Asia/Kolkata'

def compute(jd, lat, lon, tz_offset):
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    sun  = swe.calc_ut(jd, swe.SUN,  swe.FLG_SIDEREAL)[0][0]
    moon = swe.calc_ut(jd, swe.MOON, swe.FLG_SIDEREAL)[0][0]

    diff = (moon - sun) % 360
    ti   = int(diff/12);  tithi_pct = (diff%12)/12*100
    ni   = int(moon/(360/27)); nak_deg=moon%(360/27); nak_pct=nak_deg/(360/27)*100
    pada = min(int(nak_deg/((360/27)/4))+1,4)
    yi   = int(((sun+moon)%360)/(360/27)); yoga_pct=((sun+moon)%360%(360/27))/(360/27)*100
    ki_f = diff/6; ki = int(ki_f)
    if ki>=57: kname=KARANAS[7+(ki-57)%4]
    elif ki==0: kname="Kimstughna"
    else: kname=KARANAS[(ki-1)%7]
    karana_pct = (ki_f%1)*100
    wd = int(jd+1.5)%7

    sun_ri = int(sun/30)%12; moon_ri = int(moon/30)%12

    try:
        sr = swe.rise_trans(jd-0.5,swe.SUN,lon,lat,0,swe.CALC_RISE|swe.BIT_DISC_CENTER)[1][0]
        ss = swe.rise_trans(jd-0.5,swe.SUN,lon,lat,0,swe.CALC_SET |swe.BIT_DISC_CENTER)[1][0]
        def jd2hm(j): return hhmm((j-int(j)-0.5)*24+tz_offset)
        sunrise=jd2hm(sr); sunset=jd2hm(ss)
    except: sunrise="06:00"; sunset="18:30"

    planets={}
    for pid,nm in [(swe.SUN,'Sun'),(swe.MOON,'Moon'),(swe.MARS,'Mars'),(swe.MERCURY,'Mercury'),
                   (swe.JUPITER,'Jupiter'),(swe.VENUS,'Venus'),(swe.SATURN,'Saturn')]:
        p=swe.calc_ut(jd,pid,swe.FLG_SIDEREAL)[0][0]
        ri=int(p/30)%12
        planets[nm]={'longitude':round(p,3),'rashi':RASHIS_SA[ri],'rashi_en':RASHIS_EN[ri],'degree':round(p%30,2)}
    rahu=swe.calc_ut(jd,swe.TRUE_NODE,swe.FLG_SIDEREAL)[0][0]
    ri=int(rahu/30)%12; planets['Rahu']={'longitude':round(rahu,3),'rashi':RASHIS_SA[ri],'rashi_en':RASHIS_EN[ri],'degree':round(rahu%30,2)}
    ketu=(rahu+180)%360; ki2=int(ketu/30)%12
    planets['Ketu']={'longitude':round(ketu,3),'rashi':RASHIS_SA[ki2],'rashi_en':RASHIS_EN[ki2],'degree':round(ketu%30,2)}

    rs,re=RAHU_KALA[wd]; gs,ge=GULIKA_KALA[wd]; ys,ye=YAMAGANDA[wd]

    return {
        'tithi':{'name':TITHIS[ti],'number':ti+1,'paksha':'Shukla Paksha' if ti<15 else 'Krishna Paksha',
                 'lord':TITHI_LORDS[ti],'nature':TITHI_NATURE[ti%5],'pct':round(tithi_pct,1)},
        'nakshatra':{**NAKSHATRAS[ni],'pada':pada,'pct':round(nak_pct,1),'deg_in_nak':round(nak_deg,2)},
        'yoga':{'name':YOGAS[yi%27],'nature':YOGA_NATURE[yi%27],'desc':YOGA_DESC.get(YOGAS[yi%27],''),'pct':round(yoga_pct,1)},
        'karana':{'name':kname,'nature':KARANA_NATURE.get(kname,'Neutral'),'pct':round(karana_pct,1)},
        'vara':{'name':VARAS[wd],'lord':VARA_LORDS[wd],'nature':VARA_NATURE[wd],'good_for':VARA_GOOD_FOR[wd],'index':wd},
        'sun':{'rashi':RASHIS_SA[sun_ri],'rashi_en':RASHIS_EN[sun_ri],'degree':round(sun%30,2),'longitude':round(sun,3)},
        'moon':{'rashi':RASHIS_SA[moon_ri],'rashi_en':RASHIS_EN[moon_ri],'degree':round(moon%30,2),'longitude':round(moon,3)},
        'sunrise':sunrise,'sunset':sunset,
        'inauspicious':{'rahu_kala':f"{hhmm(rs)}–{hhmm(re)}",'gulika':f"{hhmm(gs)}–{hhmm(ge)}",'yamaganda':f"{hhmm(ys)}–{hhmm(ye)}"},
        'auspicious':{'abhijit':f"{hhmm(11.75)}–{hhmm(12.5)}",'brahma_muhurta':f"{hhmm(4.4)}–{hhmm(5.2)}"},
        'planets':planets,
    }

class DailyReq(BaseModel):
    date:Optional[str]=None; city:Optional[str]="New Delhi"; country:Optional[str]="India"

class BirthReq(BaseModel):
    date:str; time:str; city:str; country:str; name:Optional[str]=None

@router.post("/daily")
async def daily_panchang(req:DailyReq):
    lat,lon,off,tz_str=geocode(req.city or "New Delhi",req.country or "India")
    if req.date: dt=datetime.strptime(req.date,"%Y-%m-%d")
    else:
        tz=pytz.timezone(tz_str); dt=datetime.now(tz)
    jd=swe.julday(dt.year,dt.month,dt.day,6.0-off)
    p=compute(jd,lat,lon,off)
    p.update({'date':dt.strftime("%Y-%m-%d"),'location':f"{req.city}, {req.country}",'type':'daily'})
    return p

@router.post("/birth")
async def birth_panchang(req:BirthReq):
    lat,lon,off,tz_str=geocode(req.city,req.country)
    dt=datetime.strptime(f"{req.date} {req.time}","%Y-%m-%d %H:%M")
    jd=swe.julday(dt.year,dt.month,dt.day,dt.hour+dt.minute/60-off)
    p=compute(jd,lat,lon,off)
    p.update({'date':req.date,'time':req.time,'location':f"{req.city}, {req.country}",'name':req.name,'type':'birth'})
    return p