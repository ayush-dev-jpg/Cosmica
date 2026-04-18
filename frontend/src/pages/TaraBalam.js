// src/pages/TaraBalam.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const COUNTRIES = ['India','USA','UK','Canada','Australia','UAE','Singapore','Nepal','Germany','Other'];

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
  'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
  'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadra',
  'Uttara Bhadra','Revati',
];

const NAK_RULERS = {
  'Ashwini':'Ketu','Bharani':'Venus','Krittika':'Sun','Rohini':'Moon',
  'Mrigashira':'Mars','Ardra':'Rahu','Punarvasu':'Jupiter','Pushya':'Saturn',
  'Ashlesha':'Mercury','Magha':'Ketu','Purva Phalguni':'Venus','Uttara Phalguni':'Sun',
  'Hasta':'Moon','Chitra':'Mars','Swati':'Rahu','Vishakha':'Jupiter',
  'Anuradha':'Saturn','Jyeshtha':'Mercury','Mula':'Ketu','Purva Ashadha':'Venus',
  'Uttara Ashadha':'Sun','Shravana':'Moon','Dhanishta':'Mars','Shatabhisha':'Rahu',
  'Purva Bhadra':'Jupiter','Uttara Bhadra':'Saturn','Revati':'Mercury',
};

const PLANET_META = {
  Sun:     { emoji:'☀️', color:'#f59e0b', nature:'malefic', label:'Sun' },
  Moon:    { emoji:'🌙', color:'#60a5fa', nature:'benefic', label:'Moon' },
  Mars:    { emoji:'♂',  color:'#f87171', nature:'malefic', label:'Mars' },
  Mercury: { emoji:'☿',  color:'#34d399', nature:'benefic', label:'Mercury' },
  Jupiter: { emoji:'♃',  color:'#c084fc', nature:'benefic', label:'Jupiter' },
  Venus:   { emoji:'♀',  color:'#f472b6', nature:'benefic', label:'Venus' },
  Saturn:  { emoji:'♄',  color:'#94a3b8', nature:'malefic', label:'Saturn' },
  Rahu:    { emoji:'☊',  color:'#818cf8', nature:'malefic', label:'Rahu' },
  Ketu:    { emoji:'☋',  color:'#fb923c', nature:'malefic', label:'Ketu' },
};

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

