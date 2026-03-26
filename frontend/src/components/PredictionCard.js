// src/components/PredictionCard.js
import React, { useState } from 'react';
import api from '../services/api';

const PREDICTION_TYPES = [
  { id: 'general', label: '🌟 General', desc: 'Overall life & personality' },
  { id: 'daily',   label: '📅 Daily',   desc: "Today's energies"          },
  { id: 'weekly',  label: '📆 Weekly',  desc: 'This week forecast'         },
  { id: 'monthly', label: '🗓️ Monthly', desc: 'Month ahead'               },
];

export default function PredictionCard({ kundliId, initialPrediction }) {
  const [activeType, setActiveType]   = useState('general');
  const [prediction, setPrediction]   = useState(initialPrediction || null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const fetchPrediction = async (type) => {
    setActiveType(type);
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/predictions/generate', {
        kundli_id: kundliId,
        prediction_type: type,
      });
      setPrediction(res.data);
    } catch (err) {
      setError('Failed to generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format markdown-like text
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={i} style={{ color: 'var(--purple-400)', margin: '16px 0 6px', fontSize: 14 }}>
          {line.replace(/\*\*/g, '')}
        </h4>;
      }
      if (line.startsWith('**')) {
        const parts = line.split('**');
        return <p key={i} style={{ marginBottom: 8, lineHeight: 1.8, fontSize: 14, color: 'var(--text-secondary)' }}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text-primary)' }}>{p}</strong> : p)}
        </p>;
      }
      if (line.startsWith('---')) return <div key={i} className="divider" />;
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
      return <p key={i} style={{ marginBottom: 8, lineHeight: 1.8, fontSize: 14, color: 'var(--text-secondary)' }}>{line}</p>;
    });
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🔭</span> AI-Powered Predictions
        {prediction?.engine && (
          <span className="badge badge-purple" style={{ marginLeft: 'auto', fontSize: 10 }}>
            {prediction.engine}
          </span>
        )}
      </h3>

      {/* Prediction type tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {PREDICTION_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => fetchPrediction(type.id)}
            disabled={loading}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid',
              borderColor: activeType === type.id ? 'var(--purple-500)' : 'var(--border)',
              background: activeType === type.id ? 'rgba(168,85,247,0.15)' : 'transparent',
              color: activeType === type.id ? 'var(--purple-400)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeType === type.id ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 32, height: 32 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            🔮 Consulting the cosmos...
          </p>
        </div>
      )}

      {error && !loading && (
        <div style={{ color: '#f87171', fontSize: 14, padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius)' }}>
          {error}
        </div>
      )}

      {!loading && !error && prediction && (
        <div className="fade-in">
          <div style={{
            padding: '16px',
            background: 'rgba(168,85,247,0.05)',
            border: '1px solid rgba(168,85,247,0.12)',
            borderRadius: 'var(--radius)',
            minHeight: 100,
          }}>
            {formatText(prediction.prediction)}
          </div>
        </div>
      )}

      {!loading && !prediction && (
        <div style={{
          textAlign: 'center', padding: '40px 0',
          color: 'var(--text-muted)', fontSize: 14,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔮</div>
          <p>Click a prediction type above to get your personalized reading</p>
        </div>
      )}
    </div>
  );
}
