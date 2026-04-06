// src/components/Reports.js
import React, { useState } from 'react';
import api from '../services/api';

const REPORT_TYPES = {
  marriage: {
    id: 'marriage',
    title: 'Marriage & Relationships',
    emoji: '💍',
    desc: 'Spouse, compatibility, married life, love & romance',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    color: '#f472b6',
    bgColor: 'rgba(244,114,182,0.08)',
    borderColor: 'rgba(244,114,182,0.25)',
  },
  career: {
    id: 'career',
    title: 'Career & Profession',
    emoji: '💼',
    desc: 'Job, business, wealth, income & professional growth',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    color: '#fbbf24',
    bgColor: 'rgba(251,191,36,0.08)',
    borderColor: 'rgba(251,191,36,0.25)',
  },
  full_life: {
    id: 'full_life',
    title: 'Complete Life Report',
    emoji: '🌟',
    desc: 'All 12 houses — personality, wealth, health, marriage, career & more',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    color: '#a78bfa',
    bgColor: 'rgba(167,139,250,0.08)',
    borderColor: 'rgba(167,139,250,0.25)',
  },
};

const TYPE_BADGE = {
  planet_house: { label: 'Planet in House', color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  planet_sign:  { label: 'Planet in Sign',  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  lord_house:   { label: 'Lord in House',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  rashi:        { label: 'Rashi',           color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  nakshatra:    { label: 'Nakshatra',       color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
};

// ── Knowledge Card ───────────────────────────────────────────
function KnowledgeCard({ item, index }) {
  const [open, setOpen] = useState(index === 0);
  const badge = TYPE_BADGE[item.type] || TYPE_BADGE.planet_house;

  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden', marginBottom: 6,
      border: `1px solid ${badge.color}22`,
      animation: `fadeSlideIn 0.3s ease ${index * 0.04}s both`,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', border: 'none', cursor: 'pointer', textAlign: 'left',
        background: open ? `${badge.color}0a` : 'rgba(255,255,255,0.02)',
        transition: 'background 0.2s',
      }}>
        <span style={{
          padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
          background: badge.bg, color: badge.color, border: `1px solid ${badge.color}33`,
          flexShrink: 0,
        }}>{badge.label}</span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
          {item.title}
        </span>
        <span style={{
          fontSize: 10, color: 'var(--text-muted)', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          padding: '14px 16px', background: `${badge.color}06`,
          borderTop: `1px solid ${badge.color}15`,
          fontSize: 13.5, lineHeight: 1.85, color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
        }}>
          {item.text}
        </div>
      )}
    </div>
  );
}

