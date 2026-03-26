// src/pages/Chart.js
// Public chart page — works without login
// Anyone can enter birth details and get their full Kundli

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import KundliChart from '../components/KundliChart';
import CosmicSummary from '../components/CosmicSummary';
import PlanetTable from '../components/PlanetTable';
import ChatBot from '../components/ChatBot';
import api from '../services/api';

const COUNTRIES = [
  'India','USA','UK','Canada','Australia','UAE','Singapore',
  'Germany','France','Japan','Nepal','Sri Lanka','Other'
];

export default function Chart() {
  const { isLoggedIn } = useAuth();

  const [form, setForm]       = useState({ name:'', date:'', time:'', city:'', country:'India' });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [activeTab, setActiveTab] = useState('chart');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/kundli/generate', form);
      setResult(res.data);
      setActiveTab('chart');
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate chart. Please check your birth details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Minimal navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(15,12,26,0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>✨</span>
          <span className="font-cinzel gradient-text" style={{ fontSize: 18, fontWeight: 700 }}>COSMICA</span>
        </Link>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              My Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login"  className="btn btn-ghost"   style={{ padding: '8px 16px', fontSize: 13 }}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Save Charts</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Birth details form */}
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>🔮</span>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
                Get Your Vedic Birth Chart
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                Enter your birth details for an accurate Kundli — no account needed
              </p>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', marginBottom: 16, borderRadius: 'var(--radius)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: 14,
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 16 }}>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="label">Full Name</label>
                <input className="input" type="text" placeholder="e.g. Arjun Sharma"
                  value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>

              <div>
                <label className="label">Date of Birth</label>
                <input className="input" type="date"
                  value={form.date} onChange={e => set('date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]} required />
              </div>

              <div>
                <label className="label">Time of Birth</label>
                <input className="input" type="time"
                  value={form.time} onChange={e => set('time', e.target.value)} required />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Use local birth time
                </p>
              </div>

              <div>
                <label className="label">Birth City</label>
                <input className="input" type="text" placeholder="e.g. Mumbai"
                  value={form.city} onChange={e => set('city', e.target.value)} required />
              </div>

              <div>
                <label className="label">Country</label>
                <select className="input" style={{ cursor: 'pointer' }}
                  value={form.country} onChange={e => set('country', e.target.value)}>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c} style={{ background: '#1a1530' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tip */}
            <div style={{
              padding: '10px 14px', marginBottom: 16,
              background: 'rgba(168,85,247,0.07)',
              border: '1px solid rgba(168,85,247,0.15)',
              borderRadius: 'var(--radius)', fontSize: 12,
              color: 'var(--text-secondary)',
            }}>
              💡 Accurate birth time gives the most precise Lagna (Ascendant) calculation
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: 15 }}>
              {loading
                ? <><span className="spinner" /> Calculating your cosmic blueprint...</>
                : '✨ Calculate My Kundli'}
            </button>
          </form>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 20px', borderWidth: 3 }} />
            <h3 style={{ marginBottom: 8 }}>Consulting the cosmos...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Calculating planetary positions with Swiss Ephemeris ✨
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <div className="fade-in">

            {/* Result header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                  ✨ {result.person_name}'s Kundli
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {result.birth_details?.city}, {result.birth_details?.country} ·{' '}
                  {result.birth_details?.date} at {result.birth_details?.time}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-purple">{result.kundli?.nakshatra?.name}</span>
                <span className="badge badge-gold">{result.kundli?.moon_rashi}</span>
                <span className="badge badge-green">Lagna: {result.kundli?.lagna?.name}</span>
              </div>
            </div>

            {/* Save chart prompt (only for guests) */}
            {!isLoggedIn && (
              <div style={{
                padding: '14px 18px', marginBottom: 20,
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: 'var(--radius)',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                    💾 Want to save this chart?
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Create a free account to save charts, track history, and access the library
                  </div>
                </div>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
                  Create Free Account
                </Link>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
              {[
                { id: 'chart',   label: '🪐 Kundli Chart' },
                { id: 'planets', label: '🌌 Planets' },
                { id: 'summary', label: '⭐ Summary' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  padding: '10px 18px', background: 'none', border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--purple-500)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--purple-400)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: 13, cursor: 'pointer', marginBottom: -1,
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chart tab */}
            {activeTab === 'chart' && (
              <KundliChart kundli={result.kundli} kundliId={result.kundli_id} />
            )}

            {/* Planets tab */}
            {activeTab === 'planets' && (
              <PlanetTable planets={result.kundli?.planetary_positions} />
            )}

            {/* Summary tab */}
            {activeTab === 'summary' && (
              <CosmicSummary kundli={result.kundli} />
            )}
          </div>
        )}
      </main>

      {/* Chatbot (visible after chart is generated) */}
      {result && <ChatBot kundliData={result.kundli} />}
    </div>
  );
}