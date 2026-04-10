// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import KundliChart from '../components/KundliChart';
import DivisionalChart from '../components/DivisionalChart';
import CosmicSummary from '../components/CosmicSummary';
import PlanetTable from '../components/PlanetTable';
import PredictionCard from '../components/PredictionCard';
import YogaPanel from '../components/YogaPanel';
import DashaTimeline from '../components/DashaTimeline';
import FullPredictions from '../components/FullPredictions';
import Reports from '../components/Reports';
import ReportGenerator from '../components/ReportGenerator';
import ChatBot from '../components/ChatBot';
import api from '../services/api';

const COUNTRIES = [
  'India','USA','UK','Canada','Australia','UAE','Singapore',
  'Germany','France','Japan','Nepal','Sri Lanka','Other'
];

const FREE_CHART_LIMIT = 2;

function PaywallModal({ feature, onClose }) {
  const navigate = useNavigate();
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(5,3,15,0.88)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        background:'var(--bg-secondary)', border:'1px solid rgba(139,92,246,0.4)',
        borderRadius:20, padding:'32px 28px', maxWidth:440, width:'100%',
        boxShadow:'0 0 60px rgba(139,92,246,0.2)', position:'relative',
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:14, right:16, background:'none', border:'none',
          color:'var(--text-muted)', fontSize:20, cursor:'pointer',
        }}>✕</button>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{
            width:64, height:64, borderRadius:'50%', margin:'0 auto 14px',
            background:'rgba(124,58,237,0.15)', border:'2px solid rgba(139,92,246,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
          }}>🔒</div>
          <h2 style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>Premium Feature</h2>
          {feature && <p style={{ color:'var(--purple-400)', fontSize:14, fontWeight:600, marginBottom:6 }}>{feature}</p>}
          <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.7 }}>
            Unlock deep AI-powered readings, Yoga calculator, Dasha timeline, reports and much more.
          </p>
        </div>
        <div style={{ padding:'14px 16px', borderRadius:12, marginBottom:18,
          background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.18)' }}>
          {['✨ Unlimited Kundli charts','🔮 Yoga & Dosha calculator','🌟 Vimshottari Dasha timeline',
            '💑 36 Guna marriage compatibility','🔭 Full AI predictions','📄 PDF Report generator']
            .map((f,i)=><div key={i} style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:5 }}>{f}</div>)}
        </div>
        <div style={{ textAlign:'center', marginBottom:14 }}>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>Starting at just </span>
          <span style={{ fontSize:26, fontWeight:800, color:'var(--purple-400)' }}>₹59</span>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>/month</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={() => navigate('/pricing')} style={{
            width:'100%', padding:'14px', borderRadius:12,
            background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
            border:'none', color:'white', fontSize:15, fontWeight:700, cursor:'pointer',
          }}>✨ View Plans — From ₹59/month</button>
          <button onClick={onClose} style={{
            width:'100%', padding:'11px', borderRadius:12,
            background:'none', border:'1px solid var(--border)',
            color:'var(--text-secondary)', fontSize:13, cursor:'pointer',
          }}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}

function FreeTierBanner({ used, limit, onUpgrade }) {
  const remaining = limit - used;
  const pct = (used / limit) * 100;
  if (used === 0) return null;
  return (
    <div style={{
      padding:'12px 16px', borderRadius:10, marginBottom:16,
      background: remaining===0 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
      border:`1px solid ${remaining===0?'rgba(239,68,68,0.3)':'rgba(245,158,11,0.3)'}`,
      display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10,
    }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:remaining===0?'#f87171':'#f59e0b', marginBottom:3 }}>
          {remaining===0 ? '⚠️ Free chart limit reached' : `✨ ${remaining} free chart${remaining!==1?'s':''} remaining`}
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{used}/{limit} charts used</div>
        <div style={{ width:160, background:'rgba(255,255,255,0.08)', borderRadius:999, height:4, marginTop:6 }}>
          <div style={{ width:`${pct}%`, height:'100%', borderRadius:999,
            background:remaining===0?'#ef4444':'#f59e0b' }}/>
        </div>
      </div>
      <button onClick={onUpgrade} style={{
        padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:700,
        background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
        border:'none', color:'white', cursor:'pointer', flexShrink:0,
      }}>💎 Upgrade ₹59/mo</button>
    </div>
  );
}

