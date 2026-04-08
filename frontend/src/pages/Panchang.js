// src/pages/Panchang.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const COUNTRIES = ['India','USA','UK','Canada','Australia','UAE','Singapore','Nepal','Germany','France','Other'];

const PLANET_META = {
  Sun:{emoji:'☀️',color:'#f59e0b'},Moon:{emoji:'🌙',color:'#60a5fa'},
  Mars:{emoji:'♂',color:'#f87171'},Mercury:{emoji:'☿',color:'#34d399'},
  Jupiter:{emoji:'♃',color:'#c084fc'},Venus:{emoji:'♀',color:'#f472b6'},
  Saturn:{emoji:'♄',color:'#94a3b8'},Rahu:{emoji:'☊',color:'#818cf8'},
  Ketu:{emoji:'☋',color:'#fb923c'},
};

const VARA_EMOJI = {Sunday:'☀️',Monday:'🌙',Tuesday:'♂',Wednesday:'☿',Thursday:'♃',Friday:'♀',Saturday:'♄'};
const GANA_COLOR = {Deva:'#60a5fa',Manav:'#34d399',Raksha:'#f87171'};
const NATURE_COLOR = {Laghu:'#34d399',Mridu:'#60a5fa',Chara:'#c084fc',Sthira:'#f59e0b',Ugra:'#f87171',Tikshna:'#ef4444',Mishra:'#94a3b8'};

function ProgressArc({ pct, color, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        style={{ transition:'stroke-dasharray 0.8s ease', filter:`drop-shadow(0 0 4px ${color}88)` }}/>
    </svg>
  );
}

