// src/pages/Compatibility.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
                'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const COUNTRIES = ['India','USA','UK','Canada','Australia','UAE','Singapore','Germany','France','Nepal','Other'];

const KOOTA_COLORS = {
  'Varna':        '#a78bfa',
  'Vashya':       '#60a5fa',
  'Tara':         '#34d399',
  'Yoni':         '#f472b6',
  'Graha Maitri': '#f59e0b',
  'Gana':         '#c084fc',
  'Bhakoot':      '#818cf8',
  'Nadi':         '#fb923c',
};

function PersonForm({ title, emoji, form, setForm, color }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = {
    width:'100%', padding:'10px 14px',
    background:'rgba(255,255,255,0.06)',
    border:'1px solid var(--border)', borderRadius:'var(--radius)',
    color:'var(--text-primary)', fontSize:14, outline:'none',
    fontFamily:'Inter, sans-serif',
  };
  const lbl = {
    display:'block', fontSize:11, fontWeight:600,
    color:'var(--text-secondary)', marginBottom:5,
    textTransform:'uppercase', letterSpacing:'0.05em',
  };

  return (
    <div style={{
      background:'rgba(255,255,255,0.02)',
      border:`1px solid ${color}33`,
      borderRadius:14, padding:20,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <span style={{ fontSize:28 }}>{emoji}</span>
        <h3 style={{ fontSize:16, fontWeight:700, color }}>{title}</h3>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <div style={{ gridColumn:'span 2' }}>
          <label style={lbl}>Full Name</label>
          <input style={inp} type="text" placeholder="e.g. Arjun Sharma"
            value={form.name} onChange={e=>set('name',e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Date of Birth</label>
          <input style={{ ...inp, fontSize:16 }} type="date" value={form.date}
            onChange={e=>set('date',e.target.value)} max={new Date().toISOString().split('T')[0]} required />
        </div>
        <div>
          <label style={lbl}>Time of Birth</label>
          <input style={{ ...inp, fontSize:16 }} type="time" value={form.time}
            onChange={e=>set('time',e.target.value)} required />
        </div>
        <div>
          <label style={lbl}>Birth City</label>
          <input style={inp} type="text" placeholder="e.g. Mumbai"
            value={form.city} onChange={e=>set('city',e.target.value)} required />
        </div>
        <div>
          <label style={lbl}>Country</label>
          <select style={{ ...inp, cursor:'pointer' }} value={form.country} onChange={e=>set('country',e.target.value)}>
            {COUNTRIES.map(c=><option key={c} value={c} style={{ background:'#1a1530' }}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ score, max, color }) {
  const pct = (score / max) * 100;
  return (
    <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:999, height:8, overflow:'hidden' }}>
      <div style={{
        width:`${pct}%`, height:'100%', borderRadius:999,
        background: color, transition:'width 0.8s ease',
      }}/>
    </div>
  );
}

function KootaCard({ koota }) {
  const [open, setOpen] = useState(false);
  const color  = KOOTA_COLORS[koota.name] || '#a78bfa';
  const pct    = koota.score / koota.max;
  const quality= pct >= 0.8 ? 'Excellent' : pct >= 0.6 ? 'Good' : pct >= 0.4 ? 'Average' : 'Low';
  const qColor = pct >= 0.8 ? '#10b981' : pct >= 0.6 ? '#f59e0b' : pct >= 0.4 ? '#f97316' : '#ef4444';

  return (
    <div style={{
      border:`1px solid ${color}33`,
      borderRadius:12, overflow:'hidden',
      background:'rgba(255,255,255,0.02)',
    }}>
      <div onClick={()=>setOpen(!open)} style={{
        padding:'14px 16px', cursor:'pointer',
        display:'flex', alignItems:'center', gap:12,
      }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontWeight:700, fontSize:14, color }}>{koota.name}</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{
                padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600,
                background:`${qColor}18`, color:qColor,
              }}>{quality}</span>
              <span style={{ fontWeight:800, fontSize:15 }}>{koota.score}/{koota.max}</span>
              <span style={{ fontSize:10, color:'var(--text-muted)', transform:open?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block' }}>▼</span>
            </div>
          </div>
          <ScoreBar score={koota.score} max={koota.max} color={color}/>
        </div>
      </div>
      {open && (
        <div style={{
          padding:'0 16px 14px', borderTop:`1px solid ${color}22`,
          fontSize:13, color:'var(--text-secondary)', lineHeight:1.7,
        }}>
          <p style={{ marginBottom:6, color:'var(--text-muted)', fontSize:12 }}>{koota.description}</p>
          {koota.boy && <p>Boy: <strong style={{ color }}>{koota.boy}</strong> · Girl: <strong style={{ color }}>{koota.girl}</strong></p>}
          <p style={{ marginTop:6, color:'var(--text-primary)', fontWeight:500 }}>{koota.result}</p>
        </div>
      )}
    </div>
  );
}

function DoshaCard({ dosha, title, color }) {
  if (!dosha) return null;
  const hasDosha = dosha.dosha || dosha.boy_manglik || dosha.girl_manglik;
  return (
    <div style={{
      padding:'14px 16px', borderRadius:12,
      background: hasDosha ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)',
      border:`1px solid ${hasDosha?'rgba(239,68,68,0.25)':'rgba(16,185,129,0.25)'}`,
    }}>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:6, color: hasDosha?'#f87171':'#34d399' }}>
        {hasDosha ? '⚠️' : '✅'} {title}
      </div>
      <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>{dosha.result}</div>
    </div>
  );
}

export default function Compatibility() {
  const [boyForm,  setBoyForm]  = useState({ name:'', date:'', time:'', city:'', country:'India' });
  const [girlForm, setGirlForm] = useState({ name:'', date:'', time:'', city:'', country:'India' });
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleCalculate(e) {
    e.preventDefault(); setError(''); setLoading(true); setResult(null);
    try {
      // First generate kundlis for both to get Moon rashi/degree
      const [boyRes, girlRes] = await Promise.all([
        api.post('/kundli/generate', boyForm),
        api.post('/kundli/generate', girlForm),
      ]);

      const bk = boyRes.data.kundli;
      const gk = girlRes.data.kundli;

      // Get Moon position for both
      const boyMoon  = bk.planetary_positions?.Moon;
      const girlMoon = gk.planetary_positions?.Moon;

      if (!boyMoon || !girlMoon) throw new Error('Could not calculate Moon position');

      // Build planet house map for Mangal Dosha
      const buildPlanetHouseMap = (kundli) => {
        const lagnaRashi = kundli.lagna?.name;
        const lagnaIdx   = RASHIS.indexOf(lagnaRashi);
        const map = {};
        Object.entries(kundli.planetary_positions || {}).forEach(([planet, data]) => {
          const ri   = RASHIS.indexOf(data.rashi);
          const house = (ri - lagnaIdx + 12) % 12 + 1;
          map[planet] = { house, rashi: data.rashi };
        });
        return map;
      };

      const res = await api.post('/compatibility/calculate', {
        boy: {
          name:            boyForm.name,
          rashi:           boyMoon.rashi,
          degree_in_rashi: parseFloat(boyMoon.degree_in_rashi),
          planets:         buildPlanetHouseMap(bk),
        },
        girl: {
          name:            girlForm.name,
          rashi:           girlMoon.rashi,
          degree_in_rashi: parseFloat(girlMoon.degree_in_rashi),
          planets:         buildPlanetHouseMap(gk),
        },
      });

      setResult({ ...res.data, boyKundli: bk, girlKundli: gk });
    } catch(err) {
      setError(err.response?.data?.detail || err.message || 'Could not calculate compatibility');
    } finally { setLoading(false); }
  }

  const verdict = result?.verdict;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'14px 20px', borderBottom:'1px solid var(--border)',
        background:'rgba(15,12,26,0.92)', backdropFilter:'blur(12px)',
        position:'sticky', top:0, zIndex:100,
      }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>✨</span>
          <span className="font-cinzel gradient-text" style={{ fontSize:17, fontWeight:700 }}>COSMICA</span>
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/chart"      className="btn btn-ghost" style={{ padding:'7px 12px', fontSize:12 }}>Kundli</Link>
          <Link to="/login"      className="btn btn-ghost" style={{ padding:'7px 12px', fontSize:12 }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary"   style={{ padding:'7px 12px', fontSize:12 }}>Sign Up</Link>
        </div>
      </nav>

      <main style={{ maxWidth:900, margin:'0 auto', padding:'28px 16px' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:10 }}>💑</div>
          <h1 className="font-cinzel gradient-text" style={{ fontSize:'clamp(22px,5vw,36px)', marginBottom:10 }}>
            Marriage Compatibility
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.7 }}>
            36 Guna Ashtakoot matching — the ancient Vedic system for marriage compatibility
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginTop:12 }}>
            {['Varna','Vashya','Tara','Yoni','Gana','Bhakoot','Nadi','Graha Maitri'].map(k=>(
              <span key={k} style={{
                padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600,
                background:`${KOOTA_COLORS[k]}18`, color:KOOTA_COLORS[k],
                border:`1px solid ${KOOTA_COLORS[k]}33`,
              }}>{k}</span>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCalculate}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16, marginBottom:20 }}>
            <PersonForm title="Boy / Groom" emoji="👨" form={boyForm}  setForm={setBoyForm}  color="#60a5fa"/>
            <PersonForm title="Girl / Bride"  emoji="👩" form={girlForm} setForm={setGirlForm} color="#f472b6"/>
          </div>

          {error && (
            <div style={{
              padding:'12px 16px', marginBottom:16, borderRadius:10,
              background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
              color:'#f87171', fontSize:13,
            }}>⚠️ {error}</div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary"
            style={{ width:'100%', padding:'15px', fontSize:16 }}>
            {loading ? '✨ Calculating Compatibility...' : '💑 Calculate 36 Guna Compatibility'}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div style={{ marginTop:32 }} className="fade-in">
            {/* Verdict */}
            <div style={{
              textAlign:'center', padding:'32px 24px', marginBottom:24,
              background:`${verdict.color}0d`,
              border:`2px solid ${verdict.color}44`,
              borderRadius:20,
            }}>
              <div style={{ fontSize:56, fontWeight:900, color:verdict.color, lineHeight:1 }}>
                {result.total}<span style={{ fontSize:28, color:'var(--text-muted)' }}>/36</span>
              </div>
              <div style={{
                display:'inline-block', margin:'10px 0',
                padding:'6px 20px', borderRadius:999,
                background:`${verdict.color}22`, color:verdict.color,
                fontWeight:700, fontSize:18,
              }}>
                {verdict.grade} — {verdict.label}
              </div>
              <div style={{ fontSize:14, color:'var(--text-secondary)', maxWidth:500, margin:'8px auto 0', lineHeight:1.7 }}>
                {verdict.description}
              </div>

              {/* Meter */}
              <div style={{ maxWidth:400, margin:'16px auto 0' }}>
                <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:999, height:12, overflow:'hidden' }}>
                  <div style={{
                    width:`${result.percentage}%`, height:'100%',
                    background:`linear-gradient(90deg, #ef4444, #f59e0b, #10b981)`,
                    borderRadius:999, transition:'width 1s ease',
                  }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
                  <span>0</span><span>18</span><span>36</span>
                </div>
              </div>
            </div>

            {/* Nakshatra info */}
            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24,
            }}>
              {[
                { data:result.boy,  emoji:'👨', color:'#60a5fa', label:'Boy' },
                { data:result.girl, emoji:'👩', color:'#f472b6', label:'Girl' },
              ].map(p=>(
                <div key={p.label} style={{
                  padding:'16px', borderRadius:12,
                  background:'rgba(255,255,255,0.02)',
                  border:`1px solid ${p.color}33`,
                }}>
                  <div style={{ fontWeight:700, color:p.color, marginBottom:8 }}>
                    {p.emoji} {p.data.name || p.label}
                  </div>
                  {[
                    ['Nakshatra', `${p.data.nakshatra} (Pada ${p.data.pada})`],
                    ['Rashi',     p.data.rashi],
                    ['Gana',      p.data.gana],
                    ['Nadi',      p.data.nadi],
                    ['Nak. Ruler',p.data.ruler],
                  ].map(([label,val])=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                      <span style={{ color:'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontWeight:600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 8 Kootas */}
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>
              🔢 8 Kootas — Individual Scores
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
              {result.kootas.map((k,i)=><KootaCard key={i} koota={k}/>)}
            </div>

            {/* Doshas */}
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>
              ⚠️ Dosha Analysis
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              <DoshaCard dosha={result.doshas.rajju}  title="Rajju Dosha"  />
              <DoshaCard dosha={result.doshas.vedha}  title="Vedha Dosha"  />
              <DoshaCard dosha={result.doshas.mangal} title="Mangal Dosha" />
            </div>

            {/* Remedies section */}
            {result.total < 18 && (
              <div style={{
                padding:'20px', borderRadius:12, marginBottom:16,
                background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.2)',
              }}>
                <h4 style={{ marginBottom:10, color:'var(--purple-400)' }}>🙏 Recommended Remedies</h4>
                <ul style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:2, paddingLeft:20 }}>
                  <li>Consult a qualified Vedic astrologer before finalising the match</li>
                  <li>Perform Navagraha puja for both individuals</li>
                  <li>Recite Vishnu Sahasranama together on Thursdays</li>
                  <li>Offer yellow flowers and turmeric at a Vishnu temple</li>
                  <li>Consider performing Kumbh Vivah if Mangal Dosha is present</li>
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              padding:'12px 16px', borderRadius:10,
              background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)',
              fontSize:12, color:'var(--text-muted)', lineHeight:1.7,
            }}>
              💡 <strong>Note:</strong> Gun Milan is one of several compatibility methods in Vedic astrology.
              A score above 18 is generally considered good. Always consult a qualified astrologer for a
              complete analysis including planetary positions, dasha periods, and chart compatibility.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}