// ── Report Section ───────────────────────────────────────────
function ReportSection({ section, reportColor, index }) {
  const [open, setOpen] = useState(true);
  const hasKnowledge = section.db_knowledge && section.db_knowledge.length > 0;
  const hasAI = section.ai_insight;

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', marginBottom: 16,
      border: `1px solid ${reportColor}25`,
      animation: `fadeSlideIn 0.4s ease ${index * 0.06}s both`,
    }}>
      {/* Section Header */}
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 18px', border: 'none', cursor: 'pointer', textAlign: 'left',
        background: open ? `${reportColor}0d` : 'rgba(255,255,255,0.02)',
        transition: 'background 0.2s',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${reportColor}18`, border: `1px solid ${reportColor}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: reportColor,
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: reportColor, marginBottom: 2 }}>
            {section.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {section.description}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {hasKnowledge && (
            <span style={{
              padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              background: 'rgba(52,211,153,0.12)', color: '#34d399',
              border: '1px solid rgba(52,211,153,0.3)',
            }}>{section.db_count} from DB</span>
          )}
          {hasAI && (
            <span style={{
              padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
              border: '1px solid rgba(139,92,246,0.3)',
            }}>AI</span>
          )}
          <span style={{
            fontSize: 10, color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
          }}>▼</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', background: `${reportColor}04` }}>

          {/* House Info Pills */}
          {section.houses && section.houses.length > 0 && (
            <div style={{
              display: 'flex', gap: 8, flexWrap: 'wrap',
              padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
              marginBottom: 12,
            }}>
              {section.houses.map(h => (
                <div key={h.house} style={{
                  padding: '6px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 11, color: 'var(--text-secondary)',
                }}>
                  <span style={{ fontWeight: 700, color: reportColor }}>H{h.house}</span>
                  {' '}{h.rashi_en} ({h.rashi})
                  {' · Lord: '}<span style={{ fontWeight: 600 }}>{h.lord}</span>
                  {h.planets.length > 0 && (
                    <span> · <span style={{ color: '#34d399' }}>{h.planets.join(', ')}</span></span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* DB Knowledge — the 70% */}
          {hasKnowledge ? (
            <div style={{ marginBottom: hasAI ? 14 : 0 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 5, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 10,
                  background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                }}>DB</span>
                Astrologer's Knowledge ({section.db_count} entries)
              </div>
              {section.db_knowledge.map((item, i) => (
                <KnowledgeCard key={i} item={item} index={i} />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '16px', borderRadius: 10, marginBottom: hasAI ? 14 : 0,
              background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
              textAlign: 'center', fontSize: 12, color: 'var(--text-muted)',
            }}>
              No database knowledge for this section yet. Add knowledge in My Knowledge page.
            </div>
          )}

          {/* AI Insight — the 30% */}
          {hasAI && (
            <div style={{
              padding: '14px 16px', borderRadius: 12,
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.18)',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 5, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 10,
                  background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                }}>AI</span>
                Supplementary Insight
              </div>
              <div style={{
                fontSize: 13.5, lineHeight: 1.85, color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
              }}>
                {section.ai_insight}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Reports Component ───────────────────────────────────
export default function Reports({ kundli, lagna, personName, kundliId }) {
  const [selectedType, setSelectedType] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  async function downloadPDF() {
    setPdfLoading(true);
    try {
      const res = await api.post('/reports/download-pdf', {
        kundli,
        lagna,
        report_type: selectedType,
        person_name: personName,
      }, { responseType: 'blob' });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cosmica_${selectedType}_${(personName || 'report').replace(/\s+/g, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  }

  async function generateReport(type) {
    setSelectedType(type);
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const res = await api.post('/reports/generate', {
        kundli,
        lagna,
        report_type: type,
        person_name: personName,
      });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const reportMeta = selectedType ? REPORT_TYPES[selectedType] : null;

  return (
    <div>
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* Report Selection Cards */}
      {!report && !loading && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--purple-400)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
            }}>Choose a Report</div>
            <h2 style={{ fontSize: 'clamp(16px,3vw,22px)', fontWeight: 800, marginBottom: 6 }}>
              Detailed Vedic Reports
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              70% from astrologer's knowledge base + 30% AI insights
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {Object.values(REPORT_TYPES).map(rt => (
              <button key={rt.id} onClick={() => generateReport(rt.id)} style={{
                padding: '24px 20px', borderRadius: 16, cursor: 'pointer',
                background: rt.bgColor, border: `1px solid ${rt.borderColor}`,
                textAlign: 'left', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = rt.color;
                e.currentTarget.style.boxShadow = `0 0 30px ${rt.color}15`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = rt.borderColor;
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: rt.gradient, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  boxShadow: `0 4px 16px ${rt.color}30`,
                }}>{rt.emoji}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: rt.color }}>
                    {rt.title}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {rt.desc}
                  </p>
                </div>
                <div style={{
                  marginTop: 'auto', padding: '8px 0 0', borderTop: `1px solid ${rt.color}18`,
                  fontSize: 12, fontWeight: 600, color: rt.color,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  Generate Report <span style={{ fontSize: 14 }}>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 20px' }}>
            <div className="spinner" style={{ width: 64, height: 64, borderWidth: 3, position: 'absolute' }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>{reportMeta?.emoji || '📄'}</div>
          </div>
          <h3 style={{ marginBottom: 8, fontSize: 16 }}>
            Generating {reportMeta?.title || 'Report'}...
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Fetching from knowledge base + AI enrichment
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>
          <button className="btn btn-primary" onClick={() => generateReport(selectedType)}>Try Again</button>
        </div>
      )}

      {/* Report Display */}
      {report && !loading && (
        <div>
          {/* Report Header */}
          <div style={{
            padding: '24px', borderRadius: 18, marginBottom: 20,
            background: `${reportMeta.color}08`,
            border: `1px solid ${reportMeta.color}25`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 120, height: 120,
              borderRadius: '50%', background: `radial-gradient(circle,${reportMeta.color}15,transparent)`,
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: reportMeta.color,
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
                  }}>
                    {reportMeta.emoji} {reportMeta.title}
                  </div>
                  <h2 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, marginBottom: 6 }}>
                    {report.person_name ? `${report.person_name}'s` : 'Your'} {reportMeta.title}
                  </h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span className="badge badge-purple">{report.lagna} Lagna</span>
                    <span className="badge badge-gold">{report.moon_rashi}</span>
                    <span className="badge badge-green">{report.nakshatra}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={downloadPDF} disabled={pdfLoading} style={{
                    padding: '9px 16px', borderRadius: 10,
                    background: reportMeta ? reportMeta.gradient : 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                    border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    opacity: pdfLoading ? 0.7 : 1,
                    boxShadow: `0 2px 12px ${reportMeta?.color || '#8b5cf6'}30`,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {pdfLoading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}/> Generating PDF...</> : '📄 Download PDF'}
                  </button>
                  <button onClick={() => { setReport(null); setSelectedType(null); }} style={{
                    padding: '9px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    ← Back to Reports
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                <div style={{
                  padding: '8px 14px', borderRadius: 10,
                  background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#34d399' }}>{report.total_db_entries}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>DB Entries (70%)</div>
                </div>
                <div style={{
                  padding: '8px 14px', borderRadius: 10,
                  background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
                }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#a78bfa' }}>
                    {report.sections.filter(s => s.ai_insight).length}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI Insights (30%)</div>
                </div>
                <div style={{
                  padding: '8px 14px', borderRadius: 10,
                  background: `${reportMeta.color}10`, border: `1px solid ${reportMeta.color}25`,
                }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: reportMeta.color }}>{report.total_sections}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sections</div>
                </div>
              </div>
            </div>
          </div>

          {/* Base Knowledge (Lagna/Nakshatra/Moon) */}
          {report.base_knowledge && report.base_knowledge.length > 0 && (
            <div style={{
              padding: '16px', borderRadius: 14, marginBottom: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
            }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10,
              }}>
                Foundation — Lagna, Moon & Nakshatra
              </div>
              {report.base_knowledge.map((item, i) => (
                <KnowledgeCard key={i} item={item} index={i} />
              ))}
            </div>
          )}

          {/* Report Sections */}
          {report.sections.map((section, i) => (
            <ReportSection
              key={section.name}
              section={section}
              reportColor={reportMeta.color}
              index={i}
            />
          ))}

          {/* Footer note */}
          <div style={{
            marginTop: 16, padding: '14px 18px', borderRadius: 12,
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>📊</span>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>About this report: </strong>
              {report.total_db_entries} entries come directly from the astrologer's curated knowledge base (70% weight).
              AI supplements each section with brief classical context and practical guidance (30% weight).
              Add more knowledge in the My Knowledge page for richer reports.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