function PremiumTabBtn({ id, label, active, isPremium, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'9px 14px', background:'none', border:'none',
      borderBottom: active ? '2px solid var(--purple-500)' : '2px solid transparent',
      color: active ? 'var(--purple-400)' : 'var(--text-secondary)',
      fontWeight: active ? 600 : 400,
      fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
      display:'flex', alignItems:'center', gap:5,
      opacity: isPremium ? 1 : 0.7,
    }}>
      {label}
      {!isPremium && <span style={{ fontSize:10 }}>🔒</span>}
    </button>
  );
}

export default function Dashboard() {
  const { user }                            = useAuth();
  const navigate                            = useNavigate();
  const [tab, setTab]                       = useState('generate');
  const [form, setForm]                     = useState({ name:'', date:'', time:'', city:'', country:'India' });
  const [result, setResult]                 = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [savedCharts, setSavedCharts]       = useState([]);
  const [chartsLoading, setChartsLoading]   = useState(false);
  const [activeTab, setActiveTab]           = useState('chart');
  const [showPaywall, setShowPaywall]       = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const isPremium = user?.subscription === 'premium'
                 || user?.subscription === 'yearly'
                 || user?.role === 'admin';

  const chartKey       = `cosmica_charts_${user?.email || 'guest'}`;
  const chartsUsed     = parseInt(localStorage.getItem(chartKey) || '0');

  function triggerPaywall(feature) { setPaywallFeature(feature); setShowPaywall(true); }
  function handlePremiumTab(id, label) {
    if (isPremium) { setActiveTab(id); return; }
    triggerPaywall(label + ' requires Premium');
  }

  useEffect(() => { loadSavedCharts(); }, []);
  useEffect(() => { if (tab === 'saved') loadSavedCharts(); }, [tab]);

  async function loadSavedCharts() {
    setChartsLoading(true);
    try {
      const res = await api.get('/kundli/my-charts');
      setSavedCharts(res.data.charts || []);
    } catch { setSavedCharts([]); }
    finally { setChartsLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isPremium && chartsUsed >= FREE_CHART_LIMIT) {
      triggerPaywall('Unlimited Charts'); return;
    }
    setError(''); setLoading(true);
    try {
      const res = await api.post('/kundli/generate', form);
      setResult(res.data); setActiveTab('chart');
      if (!isPremium) localStorage.setItem(chartKey, chartsUsed + 1);
      loadSavedCharts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate chart. Please check your birth details.');
    } finally { setLoading(false); }
  }

  async function handleDeleteChart(id) {
    if (!window.confirm('Delete this chart?')) return;
    try {
      await api.delete(`/kundli/${id}`);
      setSavedCharts(prev => prev.filter(c => c.id !== id));
    } catch { alert('Failed to delete'); }
  }

  async function handleLoadChart(chartId) {
    try {
      const res = await api.get(`/kundli/${chartId}`);
      setResult({ kundli_id:chartId, person_name:res.data.person_name,
        birth_details:res.data.birth_details, kundli:res.data.kundli });
      setTab('generate'); setActiveTab('chart');
      window.scrollTo({ top:0, behavior:'smooth' });
    } catch { alert('Could not load chart.'); }
  }

  const tabBtn = (id, label, active) => (
    <button key={id} onClick={() => setTab(id)} style={{
      padding:'10px 16px', background:'none', border:'none',
      borderBottom: active ? '2px solid var(--purple-500)' : '2px solid transparent',
      color: active ? 'var(--purple-400)' : 'var(--text-secondary)',
      fontWeight: active ? 600 : 400,
      fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
    }}>{label}</button>
  );

  const freeTabBtn = (id, label, active) => (
    <button key={id} onClick={() => setActiveTab(id)} style={{
      padding:'9px 14px', background:'none', border:'none',
      borderBottom: active ? '2px solid var(--purple-500)' : '2px solid transparent',
      color: active ? 'var(--purple-400)' : 'var(--text-secondary)',
      fontWeight: active ? 600 : 400,
      fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      <Navbar />

      {showPaywall && <PaywallModal feature={paywallFeature} onClose={() => setShowPaywall(false)}/>}

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>

        {/* Welcome */}
        <div style={{ marginBottom:22, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
          <div>
            <h1 style={{ fontSize:'clamp(18px,4vw,26px)', fontWeight:700, marginBottom:4 }}>
              Namaste, {user?.name?.split(' ')[0]} 🙏
            </h1>
            <p style={{ color:'var(--text-secondary)', fontSize:13 }}>
              {savedCharts.length > 0
                ? `You have ${savedCharts.length} saved chart${savedCharts.length>1?'s':''}`
                : 'Generate your first Vedic birth chart below'}
            </p>
          </div>
          {!isPremium ? (
            <button onClick={() => navigate('/pricing')} style={{
              padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:700,
              background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
              border:'none', color:'white', cursor:'pointer',
            }}>💎 Upgrade to Premium</button>
          ) : (
            <div style={{
              padding:'5px 12px', borderRadius:999, fontSize:11, fontWeight:700,
              background:'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(79,70,229,0.2))',
              border:'1px solid rgba(139,92,246,0.4)', color:'var(--purple-400)',
            }}>✦ Premium</div>
          )}
        </div>

        {/* Main tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
          {tabBtn('generate', '✨ New Chart', tab==='generate')}
          {tabBtn('saved', `📚 Saved (${savedCharts.length})`, tab==='saved')}
        </div>

        {/* ── GENERATE TAB ── */}
        {tab==='generate' && (
          <div>
            {!isPremium && (
              <FreeTierBanner used={chartsUsed} limit={FREE_CHART_LIMIT} onUpgrade={() => navigate('/pricing')}/>
            )}

            <div className="card" style={{ marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                <span style={{ fontSize:24 }}>🔮</span>
                <div>
                  <h2 style={{ fontSize:16, fontWeight:700, marginBottom:2 }}>Generate Kundli</h2>
                  <p style={{ color:'var(--text-secondary)', fontSize:12 }}>
                    {isPremium ? 'Unlimited charts · Premium account' : `${Math.max(0,FREE_CHART_LIMIT-chartsUsed)} of ${FREE_CHART_LIMIT} free charts remaining`}
                  </p>
                </div>
              </div>

              {error && (
                <div style={{ padding:'12px 14px', marginBottom:14, borderRadius:'var(--radius)',
                  background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
                  color:'#f87171', fontSize:13 }}>⚠️ {error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:14 }}>
                  <div style={{ gridColumn:'span 2' }}>
                    <label className="label">Full Name</label>
                    <input className="input" type="text" placeholder="e.g. Arjun Sharma"
                      value={form.name} onChange={e=>set('name',e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Date of Birth</label>
                    <input className="input" type="date" value={form.date}
                      onChange={e=>set('date',e.target.value)}
                      max={new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div>
                    <label className="label">Time of Birth</label>
                    <input className="input" type="time" value={form.time}
                      onChange={e=>set('time',e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Birth City</label>
                    <input className="input" type="text" placeholder="e.g. Mumbai"
                      value={form.city} onChange={e=>set('city',e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <select className="input" style={{ cursor:'pointer' }}
                      value={form.country} onChange={e=>set('country',e.target.value)}>
                      {COUNTRIES.map(c=><option key={c} value={c} style={{ background:'#1a1530' }}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}
                  style={{ width:'100%', padding:'13px', fontSize:15 }}>
                  {loading ? <><span className="spinner"/> Calculating...</> : '✨ Calculate My Kundli'}
                </button>
              </form>
            </div>

            {loading && (
              <div style={{ textAlign:'center', padding:'48px 0' }}>
                <div className="spinner" style={{ width:44, height:44, margin:'0 auto 14px', borderWidth:3 }}/>
                <h3 style={{ marginBottom:6, fontSize:16 }}>Consulting the cosmos...</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Calculating with Swiss Ephemeris ✨</p>
              </div>
            )}

            {!loading && result && (
              <div className="fade-in">
                <div style={{ marginBottom:18 }}>
                  <h2 style={{ fontSize:'clamp(16px,3vw,20px)', fontWeight:700, marginBottom:6 }}>
                    ✨ {result.person_name}'s Kundli
                  </h2>
                  <p style={{ color:'var(--text-secondary)', fontSize:12, marginBottom:10 }}>
                    {result.birth_details?.city}, {result.birth_details?.country} ·{' '}
                    {result.birth_details?.date} at {result.birth_details?.time}
                  </p>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <span className="badge badge-purple">{result.kundli?.nakshatra?.name}</span>
                    <span className="badge badge-gold">{result.kundli?.moon_rashi}</span>
                    <span className="badge badge-green">Lagna: {result.kundli?.lagna?.name}</span>
                  </div>
                </div>

                {/* Content tabs */}
                <div style={{ display:'flex', gap:2, marginBottom:18, borderBottom:'1px solid var(--border)',
                  overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
                  {freeTabBtn('chart',   '🪐 Chart',   activeTab==='chart')}
                  {freeTabBtn('planets', '🌌 Planets', activeTab==='planets')}
                  {freeTabBtn('summary', '⭐ Summary', activeTab==='summary')}
                  <PremiumTabBtn id="prediction" label="🔭 Predictions"    active={activeTab==='prediction'} isPremium={isPremium} onClick={()=>handlePremiumTab('prediction','Predictions')}/>
                  <PremiumTabBtn id="yogas"      label="🔮 Yogas & Doshas" active={activeTab==='yogas'}      isPremium={isPremium} onClick={()=>handlePremiumTab('yogas','Yoga & Dosha Calculator')}/>
                  <PremiumTabBtn id="dasha"      label="🌟 Dasha"          active={activeTab==='dasha'}      isPremium={isPremium} onClick={()=>handlePremiumTab('dasha','Dasha Timeline')}/>
                  <PremiumTabBtn id="d9"         label="D9 Navamsa"        active={activeTab==='d9'}         isPremium={isPremium} onClick={()=>handlePremiumTab('d9','D9 Navamsa Chart')}/>
                  <PremiumTabBtn id="d10"        label="D10 Dasamsa"       active={activeTab==='d10'}        isPremium={isPremium} onClick={()=>handlePremiumTab('d10','D10 Dasamsa Chart')}/>
                  <PremiumTabBtn id="readings"   label="📖 Readings"       active={activeTab==='readings'}   isPremium={isPremium} onClick={()=>handlePremiumTab('readings','Full Predictions')}/>
                  <PremiumTabBtn id="reports"    label="📄 Reports"        active={activeTab==='reports'}    isPremium={isPremium} onClick={()=>handlePremiumTab('reports','Detailed Reports')}/>
                  <PremiumTabBtn id="report"     label="📄 PDF Report"     active={activeTab==='report'}     isPremium={isPremium} onClick={()=>handlePremiumTab('report','PDF Report')}/>
                </div>

                {activeTab==='chart'      && <KundliChart kundli={result.kundli} kundliId={result.kundli_id}/>}
                {activeTab==='planets'    && <PlanetTable planets={result.kundli?.planetary_positions}/>}
                {activeTab==='summary'    && <CosmicSummary kundli={result.kundli}/>}
                {activeTab==='prediction' && isPremium && <PredictionCard kundliId={result.kundli_id}/>}
                {activeTab==='yogas'      && isPremium && <YogaPanel kundli={result.kundli}/>}
                {activeTab==='dasha'      && isPremium && <DashaTimeline kundli={result.kundli} birthDate={result.birth_details?.date}/>}
                {activeTab==='d9'         && isPremium && <DivisionalChart chartData={result.kundli?.d9}  title="D9 Navamsa Chart"/>}
                {activeTab==='d10'        && isPremium && <DivisionalChart chartData={result.kundli?.d10} title="D10 Dasamsa Chart"/>}
                {activeTab==='readings'   && isPremium && (
                  <FullPredictions
                    kundli={result.kundli}
                    lagna={result.kundli?.lagna?.name}
                    personName={result.person_name}
                    kundliId={result.kundli_id}
                  />
                )}
                {activeTab==='reports' && isPremium && (
                  <Reports
                    kundli={result.kundli}
                    lagna={result.kundli?.lagna?.name}
                    personName={result.person_name}
                    kundliId={result.kundli_id}
                    birthDate={result.birth_details?.date}
                    birthTime={result.birth_details?.time}
                    birthPlace={`${result.birth_details?.city || ''}, ${result.birth_details?.country || ''}`}
                    moonRashi={result.kundli?.planetary_positions?.Moon?.rashi_en}
                  />
                )}
                {activeTab==='report' && isPremium && (
                  <ReportGenerator
                    kundli={result.kundli}
                    lagna={result.kundli?.lagna?.name}
                    personName={result.person_name}
                    birthDetails={result.birth_details}
                    isPremium={isPremium}
                  />
                )}
              </div>
            )}

            {!loading && !result && (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)' }}>
                <div style={{ fontSize:52, marginBottom:10 }}>🪐</div>
                <p style={{ fontSize:14 }}>Enter birth details above to generate your Kundli</p>
              </div>
            )}
          </div>
        )}

        {/* ── SAVED CHARTS TAB ── */}
        {tab==='saved' && (
          <div>
            {chartsLoading ? (
              <div style={{ textAlign:'center', padding:'48px 0' }}>
                <div className="spinner" style={{ width:36, height:36, margin:'0 auto 12px', borderWidth:3 }}/>
                <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Loading your charts...</p>
              </div>
            ) : savedCharts.length===0 ? (
              <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)' }}>
                <div style={{ fontSize:52, marginBottom:10 }}>📚</div>
                <h3 style={{ color:'var(--text-secondary)', marginBottom:8, fontSize:16 }}>No saved charts yet</h3>
                <p style={{ fontSize:13, marginBottom:18 }}>Generate a chart and it will be saved here automatically</p>
                <button className="btn btn-primary" onClick={() => setTab('generate')}>✨ Generate Chart</button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
                {savedCharts.map(chart => (
                  <div key={chart.id} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <h3 style={{ fontSize:15, marginBottom:3 }}>{chart.person_name}</h3>
                        <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                          {new Date(chart.created_at).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'})}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteChart(chart.id)} style={{
                        padding:'5px 8px', fontSize:12,
                        background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                        color:'#f87171', borderRadius:6, cursor:'pointer',
                      }}>🗑️</button>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
                      {[
                        ['Nakshatra', chart.nakshatra],
                        ['Moon Rashi', chart.moon_rashi],
                        ['Lagna', chart.lagna],
                        ['Place', `${chart.birth_details?.city}, ${chart.birth_details?.country}`],
                        ['Date', chart.birth_details?.date],
                      ].map(([label,val])=>(
                        <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                          <span style={{ color:'var(--text-muted)' }}>{label}</span>
                          <span style={{ fontWeight:600 }}>{val||'—'}</span>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-primary" style={{ width:'100%', padding:'10px' }}
                      onClick={() => handleLoadChart(chart.id)}>
                      View Full Chart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <ChatBot kundliData={result?.kundli||null}/>
    </div>
  );
}