function PanchangCard({ emoji, title, main, sub, sub2, nature, pct, color, onClick, expanded, children }) {
  const natColor = nature === 'Auspicious' ? '#10b981' : nature === 'Inauspicious' ? '#ef4444' : '#f59e0b';
  return (
    <div onClick={onClick} style={{
      borderRadius: 14, overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
      border: `1px solid ${expanded ? color+'55' : 'rgba(255,255,255,0.07)'}`,
      background: expanded ? `${color}0a` : 'rgba(255,255,255,0.025)',
      transition: 'all 0.25s',
      boxShadow: expanded ? `0 0 24px ${color}15` : 'none',
    }}>
      <div style={{ padding: '16px 18px', display:'flex', alignItems:'center', gap:14 }}>
        {/* Arc + emoji */}
        <div style={{ position:'relative', flexShrink:0 }}>
          {pct != null ? <ProgressArc pct={pct} color={color} size={54}/> : null}
          <div style={{
            position: pct != null ? 'absolute' : 'relative',
            inset: pct != null ? 0 : undefined,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: pct != null ? 20 : 28,
          }}>{emoji}</div>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)',
            textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>{title}</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#f8f4ff', marginBottom:2,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{main}</div>
          {sub && <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{sub}</div>}
          {sub2 && <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{sub2}</div>}
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0 }}>
          {nature && (
            <span style={{ padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:700,
              background:`${natColor}18`, color:natColor, border:`1px solid ${natColor}33` }}>
              {nature}
            </span>
          )}
          {pct != null && <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{pct}% elapsed</div>}
          {onClick && <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)',
            transform:expanded?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block' }}>▼</span>}
        </div>
      </div>
      {expanded && children && (
        <div style={{ padding:'0 18px 18px', borderTop:`1px solid ${color}18` }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TimeBlock({ label, time, color, icon, danger }) {
  return (
    <div style={{
      padding:'14px 16px', borderRadius:12, textAlign:'center',
      background: danger ? 'rgba(239,68,68,0.07)' : `${color}09`,
      border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : color+'22'}`,
    }}>
      <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:4,
        textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
      <div style={{ fontSize:14, fontWeight:800, color: danger ? '#f87171' : color }}>{time}</div>
    </div>
  );
}

function PlanetGrid({ planets }) {
  const order = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:8, marginTop:12 }}>
      {order.map(name => {
        const p = planets[name]; if(!p) return null;
        const m = PLANET_META[name] || { emoji:'🪐', color:'#a78bfa' };
        return (
          <div key={name} style={{
            padding:'12px', borderRadius:10, textAlign:'center',
            background:`${m.color}0a`, border:`1px solid ${m.color}22`,
          }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{m.emoji}</div>
            <div style={{ fontSize:12, fontWeight:700, color:m.color, marginBottom:3 }}>{name}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginBottom:1 }}>{p.rashi_en}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{p.degree}°</div>
          </div>
        );
      })}
    </div>
  );
}

function NakshatraDetail({ nak }) {
  if (!nak) return null;
  return (
    <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {[
          ['Deity',nak.deity],['Gana',nak.gana],
          ['Nature',nak.nature],['Symbol',nak.symbol],
          ['Quality',nak.quality,'span 2'],
        ].map(([l,v,span])=>(
          <div key={l} style={{
            padding:'10px 12px', borderRadius:8,
            background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
            gridColumn: span||undefined,
          }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:13, fontWeight:600, color:
              l==='Gana' ? GANA_COLOR[v]||'#f8f4ff' :
              l==='Nature' ? NATURE_COLOR[v]||'#f8f4ff' : '#f8f4ff' }}>{v}</div>
          </div>
        ))}
      </div>
      {nak.syllables && (
        <div style={{ padding:'12px', borderRadius:10, background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.2)' }}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Auspicious Name Syllables</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {nak.syllables.map((s,i) => (
              <span key={i} style={{ padding:'4px 12px', borderRadius:999, background:'rgba(168,85,247,0.15)',
                border:'1px solid rgba(168,85,247,0.3)', color:'#c084fc', fontWeight:700, fontSize:15 }}>{s}</span>
            ))}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:8 }}>
            Pada {nak.pada} · Ruler: {nak.ruler}
          </div>
        </div>
      )}
    </div>
  );
}

function PanchangResult({ data, isBirth }) {
  const [expanded, setExpanded] = useState({ tithi:true, nakshatra:true, yoga:false, karana:false, vara:false, planets:false });
  const toggle = k => setExpanded(p => ({...p, [k]:!p[k]}));

  if (!data) return null;

  const d = data;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {/* Header band */}
      <div style={{
        padding:'20px', borderRadius:16, marginBottom:4,
        background:'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.06))',
        border:'1px solid rgba(139,92,246,0.2)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(168,85,247,0.9)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>
              {isBirth ? '⭐ Birth Panchang' : '🗓️ Daily Panchang'}
            </div>
            <div style={{ fontSize:20, fontWeight:800 }}>
              {isBirth && d.name ? `${d.name}'s ` : ''}{d.date}
              {isBirth && d.time ? ` · ${d.time}` : ''}
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{d.location}</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
            <div style={{ textAlign:'center', padding:'8px 14px', borderRadius:10, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize:18 }}>☀️</div>
              <div style={{ fontSize:11, color:'#f59e0b', fontWeight:600 }}>{d.sunrise}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>Sunrise</div>
            </div>
            <div style={{ textAlign:'center', padding:'8px 14px', borderRadius:10, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize:18 }}>🌅</div>
              <div style={{ fontSize:11, color:'#818cf8', fontWeight:600 }}>{d.sunset}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>Sunset</div>
            </div>
          </div>
        </div>
        {/* Quick badges */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[
            {l:'Tithi',v:`${d.tithi?.name} (${d.tithi?.paksha?.split(' ')[0]})`},
            {l:'Nakshatra',v:`${d.nakshatra?.name} P${d.nakshatra?.pada}`},
            {l:'Yoga',v:d.yoga?.name},
            {l:'Vara',v:d.vara?.name},
          ].map(({l,v})=>(
            <span key={l} style={{ padding:'4px 10px', borderRadius:999, fontSize:11,
              background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
              color:'rgba(255,255,255,0.7)' }}>
              <span style={{ color:'rgba(255,255,255,0.35)' }}>{l}: </span>{v}
            </span>
          ))}
        </div>
      </div>

      {/* Tithi */}
      <PanchangCard emoji="🌑" title="Tithi · Lunar Day" main={d.tithi?.name}
        sub={`${d.tithi?.paksha} · Lord: ${d.tithi?.lord}`}
        sub2={`Nature: ${d.tithi?.nature}`}
        nature={d.tithi?.nature === 'Nanda' || d.tithi?.nature === 'Purna' ? 'Auspicious' :
                d.tithi?.nature === 'Rikta' ? 'Inauspicious' : 'Mixed'}
        pct={d.tithi?.pct} color="#818cf8"
        onClick={()=>toggle('tithi')} expanded={expanded.tithi}>
        <div style={{ paddingTop:12, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[['Tithi #',d.tithi?.number],['Paksha',d.tithi?.paksha?.split(' ')[0]],['Deity',d.tithi?.lord]].map(([l,v])=>(
            <div key={l} style={{ padding:'10px',borderRadius:8,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',textAlign:'center' }}>
              <div style={{ fontSize:9,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:13,fontWeight:700 }}>{v}</div>
            </div>
          ))}
        </div>
      </PanchangCard>

      {/* Nakshatra */}
      <PanchangCard emoji="⭐" title="Nakshatra · Birth Star" main={d.nakshatra?.name}
        sub={`Pada ${d.nakshatra?.pada} · Ruler: ${d.nakshatra?.ruler}`}
        sub2={d.nakshatra?.quality}
        nature={d.nakshatra?.nature === 'Mridu' || d.nakshatra?.nature === 'Laghu' ? 'Auspicious' :
                d.nakshatra?.nature === 'Ugra' || d.nakshatra?.nature === 'Tikshna' ? 'Inauspicious' : 'Mixed'}
        pct={d.nakshatra?.pct} color="#c084fc"
        onClick={()=>toggle('nakshatra')} expanded={expanded.nakshatra}>
        <NakshatraDetail nak={d.nakshatra}/>
      </PanchangCard>

      {/* Yoga */}
      <PanchangCard emoji="🔯" title="Yoga · Sun-Moon Union" main={d.yoga?.name}
        sub={d.yoga?.desc} nature={d.yoga?.nature}
        pct={d.yoga?.pct} color={d.yoga?.nature==='Auspicious'?'#10b981':'#ef4444'}
        onClick={()=>toggle('yoga')} expanded={expanded.yoga}>
        <div style={{ paddingTop:12, fontSize:13, lineHeight:1.8, color:'rgba(255,255,255,0.6)' }}>
          {d.yoga?.desc}
        </div>
      </PanchangCard>

      {/* Karana */}
      <PanchangCard emoji="🌓" title="Karana · Half-Tithi" main={d.karana?.name}
        sub={d.karana?.nature} nature={d.karana?.nature?.includes('Auspicious')?'Auspicious':d.karana?.nature?.includes('Inauspicious')?'Inauspicious':'Neutral'}
        pct={d.karana?.pct} color="#f59e0b"
        onClick={()=>toggle('karana')} expanded={expanded.karana}>
        <div style={{ paddingTop:12, fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
          Each Tithi has two Karanas. The Karana indicates the quality of the half-day period.
          <br/><strong style={{ color:'#f59e0b' }}>{d.karana?.name}</strong> — {d.karana?.nature}
        </div>
      </PanchangCard>

      {/* Vara */}
      <PanchangCard emoji={VARA_EMOJI[d.vara?.name]||'📅'} title="Vara · Weekday"
        main={d.vara?.name} sub={`Ruled by ${d.vara?.lord}`} sub2={`Good for: ${d.vara?.good_for}`}
        nature={d.vara?.nature} color="#34d399"
        onClick={()=>toggle('vara')} expanded={expanded.vara}>
        <div style={{ paddingTop:12 }}>
          <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.15)', fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>
            <strong style={{ color:'#34d399' }}>Best activities today:</strong> {d.vara?.good_for}
          </div>
        </div>
      </PanchangCard>

      {/* Auspicious & Inauspicious times */}
      <div style={{ padding:'16px', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
          ⏰ Important Timings
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:8 }}>
          <TimeBlock label="Brahma Muhurta" time={d.auspicious?.brahma_muhurta} color="#f59e0b" icon="🌄" />
          <TimeBlock label="Abhijit Muhurta" time={d.auspicious?.abhijit} color="#10b981" icon="⚡" />
          <TimeBlock label="Rahu Kala" time={d.inauspicious?.rahu_kala} color="#ef4444" icon="☊" danger />
          <TimeBlock label="Gulika Kala" time={d.inauspicious?.gulika} color="#ef4444" icon="🔴" danger />
          <TimeBlock label="Yamaganda" time={d.inauspicious?.yamaganda} color="#ef4444" icon="⚠️" danger />
        </div>
      </div>

      {/* Sun & Moon */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[{name:'Sun',emoji:'☀️',color:'#f59e0b',d:d.sun},{name:'Moon',emoji:'🌙',color:'#60a5fa',d:d.moon}].map(p=>(
          <div key={p.name} style={{ padding:'14px', borderRadius:12, background:`${p.color}09`, border:`1px solid ${p.color}22`, textAlign:'center' }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{p.emoji}</div>
            <div style={{ fontWeight:700, color:p.color, marginBottom:3 }}>{p.name} in {p.d?.rashi_en}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{p.d?.rashi} · {p.d?.degree}°</div>
          </div>
        ))}
      </div>

      {/* All Planets */}
      <div style={{ padding:'16px', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={()=>toggle('planets')} style={{
          width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
          background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.7)',
          fontSize:13, fontWeight:600,
        }}>
          <span>🪐 All Planetary Positions</span>
          <span style={{ fontSize:10, transform:expanded.planets?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block', color:'rgba(255,255,255,0.3)' }}>▼</span>
        </button>
        {expanded.planets && <PlanetGrid planets={d.planets}/>}
      </div>
    </div>
  );
}

export default function Panchang() {
  const [mode, setMode]       = useState('daily');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Daily form
  const [dDate, setDDate]     = useState(new Date().toISOString().split('T')[0]);
  const [dCity, setDCity]     = useState('New Delhi');
  const [dCountry, setDCountry] = useState('India');

  // Birth form
  const [bName, setBName]     = useState('');
  const [bDate, setBDate]     = useState('');
  const [bTime, setBTime]     = useState('');
  const [bCity, setBCity]     = useState('');
  const [bCountry, setBCountry] = useState('India');

  useEffect(() => { if (mode === 'daily') fetchDaily(); }, []);

  async function fetchDaily() {
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await api.post('/panchang/daily', { date:dDate, city:dCity, country:dCountry });
      setResult(res.data);
    } catch { setError('Could not fetch panchang. Please try again.'); }
    finally { setLoading(false); }
  }

  async function fetchBirth(e) {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await api.post('/panchang/birth', { date:bDate, time:bTime, city:bCity, country:bCountry, name:bName });
      setResult(res.data);
    } catch { setError('Could not calculate birth panchang.'); }
    finally { setLoading(false); }
  }

  const inp = { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#f8f4ff', fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 };

  return (
    <div style={{ minHeight:'100vh', background:'#080614', color:'#f8f4ff', fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px } ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.3); border-radius:999px }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fade-up { animation:fadeUp 0.5s ease both }
        input[type="date"], input[type="time"] { color-scheme:dark }
        select option { background:#1a1530 }
      `}</style>

      {/* Stars bg */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        {[...Array(40)].map((_,i)=>(
          <div key={i} style={{
            position:'absolute', borderRadius:'50%',
            width: Math.random()*2+1, height: Math.random()*2+1,
            left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
            background:'white', opacity:Math.random()*0.4+0.1,
            animation:`spinSlow ${Math.random()*20+10}s linear infinite`,
          }}/>
        ))}
      </div>

      {/* Navbar */}
      <nav style={{
        position:'sticky', top:0, zIndex:100, backdropFilter:'blur(16px)',
        background:'rgba(8,6,20,0.9)', borderBottom:'1px solid rgba(255,255,255,0.06)',
        padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>✨</span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, background:'linear-gradient(90deg,#c084fc,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>COSMICA</span>
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/chart" style={{ padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)', fontSize:12, textDecoration:'none', fontWeight:500 }}>Kundli</Link>
          <Link to="/compatibility" style={{ padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)', fontSize:12, textDecoration:'none', fontWeight:500 }}>Compatibility</Link>
        </div>
      </nav>

      <main style={{ maxWidth:720, margin:'0 auto', padding:'32px 16px 80px', position:'relative', zIndex:1 }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:32 }} className="fade-up">
          <div style={{ fontSize:52, marginBottom:12 }}>🗓️</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(26px,6vw,42px)', fontWeight:700, marginBottom:10, lineHeight:1.2,
            background:'linear-gradient(135deg,#f8f4ff,#c084fc,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Panchang
          </h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, lineHeight:1.7, maxWidth:420, margin:'0 auto' }}>
            The five limbs of Vedic time — Tithi, Nakshatra, Yoga, Karana & Vara — for any moment in time
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:4, marginBottom:24 }}>
          {[['daily','🗓️ Daily Panchang'],['birth','⭐ Birth Panchang']].map(([id,label])=>(
            <button key={id} onClick={()=>{setMode(id);setResult(null);}} style={{
              flex:1, padding:'11px', borderRadius:9, border:'none', cursor:'pointer',
              background: mode===id ? 'rgba(139,92,246,0.25)' : 'transparent',
              color: mode===id ? '#c084fc' : 'rgba(255,255,255,0.4)',
              fontWeight: mode===id ? 700 : 500, fontSize:14,
              borderBottom: mode===id ? '2px solid #c084fc' : '2px solid transparent',
              transition:'all 0.2s', fontFamily:'inherit',
            }}>{label}</button>
          ))}
        </div>

        {/* Daily form */}
        {mode === 'daily' && (
          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:20 }} className="fade-up">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={lbl}>Date</label>
                <input style={{...inp,fontSize:15}} type="date" value={dDate} onChange={e=>setDDate(e.target.value)} max={new Date().toISOString().split('T')[0]}/>
              </div>
              <div>
                <label style={lbl}>City</label>
                <input style={inp} type="text" placeholder="New Delhi" value={dCity} onChange={e=>setDCity(e.target.value)}/>
              </div>
              <div>
                <label style={lbl}>Country</label>
                <select style={inp} value={dCountry} onChange={e=>setDCountry(e.target.value)}>
                  {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button onClick={fetchDaily} disabled={loading} style={{
              width:'100%', padding:'13px', borderRadius:10, border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,rgba(124,58,237,0.8),rgba(79,70,229,0.8))',
              color:'white', fontSize:15, fontWeight:700, fontFamily:'inherit',
            }}>
              {loading ? '✨ Fetching Panchang...' : '🗓️ Get Today\'s Panchang'}
            </button>
          </div>
        )}

        {/* Birth form */}
        {mode === 'birth' && (
          <form onSubmit={fetchBirth} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:20 }} className="fade-up">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div style={{ gridColumn:'span 2' }}>
                <label style={lbl}>Full Name (optional)</label>
                <input style={inp} type="text" placeholder="e.g. Arjun Sharma" value={bName} onChange={e=>setBName(e.target.value)}/>
              </div>
              <div>
                <label style={lbl}>Date of Birth</label>
                <input style={{...inp,fontSize:15}} type="date" value={bDate} onChange={e=>setBDate(e.target.value)} required/>
              </div>
              <div>
                <label style={lbl}>Time of Birth</label>
                <input style={{...inp,fontSize:15}} type="time" value={bTime} onChange={e=>setBTime(e.target.value)} required/>
              </div>
              <div>
                <label style={lbl}>Birth City</label>
                <input style={inp} type="text" placeholder="e.g. Mumbai" value={bCity} onChange={e=>setBCity(e.target.value)} required/>
              </div>
              <div>
                <label style={lbl}>Country</label>
                <select style={inp} value={bCountry} onChange={e=>setBCountry(e.target.value)}>
                  {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px', borderRadius:10, border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,rgba(124,58,237,0.8),rgba(79,70,229,0.8))',
              color:'white', fontSize:15, fontWeight:700, fontFamily:'inherit',
            }}>
              {loading ? '⭐ Calculating...' : '⭐ Calculate Birth Panchang'}
            </button>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid rgba(139,92,246,0.2)', borderTop:'3px solid #c084fc', animation:'spinSlow 1s linear infinite', margin:'0 auto 16px' }}/>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Consulting the cosmos...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding:'14px 16px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', fontSize:13, marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="fade-up">
            <PanchangResult data={result} isBirth={mode==='birth'}/>
          </div>
        )}

        {/* Info footer */}
        <div style={{ marginTop:24, padding:'14px 18px', borderRadius:12, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', fontSize:12, color:'rgba(255,255,255,0.25)', lineHeight:1.8, textAlign:'center' }}>
          Panchang calculated using Swiss Ephemeris · Lahiri Ayanamsa · All times in local timezone
        </div>
      </main>
    </div>
  );
}