const TARAS = [
  { num:1, name:'Janma',        sanskrit:'जन्म',     icon:'🌟', quality:'Mixed',         color:'#94a3b8',
    meaning:'Birth Star', nature:'Neutral',
    desc:'Your own birth nakshatra. Represents your fundamental nature, body and life patterns.',
    good:'Strong identity, natural confidence, vitality when benefic planets placed here.',
    bad:'Malefic planets here can cause health issues and identity challenges.',
    benefic_effect:'Strengthens your personality, brings confidence and good health.',
    malefic_effect:'Health issues, identity struggles and physical challenges are possible.',
    dasha_advice:'During this planet\'s period, focus on self-care, health and personal development.',
  },
  { num:2, name:'Sampat',       sanskrit:'सम्पत्',   icon:'💰', quality:'Excellent',      color:'#10b981',
    meaning:'Wealth Star', nature:'Highly Auspicious',
    desc:'The most auspicious position after Parama Mitra. Planets here bring wealth, prosperity and abundance.',
    good:'Financial gains, accumulation of assets, family happiness, excellent for investments.',
    bad:'Very few negatives — even malefic planets here tend to bring wealth through hard work.',
    benefic_effect:'Exceptional wealth, easy money flow, strong family bonds and luxurious comforts.',
    malefic_effect:'Wealth comes through hard work and struggle, but ultimately the native prospers.',
    dasha_advice:'This is an excellent period for financial investments, business and wealth accumulation.',
  },
  { num:3, name:'Vipat',        sanskrit:'विपत्',    icon:'⚡', quality:'Difficult',      color:'#ef4444',
    meaning:'Danger Star', nature:'Inauspicious',
    desc:'One of the most challenging positions. Planets here bring sudden dangers, obstacles and reversals.',
    good:'The native develops resilience, courage and wisdom through overcoming challenges.',
    bad:'Accidents, sudden losses, health crises, unexpected obstacles and reversals of fortune.',
    benefic_effect:'Even benefics here bring mixed results — temporary gains followed by challenges. Stay vigilant.',
    malefic_effect:'Serious danger to health, finances and relationships. Strong remedies and caution essential.',
    dasha_advice:'During this period: avoid major risks, drive carefully, get health checkups and do remedies.',
  },
  { num:4, name:'Kshema',       sanskrit:'क्षेम',   icon:'🛡️', quality:'Excellent',      color:'#10b981',
    meaning:'Prosperity Star', nature:'Highly Auspicious',
    desc:'Brings comfort, security, protection and steady prosperity. One of the most beneficial positions.',
    good:'Stable income, good health, domestic happiness, protection from enemies, mental peace.',
    bad:'May bring complacency or over-comfort that leads to laziness.',
    benefic_effect:'Outstanding results — wealth, health, happiness and protection from all hardships.',
    malefic_effect:'Even malefics here become softened — challenges are manageable and resolved favorably.',
    dasha_advice:'An excellent period for property purchases, family expansion and long-term stability.',
  },
  { num:5, name:'Pratyak',      sanskrit:'प्रत्यक्', icon:'🌀', quality:'Challenging',    color:'#f97316',
    meaning:'Obstacle Star', nature:'Inauspicious',
    desc:'Brings obstacles, confusion and indirect challenges. Things may not go as planned.',
    good:'Forces innovation, finding alternative paths and developing patience.',
    bad:'Plans get derailed, hidden enemies, misunderstandings and indirect harm.',
    benefic_effect:'Obstacles exist but the native can navigate through with effort and divine grace.',
    malefic_effect:'Hidden dangers, enemies in disguise, financial leakage and health through neglect.',
    dasha_advice:'Be extra cautious of hidden enemies, read contracts carefully and avoid hasty decisions.',
  },
  { num:6, name:'Sadhana',      sanskrit:'साधन',    icon:'✨', quality:'Excellent',      color:'#10b981',
    meaning:'Achievement Star', nature:'Auspicious',
    desc:'Highly auspicious for achievement, goals, success and fulfillment of desires.',
    good:'Hard work gets rewarded, goals achieved, enemies defeated, diseases overcome, debts cleared.',
    bad:'Success may require sustained effort — results come to those who persist.',
    benefic_effect:'Tremendous success, achievement of life goals, victory over obstacles and enemies.',
    malefic_effect:'Success comes after overcoming significant resistance — ultimate victory is indicated.',
    dasha_advice:'Push hard toward your goals during this period. Efforts will be rewarded. Clear debts and enemies.',
  },
  { num:7, name:'Naidhana',     sanskrit:'नैधन',    icon:'🌑', quality:'Most Difficult', color:'#dc2626',
    meaning:'Death Star', nature:'Most Inauspicious',
    desc:'The most challenging tara — associated with death-like experiences, major losses and deep transformation.',
    good:'Profound transformation, spiritual awakening, letting go of the old for the new.',
    bad:'Major losses, health crises, relationship breakdowns, career setbacks and near-death experiences.',
    benefic_effect:'Transformation is intense but leads to renewal. Some losses occur but new beginnings follow.',
    malefic_effect:'Extremely challenging period. Serious precautions, remedies and spiritual practices are essential.',
    dasha_advice:'This requires maximum caution. Do Navagraha puja, avoid major life decisions and focus on spiritual practice.',
  },
  { num:8, name:'Mitra',        sanskrit:'मित्र',   icon:'🤝', quality:'Good',           color:'#3b82f6',
    meaning:'Friend Star', nature:'Auspicious',
    desc:'Brings friendship, alliances, helpful people and social support.',
    good:'Good friends, helpful colleagues, social recognition, alliances that bring benefits.',
    bad:'Over-dependence on others, friendships that don\'t serve long-term interests.',
    benefic_effect:'Excellent social connections, powerful allies, mutual benefit in all partnerships.',
    malefic_effect:'Some friends may prove unreliable, but genuine support is still available.',
    dasha_advice:'Build your social network, collaborate with others and use alliances to advance your goals.',
  },
  { num:9, name:'Parama Mitra', sanskrit:'परम मित्र', icon:'💜', quality:'Excellent',    color:'#8b5cf6',
    meaning:'Best Friend Star', nature:'Most Auspicious',
    desc:'The most auspicious tara — representing divine friendship, grace and supreme blessings.',
    good:'Divine favor, unexpected blessings, grace in all areas, spiritual advancement, supreme good fortune.',
    bad:'Almost no negatives — this is the most favorable position.',
    benefic_effect:'Exceptional divine grace, supreme blessings and outstanding results in all life areas.',
    malefic_effect:'Even malefics here behave like benefics — supreme protection and divine favor is indicated.',
    dasha_advice:'Make the most of this exceptional period. Start new ventures, make important decisions with confidence.',
  },
];

