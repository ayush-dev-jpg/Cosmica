// src/components/FullPredictions.js
// Redesigned: big cards, one planet at a time, easy language, mobile-first
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const PLANET_META = {
  Sun:     { emoji:'☀️', color:'#f59e0b', bg:'#f59e0b', name:'Sun', meaning:'Your soul, confidence & life purpose', hindi:'Surya' },
  Moon:    { emoji:'🌙', color:'#60a5fa', bg:'#60a5fa', name:'Moon', meaning:'Your mind, emotions & inner world', hindi:'Chandra' },
  Mars:    { emoji:'🔥', color:'#f87171', bg:'#f87171', name:'Mars', meaning:'Your energy, courage & ambition', hindi:'Mangal' },
  Mercury: { emoji:'💬', color:'#34d399', bg:'#34d399', name:'Mercury', meaning:'Your intelligence, speech & business', hindi:'Budha' },
  Jupiter: { emoji:'🌟', color:'#c084fc', bg:'#c084fc', name:'Jupiter', meaning:'Your wisdom, luck & blessings', hindi:'Guru' },
  Venus:   { emoji:'💎', color:'#f472b6', bg:'#f472b6', name:'Venus', meaning:'Your love, beauty & pleasures', hindi:'Shukra' },
  Saturn:  { emoji:'⏳', color:'#94a3b8', bg:'#94a3b8', name:'Saturn', meaning:'Your karma, discipline & life lessons', hindi:'Shani' },
  Rahu:    { emoji:'🌐', color:'#818cf8', bg:'#818cf8', name:'Rahu', meaning:'Your worldly desires & ambitions', hindi:'Rahu' },
  Ketu:    { emoji:'🔮', color:'#fb923c', bg:'#fb923c', name:'Ketu', meaning:'Your spirituality & past life karma', hindi:'Ketu' },
};

const TYPE_LABELS = {
  planet_house: 'Planet Position',
  planet_sign:  'Sign Influence',
  lord_house:   'House Lord Effect',
};

const HOUSE_MEANINGS = {
  1:'Self & Personality', 2:'Wealth & Family', 3:'Courage & Siblings',
  4:'Home & Happiness', 5:'Intelligence & Children', 6:'Health & Challenges',
  7:'Marriage & Partnerships', 8:'Transformation & Hidden Matters', 9:'Luck & Dharma',
  10:'Career & Public Life', 11:'Gains & Social Life', 12:'Spirituality & Liberation',
};

const RASHIS_SA = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
                   'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHIS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                   'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// ── Summary badges ────────────────────────────────────────────
function SummaryHighlight({ sections }) {
  if (!sections?.length) return null;

  // Pick top 3 most important planets
  const strengths = sections.filter(s => ['Jupiter','Sun','Moon','Venus'].includes(s.planet) && s.readings?.length > 0).slice(0,2);
  const challenges = sections.filter(s => ['Saturn','Rahu','Ketu','Mars'].includes(s.planet) && s.readings?.length > 0).slice(0,1);

  if (!strengths.length && !challenges.length) return null;

  return (
    <div style={{
      borderRadius:16, overflow:'hidden', marginBottom:24,
      background:'linear-gradient(135deg,rgba(192,132,252,0.08),rgba(96,165,250,0.06))',
      border:'1px solid rgba(192,132,252,0.2)',
    }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:11,fontWeight:700,color:'#c084fc',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>
          ✦ Your Chart at a Glance
        </div>
        <div style={{ fontSize:15,fontWeight:700,color:'rgba(255,255,255,0.9)' }}>
          Key themes from your birth chart
        </div>
      </div>
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
        {strengths.map(s => {
          const m = PLANET_META[s.planet];
          return (
            <div key={s.planet} style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'12px 14px', borderRadius:12,
              background:`${m.color}10`, border:`1px solid ${m.color}25`,
            }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{m.emoji}</span>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:m.color }}>{m.name} ({m.hindi}) in House {s.house}</div>
                <div style={{ fontSize:12,color:'rgba(255,255,255,0.5)',marginTop:2 }}>{m.meaning}</div>
              </div>
              <div style={{ marginLeft:'auto', padding:'3px 10px', borderRadius:999,
                background:`${m.color}18`, color:m.color, fontSize:11, fontWeight:700, flexShrink:0 }}>
                {s.readings.length} insights
              </div>
            </div>
          );
        })}
        {challenges.map(s => {
          const m = PLANET_META[s.planet];
          return (
            <div key={s.planet} style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'12px 14px', borderRadius:12,
              background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)',
            }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{m.emoji}</span>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:'#f87171' }}>Area needing attention: {m.name}</div>
                <div style={{ fontSize:12,color:'rgba(255,255,255,0.5)',marginTop:2 }}>{m.meaning} · House {s.house}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Planet selector pill ──────────────────────────────────────
