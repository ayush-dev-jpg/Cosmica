// src/components/FullPredictions.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const PLANET_META = {
  Sun:     { emoji:'☀️', color:'#f59e0b', glyph:'Su' },
  Moon:    { emoji:'🌙', color:'#60a5fa', glyph:'Mo' },
  Mars:    { emoji:'♂',  color:'#f87171', glyph:'Ma' },
  Mercury: { emoji:'☿',  color:'#34d399', glyph:'Me' },
  Jupiter: { emoji:'♃',  color:'#c084fc', glyph:'Ju' },
  Venus:   { emoji:'♀',  color:'#f472b6', glyph:'Ve' },
  Saturn:  { emoji:'♄',  color:'#94a3b8', glyph:'Sa' },
  Rahu:    { emoji:'☊',  color:'#818cf8', glyph:'Ra' },
  Ketu:    { emoji:'☋',  color:'#fb923c', glyph:'Ke' },
};

const TYPE_META = {
  planet_house: { emoji:'🏠', label:'Planet in House', color:'#c084fc' },
  planet_sign:  { emoji:'♈', label:'Planet in Sign',  color:'#60a5fa' },
  lord_house:   { emoji:'🏛️', label:'Lord in House',   color:'#f59e0b' },
};

// ── Reading card ──────────────────────────────────────────────
function ReadingCard({ reading, planetColor, index }) {
  const [open, setOpen] = useState(index === 0);
  const meta = TYPE_META[reading.type] || TYPE_META.planet_house;

  return (
    <div style={{
      borderRadius:12, overflow:'hidden', marginBottom:8,
      border:`1px solid ${meta.color}22`,
      animation:`fadeSlideIn 0.3s ease ${index * 0.05}s both`,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:10,
        padding:'12px 16px', border:'none', cursor:'pointer', textAlign:'left',
        background: open ? `${meta.color}0c` : 'rgba(255,255,255,0.02)',
        transition:'background 0.2s',
      }}>
        <span style={{
          width:28, height:28, borderRadius:8, flexShrink:0,
          background:`${meta.color}18`, border:`1px solid ${meta.color}33`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:13,
        }}>{meta.emoji}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:600, fontSize:13, color:meta.color }}>{reading.title}</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>{meta.label}</div>
        </div>
        <span style={{
          fontSize:10, color:'var(--text-muted)', flexShrink:0,
          transform:open?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block',
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          padding:'16px 18px',
          background:`${meta.color}06`,
          borderTop:`1px solid ${meta.color}18`,
          fontSize:13.5, lineHeight:1.9, color:'var(--text-primary)',
          whiteSpace:'pre-wrap',
        }}>
          {reading.text}
        </div>
      )}
    </div>
  );
}