const QUALITY_CONFIG = {
  'Excellent':      { bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.3)',  text:'#10b981', glow:'rgba(16,185,129,0.15)' },
  'Good':           { bg:'rgba(59,130,246,0.1)',  border:'rgba(59,130,246,0.3)',  text:'#60a5fa', glow:'rgba(59,130,246,0.15)' },
  'Mixed':          { bg:'rgba(148,163,184,0.07)',border:'rgba(148,163,184,0.2)', text:'#94a3b8', glow:'transparent' },
  'Challenging':    { bg:'rgba(249,115,22,0.09)', border:'rgba(249,115,22,0.28)',  text:'#f97316', glow:'rgba(249,115,22,0.12)' },
  'Difficult':      { bg:'rgba(239,68,68,0.09)',  border:'rgba(239,68,68,0.28)',   text:'#ef4444', glow:'rgba(239,68,68,0.12)' },
  'Most Difficult': { bg:'rgba(220,38,38,0.11)',  border:'rgba(220,38,38,0.35)',   text:'#dc2626', glow:'rgba(220,38,38,0.15)' },
};

function getTaraFromNaks(birthNakName, planetNakName) {
  const bi = NAKSHATRAS.indexOf(birthNakName);
  const pi = NAKSHATRAS.indexOf(planetNakName);
  if (bi < 0 || pi < 0) return null;
  const diff = ((pi - bi) + 27) % 27;
  const taraNum = (diff % 9) + 1;
  return TARAS[taraNum - 1];
}

function TaraChip({ tara }) {
  if (!tara) return null;
  const q = QUALITY_CONFIG[tara.quality] || QUALITY_CONFIG['Mixed'];
  return (
    <span style={{
      padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700,
      background:q.bg, color:q.text, border:`1px solid ${q.border}`,
      display:'inline-flex', alignItems:'center', gap:4,
    }}>
      {tara.icon} {tara.name}
    </span>
  );
}

