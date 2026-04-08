import React, { useState } from 'react';
import api from '../services/api';

const REPORTS = [
  {
    type: 'career',
    icon: '💼',
    title: 'Career & Profession',
    desc: 'Professional path, financial destiny, and career timing',
  },
  {
    type: 'marriage',
    icon: '💍',
    title: 'Marriage & Relationship',
    desc: 'Love, partnership compatibility, and family life',
  },
  {
    type: 'health',
    icon: '🏥',
    title: 'Health & Wellness',
    desc: 'Vitality, vulnerable areas, and wellness guidance',
  },
  {
    type: 'general',
    icon: '✨',
    title: 'Complete Life Overview',
    desc: 'Comprehensive reading covering all life areas',
  },
];

export default function ReportDownloader({ kundliId }) {
  const [loading, setLoading] = useState(null);
  const [error, setError]     = useState('');

  const download = async (reportType) => {
    setLoading(reportType);
    setError('');
    try {
      const res = await api.post(
        '/reports/generate',
        { kundli_id: kundliId, report_type: reportType },
        { responseType: 'blob' },
      );
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href     = url;
      link.download = `Cosmica_${reportType}_Report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError(`Failed to generate ${reportType} report. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
          Download PDF Reports
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          Get detailed Vedic astrology readings as professional PDF documents
        </p>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', marginBottom: 14, borderRadius: 'var(--radius)',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', fontSize: 12,
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {REPORTS.map(r => (
          <div key={r.type} style={{
            padding: 16,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'rgba(168,85,247,0.04)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div>
              <span style={{ fontSize: 22, marginRight: 8 }}>{r.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 11, margin: 0, flex: 1 }}>
              {r.desc}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => download(r.type)}
              disabled={loading !== null}
              style={{
                padding: '9px 14px', fontSize: 12, width: '100%',
                opacity: loading && loading !== r.type ? 0.5 : 1,
              }}
            >
              {loading === r.type
                ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }}/>Generating...</>
                : 'Download PDF'}
            </button>
          </div>
        ))}
      </div>

      <p style={{
        color: 'var(--text-secondary)', fontSize: 10,
        marginTop: 14, textAlign: 'center', margin: '14px 0 0',
      }}>
        Reports are generated using AI-powered Vedic analysis and may take a few seconds
      </p>
    </div>
  );
}
