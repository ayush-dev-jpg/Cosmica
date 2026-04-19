// src/pages/SadeSati.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const COUNTRIES = ['India','USA','UK','Canada','Australia','UAE','Singapore','Nepal','Germany','France','Other'];

const RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
                'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHIS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                   'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// Saturn transit ~2.5 years per sign
// Current Saturn position (approximate — Kumbha/Aquarius as of 2024-2026)
// Saturn enters Meena (Pisces) ~March 2025, exits ~May 2027
const SATURN_TRANSITS = [
  { rashi:'Makara',  rashiEn:'Capricorn',   enter:'2020-01-24', exit:'2023-01-17' },
  { rashi:'Kumbha',  rashiEn:'Aquarius',    enter:'2023-01-17', exit:'2025-03-29' },
  { rashi:'Meena',   rashiEn:'Pisces',      enter:'2025-03-29', exit:'2027-05-30' },
  { rashi:'Mesha',   rashiEn:'Aries',       enter:'2027-05-30', exit:'2029-07-12' },
  { rashi:'Vrishabha',rashiEn:'Taurus',     enter:'2029-07-12', exit:'2032-01-01' },
  { rashi:'Mithuna', rashiEn:'Gemini',      enter:'2032-01-01', exit:'2034-01-01' },
];

function getSaturnRashiOnDate(dateStr) {
  const d = new Date(dateStr);
  for (const t of SATURN_TRANSITS) {
    if (d >= new Date(t.enter) && d < new Date(t.exit)) return t.rashi;
  }
  // fallback extrapolation
  return 'Mesha';
}

function getSadeSatiPhases(moonRashi) {
  const moonIdx = RASHIS.indexOf(moonRashi);
  if (moonIdx < 0) return null;

  // Sade Sati = Saturn in 12th, 1st, 2nd from Moon
  const phase12 = RASHIS[(moonIdx - 1 + 12) % 12]; // sign before moon
  const phase1  = RASHIS[moonIdx];                   // moon sign
  const phase2  = RASHIS[(moonIdx + 1) % 12];        // sign after moon

  // Find Saturn transit dates for each phase
  function findTransits(rashi) {
    return SATURN_TRANSITS.filter(t => t.rashi === rashi);
  }

  const phases = [
    {
      num: 1, name: 'Rising Phase', emoji: '🌒',
      rashi: phase12, rashiEn: RASHIS_EN[(moonIdx - 1 + 12) % 12],
      desc: 'Saturn enters the 12th sign from Moon',
      meaning: 'The beginning — expenses rise, hidden anxieties, foreign travels, sleep disturbances. A time of preparation and inner change.',
      intensity: 'Moderate',
      color: '#f59e0b',
      advice: 'Manage finances carefully. Avoid unnecessary expenses. Good time for spiritual retreats and introspection.',
      transits: findTransits(phase12),
    },
    {
      num: 2, name: 'Peak Phase', emoji: '🌕',
      rashi: phase1, rashiEn: RASHIS_EN[moonIdx],
      desc: 'Saturn directly on Moon sign — the core of Sade Sati',
      meaning: 'The peak — maximum pressure on the mind, health challenges, responsibilities multiply. Career tests and relationship strain. This is when the real transformation happens.',
      intensity: 'High',
      color: '#ef4444',
      advice: 'Stay grounded. Avoid impulsive decisions. Focus on duty and hard work. Health must be prioritized. Spiritual practice is most effective now.',
      transits: findTransits(phase1),
    },
    {
      num: 3, name: 'Setting Phase', emoji: '🌘',
      rashi: phase2, rashiEn: RASHIS_EN[(moonIdx + 1) % 12],
      desc: 'Saturn moves to 2nd sign from Moon',
      meaning: 'The closing chapter — financial pressures, family challenges, speech-related issues. Slowly the burdens begin to lift and results of Saturn\'s lessons become visible.',
      intensity: 'Moderate',
      color: '#f97316',
      advice: 'Watch your words and spending. Family matters need attention. The worst is behind you — stay patient and disciplined.',
      transits: findTransits(phase2),
    },
  ];

  return { phases, moonRashi, moonRashiEn: RASHIS_EN[moonIdx] };
}

function getCurrentPhase(phases, today = new Date()) {
  const todayStr = today.toISOString().split('T')[0];
  const saturnRashi = getSaturnRashiOnDate(todayStr);

  for (const phase of phases) {
    if (phase.rashi === saturnRashi) {
      // Find the specific transit
      const transit = phase.transits.find(t =>
        new Date(t.enter) <= today && today < new Date(t.exit)
      );
      return { phase, transit, saturnRashi, active: true };
    }
  }
  return { phase: null, transit: null, saturnRashi, active: false };
}