// ── Planet section ────────────────────────────────────────────
function PlanetSection({ section, isActive, onClick }) {
  const meta = PLANET_META[section.planet] || { emoji:'🪐', color:'#a78bfa', glyph:'P' };

  return (
    <div style={{
      borderRadius:14, overflow:'hidden', marginBottom:12,
      border:`1px solid ${isActive ? meta.color+'55' : 'var(--border)'}`,
      transition:'all 0.25s',
      boxShadow: isActive ? `0 0 24px ${meta.color}18` : 'none',
    }}>
      {/* Planet header */}
      <button onClick={onClick} style={{
        width:'100%', display:'flex', alignItems:'center', gap:14,
        padding:'16px 18px', border:'none', cursor:'pointer', textAlign:'left',
        background: isActive ? `${meta.color}0d` : 'rgba(255,255,255,0.02)',
        transition:'background 0.2s',
      }}>
        {/* Planet orb */}
        <div style={{
          width:44, height:44, borderRadius:12, flexShrink:0,
          background:`radial-gradient(circle at 35% 35%, ${meta.color}44, ${meta.color}11)`,
          border:`2px solid ${meta.color}55`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20,
        }}>{meta.emoji}</div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
            <span style={{ fontWeight:800, fontSize:16, color:meta.color }}>{section.planet}</span>
            <span style={{
              padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:700,
              background:`${meta.color}15`, color:meta.color, border:`1px solid ${meta.color}33`,
            }}>H{section.house}</span>
            <span style={{
              padding:'2px 8px', borderRadius:999, fontSize:10,
              background:'rgba(255,255,255,0.06)', color:'var(--text-muted)',
            }}>{section.rashi_en}</span>
          </div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>
            {section.house_theme} · {section.readings.length} reading{section.readings.length!==1?'s':''}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          {/* Reading count dots */}
          <div style={{ display:'flex', gap:3 }}>
            {section.readings.slice(0,4).map((r,i)=>(
              <div key={i} style={{
                width:6, height:6, borderRadius:'50%',
                background: (TYPE_META[r.type]||TYPE_META.planet_house).color,
                opacity:0.8,
              }}/>
            ))}
          </div>
          <span style={{
            fontSize:10, color:'var(--text-muted)',
            transform:isActive?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block',
          }}>▼</span>
        </div>
      </button>

      {/* Readings */}
      {isActive && (
        <div style={{ padding:'0 16px 16px', background:`${meta.color}04` }}>
          {section.readings.map((r,i)=>(
            <ReadingCard key={i} reading={r} planetColor={meta.color} index={i}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Chatbot ───────────────────────────────────────────────────
function PredictionChatbot({ chartSummary, personName, lagna, onClose }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:`Namaste! 🙏 I've studied ${personName || 'your'}'s complete birth chart. Ask me anything — about career, relationships, health, spirituality, or any specific planet or house. I'll give you insights based on the actual chart readings.` }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const QUICK_QUESTIONS = [
    '💼 What does my chart say about career?',
    '❤️ What about love and relationships?',
    '💰 Tell me about my finances',
    '🌟 Which is my strongest planet?',
    '⚠️ What challenges should I be aware of?',
  ];

  async function sendMessage(text) {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    const history = messages.map(m => ({ role:m.role, content:m.content }));
    const newMessages = [...messages, { role:'user', content:q }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await api.post('/predictions-full/chat', {
        question: q,
        chart_summary: chartSummary,
        person_name: personName,
        lagna,
        history: history.slice(-6),
      });
      setMessages(prev => [...prev, { role:'assistant', content:res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'Sorry, I had trouble processing that. Please try again.' }]);
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:500,
      width:'min(420px, calc(100vw - 48px))',
      background:'rgba(10,8,22,0.97)',
      backdropFilter:'blur(20px)',
      border:'1px solid rgba(139,92,246,0.4)',
      borderRadius:20,
      boxShadow:'0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)',
      display:'flex', flexDirection:'column',
      maxHeight:'75vh',
      animation:'slideUpFade 0.3s ease',
    }}>
      {/* Header */}
      <div style={{
        padding:'16px 18px', borderBottom:'1px solid rgba(139,92,246,0.2)',
        display:'flex', alignItems:'center', gap:12, flexShrink:0,
      }}>
        <div style={{
          width:40, height:40, borderRadius:12, flexShrink:0,
          background:'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(79,70,229,0.2))',
          border:'1px solid rgba(139,92,246,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
        }}>🔮</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>Cosmica Astrologer</div>
          <div style={{ fontSize:11, color:'#34d399', display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', animation:'pulse 2s infinite' }}/>
            Online · Reading your chart
          </div>
        </div>
        <button onClick={onClose} style={{
          background:'none', border:'none', color:'var(--text-muted)',
          fontSize:18, cursor:'pointer', padding:4,
        }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display:'flex', gap:8, flexDirection: msg.role==='user'?'row-reverse':'row',
          }}>
            {msg.role==='assistant' && (
              <div style={{
                width:28, height:28, borderRadius:8, flexShrink:0,
                background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:12,
              }}>🔮</div>
            )}
            <div style={{
              maxWidth:'80%',
              padding:'10px 14px', borderRadius: msg.role==='user'?'14px 4px 14px 14px':'4px 14px 14px 14px',
              background: msg.role==='user'
                ? 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(79,70,229,0.25))'
                : 'rgba(255,255,255,0.05)',
              border: msg.role==='user'?'1px solid rgba(139,92,246,0.3)':'1px solid rgba(255,255,255,0.08)',
              fontSize:13, lineHeight:1.7, color:'var(--text-primary)',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12 }}>🔮</div>
            <div style={{ padding:'10px 14px',borderRadius:'4px 14px 14px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{ width:6,height:6,borderRadius:'50%',background:'var(--purple-400)',
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
        <div style={{ padding:'0 16px 8px', display:'flex', flexWrap:'wrap', gap:6 }}>
          {QUICK_QUESTIONS.map((q,i)=>(
            <button key={i} onClick={()=>sendMessage(q)} style={{
              padding:'5px 10px', borderRadius:999, fontSize:11,
              background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)',
              color:'var(--purple-400)', cursor:'pointer', transition:'all 0.15s',
            }}>{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding:'12px 16px', borderTop:'1px solid rgba(139,92,246,0.15)', flexShrink:0,
        display:'flex', gap:8,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendMessage()}
          placeholder="Ask about career, love, health..."
          style={{
            flex:1, padding:'10px 14px', borderRadius:12,
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(139,92,246,0.2)',
            color:'var(--text-primary)', fontSize:13, outline:'none',
          }}
        />
        <button onClick={()=>sendMessage()} disabled={!input.trim()||loading} style={{
          width:40, height:40, borderRadius:10, flexShrink:0,
          background:input.trim()&&!loading?'linear-gradient(135deg,#7c3aed,#4f46e5)':'rgba(255,255,255,0.05)',
          border:'none', cursor:input.trim()&&!loading?'pointer':'default',
          color:'white', fontSize:16, transition:'all 0.2s',
        }}>↑</button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function FullPredictions({ kundli, lagna, personName, kundliId }) {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [activeSection, setActive]    = useState(null);
  const [showChat,    setShowChat]    = useState(false);
  const [filter,      setFilter]      = useState('all');

  useEffect(() => {
    if (kundli && lagna) loadPredictions();
  }, [kundli, lagna]);

  async function loadPredictions() {
    setLoading(true); setError('');
    try {
      const res = await api.post('/predictions-full/generate', {
        kundli, lagna, person_name: personName,
      });
      setData(res.data);
      if (res.data.sections?.length > 0) setActive(res.data.sections[0].planet);
    } catch (err) {
      setError('Could not load predictions. Please try again.');
    } finally { setLoading(false); }
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <div style={{ position:'relative', width:64, height:64, margin:'0 auto 20px' }}>
        <div className="spinner" style={{ width:64,height:64,borderWidth:3,position:'absolute' }}/>
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>🔮</div>
      </div>
      <h3 style={{ marginBottom:8 }}>Reading your cosmic blueprint...</h3>
      <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Gathering all planetary insights from the knowledge base</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign:'center', padding:'40px 0' }}>
      <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
      <p style={{ color:'#f87171', marginBottom:16 }}>{error}</p>
      <button className="btn btn-primary" onClick={loadPredictions}>Try Again</button>
    </div>
  );

  if (!data) return null;

  const sections = data.sections || [];
  const filtered = filter === 'all' ? sections :
    sections.filter(s => s.readings.some(r => r.type === filter));

  const totalReadings = data.total_readings || 0;

  return (
    <div style={{ position:'relative' }}>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUpFade  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* Header */}
      <div style={{
        padding:'24px', borderRadius:18, marginBottom:20,
        background:'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.06),rgba(0,0,0,0))',
        border:'1px solid rgba(139,92,246,0.2)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(139,92,246,0.15),transparent)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-20, left:-20, width:80, height:80, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(99,102,241,0.1),transparent)', pointerEvents:'none' }}/>

        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--purple-400)', textTransform:'uppercase',
                letterSpacing:'0.1em', marginBottom:8 }}>✦ Complete Vedic Reading</div>
              <h2 style={{ fontSize:'clamp(18px,3vw,24px)', fontWeight:800, marginBottom:6 }}>
                {personName ? `${personName}'s` : 'Your'} Cosmic Blueprint
              </h2>
              <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>
                {totalReadings} personalized insights from the knowledge base · {sections.length} planetary readings
              </p>
            </div>
            <button onClick={() => setShowChat(!showChat)} style={{
              padding:'11px 20px', borderRadius:12,
              background: showChat ? 'rgba(52,211,153,0.15)' : 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(79,70,229,0.2))',
              border:`1px solid ${showChat?'rgba(52,211,153,0.4)':'rgba(139,92,246,0.4)'}`,
              color: showChat ? '#34d399' : 'var(--purple-400)',
              fontSize:13, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <span>🔮</span>
              {showChat ? 'Hide Astrologer' : 'Ask Astrologer'}
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:16, marginTop:16, flexWrap:'wrap' }}>
            {[
              { label:'Planet Readings', value:sections.filter(s=>s.readings.some(r=>r.type==='planet_house')).length, color:'#c084fc' },
              { label:'Sign Readings',   value:sections.filter(s=>s.readings.some(r=>r.type==='planet_sign')).length,  color:'#60a5fa' },
              { label:'Lord Readings',   value:sections.filter(s=>s.readings.some(r=>r.type==='lord_house')).length,   color:'#f59e0b' },
            ].map(s=>(
              <div key={s.label} style={{
                padding:'8px 14px', borderRadius:10,
                background:`${s.color}10`, border:`1px solid ${s.color}25`,
              }}>
                <div style={{ fontWeight:800, fontSize:18, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{
        display:'flex', gap:4, marginBottom:18,
        borderBottom:'1px solid var(--border)',
        overflowX:'auto', WebkitOverflowScrolling:'touch',
      }}>
        {[
          { id:'all',          label:`All (${totalReadings})`,  color:'var(--purple-400)' },
          { id:'planet_house', label:'🏠 Planet in House',      color:'#c084fc' },
          { id:'planet_sign',  label:'♈ Planet in Sign',       color:'#60a5fa' },
          { id:'lord_house',   label:'🏛️ Lord in House',        color:'#f59e0b' },
        ].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{
            padding:'9px 14px', background:'none', border:'none',
            borderBottom:`2px solid ${filter===f.id?'var(--purple-500)':'transparent'}`,
            color: filter===f.id ? f.color : 'var(--text-secondary)',
            fontWeight: filter===f.id ? 700 : 400,
            fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 0' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
          <h3 style={{ color:'var(--text-secondary)', marginBottom:8 }}>No readings yet</h3>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>
            Add knowledge in My Knowledge → Planet in House / Planet in Sign / Lord in House
          </p>
        </div>
      )}

      {/* Planet sections */}
      <div>
        {filtered.map((section, i) => (
          <div key={section.planet} style={{ animationDelay:`${i*0.05}s`, animation:'fadeSlideIn 0.4s ease both' }}>
            <PlanetSection
              section={section}
              isActive={activeSection === section.planet}
              onClick={() => setActive(activeSection === section.planet ? null : section.planet)}
            />
          </div>
        ))}
      </div>

      {/* Knowledge base note */}
      {totalReadings > 0 && (
        <div style={{
          marginTop:16, padding:'14px 18px', borderRadius:12,
          background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)',
          fontSize:12, color:'var(--text-muted)', lineHeight:1.7,
          display:'flex', gap:10, alignItems:'flex-start',
        }}>
          <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
          <div>
            <strong style={{ color:'var(--text-secondary)' }}>About these readings: </strong>
            These predictions come directly from the astrologer's personal knowledge base — refined over years of practice.
            Click any planet to expand its readings. Use the 🔮 Astrologer chatbot to ask specific questions about your chart.
          </div>
        </div>
      )}

      {/* Floating chatbot */}
      {showChat && (
        <PredictionChatbot
          chartSummary={data.summary_for_chatbot}
          personName={personName}
          lagna={lagna}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}