function PlanetTaraCard({ planet, nakshatra, tara, index }) {
  const [open, setOpen] = useState(false);
  const meta = PLANET_META[planet];
  const q = QUALITY_CONFIG[tara.quality] || QUALITY_CONFIG['Mixed'];
  const isBenefic = meta.nature === 'benefic';

  return (
    <div style={{
      borderRadius:14, overflow:'hidden',
      border:`1px solid ${open ? q.border : 'rgba(255,255,255,0.07)'}`,
      background: open ? q.bg : 'rgba(255,255,255,0.02)',
      transition:'all 0.25s',
      boxShadow: open ? `0 4px 24px ${q.glow}` : 'none',
      animation:`fadeUp 0.4s ease ${index*0.05}s both`,
    }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'14px 16px', border:'none', cursor:'pointer',
        background:'transparent', color:'inherit', fontFamily:'inherit', textAlign:'left',
      }}>
        {/* Planet orb */}
        <div style={{
          width:46, height:46, borderRadius:12, flexShrink:0,
          background:`radial-gradient(circle at 35% 35%,${meta.color}44,${meta.color}11)`,
          border:`2px solid ${meta.color}55`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
        }}>{meta.emoji}</div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontWeight:800, fontSize:15, color:meta.color }}>{planet}</span>
            <span style={{
              padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:600,
              background:`${meta.color}15`, color:meta.color, border:`1px solid ${meta.color}30`,
            }}>in {nakshatra}</span>
            <span style={{
              padding:'2px 7px', borderRadius:999, fontSize:10, fontWeight:600,
              background: isBenefic?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)',
              color: isBenefic?'#10b981':'#f87171',
            }}>{isBenefic?'Natural Benefic':'Natural Malefic'}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:16 }}>{tara.icon}</span>
            <span style={{ fontWeight:700, fontSize:13, color:tara.color }}>{tara.name} Tara</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>· {tara.meaning}</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0 }}>
          <span style={{
            padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700,
            background:q.bg, color:q.text, border:`1px solid ${q.border}`,
          }}>{tara.quality}</span>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)',
            transform:open?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block' }}>▼</span>
        </div>
      </button>

      {open && (
        <div style={{ padding:'0 16px 18px', borderTop:`1px solid ${tara.color}18` }}>
          {/* What this tara means */}
          <div style={{ padding:'12px 14px', borderRadius:10, marginTop:12, marginBottom:10,
            background:`${tara.color}0d`, border:`1px solid ${tara.color}22` }}>
            <div style={{ fontSize:11, fontWeight:700, color:tara.color,
              textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
              {tara.icon} About {tara.name} Tara ({tara.sanskrit})
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.8 }}>{tara.desc}</div>
          </div>

          {/* What this planet will do in this tara */}
          <div style={{ padding:'12px 14px', borderRadius:10, marginBottom:10,
            background: isBenefic?'rgba(16,185,129,0.07)':'rgba(239,68,68,0.07)',
            border:`1px solid ${isBenefic?'rgba(16,185,129,0.22)':'rgba(239,68,68,0.22)'}` }}>
            <div style={{ fontSize:11, fontWeight:700, marginBottom:6,
              color:isBenefic?'#10b981':'#f87171', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              {meta.emoji} {planet}'s Influence in {tara.name} Tara
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.75)', lineHeight:1.8 }}>
              {isBenefic ? tara.benefic_effect : tara.malefic_effect}
            </div>
          </div>

          {/* Positive / Caution */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div style={{ padding:'10px 12px', borderRadius:8,
              background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#10b981',
                textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>✨ Positive</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>{tara.good}</div>
            </div>
            <div style={{ padding:'10px 12px', borderRadius:8,
              background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#f87171',
                textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>⚠️ Caution</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>{tara.bad}</div>
            </div>
          </div>

          {/* Dasha advice */}
          <div style={{ padding:'10px 14px', borderRadius:8,
            background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.18)' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#c084fc',
              textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>
              💡 During {planet} Dasha/Antardasha
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>
              {tara.dasha_advice}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaraSummaryGrid({ taraResults }) {
  const byTara = {};
  taraResults.forEach(r => {
    if (!byTara[r.tara.num]) byTara[r.tara.num] = [];
    byTara[r.tara.num].push(r);
  });

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
      {TARAS.map(tara => {
        const planets = byTara[tara.num] || [];
        const q = QUALITY_CONFIG[tara.quality];
        return (
          <div key={tara.num} style={{
            padding:'12px', borderRadius:10,
            background: planets.length>0 ? q.bg : 'rgba(255,255,255,0.02)',
            border:`1px solid ${planets.length>0 ? q.border : 'rgba(255,255,255,0.05)'}`,
          }}>
            <div style={{ marginBottom:4 }}>
              <span style={{ fontSize:18 }}>{tara.icon}</span>
              <div style={{ fontSize:11, fontWeight:700, color:tara.color, marginTop:2 }}>{tara.name}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', marginBottom:4 }}>{tara.meaning}</div>
              <span style={{ padding:'1px 6px', borderRadius:999, fontSize:9, fontWeight:700,
                background:q.bg, color:q.text }}>{tara.quality}</span>
            </div>
            {planets.length>0 ? (
              <div style={{ display:'flex', gap:3, flexWrap:'wrap', marginTop:6 }}>
                {planets.map(p=>(
                  <span key={p.planet} title={p.planet} style={{ fontSize:16 }}>
                    {PLANET_META[p.planet]?.emoji}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.12)', marginTop:4 }}>No planets</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TaraBalam() {
  const [form, setForm]       = useState({ name:'', date:'', time:'', city:'', country:'India' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);
  const [filter, setFilter]   = useState('all');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function calculate(e) {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await api.post('/kundli/generate', form);
      const kundli = res.data.kundli;
      const pp     = kundli.planetary_positions || {};
      const birthNak = kundli.nakshatra?.name || '';

      // Build tara results for all planets
      const taraResults = PLANET_ORDER
        .filter(p => pp[p]?.nakshatra || pp[p])
        .map(planet => {
          // Get nakshatra from planetary_positions
          const pdata  = pp[planet] || {};
          const nakName = pdata.nakshatra?.name || pdata.nakshatra || '';

          // If nakshatra not in kundli data, derive from rashi+degree
          let finalNak = nakName;
          if (!finalNak && pdata.rashi) {
            const RASHIS_SA=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
                             'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
            const ri  = RASHIS_SA.indexOf(pdata.rashi);
            const deg = ri*30 + parseFloat(pdata.degree_in_rashi||0);
            const ni  = Math.floor(deg/(360/27));
            finalNak  = NAKSHATRAS[ni%27] || '';
          }

          if (!finalNak || !birthNak) return null;
          const tara = getTaraFromNaks(birthNak, finalNak);
          if (!tara) return null;
          return { planet, nakshatra:finalNak, tara };
        })
        .filter(Boolean)
        .sort((a,b) => {
          const order=['Excellent','Good','Mixed','Challenging','Difficult','Most Difficult'];
          return order.indexOf(a.tara.quality)-order.indexOf(b.tara.quality);
        });

      setResult({ birthNak, taraResults, personName:form.name, kundli });
    } catch(err) {
      setError(err.response?.data?.detail || 'Could not calculate. Please check your birth details.');
    } finally { setLoading(false); }
  }

  const filtered = result ? (
    filter==='all' ? result.taraResults :
    filter==='good' ? result.taraResults.filter(r=>['Excellent','Good'].includes(r.tara.quality)) :
    filter==='warn' ? result.taraResults.filter(r=>['Challenging','Difficult','Most Difficult'].includes(r.tara.quality)) :
    result.taraResults.filter(r=>r.tara.quality==='Mixed')
  ) : [];

  const inp = { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#f8f4ff',
    fontSize:14, outline:'none', fontFamily:'inherit', appearance:'none' };
  const lbl = { display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)',
    textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 };

  return (
    <div style={{ minHeight:'100vh', background:'#06030f', color:'#f8f4ff',
      fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.3);border-radius:999px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        select option{background:#0d0820}
        input[type="date"],input[type="time"]{color-scheme:dark}
      `}</style>

      {/* Subtle star bg */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[...Array(45)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', borderRadius:'50%',
            width:Math.random()*2+0.5, height:Math.random()*2+0.5,
            left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
            background:'white', opacity:Math.random()*0.3+0.05 }}/>
        ))}
        <div style={{ position:'absolute', top:'5%', right:'10%', width:320, height:320, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(124,58,237,0.07),transparent)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'15%', left:'5%', width:240, height:240, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(16,185,129,0.05),transparent)', pointerEvents:'none' }}/>
      </div>

      {/* Navbar */}
      <nav style={{ position:'sticky', top:0, zIndex:100, backdropFilter:'blur(16px)',
        background:'rgba(6,3,15,0.92)', borderBottom:'1px solid rgba(255,255,255,0.06)',
        padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>✨</span>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700,
            background:'linear-gradient(90deg,#c084fc,#818cf8)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>COSMICA</span>
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/nakshatra" style={{ padding:'7px 14px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            color:'rgba(255,255,255,0.55)', fontSize:12, textDecoration:'none' }}>
            ⭐ Find My Nakshatra
          </Link>
          <Link to="/chart" style={{ padding:'7px 14px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            color:'rgba(255,255,255,0.55)', fontSize:12, textDecoration:'none' }}>Kundli</Link>
        </div>
      </nav>

      <main style={{ maxWidth:760, margin:'0 auto', padding:'32px 16px 80px', position:'relative', zIndex:1 }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:32, animation:'fadeUp 0.5s ease' }}>
          <div style={{ fontSize:52, marginBottom:12 }}>⭐</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif",
            fontSize:'clamp(26px,6vw,44px)', fontWeight:700, lineHeight:1.2, marginBottom:10,
            background:'linear-gradient(135deg,#f8f4ff,#c084fc,#818cf8)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Tara Balam Calculator
          </h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, lineHeight:1.8, maxWidth:480, margin:'0 auto 16px' }}>
            Enter your birth details and discover how each planet's nakshatra
            relates to yours — revealing which planets bring fortune, danger or transformation in your life
          </p>

          {/* Tara pills */}
          <div style={{ display:'flex', gap:5, justifyContent:'center', flexWrap:'wrap' }}>
            {TARAS.map(t=>(
              <span key={t.num} title={t.meaning} style={{
                padding:'3px 9px', borderRadius:999, fontSize:10, fontWeight:600, cursor:'default',
                background:`${t.color}10`, color:t.color, border:`1px solid ${t.color}22`,
              }}>{t.icon} {t.name}</span>
            ))}
          </div>
        </div>

        {/* Birth form */}
        <div style={{ padding:24, borderRadius:18, marginBottom:20,
          background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)',
          animation:'fadeUp 0.5s ease 0.1s both' }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>Enter Your Birth Details</h2>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginBottom:20 }}>
            We'll automatically calculate your nakshatra and all planetary nakshatras
          </p>

          <form onSubmit={calculate}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:14 }}>
              <div style={{ gridColumn:'span 2' }}>
                <label style={lbl}>Full Name (optional)</label>
                <input style={inp} type="text" placeholder="e.g. Arjun Sharma"
                  value={form.name} onChange={e=>set('name',e.target.value)}/>
              </div>
              <div>
                <label style={lbl}>Date of Birth</label>
                <input style={{...inp,fontSize:15}} type="date" value={form.date}
                  onChange={e=>set('date',e.target.value)}
                  max={new Date().toISOString().split('T')[0]} required/>
              </div>
              <div>
                <label style={lbl}>Time of Birth</label>
                <input style={{...inp,fontSize:15}} type="time" value={form.time}
                  onChange={e=>set('time',e.target.value)} required/>
              </div>
              <div>
                <label style={lbl}>Birth City</label>
                <input style={inp} type="text" placeholder="e.g. Mumbai"
                  value={form.city} onChange={e=>set('city',e.target.value)} required/>
              </div>
              <div>
                <label style={lbl}>Country</label>
                <select style={{...inp,cursor:'pointer'}} value={form.country}
                  onChange={e=>set('country',e.target.value)}>
                  {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div style={{ padding:'12px 14px', marginBottom:14, borderRadius:10,
                background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                color:'#f87171', fontSize:13 }}>⚠️ {error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'14px', borderRadius:10, border:'none',
              background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
              color:'white', fontSize:15, fontWeight:700, cursor:'pointer',
              fontFamily:'inherit', boxShadow:'0 4px 20px rgba(124,58,237,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            }}>
              {loading ? (
                <>
                  <div style={{ width:20,height:20,borderRadius:'50%',
                    border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',
                    animation:'spin 0.8s linear infinite' }}/>
                  Calculating your Tara Balam...
                </>
              ) : '⭐ Calculate Tara Balam'}
            </button>
          </form>

          {/* Help link */}
          <div style={{ marginTop:14, textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.25)' }}>
            Don't know your birth time?{' '}
            <Link to="/nakshatra" style={{ color:'#c084fc', textDecoration:'none' }}>
              Find your nakshatra here →
            </Link>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div style={{ animation:'fadeUp 0.5s ease' }}>
            {/* Birth star header */}
            <div style={{ padding:'20px', borderRadius:18, marginBottom:20,
              background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.06))',
              border:'1px solid rgba(139,92,246,0.25)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                flexWrap:'wrap', gap:10, marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:10,fontWeight:700,color:'#c084fc',
                    textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6 }}>
                    ⭐ Tara Balam Analysis
                  </div>
                  <h2 style={{ fontSize:'clamp(16px,3vw,22px)', fontWeight:800, marginBottom:4 }}>
                    {result.personName ? `${result.personName}'s ` : ''}Tara Balam
                  </h2>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <span style={{ padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:700,
                      background:'rgba(124,58,237,0.2)', color:'#c084fc', border:'1px solid rgba(124,58,237,0.3)' }}>
                      🌟 Birth Star: {result.birthNak}
                    </span>
                    <span style={{ padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                      background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.5)' }}>
                      Ruler: {NAK_RULERS[result.birthNak]}
                    </span>
                  </div>
                </div>
                <button onClick={()=>setResult(null)} style={{
                  padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)',
                  fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>🔄 Recalculate</button>
              </div>

              {/* Quick stats */}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[
                  {label:'Auspicious', count:result.taraResults.filter(r=>['Excellent','Good'].includes(r.tara.quality)).length, color:'#10b981'},
                  {label:'Mixed',      count:result.taraResults.filter(r=>r.tara.quality==='Mixed').length, color:'#94a3b8'},
                  {label:'Challenging',count:result.taraResults.filter(r=>['Challenging','Difficult','Most Difficult'].includes(r.tara.quality)).length, color:'#f87171'},
                ].map(s=>(
                  <div key={s.label} style={{ padding:'8px 14px', borderRadius:10,
                    background:`${s.color}0e`, border:`1px solid ${s.color}25` }}>
                    <div style={{ fontWeight:800, fontSize:20, color:s.color }}>{s.count}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overview grid */}
            <div style={{ padding:'16px', borderRadius:14, marginBottom:20,
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.3)',
                textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12 }}>
                All 9 Taras — Quick Overview
              </div>
              <TaraSummaryGrid taraResults={result.taraResults}/>
            </div>

            {/* Planet nakshatra table */}
            <div style={{ padding:'16px', borderRadius:14, marginBottom:20,
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.3)',
                textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12 }}>
                Planetary Nakshatras &amp; Their Taras
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr>
                      {['Planet','Nakshatra','Ruler','Tara','Quality'].map(h=>(
                        <th key={h} style={{ padding:'8px 10px', textAlign:'left',
                          color:'rgba(255,255,255,0.35)', fontWeight:600, fontSize:10,
                          textTransform:'uppercase', letterSpacing:'0.06em',
                          borderBottom:'1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.taraResults.map(r=>{
                      const meta=PLANET_META[r.planet];
                      const q=QUALITY_CONFIG[r.tara.quality];
                      return (
                        <tr key={r.planet} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding:'9px 10px' }}>
                            <span style={{ display:'flex',alignItems:'center',gap:6 }}>
                              <span style={{ fontSize:16 }}>{meta.emoji}</span>
                              <span style={{ fontWeight:700,color:meta.color }}>{r.planet}</span>
                            </span>
                          </td>
                          <td style={{ padding:'9px 10px', color:'rgba(255,255,255,0.7)' }}>{r.nakshatra}</td>
                          <td style={{ padding:'9px 10px', color:'rgba(255,255,255,0.4)' }}>{NAK_RULERS[r.nakshatra]}</td>
                          <td style={{ padding:'9px 10px' }}>
                            <span style={{ display:'flex',alignItems:'center',gap:5 }}>
                              <span>{r.tara.icon}</span>
                              <span style={{ fontWeight:600,color:r.tara.color }}>{r.tara.name}</span>
                            </span>
                          </td>
                          <td style={{ padding:'9px 10px' }}>
                            <span style={{ padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:700,
                              background:q.bg,color:q.text,border:`1px solid ${q.border}` }}>
                              {r.tara.quality}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display:'flex',gap:4,marginBottom:14,
              borderBottom:'1px solid rgba(255,255,255,0.07)',overflowX:'auto' }}>
              {[
                {id:'all', label:`All Planets (${result.taraResults.length})`},
                {id:'good',label:'✨ Auspicious'},
                {id:'warn',label:'⚠️ Challenging'},
                {id:'mixed',label:'~ Mixed'},
              ].map(f=>(
                <button key={f.id} onClick={()=>setFilter(f.id)} style={{
                  padding:'9px 14px',background:'none',border:'none',fontFamily:'inherit',
                  borderBottom:`2px solid ${filter===f.id?'#7c3aed':'transparent'}`,
                  color:filter===f.id?'#c084fc':'rgba(255,255,255,0.4)',
                  fontWeight:filter===f.id?700:400,
                  fontSize:13,cursor:'pointer',marginBottom:-1,whiteSpace:'nowrap',
                }}>{f.label}</button>
              ))}
            </div>

            {/* Detailed planet cards */}
            <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:20 }}>
              {filtered.map((r,i)=>(
                <PlanetTaraCard key={r.planet} planet={r.planet}
                  nakshatra={r.nakshatra} tara={r.tara} index={i}/>
              ))}
            </div>

            {/* Footer note */}
            <div style={{ padding:'14px 16px',borderRadius:12,
              background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',
              fontSize:12,color:'rgba(255,255,255,0.25)',lineHeight:1.8 }}>
              💡 <strong style={{ color:'rgba(255,255,255,0.4)' }}>How to use Tara Balam: </strong>
              During a planet's Mahadasha or Antardasha, check its Tara. Planets in Sampat (2),
              Kshema (4), Sadhana (6), Mitra (8) and Parama Mitra (9) Taras give excellent results.
              Vipat (3), Pratyak (5) and Naidhana (7) require extra caution, remedies and
              spiritual practices during those dasha periods. Click any planet card for detailed guidance.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}