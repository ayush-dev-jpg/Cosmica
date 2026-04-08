// src/pages/Chart.js — Public chart page, fully responsive
import YogaPanel from '../components/YogaPanel';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import KundliChart from '../components/KundliChart';
import DivisionalChart from '../components/DivisionalChart';
import CosmicSummary from '../components/CosmicSummary';
import PlanetTable from '../components/PlanetTable';
import ChatBot from '../components/ChatBot';
import DashaTimeline from '../components/DashaTimeline';
import ReportDownloader from '../components/ReportDownloader';
import api from '../services/api';

const COUNTRIES = [
  'India','USA','UK','Canada','Australia','UAE','Singapore',
  'Germany','France','Japan','Nepal','Sri Lanka','Other'
];

export default function Chart() {
  const { isLoggedIn } = useAuth();
  const [form, setForm]         = useState({ name:'', date:'', time:'', city:'', country:'India' });
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState('chart');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/kundli/generate', form);
      setResult(res.data); setActiveTab('chart');
    } catch(err) {
      setError(err.response?.data?.detail || 'Could not generate chart. Please check your birth details.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>

      {/* Minimal navbar */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'14px 20px', borderBottom:'1px solid var(--border)',
        background:'rgba(15,12,26,0.9)', backdropFilter:'blur(12px)',
        position:'sticky', top:0, zIndex:100,
      }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>✨</span>
          <span className="font-cinzel gradient-text" style={{ fontSize:17, fontWeight:700 }}>COSMICA</span>
        </Link>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login"  className="btn btn-ghost"   style={{ padding:'7px 12px', fontSize:12 }}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding:'7px 12px', fontSize:12 }}>Save Charts</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>

        {/* Birth form */}
        <div className="card" style={{ marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <span style={{ fontSize:26 }}>🔮</span>
            <div>
              <h2 style={{ fontSize:'clamp(15px,3vw,20px)', fontWeight:700, marginBottom:2 }}>
                Get Your Vedic Birth Chart
              </h2>
              <p style={{ color:'var(--text-secondary)', fontSize:12 }}>
                Enter your birth details — no account needed
              </p>
            </div>
          </div>

          {error && (
            <div style={{
              padding:'12px 14px', marginBottom:14, borderRadius:'var(--radius)',
              background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
              color:'#f87171', fontSize:13,
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))',
              gap:12, marginBottom:14,
            }}>
              <div style={{ gridColumn:'span 2' }}>
                <label className="label">Full Name</label>
                <input className="input" type="text" placeholder="e.g. Arjun Sharma"
                  value={form.name} onChange={e=>set('name',e.target.value)} required/>
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input className="input" type="date" value={form.date}
                  onChange={e=>set('date',e.target.value)}
                  max={new Date().toISOString().split('T')[0]} required/>
              </div>
              <div>
                <label className="label">Time of Birth</label>
                <input className="input" type="time" value={form.time}
                  onChange={e=>set('time',e.target.value)} required/>
              </div>
              <div>
                <label className="label">Birth City</label>
                <input className="input" type="text" placeholder="e.g. Mumbai"
                  value={form.city} onChange={e=>set('city',e.target.value)} required/>
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" style={{ cursor:'pointer' }}
                  value={form.country} onChange={e=>set('country',e.target.value)}>
                  {COUNTRIES.map(c=><option key={c} value={c} style={{ background:'#1a1530' }}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{
              padding:'10px 12px', marginBottom:12,
              background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.15)',
              borderRadius:'var(--radius)', fontSize:12, color:'var(--text-secondary)',
            }}>
              💡 Accurate birth time gives the most precise Lagna calculation
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', padding:'14px', fontSize:15 }}>
              {loading
                ? <><span className="spinner"/> Calculating your cosmic blueprint...</>
                : '✨ Calculate My Kundli'}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div className="spinner" style={{ width:44, height:44, margin:'0 auto 16px', borderWidth:3 }}/>
            <h3 style={{ marginBottom:6 }}>Consulting the cosmos...</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:13 }}>
              Calculating planetary positions with Swiss Ephemeris ✨
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <div className="fade-in">
            {/* Header */}
            <div style={{ marginBottom:18 }}>
              <h2 style={{ fontSize:'clamp(16px,3vw,22px)', fontWeight:700, marginBottom:6 }}>
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

            {/* Save prompt for guests */}
            {!isLoggedIn && (
              <div style={{
                padding:'12px 16px', marginBottom:18,
                background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.2)',
                borderRadius:'var(--radius)',
                display:'flex', justifyContent:'space-between', alignItems:'center',
                flexWrap:'wrap', gap:10,
              }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>💾 Want to save this chart?</div>
                  <div style={{ fontSize:11, color:'var(--text-secondary)' }}>
                    Create a free account to save and access your charts anytime
                  </div>
                </div>
                <Link to="/signup" className="btn btn-primary" style={{ padding:'8px 18px', fontSize:13 }}>
                  Create Free Account
                </Link>
              </div>
            )}

            {/* Content tabs */}
            <div style={{
              display:'flex', gap:2, marginBottom:18,
              borderBottom:'1px solid var(--border)',
              overflowX:'auto', WebkitOverflowScrolling:'touch',
            }}>
              {[
                { id:'chart',   label:'🪐 Chart' },
                { id:'planets', label:'🌌 Planets' },
                { id:'summary', label:'⭐ Summary' },
                { id:'d9',      label:'D9 Navamsa' },
                { id:'d10',     label:'D10 Dasamsa' },
                { id:'dasha',   label:'🌟 Dasha' },
                { id:'reports', label:'📄 Reports' },
              ].map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                  padding:'10px 16px', background:'none', border:'none',
                  borderBottom: activeTab===t.id ? '2px solid var(--purple-500)' : '2px solid transparent',
                  color: activeTab===t.id ? 'var(--purple-400)' : 'var(--text-secondary)',
                  fontWeight: activeTab===t.id ? 600 : 400,
                  fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
                }}>{t.label}</button>
              ))}
            </div>

            {activeTab==='chart'   && <KundliChart kundli={result.kundli} kundliId={result.kundli_id}/>}
            {activeTab==='planets' && <PlanetTable planets={result.kundli?.planetary_positions}/>}
            {activeTab==='summary' && <CosmicSummary kundli={result.kundli}/>}
            {activeTab==='d9'  && <DivisionalChart chartData={result.kundli?.d9}  title="D9 Navamsa Chart" />}
            {activeTab==='d10' && <DivisionalChart chartData={result.kundli?.d10} title="D10 Dasamsa Chart" />}
            {activeTab==='dasha' && <DashaTimeline kundli={result.kundli} birthDate={result.birth_details?.date} />}
            {activeTab==='reports' && <ReportDownloader kundliId={result.kundli_id} />}
          </div>
        )}
      </main>

      {result && <ChatBot kundliData={result.kundli}/>}
    </div>
  );
}