function PlanetPill({ planet, isActive, hasData, onClick }) {
  const m = PLANET_META[planet] || { emoji:'🪐', color:'#a78bfa' };
  return (
    <button onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'center', gap:4,
      padding:'10px 14px', borderRadius:14, border:'none', cursor:'pointer',
      background: isActive ? `${m.color}22` : 'rgba(255,255,255,0.03)',
      borderBottom: isActive ? `3px solid ${m.color}` : '3px solid transparent',
      transition:'all 0.2s', flexShrink:0, minWidth:64,
      opacity: hasData ? 1 : 0.4,
    }}>
      <span style={{ fontSize:22 }}>{m.emoji}</span>
      <span style={{ fontSize:10, fontWeight:isActive?700:500,
        color: isActive ? m.color : 'rgba(255,255,255,0.5)' }}>{planet}</span>
      {hasData && (
        <div style={{ width:4,height:4,borderRadius:'50%',
          background: isActive ? m.color : 'rgba(255,255,255,0.2)' }}/>
      )}
    </button>
  );
}

// ── Single reading card ───────────────────────────────────────
function ReadingCard({ reading, color, index }) {
  const [open, setOpen] = useState(index === 0);
  const typeLabel = TYPE_LABELS[reading.type] || 'Reading';

  // Make text more readable — ensure paragraphs
  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/\. /g, '.\n\n').replace(/\n{3,}/g, '\n\n').trim();
  };

  return (
    <div style={{
      borderRadius:14, overflow:'hidden', marginBottom:10,
      border:`1px solid ${open ? color+'33' : 'rgba(255,255,255,0.07)'}`,
      transition:'border-color 0.2s',
      animation:`fadeUp 0.3s ease ${index*0.08}s both`,
    }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'16px 18px', border:'none', cursor:'pointer', textAlign:'left',
        background: open ? `${color}08` : 'rgba(255,255,255,0.02)',
        transition:'background 0.2s',
      }}>
        <div style={{
          width:36, height:36, borderRadius:10, flexShrink:0,
          background:`${color}18`, border:`1px solid ${color}33`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
        }}>
          {reading.type==='planet_house' ? '🏠' : reading.type==='planet_sign' ? '♈' : '🏛️'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.9)', marginBottom:2,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {reading.title}
          </div>
          <div style={{ fontSize:11, color:`${color}cc`, fontWeight:500 }}>{typeLabel}</div>
        </div>
        <span style={{
          fontSize:12, color:'rgba(255,255,255,0.3)', flexShrink:0,
          transform:open?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block',
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          padding:'0 18px 18px',
          borderTop:`1px solid ${color}15`,
          background:`${color}04`,
        }}>
          <div style={{
            fontSize:15, lineHeight:1.9, color:'rgba(255,255,255,0.82)',
            whiteSpace:'pre-wrap', paddingTop:14,
            fontFamily:"'Georgia', serif",
            letterSpacing:'0.01em',
          }}>
            {formatText(reading.text)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Planet detail view ────────────────────────────────────────
function PlanetDetail({ section }) {
  const m = PLANET_META[section.planet] || { emoji:'🪐', color:'#a78bfa', meaning:'', hindi:'' };
  const houseName = HOUSE_MEANINGS[section.house] || '';
  const rashiEn = section.rashi_en || section.rashi || '';

  return (
    <div style={{ animation:'fadeUp 0.35s ease both' }}>
      {/* Planet hero card */}
      <div style={{
        padding:'24px 20px', borderRadius:18, marginBottom:16,
        background:`linear-gradient(135deg,${m.color}14,${m.color}06)`,
        border:`1px solid ${m.color}33`,
        position:'relative', overflow:'hidden',
      }}>
        {/* Background orb */}
        <div style={{
          position:'absolute', top:-40, right:-40,
          width:160, height:160, borderRadius:'50%',
          background:`radial-gradient(circle,${m.color}18,transparent)`,
          pointerEvents:'none',
        }}/>

        <div style={{ position:'relative', display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{
            width:64, height:64, borderRadius:20, flexShrink:0,
            background:`${m.color}20`, border:`2px solid ${m.color}44`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:30,
          }}>{m.emoji}</div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11,fontWeight:700,color:`${m.color}bb`,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>
              {m.hindi} · Planet Reading
            </div>
            <h3 style={{ fontSize:22, fontWeight:800, color:m.color, marginBottom:4, lineHeight:1.2 }}>
              {section.planet}
            </h3>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:10, lineHeight:1.5 }}>
              {m.meaning}
            </p>
            {/* Position pills */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                background:`${m.color}18`, color:m.color, border:`1px solid ${m.color}33` }}>
                🏠 House {section.house}
              </span>
              {rashiEn && (
                <span style={{ padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:600,
                  background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)',
                  border:'1px solid rgba(255,255,255,0.1)' }}>
                  ♈ {rashiEn} ({section.rashi})
                </span>
              )}
              {section.house && (
                <span style={{ padding:'5px 12px', borderRadius:999, fontSize:12,
                  background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.45)',
                  border:'1px solid rgba(255,255,255,0.08)' }}>
                  {houseName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Readings count */}
      {section.readings?.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)',
            textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
            📖 {section.readings.length} Insight{section.readings.length!==1?'s':''} from Astrologer's Knowledge
          </div>
          {section.readings.map((r,i) => (
            <ReadingCard key={i} reading={r} color={m.color} index={i}/>
          ))}
        </div>
      )}

      {/* Empty state */}
      {(!section.readings || section.readings.length === 0) && (
        <div style={{
          textAlign:'center', padding:'32px 20px', borderRadius:14,
          background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize:32, marginBottom:8 }}>{m.emoji}</div>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:14, lineHeight:1.6 }}>
            No readings added yet for {section.planet} in your knowledge base.
            <br/>Add entries in <strong style={{ color:'rgba(255,255,255,0.5)' }}>My Knowledge</strong> to see insights here.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Chatbot ───────────────────────────────────────────────────
