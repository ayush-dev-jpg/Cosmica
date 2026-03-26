// src/components/BirthForm.js
import React, { useState } from 'react';
import api from '../services/api';

const COUNTRIES = [
  'India', 'USA', 'UK', 'Canada', 'Australia', 'UAE', 'Singapore',
  'Germany', 'France', 'Japan', 'China', 'Nepal', 'Sri Lanka', 'Other'
];

export default function BirthForm({ onResult, onLoading }) {
  const [form, setForm]   = useState({
    name: '', date: '', time: '', city: '', country: 'India'
  });
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.date || !form.time || !form.city) {
      return setError('Please fill in all fields');
    }

    onLoading(true);
    try {
      const res = await api.post('/kundli/generate', form);
      onResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to generate chart. Check your birth details.';
      setError(msg);
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 28 }}>🔮</div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Generate Your Kundli</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Enter birth details for accurate Vedic chart generation
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', marginBottom: 20, borderRadius: 'var(--radius)',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', fontSize: 14,
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Full Name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Full Name</label>
            <input className="input" type="text" placeholder="e.g. Arjun Sharma"
              value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          {/* Date */}
          <div>
            <label className="label">Date of Birth</label>
            <input className="input" type="date"
              value={form.date} onChange={e => set('date', e.target.value)} required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time */}
          <div>
            <label className="label">Time of Birth</label>
            <input className="input" type="time"
              value={form.time} onChange={e => set('time', e.target.value)} required />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Use local birth time (24-hour format)
            </p>
          </div>

          {/* City */}
          <div>
            <label className="label">Birth City</label>
            <input className="input" type="text" placeholder="e.g. Mumbai"
              value={form.city} onChange={e => set('city', e.target.value)} required />
          </div>

          {/* Country */}
          <div>
            <label className="label">Country</label>
            <select className="input" style={{ cursor: 'pointer' }}
              value={form.country} onChange={e => set('country', e.target.value)}>
              {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#1a1530' }}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Tip */}
        <div style={{
          marginTop: 16,
          padding: '10px 14px',
          background: 'rgba(168,85,247,0.07)',
          border: '1px solid rgba(168,85,247,0.15)',
          borderRadius: 'var(--radius)',
          fontSize: 12,
          color: 'var(--text-secondary)',
        }}>
          💡 <strong>Tip:</strong> Accurate birth time ensures the most precise Lagna (Ascendant) calculation.
          Even a few minutes matter!
        </div>

        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 20, padding: '14px' }}>
          ✨ Calculate My Kundli
        </button>
      </form>
    </div>
  );
}