function getAllSadeSatiPeriods(phases) {
  // Collect all transit periods across all 3 phases, sorted by date
  const periods = [];
  for (const phase of phases) {
    for (const t of phase.transits) {
      periods.push({ ...t, phase });
    }
  }
  return periods.sort((a,b) => new Date(a.enter) - new Date(b.enter));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { month:'short', year:'numeric', day:'numeric' });
}

function getDuration(enter, exit) {
  const ms   = new Date(exit) - new Date(enter);
  const days = Math.round(ms / (1000*60*60*24));
  const yrs  = Math.floor(days/365);
  const mos  = Math.floor((days%365)/30);
  return yrs > 0 ? `${yrs}y ${mos}m` : `${mos} months`;
}

function getProgress(enter, exit) {
  const now   = new Date();
  const start = new Date(enter);
  const end   = new Date(exit);
  if (now < start) return 0;
  if (now >= end)  return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

function getDaysRemaining(exit) {
  const ms = new Date(exit) - new Date();
  if (ms <= 0) return 0;
  return Math.round(ms / (1000*60*60*24));
}

// ── Moon sign effects by sign ─────────────────────────────────
const MOON_SIGN_EFFECTS = {
  'Mesha':     { peak:'Strong professional challenges and health tests. The native must demonstrate courage and resilience.', remedy:'Recite Hanuman Chalisa daily. Wear red coral (if Mars is strong). Donate blood.' },
  'Vrishabha': { peak:'Financial instability and relationship strain. Material security is tested but ultimately stabilized.', remedy:'Feed cows regularly. Wear blue sapphire after consulting astrologer. Worship Shiva.' },
  'Mithuna':   { peak:'Communication challenges, sibling issues and short travel disruptions. Mental agility is tested.', remedy:'Chant "Om Sham Shanicharaya Namah". Serve workers and laborers.' },
  'Karka':     { peak:'Mother\'s health, property matters and emotional turbulence are highlighted. Home situations shift.', remedy:'Worship Shiva with water. Feed workers. Wear iron ring on middle finger.' },
  'Simha':     { peak:'Career setbacks, ego challenges and authority conflicts. Humility becomes the greatest teacher.', remedy:'Feed crows every Saturday. Donate black sesame. Light mustard oil lamp for Shani.' },
  'Kanya':     { peak:'Health and daily routine disruptions. Service-oriented activities help neutralize Saturn\'s pressure.', remedy:'Serve old people and disabled. Feed sesame to birds. Recite Shani Stotra.' },
  'Tula':      { peak:'Partnership challenges and legal matters may arise. But Tula is Saturn\'s exalted sign — effects are milder.', remedy:'Donate blue cloth on Saturdays. Worship Hanuman. Light lamp for Shanidev.' },
  'Vrishchika':{ peak:'Deep transformation, health crises and secrets revealed. The most intense Sade Sati for Scorpio.', remedy:'Chant Mahamrityunjaya Mantra daily. Visit Shani temples. Feed oil to Shani idol.' },
  'Dhanu':     { peak:'Spiritual growth alongside material challenges. Father-related issues and higher learning disrupted.', remedy:'Read Shani Chalisa on Saturdays. Serve teachers and Brahmins. Feed horses.' },
  'Makara':    { peak:'Saturn rules Capricorn — here Sade Sati brings discipline and hard work leading to lasting success.', remedy:'Continue serving others. Donate to workers. This Saturn is relatively favorable.', },
  'Kumbha':    { peak:'Saturn rules Aquarius — humanitarian service and community work bring relief. Gains through networking.', remedy:'Serve communities and social causes. Donate to charitable organizations. Worship Shani.' },
  'Meena':     { peak:'Spiritual confusion and foreign travel. Expenses on spirituality are indicated. Dreams become vivid.', remedy:'Practice meditation and yoga. Donate to hospitals. Chant "Om Namah Shivaya".'},
};

// ── Components ────────────────────────────────────────────────

function PhaseCard({ phase, isCurrent, transit }) {
  const [open, setOpen] = useState(isCurrent);
  const intensityColor = phase.intensity === 'High' ? '#ef4444' : '#f97316';
  const prog = transit ? getProgress(transit.enter, transit.exit) : null;

  return (
    <div style={{
      borderRadius:14, overflow:'hidden',
      border:`1.5px solid ${isCurrent ? phase.color+'66' : 'rgba(255,255,255,0.07)'}`,
      background: isCurrent ? `${phase.color}0d` : 'rgba(255,255,255,0.02)',
      boxShadow: isCurrent ? `0 0 28px ${phase.color}18` : 'none',
      transition:'all 0.3s',
    }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:14,
        padding:'16px 18px', border:'none', cursor:'pointer',
        background:'transparent', color:'inherit', fontFamily:'inherit', textAlign:'left',
      }}>
        <div style={{
          width:48, height:48, borderRadius:12, flexShrink:0,
          background:`${phase.color}18`, border:`2px solid ${phase.color}44`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
        }}>{phase.emoji}</div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
            <span style={{ fontWeight:800, fontSize:15, color:phase.color }}>
              Phase {phase.num}: {phase.name}
            </span>
            {isCurrent && (
              <span style={{
                padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:700,
                background:phase.color, color:'white',
                animation:'pulse 2s infinite',
              }}>ACTIVE NOW</span>
            )}
            <span style={{
              padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:600,
              background:`${intensityColor}15`, color:intensityColor,
              border:`1px solid ${intensityColor}30`,
            }}>Intensity: {phase.intensity}</span>
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>
            Saturn in {phase.rashiEn} ({phase.rashi}) — {phase.desc}
          </div>
          {isCurrent && transit && prog !== null && (
            <div style={{ marginTop:6 }}>
              <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:999, height:5, overflow:'hidden', marginBottom:3 }}>
                <div style={{ width:`${prog}%`, height:'100%', background:phase.color, borderRadius:999, transition:'width 1s' }}/>
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>
                {prog}% complete · {getDaysRemaining(transit.exit)} days remaining
              </div>
            </div>
          )}
        </div>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)',
          transform:open?'rotate(180deg)':'none', transition:'transform 0.2s',
          display:'inline-block', flexShrink:0 }}>▼</span>
      </button>

      {open && (
        <div style={{ padding:'0 18px 18px', borderTop:`1px solid ${phase.color}18` }}>
          {/* Meaning */}
          <div style={{ padding:'12px 14px', borderRadius:10, marginTop:12, marginBottom:10,
            background:`${phase.color}0a`, border:`1px solid ${phase.color}20` }}>
            <div style={{ fontSize:11, fontWeight:700, color:phase.color,
              textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>
              What this phase brings
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.72)', lineHeight:1.85 }}>
              {phase.meaning}
            </div>
          </div>

          {/* Advice */}
          <div style={{ padding:'12px 14px', borderRadius:10, marginBottom:10,
            background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.18)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#c084fc',
              textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>
              💡 Guidance for this phase
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.8 }}>
              {phase.advice}
            </div>
          </div>

          {/* Transit dates */}
          {phase.transits.length > 0 && (
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)',
                textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
                Saturn in {phase.rashiEn} — Transit Dates
              </div>
              {phase.transits.map((t,i)=>{
                const p = getProgress(t.enter, t.exit);
                const isPast = new Date(t.exit) < new Date();
                const isFuture = new Date(t.enter) > new Date();
                return (
                  <div key={i} style={{ padding:'10px 12px', borderRadius:8, marginBottom:6,
                    background: !isPast && !isFuture ? `${phase.color}12` : 'rgba(255,255,255,0.03)',
                    border:`1px solid ${!isPast && !isFuture ? phase.color+'33' : 'rgba(255,255,255,0.07)'}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:600,
                        color: !isPast && !isFuture ? phase.color : isPast ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)' }}>
                        {formatDate(t.enter)} → {formatDate(t.exit)}
                      </span>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>
                          {getDuration(t.enter, t.exit)}
                        </span>
                        {isPast && <span style={{ fontSize:10, color:'#34d399', fontWeight:600 }}>✓ Completed</span>}
                        {isFuture && <span style={{ fontSize:10, color:'#60a5fa', fontWeight:600 }}>Upcoming</span>}
                        {!isPast && !isFuture && <span style={{ fontSize:10, color:phase.color, fontWeight:700 }}>● Active</span>}
                      </div>
                    </div>
                    {!isPast && !isFuture && (
                      <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:999, height:4, overflow:'hidden' }}>
                        <div style={{ width:`${p}%`, height:'100%', background:phase.color, borderRadius:999 }}/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Timeline({ periods, moonRashiEn }) {
  const today = new Date();

  return (
    <div style={{ position:'relative' }}>
      {/* Vertical line */}
      <div style={{ position:'absolute', left:20, top:0, bottom:0, width:2,
        background:'rgba(255,255,255,0.07)', borderRadius:999 }}/>

      {periods.map((p, i) => {
        const isPast   = new Date(p.exit)  < today;
        const isFuture = new Date(p.enter) > today;
        const isActive = !isPast && !isFuture;
        const prog     = getProgress(p.enter, p.exit);
        const col      = p.phase.color;

        return (
          <div key={i} style={{ display:'flex', gap:16, marginBottom:20, position:'relative' }}>
            {/* Dot */}
            <div style={{ flexShrink:0, position:'relative', zIndex:1 }}>
              <div style={{
                width:40, height:40, borderRadius:'50%',
                background: isActive ? `linear-gradient(135deg,${col}44,${col}11)` : isPast ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
                border:`2px solid ${isActive ? col : isPast ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:16, boxShadow: isActive ? `0 0 16px ${col}44` : 'none',
              }}>{p.phase.emoji}</div>
            </div>

            <div style={{ flex:1, minWidth:0, paddingTop:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ fontWeight:700, fontSize:13,
                  color: isActive ? col : isPast ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.65)' }}>
                  {p.phase.name}
                </span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>
                  Saturn in {p.rashiEn}
                </span>
                {isActive && <span style={{ fontSize:10, fontWeight:700, color:col,
                  padding:'1px 6px', borderRadius:999, background:`${col}18`, border:`1px solid ${col}33` }}>ACTIVE</span>}
                {isPast   && <span style={{ fontSize:10, color:'#34d399', fontWeight:600 }}>Completed</span>}
                {isFuture && <span style={{ fontSize:10, color:'#60a5fa', fontWeight:600 }}>Upcoming</span>}
              </div>

              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:6 }}>
                {formatDate(p.enter)} → {formatDate(p.exit)} · {getDuration(p.enter, p.exit)}
              </div>

              {isActive && (
                <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:999, height:5, overflow:'hidden' }}>
                  <div style={{ width:`${prog}%`, height:'100%', background:`linear-gradient(90deg,${col},${col}aa)`,
                    borderRadius:999, transition:'width 1s' }}/>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SadeSati() {
  const [form, setForm]       = useState({ name:'', date:'', time:'12:00', city:'', country:'India' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function calculate(e) {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null);
    try {
      const res    = await api.post('/kundli/generate', form);
      const kundli = res.data.kundli;
      const moonRashi = kundli.planetary_positions?.Moon?.rashi || kundli.moon_rashi || '';

      if (!moonRashi) throw new Error('Could not determine Moon sign');

      const sadeSatiData  = getSadeSatiPhases(moonRashi);
      if (!sadeSatiData) throw new Error('Invalid Moon sign');

      const currentInfo   = getCurrentPhase(sadeSatiData.phases);
      const allPeriods    = getAllSadeSatiPeriods(sadeSatiData.phases);
      const moonEffect    = MOON_SIGN_EFFECTS[moonRashi] || {};

      // Check if currently in Sade Sati
      const inSadeSati = currentInfo.active;

      // Find next upcoming period
      const nextPeriod = allPeriods.find(p => new Date(p.phase.transits?.[0]?.enter || p.enter) > new Date());

      setResult({
        personName:    form.name,
        moonRashi,
        moonRashiEn:   sadeSatiData.moonRashiEn,
        nakshatra:     kundli.nakshatra?.name || '',
        phases:        sadeSatiData.phases,
        currentInfo,
        allPeriods,
        inSadeSati,
        moonEffect,
        lagna:         kundli.lagna?.name || '',
      });
    } catch(err) {
      setError(err.response?.data?.detail || err.message || 'Could not calculate. Please check your birth details.');
    } finally { setLoading(false); }
  }

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
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes saturnRing{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        select option,input{background:#0d0820}
        input[type="date"],input[type="time"]{color-scheme:dark}
      `}</style>

      {/* Background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[...Array(50)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', borderRadius:'50%',
            width:Math.random()*2+0.5, height:Math.random()*2+0.5,
            left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
            background:'white', opacity:Math.random()*0.25+0.05 }}/>
        ))}
        <div style={{ position:'absolute', top:'8%', right:'5%', width:350, height:350, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(148,163,184,0.06),transparent)' }}/>
        <div style={{ position:'absolute', bottom:'10%', left:'8%', width:280, height:280, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(99,102,241,0.05),transparent)' }}/>
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
          <Link to="/tara-balam" style={{ padding:'7px 14px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            color:'rgba(255,255,255,0.55)', fontSize:12, textDecoration:'none' }}>⭐ Tara Balam</Link>
          <Link to="/chart" style={{ padding:'7px 14px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            color:'rgba(255,255,255,0.55)', fontSize:12, textDecoration:'none' }}>Kundli</Link>
        </div>
      </nav>

      <main style={{ maxWidth:760, margin:'0 auto', padding:'32px 16px 80px', position:'relative', zIndex:1 }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:32, animation:'fadeUp 0.5s ease' }}>
          {/* Saturn illustration */}
          <div style={{ position:'relative', width:80, height:80, margin:'0 auto 16px' }}>
            <div style={{ width:80, height:80, borderRadius:'50%',
              background:'radial-gradient(circle at 35% 35%,rgba(148,163,184,0.4),rgba(100,116,139,0.15))',
              border:'2px solid rgba(148,163,184,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:36, position:'relative', zIndex:1 }}>♄</div>
            {/* Ring */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
              width:110, height:30, borderRadius:'50%',
              border:'3px solid rgba(148,163,184,0.25)', zIndex:0 }}/>
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif",
            fontSize:'clamp(26px,6vw,44px)', fontWeight:700, lineHeight:1.2, marginBottom:10,
            background:'linear-gradient(135deg,#f8f4ff,#94a3b8,#60a5fa)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Sade Sati Calculator
          </h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, lineHeight:1.8,
            maxWidth:500, margin:'0 auto 16px' }}>
            Saturn's famous 7.5-year transit — find out if you're currently under Sade Sati,
            which phase you're in, and what it means for your life
          </p>

          {/* What is Sade Sati */}
          <div style={{ padding:'14px 18px', borderRadius:12, maxWidth:520, margin:'0 auto',
            background:'rgba(148,163,184,0.07)', border:'1px solid rgba(148,163,184,0.15)',
            fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7, textAlign:'left' }}>
            <strong style={{ color:'#94a3b8' }}>What is Sade Sati?</strong> When Saturn (Shani) transits
            through the 12th, 1st, and 2nd signs from your Moon sign, it creates a 7.5-year period of
            intense karmic lessons called Sade Sati. It occurs roughly every 30 years and is the most
            discussed transit in Vedic astrology.
          </div>
        </div>

        {/* Form */}
        <div style={{ padding:24, borderRadius:18, marginBottom:20,
          background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)',
          animation:'fadeUp 0.5s ease 0.1s both' }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>Check Your Sade Sati</h2>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginBottom:20 }}>
            Enter your birth details to calculate your Moon sign and Sade Sati status
          </p>

          <form onSubmit={calculate}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:14 }}>
              <div style={{ gridColumn:'span 2' }}>
                <label style={lbl}>Full Name (optional)</label>
                <input style={inp} type="text" placeholder="e.g. Priya Sharma"
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
                <input style={inp} type="text" placeholder="e.g. Delhi"
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
              background:'linear-gradient(135deg,#475569,#334155)',
              color:'white', fontSize:15, fontWeight:700, cursor:'pointer',
              fontFamily:'inherit', boxShadow:'0 4px 20px rgba(71,85,105,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            }}>
              {loading ? (
                <>
                  <div style={{ width:20,height:20,borderRadius:'50%',
                    border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',
                    animation:'spin 0.8s linear infinite' }}/>
                  Calculating Saturn's position...
                </>
              ) : '♄ Check Sade Sati Status'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div style={{ animation:'fadeUp 0.5s ease' }}>

            {/* Status banner */}
            <div style={{
              padding:'24px', borderRadius:18, marginBottom:20,
              background: result.inSadeSati
                ? 'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(245,158,11,0.06))'
                : 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(59,130,246,0.06))',
              border: `2px solid ${result.inSadeSati ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
              textAlign:'center',
            }}>
              <div style={{ fontSize:52, marginBottom:10 }}>
                {result.inSadeSati ? '⚠️' : '✅'}
              </div>
              <h2 style={{ fontSize:'clamp(18px,4vw,26px)', fontWeight:800, marginBottom:8 }}>
                {result.personName ? `${result.personName} — ` : ''}
                {result.inSadeSati ? 'Currently in Sade Sati' : 'Not in Sade Sati'}
              </h2>
              <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:12 }}>
                <span style={{ padding:'5px 14px', borderRadius:999, fontSize:13, fontWeight:700,
                  background:'rgba(148,163,184,0.15)', color:'#94a3b8', border:'1px solid rgba(148,163,184,0.3)' }}>
                  🌙 Moon in {result.moonRashiEn} ({result.moonRashi})
                </span>
                {result.nakshatra && (
                  <span style={{ padding:'5px 14px', borderRadius:999, fontSize:13, fontWeight:600,
                    background:'rgba(139,92,246,0.12)', color:'#c084fc', border:'1px solid rgba(139,92,246,0.25)' }}>
                    ⭐ {result.nakshatra}
                  </span>
                )}
              </div>
              {result.inSadeSati && result.currentInfo.phase && (
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>
                  You are in the <strong style={{ color:result.currentInfo.phase.color }}>
                  {result.currentInfo.phase.name}</strong> of Sade Sati.
                  {result.currentInfo.transit && (
                    <> This phase ends on <strong style={{ color:'#60a5fa' }}>
                    {formatDate(result.currentInfo.transit.exit)}</strong> ({getDaysRemaining(result.currentInfo.transit.exit)} days remaining).</>
                  )}
                </div>
              )}
              {!result.inSadeSati && (
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
                  Saturn is not currently transiting the 12th, 1st or 2nd house from your Moon sign.
                  Check the timeline below for your past and future Sade Sati periods.
                </div>
              )}
            </div>

            {/* Moon sign specific effect */}
            {result.moonEffect.peak && (
              <div style={{ padding:'16px 18px', borderRadius:14, marginBottom:20,
                background:'rgba(148,163,184,0.06)', border:'1px solid rgba(148,163,184,0.15)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
                  ♄ Sade Sati for {result.moonRashiEn} Moon
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.8, marginBottom:10 }}>
                  {result.moonEffect.peak}
                </div>
                <div style={{ padding:'10px 12px', borderRadius:8,
                  background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.15)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#c084fc',
                    textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>
                    🕉️ Recommended Remedies
                  </div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>
                    {result.moonEffect.remedy}
                  </div>
                </div>
              </div>
            )}

            {/* 3 Phase Cards */}
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)',
              textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
              The 3 Phases of Sade Sati
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {result.phases.map(phase => {
                const isCurrent = result.inSadeSati && result.currentInfo.phase?.num === phase.num;
                const transit   = isCurrent ? result.currentInfo.transit : null;
                return (
                  <PhaseCard key={phase.num} phase={phase} isCurrent={isCurrent} transit={transit}/>
                );
              })}
            </div>

            {/* Timeline */}
            <div style={{ padding:'18px', borderRadius:14, marginBottom:20,
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)',
                textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                📅 Complete Sade Sati Timeline
              </div>
              <Timeline periods={result.allPeriods} moonRashiEn={result.moonRashiEn}/>
            </div>

            {/* General advice */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12, marginBottom:20 }}>
              {[
                { icon:'🙏', title:'Worship', text:'Visit Shani temples every Saturday. Light mustard oil lamp. Chant "Om Sham Shanicharaya Namah" 108 times.' },
                { icon:'🤝', title:'Service', text:'Serve old people, workers and the underprivileged. Feed crows on Saturdays. Donate black sesame and mustard oil.' },
                { icon:'📿', title:'Mantras', text:'Recite Shani Chalisa, Hanuman Chalisa and Mahamrityunjaya Mantra. These are the most powerful shields against Saturn\'s challenges.' },
                { icon:'💎', title:'Remedies', text:'Wear blue sapphire or Neelam only after consulting a qualified astrologer. Iron ring on middle finger also helps.' },
              ].map(a=>(
                <div key={a.icon} style={{ padding:'14px 16px', borderRadius:12,
                  background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{a.icon}</div>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>{a.text}</div>
                </div>
              ))}
            </div>

            {/* Important note */}
            <div style={{ padding:'14px 18px', borderRadius:12,
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
              fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.8 }}>
              💡 <strong style={{ color:'rgba(255,255,255,0.45)' }}>Important: </strong>
              Sade Sati is not always negative. For Moon signs that are compatible with Saturn
              (Tula, Makara, Kumbha), it can bring tremendous growth and achievements.
              The effects also depend on your natal Saturn placement, current Dasha period,
              and other chart factors. Always consult a qualified Jyotishi for personalized guidance.
              Transit dates are approximate and may vary by a few days due to Saturn's retrograde motion.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}