function AstrologerChat({ chartSummary, personName, lagna, onClose }) {
  const [messages, setMessages] = useState([{
    role:'assistant',
    content:`Namaste! 🙏 I've studied your complete birth chart carefully. Feel free to ask me anything — about your career, love life, health, money, or any specific planet. I'll explain it in simple terms.`
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const QUICK = [
    '💼 Career & money',
    '❤️ Love & marriage',
    '🌟 My strengths',
    '⚠️ What to be careful about',
    '🙏 Remedies for me',
  ];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  async function send(text) {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    const history = messages.map(m=>({role:m.role,content:m.content}));
    setMessages(prev => [...prev, {role:'user',content:q}]);
    setLoading(true);
    try {
      const res = await api.post('/predictions-full/chat', {
        question:q, chart_summary:chartSummary,
        person_name:personName, lagna, history:history.slice(-6),
      });
      setMessages(prev => [...prev, {role:'assistant',content:res.data.answer}]);
    } catch {
      setMessages(prev => [...prev, {role:'assistant',content:'Sorry, I had trouble with that. Please try again.'}]);
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      position:'fixed', bottom:24, right:16,
      width:'min(400px,calc(100vw - 32px))',
      background:'rgba(8,6,20,0.97)', backdropFilter:'blur(20px)',
      border:'1px solid rgba(139,92,246,0.35)', borderRadius:20,
      boxShadow:'0 20px 60px rgba(0,0,0,0.7)',
      display:'flex', flexDirection:'column', maxHeight:'72vh',
      zIndex:500, animation:'slideUp 0.3s ease',
    }}>
      {/* Header */}
      <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)',
        display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{ width:36,height:36,borderRadius:10,
          background:'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(79,70,229,0.2))',
          border:'1px solid rgba(139,92,246,0.4)',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🔮</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>Ask Your Astrologer</div>
          <div style={{ fontSize:11, color:'#34d399', display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:5,height:5,borderRadius:'50%',background:'#34d399' }}/>
            Online · Reading your chart
          </div>
        </div>
        <button onClick={onClose} style={{ background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:18,cursor:'pointer' }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:10 }}>
        {messages.map((msg,i)=>(
          <div key={i} style={{ display:'flex', gap:8, flexDirection:msg.role==='user'?'row-reverse':'row' }}>
            {msg.role==='assistant' && (
              <div style={{ width:28,height:28,borderRadius:8,flexShrink:0,
                background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:12 }}>🔮</div>
            )}
            <div style={{
              maxWidth:'82%', padding:'10px 14px',
              borderRadius:msg.role==='user'?'14px 4px 14px 14px':'4px 14px 14px 14px',
              background:msg.role==='user'?'rgba(124,58,237,0.25)':'rgba(255,255,255,0.05)',
              border:msg.role==='user'?'1px solid rgba(139,92,246,0.3)':'1px solid rgba(255,255,255,0.08)',
              fontSize:14, lineHeight:1.75, color:'rgba(255,255,255,0.88)',
              fontFamily:"'Georgia',serif",
            }}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:12 }}>🔮</div>
            <div style={{ padding:'12px 16px',borderRadius:'4px 14px 14px 14px',
              background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display:'flex', gap:4 }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{ width:6,height:6,borderRadius:'50%',background:'#c084fc',
                    animation:`bounce 1s infinite ${i*0.15}s` }}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick questions */}
      {messages.length <= 2 && (
        <div style={{ padding:'0 12px 8px', display:'flex', gap:6, flexWrap:'wrap' }}>
          {QUICK.map((q,i)=>(
            <button key={i} onClick={()=>send(q)} style={{
              padding:'6px 12px', borderRadius:999, fontSize:12,
              background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)',
              color:'#c084fc', cursor:'pointer',
            }}>{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.07)',
        flexShrink:0, display:'flex', gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
          placeholder="Ask anything about your chart..."
          style={{
            flex:1, padding:'10px 14px', borderRadius:12,
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(139,92,246,0.2)',
            color:'rgba(255,255,255,0.9)', fontSize:14, outline:'none',
            fontFamily:"'Georgia',serif",
          }}/>
        <button onClick={()=>send()} disabled={!input.trim()||loading} style={{
          width:42, height:42, borderRadius:12, flexShrink:0,
          background:input.trim()&&!loading?'linear-gradient(135deg,#7c3aed,#4f46e5)':'rgba(255,255,255,0.05)',
          border:'none', cursor:'pointer', color:'white', fontSize:18,
        }}>↑</button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function FullPredictions({ kundli, lagna, personName, kundliId }) {
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [activePlanet,  setActivePlanet]  = useState(null);
  const [showChat,      setShowChat]      = useState(false);
  const pillsRef = useRef(null);

  const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

  useEffect(() => {
    if (kundli && lagna) loadPredictions();
  }, [kundli, lagna]);

  async function loadPredictions() {
    setLoading(true); setError('');
    try {
      const res = await api.post('/predictions-full/generate', { kundli, lagna, person_name:personName });
      setData(res.data);
      const first = res.data.sections?.find(s => s.readings?.length > 0);
      if (first) setActivePlanet(first.planet);
      else if (res.data.sections?.length) setActivePlanet(res.data.sections[0].planet);
    } catch {
      setError('Could not load predictions. Please try again.');
    } finally { setLoading(false); }
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <div style={{ position:'relative', width:72, height:72, margin:'0 auto 20px' }}>
        <div style={{ width:72,height:72,borderRadius:'50%',border:'3px solid rgba(192,132,252,0.15)',
          borderTop:'3px solid #c084fc',animation:'spin 1s linear infinite',position:'absolute' }}/>
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>🔮</div>
      </div>
      <h3 style={{ marginBottom:8, fontSize:17 }}>Reading your cosmic blueprint...</h3>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Gathering all insights from the knowledge base</p>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ textAlign:'center', padding:'40px 0' }}>
      <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
      <p style={{ color:'#f87171', marginBottom:16, fontSize:15 }}>{error}</p>
      <button onClick={loadPredictions} style={{
        padding:'11px 24px', borderRadius:10,
        background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
        border:'none', color:'white', fontSize:14, fontWeight:700, cursor:'pointer',
      }}>Try Again</button>
    </div>
  );

  if (!data) return null;

  const sections      = data.sections || [];
  const activeSection = sections.find(s => s.planet === activePlanet);
  const totalReadings = data.total_readings || 0;

  return (
    <div style={{ position:'relative' }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>

      {/* Header */}
      <div style={{
        padding:'20px', borderRadius:16, marginBottom:20,
        background:'linear-gradient(135deg,rgba(192,132,252,0.08),rgba(96,165,250,0.05))',
        border:'1px solid rgba(192,132,252,0.15)',
        display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12,
      }}>
        <div>
          <div style={{ fontSize:11,fontWeight:700,color:'#c084fc',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6 }}>
            ✦ Complete Vedic Reading
          </div>
          <h2 style={{ fontSize:'clamp(17px,3vw,22px)', fontWeight:800, marginBottom:4 }}>
            {personName ? `${personName}'s` : 'Your'} Cosmic Blueprint
          </h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>
            {totalReadings} personalized insights · {sections.length} planets · Tap any planet below
          </p>
        </div>
        <button onClick={()=>setShowChat(!showChat)} style={{
          padding:'10px 18px', borderRadius:12,
          background: showChat ? 'rgba(52,211,153,0.12)' : 'rgba(124,58,237,0.2)',
          border:`1px solid ${showChat?'rgba(52,211,153,0.35)':'rgba(139,92,246,0.35)'}`,
          color: showChat ? '#34d399' : '#c084fc',
          fontSize:13, fontWeight:700, cursor:'pointer',
          display:'flex', alignItems:'center', gap:8,
        }}>
          <span>🔮</span> {showChat ? 'Hide Chat' : 'Ask Astrologer'}
        </button>
      </div>

      {/* Summary highlights */}
      <SummaryHighlight sections={sections}/>

      {/* Planet pills — horizontal scroll */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.35)',
          textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
          Select a Planet to Explore
        </div>
        <div ref={pillsRef} style={{
          display:'flex', gap:8, overflowX:'auto', paddingBottom:6,
          scrollbarWidth:'none', WebkitOverflowScrolling:'touch',
        }}>
          {PLANET_ORDER.map(planet => {
            const sec = sections.find(s => s.planet === planet);
            return (
              <PlanetPill key={planet} planet={planet}
                isActive={activePlanet === planet}
                hasData={!!(sec?.readings?.length)}
                onClick={() => setActivePlanet(planet)}/>
            );
          })}
        </div>
        <style>{`.planet-pills::-webkit-scrollbar{display:none}`}</style>
      </div>

      {/* Active planet detail */}
      {activeSection ? (
        <PlanetDetail section={activeSection}/>
      ) : activePlanet ? (
        <div style={{ textAlign:'center', padding:'32px', borderRadius:14,
          background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize:36, marginBottom:8 }}>
            {PLANET_META[activePlanet]?.emoji || '🪐'}
          </div>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:14 }}>
            No readings yet for {activePlanet}. Add knowledge in My Knowledge page.
          </p>
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>☝️</div>
          <p style={{ fontSize:15 }}>Select a planet above to see your reading</p>
        </div>
      )}

      {/* Empty total state */}
      {totalReadings === 0 && (
        <div style={{ textAlign:'center', padding:'32px', borderRadius:14, marginTop:16,
          background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>📭</div>
          <h3 style={{ color:'rgba(255,255,255,0.6)', marginBottom:8 }}>No readings yet</h3>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>
            Add knowledge in My Knowledge → Planet in House / Planet in Sign / Lord in House
          </p>
        </div>
      )}

      {/* Floating chatbot */}
      {showChat && (
        <AstrologerChat
          chartSummary={data.summary_for_chatbot}
          personName={personName}
          lagna={lagna}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}