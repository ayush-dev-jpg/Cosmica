// src/components/FullPredictions.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const PLANET_META = {
  Sun:     { emoji:'☀️', color:'#f59e0b', glow:'#f59e0b30', name:'Sun (Surya)',     meaning:'Soul, confidence & life purpose',    house_theme:'Authority & vitality' },
  Moon:    { emoji:'🌙', color:'#60a5fa', glow:'#60a5fa30', name:'Moon (Chandra)',  meaning:'Mind, emotions & inner world',       house_theme:'Feelings & intuition' },
  Mars:    { emoji:'🔥', color:'#f87171', glow:'#f8717130', name:'Mars (Mangal)',   meaning:'Energy, courage & ambition',         house_theme:'Action & drive' },
  Mercury: { emoji:'💫', color:'#34d399', glow:'#34d39930', name:'Mercury (Budha)', meaning:'Intelligence, speech & business',    house_theme:'Communication & wit' },
  Jupiter: { emoji:'✨', color:'#c084fc', glow:'#c084fc30', name:'Jupiter (Guru)',  meaning:'Wisdom, luck & divine blessings',    house_theme:'Expansion & grace' },
  Venus:   { emoji:'💎', color:'#f472b6', glow:'#f472b630', name:'Venus (Shukra)', meaning:'Love, beauty & life pleasures',      house_theme:'Relationships & joy' },
  Saturn:  { emoji:'⏳', color:'#94a3b8', glow:'#94a3b830', name:'Saturn (Shani)', meaning:'Karma, discipline & life lessons',   house_theme:'Responsibility & growth' },
  Rahu:    { emoji:'🌐', color:'#818cf8', glow:'#818cf830', name:'Rahu',            meaning:'Worldly desires & foreign matters',  house_theme:'Obsession & ambition' },
  Ketu:    { emoji:'🔮', color:'#fb923c', glow:'#fb923c30', name:'Ketu',            meaning:'Spirituality & past-life karma',     house_theme:'Liberation & detachment' },
};

const RASHIS_SA = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHIS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const HOUSE_AREAS = {
  1:'Self & Body', 2:'Wealth & Family', 3:'Siblings & Courage', 4:'Home & Mother',
  5:'Children & Creativity', 6:'Health & Service', 7:'Marriage & Business',
  8:'Hidden Matters & Transformation', 9:'Luck & Higher Purpose',
  10:'Career & Fame', 11:'Gains & Social Life', 12:'Spirituality & Foreign Lands',
};

const TYPE_META = {
  planet_house:{ label:'Position Reading', icon:'🏠', color:'#c084fc' },
  planet_sign: { label:'Sign Influence',   icon:'♈', color:'#60a5fa' },
  lord_house:  { label:'Lord Effect',      icon:'👑', color:'#f59e0b' },
};

const PLANET_ORDER = ['Sun','Moon','Jupiter','Venus','Mars','Mercury','Saturn','Rahu','Ketu'];

