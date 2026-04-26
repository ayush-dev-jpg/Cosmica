// src/pages/Synastry.js
import React, { useState } from 'react';
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

const ASPECT_CONFIG = {
  conjunction:{ color:'#f59e0b', symbol:'☌', label:'Conjunction' },
  trine:      { color:'#10b981', symbol:'△', label:'Trine'       },
  sextile:    { color:'#34d399', symbol:'✶', label:'Sextile'     },
  square:     { color:'#f87171', symbol:'□', label:'Square'      },
  opposition: { color:'#818cf8', symbol:'☍', label:'Opposition'  },
};

const NATURE_COLOR = {
  Harmonious:'#10b981', Supportive:'#34d399',
  Intense:'#f59e0b', Polarizing:'#818cf8', Challenging:'#f87171',
};

const KOOTA_COLORS = {
  Varna:'#a78bfa',Vashya:'#60a5fa',Tara:'#34d399',Yoni:'#f472b6',
  'Graha Maitri':'#f59e0b',Gana:'#c084fc',Bhakoot:'#818cf8',Nadi:'#fb923c',
};

function PersonForm({ title, emoji, color, form, setForm }) {
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = {
    width:'100%', padding:'10px 14px',
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:10, color:'#f8f4ff', fontSize:14, outline:'none', fontFamily:'inherit',
  };
  const lbl = { display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)',
    textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 };

  return (
    <div style={{
      padding:20, borderRadius:14,
      background:`${color}08`, border:`1px solid ${color}33`,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <span style={{ fontSize:28 }}>{emoji}</span>
        <h3 style={{ fontSize:16, fontWeight:700, color }}>{title}</h3>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={{ gridColumn:'span 2' }}>
          <label style={lbl}>Full Name</label>
          <input style={inp} type="text" placeholder="e.g. Arjun Sharma"
            value={form.name} onChange={e=>set('name',e.target.value)} required/>
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
    </div>
  );
}

function ScoreRing({ score, color, size=120 }) {
  const r = (size-16)/2;
  const circ = 2*Math.PI*r;
  const filled = (score/100)*circ;
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={10}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={`${filled} ${circ-filled}`}
          strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 6px ${color}88)`, transition:'stroke-dasharray 1s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:24, fontWeight:800, color }}>{score}</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>/ 100</div>
      </div>
    </div>
  );
}

function KootaBar({ koota }) {
  const [open,setOpen] = useState(false);
  const color = KOOTA_COLORS[koota.name] || '#a78bfa';
  const pct = (koota.score/koota.max)*100;
  return (
    <div style={{ borderRadius:10, overflow:'hidden', marginBottom:6,
      border:`1px solid ${color}22`, background:open?`${color}09`:'rgba(255,255,255,0.02)' }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:10,
        padding:'10px 14px', border:'none', cursor:'pointer',
        background:'transparent', color:'inherit', fontFamily:'inherit', textAlign:'left',
      }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontWeight:700, fontSize:13, color }}>{koota.name}</span>
            <span style={{ fontWeight:800, fontSize:13 }}>{koota.score}/{koota.max}</span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:999, height:5, overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:999,
              transition:'width 0.8s ease' }}/>
          </div>
        </div>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)',
          transform:open?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block' }}>▼</span>
      </button>
      {open && (
        <div style={{ padding:'0 14px 12px', fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>
          <div style={{ marginBottom:4 }}>{koota.meaning}</div>
          {koota.p1 && <div>Person 1: <strong style={{color}}>{koota.p1}</strong> · Person 2: <strong style={{color}}>{koota.p2}</strong></div>}
          {koota.tara_name && <div>Tara: <strong style={{color}}>{koota.tara_name}</strong></div>}
          {koota.dosha && <div style={{color:'#f87171',marginTop:4}}>⚠️ Nadi Dosha present — same Nadi</div>}
        </div>
      )}
    </div>
  );
}

function AspectCard({ aspect, p1name, p2name }) {
  const [open,setOpen] = useState(false);
  const cfg = ASPECT_CONFIG[aspect.aspect] || ASPECT_CONFIG.conjunction;
  const natColor = NATURE_COLOR[aspect.nature] || '#94a3b8';
  const m1 = PLANET_META[aspect.planet1];
  const m2 = PLANET_META[aspect.planet2];

  return (
    <div style={{ borderRadius:10, overflow:'hidden', marginBottom:6,
      border:`1px solid ${natColor}22`,
      background:open?`${natColor}09`:'rgba(255,255,255,0.02)' }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:10,
        padding:'11px 14px', border:'none', cursor:'pointer',
        background:'transparent', color:'inherit', fontFamily:'inherit', textAlign:'left',
      }}>
        <span style={{ fontSize:20 }}>{m1?.emoji}</span>
        <span style={{ fontSize:18, color:cfg.color, fontWeight:700 }}>{cfg.symbol}</span>
        <span style={{ fontSize:20 }}>{m2?.emoji}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13 }}>
            <span style={{ color:m1?.color }}>{p1name}'s {aspect.planet1}</span>
            {' '}{cfg.label}{' '}
            <span style={{ color:m2?.color }}>{p2name}'s {aspect.planet2}</span>
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>
            Orb: {aspect.orb}° · {aspect.p1_rashi} — {aspect.p2_rashi}
          </div>
        </div>
        <span style={{
          padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:700,
          background:`${natColor}18`, color:natColor, border:`1px solid ${natColor}30`,
        }}>{aspect.nature}</span>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)',
          transform:open?'rotate(180deg)':'none', transition:'transform 0.2s',
          display:'inline-block', flexShrink:0 }}>▼</span>
      </button>
      {open && (
        <div style={{ padding:'0 14px 12px', fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.75,
          borderTop:`1px solid ${natColor}18` }}>
          <p style={{ marginBottom:6 }}>{aspect.desc}</p>
          {aspect.meaning && <p style={{ color:'rgba(255,255,255,0.75)', fontStyle:'italic' }}>{aspect.meaning}</p>}
        </div>
      )}
    </div>
  );
}

function OverlayCard({ overlay, hostName, guestName }) {
  const m = PLANET_META[overlay.planet];
  const houseColors = {
    1:'#f87171',2:'#f59e0b',3:'#34d399',4:'#60a5fa',
    5:'#c084fc',6:'#94a3b8',7:'#f472b6',8:'#818cf8',
    9:'#fb923c',10:'#10b981',11:'#fbbf24',12:'#a78bfa',
  };
  const color = houseColors[overlay.house] || '#a78bfa';
  return (
    <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:6,
      background:`${color}09`, border:`1px solid ${color}22`,
      display:'flex', alignItems:'flex-start', gap:12 }}>
      <span style={{ fontSize:22, flexShrink:0 }}>{m?.emoji}</span>
      <div>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>
          <span style={{ color:m?.color }}>{guestName}'s {overlay.planet}</span>
          {' in '}<span style={{ color }}>House {overlay.house}</span>
          {' of '}<span style={{ color:'rgba(255,255,255,0.7)' }}>{hostName}</span>
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>
          {overlay.meaning}
        </div>
      </div>
    </div>
  );
}

function ChartSummary({ person, name }) {
  return (
    <div style={{ padding:'14px 16px', borderRadius:12,
      background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>{name}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {[
          ['🌙 Moon Sign', `${person.moon_rashi_en} (${person.moon_rashi})`],
          ['⭐ Nakshatra',  person.nakshatra],
          ['🪐 Nak. Lord',  person.nakshatra_lord],
          ['🏛️ Lagna',      `${person.lagna?.en} (${person.lagna?.name})`],
          ['🔵 Gana',       person.gana],
          ['🌊 Nadi',       person.nadi],
          ['🐾 Yoni',       person.yoni],
          ['⚡ Varna',      person.varna],
        ].map(([l,v])=>(
          <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
            <span style={{ color:'rgba(255,255,255,0.4)' }}>{l}</span>
            <span style={{ fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Synastry() {
  const [p1Form, setP1Form] = useState({ name:'', date:'', time:'', city:'', country:'India' });
  const [p2Form, setP2Form] = useState({ name:'', date:'', time:'', city:'', country:'India' });
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [aspectFilter, setAspectFilter]   = useState('all');

  async function handleCalculate(e) {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await api.post('/synastry/calculate', {
        person1: p1Form, person2: p2Form,
      });
      setResult(res.data);
      setActiveSection('overview');
    } catch(err) {
      setError(err.response?.data?.detail || 'Could not calculate. Please check all birth details.');
    } finally { setLoading(false); }
  }

  const filteredAspects = result ? (
    aspectFilter === 'all'  ? result.aspects :
    aspectFilter === 'good' ? result.aspects.filter(a=>['Harmonious','Supportive'].includes(a.nature)) :
    result.aspects.filter(a=>['Challenging','Polarizing'].includes(a.nature))
  ) : [];

  const nav = (id,label) => (
    <button onClick={()=>setActiveSection(id)} style={{
      padding:'9px 14px', background:'none', border:'none',
      borderBottom:`2px solid ${activeSection===id?'#7c3aed':'transparent'}`,
      color:activeSection===id?'#c084fc':'rgba(255,255,255,0.4)',
      fontWeight:activeSection===id?700:400,
      fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
      fontFamily:'inherit',
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)', color:'var(--text-primary)' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        select option{background:#0d0820}
        input[type="date"],input[type="time"]{color-scheme:dark}
      `}</style>

      {/* Navbar */}
      <nav style={{ position:'sticky', top:0, zIndex:100, backdropFilter:'blur(16px)',
        background:'rgba(8,6,20,0.92)', borderBottom:'1px solid var(--border)',
        padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>✨</span>
          <span className="font-cinzel gradient-text" style={{ fontSize:17, fontWeight:700 }}>COSMICA</span>
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/compatibility" style={{ padding:'7px 12px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            color:'rgba(255,255,255,0.55)', fontSize:12, textDecoration:'none' }}>💑 Kundli Milan</Link>
          <Link to="/chart" style={{ padding:'7px 12px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            color:'rgba(255,255,255,0.55)', fontSize:12, textDecoration:'none' }}>Kundli</Link>
        </div>
      </nav>

      <main style={{ maxWidth:900, margin:'0 auto', padding:'28px 16px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:28, animation:'fadeUp 0.5s ease' }}>
          <div style={{ fontSize:52, marginBottom:10 }}>💑</div>
          <h1 className="font-cinzel gradient-text"
            style={{ fontSize:'clamp(22px,5vw,38px)', marginBottom:10, lineHeight:1.2 }}>
            Synastry Compatibility
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.8,
            maxWidth:500, margin:'0 auto' }}>
            Complete Vedic synastry — 36 Guna Ashtakoot matching + full planetary aspect analysis
            between both birth charts
          </p>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginTop:14 }}>
            {['36 Guna Matching','Planetary Aspects','House Overlays','Dasha Compatibility'].map(f=>(
              <span key={f} style={{ padding:'3px 10px', borderRadius:999, fontSize:11,
                background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)',
                color:'#c084fc' }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Forms */}
        <form onSubmit={handleCalculate} style={{ animation:'fadeUp 0.5s ease 0.1s both' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',
            gap:16, marginBottom:16 }}>
            <PersonForm title="Person 1" emoji="👨" color="#60a5fa"
              form={p1Form} setForm={setP1Form}/>
            <PersonForm title="Person 2" emoji="👩" color="#f472b6"
              form={p2Form} setForm={setP2Form}/>
          </div>

          {error && (
            <div style={{ padding:'12px 14px', marginBottom:14, borderRadius:10,
              background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
              color:'#f87171', fontSize:13 }}>⚠️ {error}</div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary"
            style={{ width:'100%', padding:'15px', fontSize:16 }}>
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <div style={{ width:20,height:20,borderRadius:'50%',
                  border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',
                  animation:'spin 0.8s linear infinite' }}/>
                Calculating synastry...
              </span>
            ) : '💑 Calculate Synastry Compatibility'}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div style={{ marginTop:28, animation:'fadeUp 0.5s ease' }}>

            {/* Overall score */}
            <div style={{
              padding:'28px', borderRadius:20, marginBottom:20,
              background:`${result.overall.color}0d`,
              border:`2px solid ${result.overall.color}44`,
              display:'flex', alignItems:'center', gap:24, flexWrap:'wrap',
            }}>
              <ScoreRing score={result.overall.score} color={result.overall.color} size={120}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)',
                  textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
                  Overall Compatibility
                </div>
                <h2 style={{ fontSize:'clamp(18px,4vw,28px)', fontWeight:800,
                  color:result.overall.color, marginBottom:8 }}>
                  {result.overall.label}
                </h2>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <span style={{ padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:700,
                    background:'rgba(139,92,246,0.15)', color:'#c084fc',
                    border:'1px solid rgba(139,92,246,0.3)' }}>
                    🪐 Ashtakoot: {result.ashtakoot.total}/36 ({result.ashtakoot.grade})
                  </span>
                  <span style={{ padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                    background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)' }}>
                    ✨ {result.aspects.filter(a=>['Harmonious','Supportive'].includes(a.nature)).length} harmonious aspects
                  </span>
                  <span style={{ padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                    background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)' }}>
                    ⚡ {result.aspects.filter(a=>['Challenging','Polarizing'].includes(a.nature)).length} challenging aspects
                  </span>
                </div>
              </div>
            </div>

            {/* Person summaries */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              <ChartSummary person={result.person1} name={`👨 ${result.person1.name}`}/>
              <ChartSummary person={result.person2} name={`👩 ${result.person2.name}`}/>
            </div>

            {/* Section nav */}
            <div style={{ display:'flex', gap:2, marginBottom:18,
              borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
              {nav('overview',  '📊 Overview')}
              {nav('ashtakoot', '🪐 36 Guna')}
              {nav('aspects',   '✨ Aspects')}
              {nav('overlays',  '🏛️ House Overlays')}
              {nav('dasha',     '⏳ Dasha')}
            </div>

            {/* ── Overview ── */}
            {activeSection==='overview' && (
              <div>
                {/* Ashtakoot summary */}
                <div style={{ padding:'20px', borderRadius:14, marginBottom:16,
                  background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>
                    🪐 36 Guna Match — {result.ashtakoot.total}/36
                  </h3>
                  <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:10, lineHeight:1.7 }}>
                    {result.ashtakoot.verdict}
                  </p>
                  <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:999, height:8, overflow:'hidden' }}>
                    <div style={{
                      width:`${(result.ashtakoot.total/36)*100}%`, height:'100%',
                      background:'linear-gradient(90deg,#ef4444,#f59e0b,#10b981)',
                      borderRadius:999, transition:'width 1s ease',
                    }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:10,
                    color:'var(--text-muted)', marginTop:4 }}>
                    <span>0</span><span>18 (minimum)</span><span>36</span>
                  </div>
                </div>

                {/* Top aspects */}
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>
                  ✨ Key Planetary Connections
                </h3>
                {result.aspects.slice(0,5).map((a,i)=>(
                  <AspectCard key={i} aspect={a}
                    p1name={result.person1.name} p2name={result.person2.name}/>
                ))}

                {/* Dasha preview */}
                <div style={{ padding:'16px', borderRadius:12, marginTop:16,
                  background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.18)' }}>
                  <h3 style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>
                    ⏳ Dasha Lord Compatibility
                  </h3>
                  <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>
                    <strong style={{ color:'#c084fc' }}>{result.dasha_compatibility.relation}</strong>
                    {' — '}{result.dasha_compatibility.desc}
                  </div>
                </div>
              </div>
            )}

            {/* ── Ashtakoot ── */}
            {activeSection==='ashtakoot' && (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <h3 style={{ fontSize:15, fontWeight:700 }}>8 Kootas — Individual Scores</h3>
                  <span style={{ fontSize:20, fontWeight:800, color:'#c084fc' }}>
                    {result.ashtakoot.total}/36
                  </span>
                </div>
                {result.ashtakoot.kootas.map((k,i)=>(
                  <KootaBar key={i} koota={k}/>
                ))}
                <div style={{ marginTop:14, padding:'14px 16px', borderRadius:12,
                  background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)',
                  fontSize:12, color:'var(--text-muted)', lineHeight:1.8 }}>
                  💡 A score of 18+ is generally considered good for marriage.
                  28+ is excellent. The most important kootas are Nadi (8 pts),
                  Bhakoot (7 pts) and Gana (6 pts).
                </div>
              </div>
            )}

            {/* ── Aspects ── */}
            {activeSection==='aspects' && (
              <div>
                <div style={{ display:'flex', gap:4, marginBottom:14,
                  borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
                  {[{id:'all',label:`All (${result.aspects.length})`},
                    {id:'good',label:'✨ Harmonious'},
                    {id:'bad', label:'⚠️ Challenging'},
                  ].map(f=>(
                    <button key={f.id} onClick={()=>setAspectFilter(f.id)} style={{
                      padding:'8px 12px', background:'none', border:'none', fontFamily:'inherit',
                      borderBottom:`2px solid ${aspectFilter===f.id?'#7c3aed':'transparent'}`,
                      color:aspectFilter===f.id?'#c084fc':'rgba(255,255,255,0.4)',
                      fontWeight:aspectFilter===f.id?700:400,
                      fontSize:12, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
                    }}>{f.label}</button>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                  {Object.entries(ASPECT_CONFIG).map(([k,v])=>(
                    <span key={k} style={{ padding:'3px 10px', borderRadius:999, fontSize:11,
                      background:`${v.color}12`, color:v.color, border:`1px solid ${v.color}25` }}>
                      {v.symbol} {v.label}
                    </span>
                  ))}
                </div>

                {filteredAspects.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'32px 0',
                    color:'var(--text-muted)', fontSize:13 }}>
                    No aspects found for this filter
                  </div>
                ) : filteredAspects.map((a,i)=>(
                  <AspectCard key={i} aspect={a}
                    p1name={result.person1.name} p2name={result.person2.name}/>
                ))}
              </div>
            )}

            {/* ── House Overlays ── */}
            {activeSection==='overlays' && (
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>
                  🏛️ {result.person2.name}'s Planets in {result.person1.name}'s Houses
                </h3>
                <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:14, lineHeight:1.7 }}>
                  Shows which areas of {result.person1.name}'s life are activated by {result.person2.name}'s planetary energies
                </p>
                {result.overlays_p2_in_p1.map((o,i)=>(
                  <OverlayCard key={i} overlay={o}
                    hostName={result.person1.name} guestName={result.person2.name}/>
                ))}

                <h3 style={{ fontSize:15, fontWeight:700, margin:'20px 0 6px' }}>
                  🏛️ {result.person1.name}'s Planets in {result.person2.name}'s Houses
                </h3>
                <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:14, lineHeight:1.7 }}>
                  Shows which areas of {result.person2.name}'s life are activated by {result.person1.name}'s planetary energies
                </p>
                {result.overlays_p1_in_p2.map((o,i)=>(
                  <OverlayCard key={i} overlay={o}
                    hostName={result.person2.name} guestName={result.person1.name}/>
                ))}
              </div>
            )}

            {/* ── Dasha Compatibility ── */}
            {activeSection==='dasha' && (
              <div>
                <div style={{ padding:'20px', borderRadius:14, marginBottom:16,
                  background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.2)' }}>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:10 }}>
                    ⏳ Nakshatra Lord Compatibility
                  </h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12,
                    alignItems:'center', marginBottom:14 }}>
                    <div style={{ textAlign:'center', padding:'12px', borderRadius:10,
                      background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)' }}>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>
                        {result.person1.name}
                      </div>
                      <div style={{ fontWeight:700, color:'#60a5fa' }}>{result.dasha_compatibility.nak1}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>
                        Lord: {result.dasha_compatibility.lord1}
                      </div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:24,
                        color: result.dasha_compatibility.relation==='Friendly'?'#10b981':
                               result.dasha_compatibility.relation==='Neutral'?'#f59e0b':'#f87171' }}>
                        {result.dasha_compatibility.relation==='Friendly'?'🤝':
                         result.dasha_compatibility.relation==='Neutral'?'⚖️':'⚡'}
                      </div>
                      <div style={{ fontSize:11, fontWeight:700,
                        color: result.dasha_compatibility.relation==='Friendly'?'#10b981':
                               result.dasha_compatibility.relation==='Neutral'?'#f59e0b':'#f87171' }}>
                        {result.dasha_compatibility.relation}
                      </div>
                    </div>
                    <div style={{ textAlign:'center', padding:'12px', borderRadius:10,
                      background:'rgba(244,114,182,0.1)', border:'1px solid rgba(244,114,182,0.2)' }}>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>
                        {result.person2.name}
                      </div>
                      <div style={{ fontWeight:700, color:'#f472b6' }}>{result.dasha_compatibility.nak2}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>
                        Lord: {result.dasha_compatibility.lord2}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.8 }}>
                    {result.dasha_compatibility.desc}
                  </p>
                </div>

                <div style={{ padding:'14px 16px', borderRadius:12,
                  background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)',
                  fontSize:12, color:'var(--text-muted)', lineHeight:1.8 }}>
                  💡 <strong style={{ color:'var(--text-secondary)' }}>About Dasha Compatibility: </strong>
                  When both partners are running dashas of friendly planets simultaneously,
                  the relationship flourishes with mutual support and growth.
                  Unfriendly dasha periods require extra communication and patience.
                  The nakshatra lords determine the natural energy of each person's current life phase.
                </div>
              </div>
            )}

            {/* Footer note */}
            <div style={{ marginTop:20, padding:'12px 16px', borderRadius:10,
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
              fontSize:12, color:'var(--text-muted)', lineHeight:1.7 }}>
              💡 Synastry analysis combines traditional 36 Guna Ashtakoot with Jyotish planetary aspects.
              Overall score weighs Ashtakoot (60%) and planetary harmony (40%). Always consult a
              qualified Jyotishi for a complete compatibility reading before major life decisions.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}