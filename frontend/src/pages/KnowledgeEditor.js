// src/pages/KnowledgeEditor.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const PLANETS    = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
const HOUSES     = Array.from({length:12}, (_,i) => i+1);
const RASHIS     = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
                    'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta',
  'Shatabhisha','Purva Bhadra','Uttara Bhadra','Revati'
];

const TABS = [
  { id:'planet',    label:'🪐 Planet in House' },
  { id:'lord',      label:'🏛️ Lord in House' },
  { id:'sign',      label:'♈ Planet in Sign' },
  { id:'rashi',     label:'🌙 Rashi Description' },
  { id:'nakshatra', label:'⭐ Nakshatra' },
  { id:'browse',    label:'📋 Browse' },
];

export default function KnowledgeEditor() {
  const [tab,     setTab]     = useState('planet');
  const [msg,     setMsg]     = useState(null);
  const [stats,   setStats]   = useState({});
  const [entries, setEntries] = useState([]);

  // Planet in House
  const [planet,  setPlanet]  = useState('Sun');
  const [house,   setHouse]   = useState(1);
  const [lagna,   setLagna]   = useState('');
  const [pText,   setPText]   = useState('');

  // Lord in House
  const [lordHouse,   setLordHouse]   = useState(1);
  const [placedHouse, setPlacedHouse] = useState(1);
  const [lordLagna,   setLordLagna]   = useState('');
  const [lText,       setLText]       = useState('');

  // Planet in Sign
  const [signPlanet, setSignPlanet] = useState('Sun');
  const [signRashi,  setSignRashi]  = useState('Mesha');
  const [sText,      setSText]      = useState('');

  // Rashi
  const [rashi, setRashi] = useState('Mesha');
  const [rText, setRText] = useState('');

  // Nakshatra
  const [naksh, setNaksh] = useState('Ashwini');
  const [nText, setNText] = useState('');

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === 'browse') loadEntries(); }, [tab]);

  async function loadStats() {
    try {
      const res = await api.get('/knowledge-editor/stats');
      setStats(res.data);
    } catch {}
  }

  async function loadEntries() {
    try {
      const res = await api.get('/knowledge-editor/planet-house');
      setEntries(res.data.entries || []);
    } catch {}
  }

  function showMsg(text, type = 'success') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  }

  async function savePlanetHouse(e) {
    e.preventDefault();
    if (!pText.trim()) return showMsg('Please enter your prediction text', 'error');
    try {
      const res = await api.post('/knowledge-editor/planet-house', {
        planet, house: parseInt(house), lagna: lagna || null, text: pText.trim(),
      });
      showMsg(res.data.message); setPText(''); loadStats();
    } catch(err) { showMsg(err.response?.data?.detail || 'Save failed', 'error'); }
  }

  async function saveLordInHouse(e) {
    e.preventDefault();
    if (!lText.trim()) return showMsg('Please enter your prediction text', 'error');
    try {
      const res = await api.post('/knowledge-editor/lord-in-house', {
        lord_house: parseInt(lordHouse), placed_in_house: parseInt(placedHouse),
        lagna: lordLagna || null, text: lText.trim(),
      });
      showMsg(res.data.message); setLText(''); loadStats();
    } catch(err) { showMsg(err.response?.data?.detail || 'Save failed', 'error'); }
  }

  async function savePlanetSign(e) {
    e.preventDefault();
    if (!sText.trim()) return showMsg('Please enter your prediction text', 'error');
    try {
      const res = await api.post('/knowledge-editor/planet-sign', {
        planet: signPlanet, rashi: signRashi, text: sText.trim(),
      });
      showMsg(res.data.message); setSText(''); loadStats();
    } catch(err) { showMsg(err.response?.data?.detail || 'Save failed', 'error'); }
  }

  async function saveRashi(e) {
    e.preventDefault();
    if (!rText.trim()) return showMsg('Please enter your description', 'error');
    try {
      const res = await api.post('/knowledge-editor/rashi', { rashi, text: rText.trim() });
      showMsg(res.data.message); setRText(''); loadStats();
    } catch { showMsg('Save failed', 'error'); }
  }

  async function saveNakshatra(e) {
    e.preventDefault();
    if (!nText.trim()) return showMsg('Please enter your description', 'error');
    try {
      const res = await api.post('/knowledge-editor/nakshatra', { nakshatra: naksh, text: nText.trim() });
      showMsg(res.data.message); setNText(''); loadStats();
    } catch { showMsg('Save failed', 'error'); }
  }

  async function deleteEntry(id) {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/knowledge-editor/planet-house/${id}`);
      loadEntries(); loadStats();
    } catch {}
  }

  const inp = {
    width:'100%', padding:'10px 14px',
    background:'rgba(255,255,255,0.06)',
    border:'1px solid var(--border)', borderRadius:'var(--radius)',
    color:'var(--text-primary)', fontSize:14, outline:'none',
    fontFamily:'Inter, sans-serif',
  };
  const lbl = {
    display:'block', fontSize:12, fontWeight:500,
    color:'var(--text-secondary)', marginBottom:6,
    textTransform:'uppercase', letterSpacing:'0.05em',
  };

  const statCards = [
    { label:'Planet in House', value:stats.planet_house_entries||0,  emoji:'🪐', color:'#c084fc' },
    { label:'Lord in House',   value:stats.lord_in_house_entries||0, emoji:'🏛️', color:'#f59e0b' },
    { label:'Planet in Sign',  value:stats.planet_sign_entries||0,   emoji:'♈', color:'#60a5fa' },
    { label:'Rashi Desc.',     value:stats.rashi_entries||0,         emoji:'🌙', color:'#34d399' },
    { label:'Nakshatra',       value:stats.nakshatra_entries||0,     emoji:'⭐', color:'#f472b6' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      <Navbar />
      <main style={{ maxWidth:920, margin:'0 auto', padding:'32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:26, fontWeight:700, marginBottom:8 }}>📖 My Astrology Knowledge</h1>
          <p style={{ color:'var(--text-secondary)', lineHeight:1.7 }}>
            Enter your personal predictions here. When a user clicks any house on their chart,
            your knowledge appears <strong>first</strong> — before AI content.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:28 }}>
          {statCards.map(s=>(
            <div key={s.label} className="card" style={{ textAlign:'center', padding:14 }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{s.emoji}</div>
              <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {msg && (
          <div style={{
            padding:'12px 16px', marginBottom:20, borderRadius:'var(--radius)',
            background: msg.type==='error'?'rgba(239,68,68,0.1)':'rgba(16,185,129,0.1)',
            border:`1px solid ${msg.type==='error'?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'}`,
            color: msg.type==='error'?'#f87171':'#34d399', fontSize:14,
          }}>{msg.text}</div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:2, marginBottom:24, borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'10px 14px', background:'none', border:'none',
              borderBottom: tab===t.id ? '2px solid var(--purple-500)' : '2px solid transparent',
              color: tab===t.id ? 'var(--purple-400)' : 'var(--text-secondary)',
              fontWeight: tab===t.id ? 600 : 400,
              fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── Planet in House ── */}
        {tab==='planet' && (
          <div className="card">
            <h3 style={{ marginBottom:6 }}>Planet in House</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:20, lineHeight:1.65 }}>
              Your prediction for a planet placed in a specific house.
              Optionally specify a Lagna for more precise predictions.
            </p>
            <form onSubmit={savePlanetHouse}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={lbl}>Planet</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={planet} onChange={e=>setPlanet(e.target.value)}>
                    {PLANETS.map(p=><option key={p} value={p} style={{ background:'#1a1530' }}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>House</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={house} onChange={e=>setHouse(e.target.value)}>
                    {HOUSES.map(h=><option key={h} value={h} style={{ background:'#1a1530' }}>House {h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Lagna (optional)</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={lagna} onChange={e=>setLagna(e.target.value)}>
                    <option value="" style={{ background:'#1a1530' }}>All Lagnas</option>
                    {RASHIS.map(r=><option key={r} value={r} style={{ background:'#1a1530' }}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{
                padding:'8px 14px', marginBottom:12,
                background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.2)',
                borderRadius:'var(--radius)', fontSize:13, color:'var(--purple-400)', fontWeight:500,
              }}>
                Saving: <strong>{planet}</strong> in <strong>House {house}</strong>
                {lagna ? <> for <strong>{lagna} Lagna</strong></> : <> (all lagnas)</>}
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Your Prediction</label>
                <textarea style={{ ...inp, minHeight:150, resize:'vertical', lineHeight:1.7 }}
                  placeholder={`Enter your knowledge for ${planet} in House ${house}...`}
                  value={pText} onChange={e=>setPText(e.target.value)} required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ padding:'12px 28px' }}>
                ✅ Save
              </button>
            </form>
          </div>
        )}

        {/* ── Lord in House ── */}
        {tab==='lord' && (
          <div className="card">
            <h3 style={{ marginBottom:6 }}>Lord in House</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:6, lineHeight:1.65 }}>
              Your prediction for when a house lord is placed in another house.
            </p>
            <div style={{
              padding:'10px 14px', marginBottom:20,
              background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)',
              borderRadius:'var(--radius)', fontSize:12, color:'var(--text-secondary)', lineHeight:1.7,
            }}>
              <strong style={{ color:'#f59e0b' }}>Example:</strong> For Leo (Simha) Lagna, Mars rules House 4 and House 9.
              If Mars is placed in House 1, enter: Lord of House → 9, Placed in House → 1.
              This will automatically show when any Leo Lagna chart has Mars in the 1st house.
            </div>
            <form onSubmit={saveLordInHouse}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={lbl}>Lord of House</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={lordHouse} onChange={e=>setLordHouse(e.target.value)}>
                    {HOUSES.map(h=><option key={h} value={h} style={{ background:'#1a1530' }}>House {h}</option>)}
                  </select>
                  <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>The house whose lord you're describing</p>
                </div>
                <div>
                  <label style={lbl}>Placed in House</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={placedHouse} onChange={e=>setPlacedHouse(e.target.value)}>
                    {HOUSES.map(h=><option key={h} value={h} style={{ background:'#1a1530' }}>House {h}</option>)}
                  </select>
                  <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>Where the lord physically sits</p>
                </div>
                <div>
                  <label style={lbl}>Lagna (optional)</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={lordLagna} onChange={e=>setLordLagna(e.target.value)}>
                    <option value="" style={{ background:'#1a1530' }}>All Lagnas</option>
                    {RASHIS.map(r=><option key={r} value={r} style={{ background:'#1a1530' }}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{
                padding:'8px 14px', marginBottom:12,
                background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)',
                borderRadius:'var(--radius)', fontSize:13, color:'#f59e0b', fontWeight:500,
              }}>
                Saving: <strong>House {lordHouse} lord</strong> placed in <strong>House {placedHouse}</strong>
                {lordLagna ? <> for <strong>{lordLagna} Lagna</strong></> : <> (all lagnas)</>}
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Your Prediction</label>
                <textarea style={{ ...inp, minHeight:150, resize:'vertical', lineHeight:1.7 }}
                  placeholder={`Enter your knowledge for House ${lordHouse} lord in House ${placedHouse}...\n\nExample: When the 9th lord is placed in the 1st house, the native is naturally fortunate, dharmic, and carries an aura of divine protection. The father plays a significant role in shaping the personality...`}
                  value={lText} onChange={e=>setLText(e.target.value)} required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ padding:'12px 28px' }}>
                ✅ Save
              </button>
            </form>
          </div>
        )}

        {/* ── Planet in Sign ── */}
        {tab==='sign' && (
          <div className="card">
            <h3 style={{ marginBottom:6 }}>Planet in Sign</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:20, lineHeight:1.65 }}>
              Your interpretation for a planet placed in a specific Rashi (zodiac sign).
              This shows when the planet occupies that sign regardless of which house it falls in.
            </p>
            <form onSubmit={savePlanetSign}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={lbl}>Planet</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={signPlanet} onChange={e=>setSignPlanet(e.target.value)}>
                    {PLANETS.map(p=><option key={p} value={p} style={{ background:'#1a1530' }}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Rashi (Sign)</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={signRashi} onChange={e=>setSignRashi(e.target.value)}>
                    {RASHIS.map(r=><option key={r} value={r} style={{ background:'#1a1530' }}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{
                padding:'8px 14px', marginBottom:12,
                background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.2)',
                borderRadius:'var(--radius)', fontSize:13, color:'#60a5fa', fontWeight:500,
              }}>
                Saving: <strong>{signPlanet}</strong> in <strong>{signRashi}</strong>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Your Interpretation</label>
                <textarea style={{ ...inp, minHeight:150, resize:'vertical', lineHeight:1.7 }}
                  placeholder={`Enter your interpretation of ${signPlanet} in ${signRashi}...\n\nExample: Jupiter in Simha (Leo) creates a powerful, generous, and kingly personality. The native is naturally philosophical with a grand vision...`}
                  value={sText} onChange={e=>setSText(e.target.value)} required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ padding:'12px 28px' }}>
                ✅ Save
              </button>
            </form>
          </div>
        )}

        {/* ── Rashi ── */}
        {tab==='rashi' && (
          <div className="card">
            <h3 style={{ marginBottom:6 }}>Rashi (Lagna) Description</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:20, lineHeight:1.65 }}>
              Your overall description of each zodiac sign as a Lagna/Ascendant.
            </p>
            <form onSubmit={saveRashi}>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Rashi</label>
                <select style={{ ...inp, cursor:'pointer' }} value={rashi} onChange={e=>setRashi(e.target.value)}>
                  {RASHIS.map(r=><option key={r} value={r} style={{ background:'#1a1530' }}>{r}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Your Description of {rashi} Lagna</label>
                <textarea style={{ ...inp, minHeight:150, resize:'vertical', lineHeight:1.7 }}
                  placeholder={`Describe ${rashi} as a Lagna...`}
                  value={rText} onChange={e=>setRText(e.target.value)} required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ padding:'12px 28px' }}>
                ✅ Save
              </button>
            </form>
          </div>
        )}

        {/* ── Nakshatra ── */}
        {tab==='nakshatra' && (
          <div className="card">
            <h3 style={{ marginBottom:6 }}>Nakshatra Description</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:20, lineHeight:1.65 }}>
              Your interpretation of each of the 27 Nakshatras.
            </p>
            <form onSubmit={saveNakshatra}>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Nakshatra</label>
                <select style={{ ...inp, cursor:'pointer' }} value={naksh} onChange={e=>setNaksh(e.target.value)}>
                  {NAKSHATRAS.map(n=><option key={n} value={n} style={{ background:'#1a1530' }}>{n}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Your Description of {naksh}</label>
                <textarea style={{ ...inp, minHeight:150, resize:'vertical', lineHeight:1.7 }}
                  placeholder={`Enter your interpretation of ${naksh} Nakshatra...`}
                  value={nText} onChange={e=>setNText(e.target.value)} required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ padding:'12px 28px' }}>
                ✅ Save
              </button>
            </form>
          </div>
        )}

        {/* ── Browse ── */}
        {tab==='browse' && (
          <div className="card">
            <h3 style={{ marginBottom:16 }}>Planet-House Entries ({entries.length})</h3>
            {entries.length===0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                <p>No entries yet. Start adding your knowledge above!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {entries.map(entry=>(
                  <div key={entry.id} style={{
                    padding:'14px 16px', background:'rgba(255,255,255,0.03)',
                    border:'1px solid var(--border)', borderRadius:'var(--radius)',
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:14, marginBottom:6, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          {entry.planet} in House {entry.house}
                          {entry.lagna ? (
                            <span style={{ padding:'2px 8px', background:'rgba(168,85,247,0.15)', color:'var(--purple-400)', borderRadius:999, fontSize:11 }}>
                              {entry.lagna} Lagna
                            </span>
                          ) : (
                            <span style={{ padding:'2px 8px', background:'rgba(255,255,255,0.07)', color:'var(--text-muted)', borderRadius:999, fontSize:11 }}>
                              All Lagnas
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, maxHeight:52, overflow:'hidden' }}>
                          {entry.text}
                        </div>
                      </div>
                      <button onClick={()=>deleteEntry(entry.id)} style={{
                        padding:'6px 10px', flexShrink:0,
                        background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
                        color:'#f87171', borderRadius:'var(--radius)', cursor:'pointer', fontSize:12,
                      }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}