// ── Celestial orb button ──────────────────────────────────────
function PlanetOrb({ planet, isActive, hasReadings, onClick }) {
  const m = PLANET_META[planet] || { emoji:'🪐', color:'#a78bfa', glow:'#a78bfa20' };
  return (
    <button onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'center', gap:6,
      padding:'12px 10px', minWidth:70, border:'none', cursor:hasReadings?'pointer':'default',
      background:'none', flexShrink:0, position:'relative',
    }}>
      {/* Orb */}
      <div style={{
        width:52, height:52, borderRadius:'50%',
        background: isActive
          ? `radial-gradient(circle at 35% 35%, ${m.color}44, ${m.color}18)`
          : hasReadings ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: isActive ? `2px solid ${m.color}` : hasReadings ? `1px solid rgba(255,255,255,0.12)` : `1px solid rgba(255,255,255,0.05)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:22, transition:'all 0.25s',
        boxShadow: isActive ? `0 0 20px ${m.glow}` : 'none',
      }}>
        {m.emoji}
      </div>
      {/* Name */}
      <span style={{
        fontSize:10, fontWeight: isActive ? 700 : 500, lineHeight:1.2,
        color: isActive ? m.color : hasReadings ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)',
        textAlign:'center', transition:'color 0.2s',
      }}>{planet}</span>
      {/* Active dot */}
      {isActive && (
        <div style={{ width:4, height:4, borderRadius:'50%', background:m.color, marginTop:-2 }}/>
      )}
      {/* Readings count badge */}
      {hasReadings && !isActive && (
        <div style={{
          position:'absolute', top:8, right:8,
          width:16, height:16, borderRadius:'50%',
          background:m.color, fontSize:9, fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center', color:'white',
        }}>{hasReadings}</div>
      )}
    </button>
  );
}

// ── Reading card ──────────────────────────────────────────────
function ReadingCard({ reading, planetColor, index, autoOpen }) {
  const [open, setOpen] = useState(autoOpen);
  const tm = TYPE_META[reading.type] || TYPE_META.planet_house;

  return (
    <div style={{
      borderRadius:16, overflow:'hidden', marginBottom:8,
      background: open ? `${planetColor}07` : 'rgba(255,255,255,0.025)',
      border:`1px solid ${open ? planetColor+'30' : 'rgba(255,255,255,0.08)'}`,
      transition:'all 0.25s',
    }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'15px 18px', border:'none', cursor:'pointer', textAlign:'left',
        background:'none',
      }}>
        {/* Type icon */}
        <div style={{
          width:34, height:34, borderRadius:10, flexShrink:0,
          background:`${tm.color}15`, border:`1px solid ${tm.color}25`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
        }}>{tm.icon}</div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.88)',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>
            {reading.title}
          </div>
          <div style={{ fontSize:11, color:`${tm.color}aa`, fontWeight:600 }}>
            {tm.label}
          </div>
        </div>

        <div style={{
          width:24, height:24, borderRadius:'50%', flexShrink:0,
          background:'rgba(255,255,255,0.05)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:10, color:'rgba(255,255,255,0.35)',
          transform:open?'rotate(180deg)':'none', transition:'transform 0.2s',
        }}>▼</div>
      </button>

      {open && (
        <div style={{
          padding:'4px 18px 20px',
          borderTop:`1px solid ${planetColor}15`,
        }}>
          <div style={{
            fontSize:15, lineHeight:1.95,
            color:'rgba(255,255,255,0.78)',
            fontFamily:"'Georgia', 'Times New Roman', serif",
            letterSpacing:'0.015em',
            whiteSpace:'pre-wrap',
          }}>
            {reading.text?.replace(/\. +/g,'.\n\n').trim()}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary cards ─────────────────────────────────────────────
function SummaryCards({ sections }) {
  if (!sections?.length) return null;
  const withData = sections.filter(s=>s.readings?.length>0);
  if (!withData.length) return null;
  const benefics  = withData.filter(s=>['Jupiter','Venus','Moon','Mercury'].includes(s.planet)).slice(0,2);
  const spotlight = withData[0];

  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>
        Your chart at a glance
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
        {benefics.map(s=>{
          const m = PLANET_META[s.planet];
          return (
            <div key={s.planet} style={{
              padding:'16px', borderRadius:14,
              background:`${m.color}0e`, border:`1px solid ${m.color}25`,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:20 }}>{m.emoji}</span>
                <div>
                  <div style={{ fontSize:13,fontWeight:700,color:m.color }}>{s.planet}</div>
                  <div style={{ fontSize:10,color:'rgba(255,255,255,0.35)' }}>House {s.house}</div>
                </div>
                <div style={{ marginLeft:'auto',padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:700,
                  background:`${m.color}18`,color:m.color }}>{s.readings.length} insights</div>
              </div>
              <div style={{ fontSize:12,color:'rgba(255,255,255,0.5)',lineHeight:1.5 }}>{m.meaning}</div>
            </div>
          );
        })}
        {spotlight && (
          <div style={{
            padding:'16px', borderRadius:14,
            background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
            display:'flex', flexDirection:'column', justifyContent:'center',
          }}>
            <div style={{ fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:6 }}>TOTAL INSIGHTS</div>
            <div style={{ fontSize:32,fontWeight:800,color:'rgba(255,255,255,0.9)',lineHeight:1 }}>
              {sections.reduce((a,s)=>a+(s.readings?.length||0),0)}
            </div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,0.35)',marginTop:4 }}>
              across {sections.filter(s=>s.readings?.length>0).length} planets
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chatbot ───────────────────────────────────────────────────
function Chat({ summary, personName, lagna, onClose }) {
  const [msgs,  setMsgs]  = useState([{role:'assistant',content:`Namaste 🙏 I've read your complete birth chart. Ask me anything about your life — career, love, health, money, or spiritual path. I'll explain it clearly.`}]);
  const [input, setInput] = useState('');
  const [busy,  setBusy]  = useState(false);
  const endRef = useRef(null);

  const QUICK = ['💼 Career & money prospects','❤️ Love life & marriage','🌟 My biggest strengths','⚠️ What challenges to expect','🕉️ Remedies for my chart'];

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs]);

  async function send(text) {
    const q = text||input.trim(); if(!q||busy) return;
    setInput('');
    const hist = msgs.map(m=>({role:m.role,content:m.content}));
    setMsgs(p=>[...p,{role:'user',content:q}]);
    setBusy(true);
    try {
      const r = await api.post('/predictions-full/chat',{question:q,chart_summary:summary,person_name:personName,lagna,history:hist.slice(-6)});
      setMsgs(p=>[...p,{role:'assistant',content:r.data.answer}]);
    } catch { setMsgs(p=>[...p,{role:'assistant',content:'Sorry, please try again.'}]); }
    finally { setBusy(false); }
  }

  return (
    <div style={{
      position:'fixed', bottom:80, right:16,
      width:'min(390px,calc(100vw-32px))',
      background:'rgba(9,7,22,0.98)', backdropFilter:'blur(24px)',
      border:'1px solid rgba(124,58,237,0.35)', borderRadius:20,
      boxShadow:'0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.08)',
      display:'flex', flexDirection:'column', maxHeight:'68vh', zIndex:600,
    }}>
      <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)',
        display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,
          background:'rgba(124,58,237,0.2)',border:'1px solid rgba(139,92,246,0.4)',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🔮</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14,fontWeight:700,color:'rgba(255,255,255,0.9)' }}>Ask Your Astrologer</div>
          <div style={{ fontSize:11,color:'#34d399',display:'flex',alignItems:'center',gap:5 }}>
            <div style={{ width:5,height:5,borderRadius:'50%',background:'#34d399',
              animation:'pulse 2s infinite' }}/>
            Online · Reading your chart
          </div>
        </div>
        <button onClick={onClose} style={{ background:'none',border:'none',
          color:'rgba(255,255,255,0.35)',fontSize:18,cursor:'pointer',padding:4 }}>✕</button>
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',gap:12 }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-end' }}>
            {m.role==='assistant' && (
              <div style={{ width:28,height:28,borderRadius:8,flexShrink:0,
                background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:12 }}>🔮</div>
            )}
            <div style={{
              maxWidth:'83%', padding:'11px 15px',
              borderRadius:m.role==='user'?'18px 4px 18px 18px':'4px 18px 18px 18px',
              background:m.role==='user'?'rgba(124,58,237,0.22)':'rgba(255,255,255,0.06)',
              border:m.role==='user'?'1px solid rgba(139,92,246,0.3)':'1px solid rgba(255,255,255,0.08)',
              fontSize:14, lineHeight:1.8, color:'rgba(255,255,255,0.85)',
              fontFamily:"'Georgia',serif",
            }}>{m.content}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display:'flex',gap:8,alignItems:'flex-end' }}>
            <div style={{ width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:12 }}>🔮</div>
            <div style={{ padding:'12px 16px',borderRadius:'4px 18px 18px 18px',
              background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',
              display:'flex',gap:5,alignItems:'center' }}>
              {[0,1,2].map(i=>(
                <div key={i} style={{ width:7,height:7,borderRadius:'50%',background:'#c084fc',
                  animation:`bounce 1.2s infinite ${i*0.18}s` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {msgs.length<=2 && (
        <div style={{ padding:'0 12px 10px',display:'flex',flexDirection:'column',gap:6 }}>
          {QUICK.map((q,i)=>(
            <button key={i} onClick={()=>send(q)} style={{
              padding:'9px 14px',borderRadius:10,textAlign:'left',
              background:'rgba(124,58,237,0.08)',border:'1px solid rgba(139,92,246,0.18)',
              color:'rgba(192,132,252,0.9)',fontSize:13,cursor:'pointer',
              transition:'background 0.15s',
            }}>{q}</button>
          ))}
        </div>
      )}

      <div style={{ padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.07)',
        flexShrink:0,display:'flex',gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
          placeholder="Ask about career, love, health..."
          style={{ flex:1,padding:'10px 14px',borderRadius:12,
            background:'rgba(255,255,255,0.06)',border:'1px solid rgba(124,58,237,0.2)',
            color:'rgba(255,255,255,0.88)',fontSize:14,outline:'none',
            fontFamily:"'Georgia',serif" }}/>
        <button onClick={()=>send()} disabled={!input.trim()||busy} style={{
          width:42,height:42,borderRadius:12,flexShrink:0,border:'none',
          background:input.trim()&&!busy?'linear-gradient(135deg,#7c3aed,#4f46e5)':'rgba(255,255,255,0.05)',
          color:'white',fontSize:18,cursor:'pointer',
          boxShadow:input.trim()&&!busy?'0 4px 16px rgba(124,58,237,0.3)':'none',
          transition:'all 0.2s',
        }}>↑</button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function FullPredictions({ kundli, lagna, personName }) {
  const [data,   setData]   = useState(null);
  const [load,   setLoad]   = useState(false);
  const [err,    setErr]    = useState('');
  const [active, setActive] = useState(null);
  const [chat,   setChat]   = useState(false);

  useEffect(()=>{ if(kundli&&lagna) loadData(); },[kundli,lagna]);

  async function loadData() {
    setLoad(true); setErr('');
    try {
      const r = await api.post('/predictions-full/generate',{kundli,lagna,person_name:personName});
      setData(r.data);
      const first = PLANET_ORDER.find(p=>r.data.sections?.find(s=>s.planet===p&&s.readings?.length>0));
      setActive(first || r.data.sections?.[0]?.planet);
    } catch { setErr('Could not load. Please try again.'); }
    finally { setLoad(false); }
  }

  const sections = data?.sections || [];
  const sec = sections.find(s=>s.planet===active);
  const m   = active ? PLANET_META[active] : null;

  if (load) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <div style={{ position:'relative',width:72,height:72,margin:'0 auto 20px' }}>
        <div style={{ width:72,height:72,borderRadius:'50%',border:'3px solid rgba(192,132,252,0.12)',
          borderTop:'3px solid #c084fc',animation:'spin 1s linear infinite',position:'absolute' }}/>
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>🔮</div>
      </div>
      <p style={{ color:'rgba(255,255,255,0.45)',fontSize:15 }}>Reading your cosmic blueprint...</p>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (err) return (
    <div style={{ textAlign:'center',padding:'40px 0' }}>
      <p style={{ color:'#f87171',marginBottom:16,fontSize:15 }}>{err}</p>
      <button onClick={loadData} style={{ padding:'11px 24px',borderRadius:10,
        background:'linear-gradient(135deg,#7c3aed,#4f46e5)',border:'none',
        color:'white',fontSize:14,fontWeight:700,cursor:'pointer' }}>Try Again</button>
    </div>
  );

  if (!data) return null;

  return (
    <div style={{ position:'relative' }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        @keyframes bounce  { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
        @keyframes pulse   { 0%,100%{opacity:1}50%{opacity:0.5} }
        @keyframes shimmer { 0%{opacity:0.6}50%{opacity:1}100%{opacity:0.6} }
      `}</style>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{
        padding:'22px 20px', borderRadius:18, marginBottom:20,
        background:'linear-gradient(145deg,rgba(124,58,237,0.1),rgba(79,70,229,0.05),transparent)',
        border:'1px solid rgba(139,92,246,0.18)',
        display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap',
      }}>
        <div>
          <div style={{ fontSize:10,fontWeight:700,color:'rgba(192,132,252,0.7)',
            textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:6 }}>
            ✦ Vedic Cosmic Reading
          </div>
          <h2 style={{ fontSize:'clamp(18px,3vw,23px)',fontWeight:800,color:'rgba(255,255,255,0.95)',marginBottom:4 }}>
            {personName ? `${personName}'s` : 'Your'} Complete Blueprint
          </h2>
          <p style={{ color:'rgba(255,255,255,0.38)',fontSize:13 }}>
            {data.total_readings} personal insights · Tap a planet to explore
          </p>
        </div>
        <button onClick={()=>setChat(!chat)} style={{
          padding:'11px 20px',borderRadius:12,border:'none',cursor:'pointer',
          background: chat
            ? 'linear-gradient(135deg,rgba(52,211,153,0.15),rgba(16,185,129,0.1))'
            : 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(79,70,229,0.15))',
          color: chat ? '#34d399' : '#c084fc',
          fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,
          boxShadow: chat ? '0 4px 16px rgba(52,211,153,0.15)' : '0 4px 16px rgba(124,58,237,0.15)',
          transition:'all 0.2s',
        }}>
          <span style={{ fontSize:16 }}>🔮</span>
          {chat ? 'Close Chat' : 'Ask Astrologer'}
        </button>
      </div>

      {/* ── Summary ──────────────────────────────────────────── */}
      <SummaryCards sections={sections}/>

      {/* ── Planet selector ──────────────────────────────────── */}
      <div style={{
        marginBottom:20,borderRadius:16,
        background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',
        padding:'6px 4px 4px',overflow:'hidden',
      }}>
        <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',
          textTransform:'uppercase',letterSpacing:'0.1em',padding:'4px 12px 6px' }}>
          Select a Planet
        </div>
        <div style={{ display:'flex',overflowX:'auto',paddingBottom:6,
          scrollbarWidth:'none',WebkitOverflowScrolling:'touch' }}>
          {PLANET_ORDER.map(p=>{
            const s = sections.find(sec=>sec.planet===p);
            return (
              <PlanetOrb key={p} planet={p} isActive={active===p}
                hasReadings={s?.readings?.length||0}
                onClick={()=>setActive(p)}/>
            );
          })}
        </div>
      </div>

      {/* ── Active planet detail ──────────────────────────────── */}
      {sec && m && (
        <div key={active} style={{ animation:'fadeUp 0.35s ease both' }}>
          {/* Planet hero */}
          <div style={{
            padding:'24px 22px', borderRadius:20, marginBottom:16,
            background:`linear-gradient(145deg,${m.color}10,${m.color}04,rgba(0,0,0,0))`,
            border:`1px solid ${m.color}28`,
            position:'relative', overflow:'hidden',
          }}>
            {/* Decorative circle */}
            <div style={{ position:'absolute',top:-50,right:-50,
              width:200,height:200,borderRadius:'50%',
              background:`radial-gradient(circle,${m.color}10,transparent)`,
              pointerEvents:'none' }}/>

            <div style={{ position:'relative',display:'flex',gap:18,alignItems:'flex-start',flexWrap:'wrap' }}>
              {/* Big orb */}
              <div style={{
                width:72,height:72,borderRadius:20,flexShrink:0,
                background:`radial-gradient(circle at 35% 35%,${m.color}35,${m.color}12)`,
                border:`2px solid ${m.color}44`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,
                boxShadow:`0 8px 32px ${m.glow}`,
              }}>{m.emoji}</div>

              <div style={{ flex:1,minWidth:180 }}>
                <div style={{ fontSize:11,fontWeight:700,color:`${m.color}99`,
                  textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>
                  Planet Reading
                </div>
                <h3 style={{ fontSize:22,fontWeight:800,color:m.color,marginBottom:4,lineHeight:1.2 }}>
                  {m.name}
                </h3>
                <p style={{ fontSize:14,color:'rgba(255,255,255,0.5)',marginBottom:14,lineHeight:1.5 }}>
                  {m.meaning}
                </p>

                {/* Info pills */}
                <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                  {sec.house && (
                    <span style={{ padding:'6px 14px',borderRadius:999,fontSize:12,fontWeight:600,
                      background:`${m.color}15`,color:m.color,border:`1px solid ${m.color}28` }}>
                      House {sec.house} · {HOUSE_AREAS[sec.house]}
                    </span>
                  )}
                  {sec.rashi_en && (
                    <span style={{ padding:'6px 14px',borderRadius:999,fontSize:12,fontWeight:600,
                      background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.65)',
                      border:'1px solid rgba(255,255,255,0.1)' }}>
                      {sec.rashi_en} ({sec.rashi})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Readings */}
          {sec.readings?.length > 0 ? (
            <div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                <div style={{ fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.3)',
                  textTransform:'uppercase',letterSpacing:'0.08em' }}>
                  📖 {sec.readings.length} Insight{sec.readings.length!==1?'s':''}
                </div>
                <div style={{ display:'flex',gap:6 }}>
                  {[...new Set(sec.readings.map(r=>r.type))].map(type=>{
                    const tm = TYPE_META[type];
                    return (
                      <span key={type} style={{ padding:'3px 10px',borderRadius:999,fontSize:10,fontWeight:600,
                        background:`${tm.color}12`,color:tm.color,border:`1px solid ${tm.color}22` }}>
                        {tm.icon} {tm.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              {sec.readings.map((r,i)=>(
                <ReadingCard key={i} reading={r} planetColor={m.color} index={i} autoOpen={i===0}/>
              ))}
            </div>
          ) : (
            <div style={{ textAlign:'center',padding:'36px 20px',borderRadius:16,
              background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize:36,marginBottom:10 }}>{m.emoji}</div>
              <p style={{ color:'rgba(255,255,255,0.3)',fontSize:14,lineHeight:1.6 }}>
                No readings added for {active} yet.<br/>
                Add entries in <strong style={{ color:'rgba(255,255,255,0.45)' }}>My Knowledge</strong> to see insights here.
              </p>
            </div>
          )}
        </div>
      )}

      {!active && (
        <div style={{ textAlign:'center',padding:'48px 0',color:'rgba(255,255,255,0.25)' }}>
          <p style={{ fontSize:16 }}>☝️ Select a planet above to begin</p>
        </div>
      )}

      {/* Floating chat button when chat is hidden */}
      {!chat && (
        <button onClick={()=>setChat(true)} style={{
          position:'fixed', bottom:24, right:16, zIndex:500,
          width:56, height:56, borderRadius:'50%', border:'none', cursor:'pointer',
          background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
          boxShadow:'0 8px 32px rgba(124,58,237,0.5)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:22, transition:'transform 0.2s',
        }}
          onMouseEnter={e=>e.target.style.transform='scale(1.1)'}
          onMouseLeave={e=>e.target.style.transform='scale(1)'}
        >🔮</button>
      )}

      {/* Chat panel */}
      {chat && (
        <Chat summary={data.summary_for_chatbot} personName={personName}
          lagna={lagna} onClose={()=>setChat(false)}/>
      )}
    </div>
  );
}