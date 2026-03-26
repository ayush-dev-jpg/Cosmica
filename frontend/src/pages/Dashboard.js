// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import KundliChart from '../components/KundliChart';
import CosmicSummary from '../components/CosmicSummary';
import PlanetTable from '../components/PlanetTable';
import PredictionCard from '../components/PredictionCard';
import ChatBot from '../components/ChatBot';
import api from '../services/api';

const COUNTRIES = [
  'India','USA','UK','Canada','Australia','UAE','Singapore',
  'Germany','France','Japan','Nepal','Sri Lanka','Other'
];

export default function Dashboard() {
  const { user }                        = useAuth();
  const navigate                        = useNavigate();
  const [tab, setTab]                   = useState('generate');
  const [form, setForm]                 = useState({ name:'', date:'', time:'', city:'', country:'India' });
  const [result, setResult]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [savedCharts, setSavedCharts]   = useState([]);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [activeTab, setActiveTab]       = useState('chart');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Load saved charts when switching to saved tab
  useEffect(() => {
    if (tab === 'saved') loadSavedCharts();
  }, [tab]);

  // Also load saved charts on mount so count shows immediately
  useEffect(() => {
    loadSavedCharts();
  }, []);

  async function loadSavedCharts() {
    setChartsLoading(true);
    try {
      const res = await api.get('/kundli/my-charts');
      setSavedCharts(res.data.charts || []);
    } catch {
      setSavedCharts([]);
    } finally {
      setChartsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/kundli/generate', form);
      setResult(res.data);
      setActiveTab('chart');
      // Refresh saved charts count after generating
      loadSavedCharts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate chart. Please check your birth details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteChart(id) {
    if (!window.confirm('Delete this chart?')) return;
    try {
      await api.delete(`/kundli/${id}`);
      setSavedCharts(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Failed to delete chart');
    }
  }

  async function handleLoadChart(chartId) {
    try {
      const res = await api.get(`/kundli/${chartId}`);
      setResult({
        kundli_id:    chartId,
        person_name:  res.data.person_name,
        birth_details: res.data.birth_details,
        kundli:       res.data.kundli,
      });
      setTab('generate');
      setActiveTab('chart');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      alert('Could not load chart. Please try again.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
            Namaste, {user?.name?.split(' ')[0]} 🙏
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {savedCharts.length > 0
              ? `You have ${savedCharts.length} saved chart${savedCharts.length > 1 ? 's' : ''}`
              : 'Generate your first Vedic birth chart below'}
          </p>
        </div>

        {/* Main tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 28,
          borderBottom: '1px solid var(--border)',
        }}>
          {[
            { id: 'generate', label: '✨ New Chart' },
            { id: 'saved',    label: `📚 Saved Charts (${savedCharts.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 20px', background: 'none', border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--purple-500)' : '2px solid transparent',
              color: tab === t.id ? 'var(--purple-400)' : 'var(--text-secondary)',
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: 14, cursor: 'pointer', marginBottom: -1,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── GENERATE TAB ── */}
        {tab === 'generate' && (
          <div>
            {/* Birth form */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 26 }}>🔮</span>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
                    Generate Kundli
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                    Charts are automatically saved to your account
                  </p>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '12px 16px', marginBottom: 16,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 'var(--radius)', color: '#f87171', fontSize: 14,
                }}>⚠️ {error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 14, marginBottom: 16,
                }}>
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

                <button className="btn btn-primary" type="submit" disabled={loading}
                  style={{ width: '100%', padding: '13px', fontSize: 15 }}>
                  {loading
                    ? <><span className="spinner" /> Calculating...</>
                    : '✨ Calculate My Kundli'}
                </button>
              </form>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <div className="spinner" style={{ width: 44, height: 44, margin: '0 auto 16px', borderWidth: 3 }} />
                <h3 style={{ marginBottom: 6 }}>Consulting the cosmos...</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  Calculating with Swiss Ephemeris ✨
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
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                      ✨ {result.person_name}'s Kundli
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
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

                {/* Content tabs */}
                <div style={{
                  display: 'flex', gap: 4, marginBottom: 20,
                  borderBottom: '1px solid var(--border)',
                }}>
                  {[
                    { id: 'chart',      label: '🪐 Chart' },
                    { id: 'planets',    label: '🌌 Planets' },
                    { id: 'summary',    label: '⭐ Summary' },
                    { id: 'prediction', label: '🔭 Predictions' },
                  ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                      padding: '9px 16px', background: 'none', border: 'none',
                      borderBottom: activeTab === t.id ? '2px solid var(--purple-500)' : '2px solid transparent',
                      color: activeTab === t.id ? 'var(--purple-400)' : 'var(--text-secondary)',
                      fontWeight: activeTab === t.id ? 600 : 400,
                      fontSize: 13, cursor: 'pointer', marginBottom: -1,
                    }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'chart' && (
                  <KundliChart kundli={result.kundli} kundliId={result.kundli_id} />
                )}
                {activeTab === 'planets' && (
                  <PlanetTable planets={result.kundli?.planetary_positions} />
                )}
                {activeTab === 'summary' && (
                  <CosmicSummary kundli={result.kundli} />
                )}
                {activeTab === 'prediction' && (
                  <PredictionCard kundliId={result.kundli_id} />
                )}
              </div>
            )}

            {/* Empty state */}
            {!loading && !result && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🪐</div>
                <p style={{ fontSize: 14 }}>Enter birth details above to generate your Kundli</p>
              </div>
            )}
          </div>
        )}

        {/* ── SAVED CHARTS TAB ── */}
        {tab === 'saved' && (
          <div>
            {chartsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 12px', borderWidth: 3 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading your charts...</p>
              </div>
            ) : savedCharts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>📚</div>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No saved charts yet</h3>
                <p style={{ fontSize: 13, marginBottom: 20 }}>
                  Generate a chart and it will be saved here automatically
                </p>
                <button className="btn btn-primary" onClick={() => setTab('generate')}>
                  ✨ Generate Chart
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}>
                {savedCharts.map(chart => (
                  <div key={chart.id} className="card" style={{ position: 'relative' }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: 14,
                    }}>
                      <div>
                        <h3 style={{ fontSize: 16, marginBottom: 4 }}>{chart.person_name}</h3>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(chart.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteChart(chart.id)}
                        style={{
                          padding: '5px 8px', fontSize: 12,
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          color: '#f87171', borderRadius: 6, cursor: 'pointer',
                        }}
                      >🗑️</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {[
                        ['Nakshatra',   chart.nakshatra],
                        ['Moon Rashi',  chart.moon_rashi],
                        ['Lagna',       chart.lagna],
                        ['Birth Place', `${chart.birth_details?.city}, ${chart.birth_details?.country}`],
                        ['Date',        chart.birth_details?.date],
                      ].map(([label, val]) => (
                        <div key={label} style={{
                          display: 'flex', justifyContent: 'space-between', fontSize: 12,
                        }}>
                          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                          <span style={{ fontWeight: 600 }}>{val || '—'}</span>
                        </div>
                      ))}
                    </div>

                    {/* View chart button — loads chart in generate tab */}
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '10px' }}
                      onClick={() => handleLoadChart(chart.id)}
                    >
                      View Full Chart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <ChatBot kundliData={result?.kundli || null} />
    </div>
  );
}