// src/components/YogaPanel.js
// Yoga & Dosha Calculator — shows all Raj Yogas, Dhana Yogas, and Doshas

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CATEGORY_CONFIG = {
  raj:              { label:'✨ Raj Yogas',         color:'#c084fc', bg:'rgba(192,132,252,0.1)',  border:'rgba(192,132,252,0.25)', emoji:'👑' },
  panch_mahapurusha:{ label:'⭐ Panch Mahapurusha', color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.25)',  emoji:'🌟' },
  dhana:            { label:'💰 Dhana Yogas',        color:'#34d399', bg:'rgba(52,211,153,0.1)',  border:'rgba(52,211,153,0.25)',  emoji:'💎' },
  dosha:            { label:'⚠️ Doshas',              color:'#f87171', bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.25)', emoji:'🔴' },
};

const STRENGTH_CONFIG = {
  very_strong: { label:'Very Strong', color:'#c084fc' },
  strong:      { label:'Strong',      color:'#34d399' },
  medium:      { label:'Moderate',    color:'#f59e0b' },
  high:        { label:'High',        color:'#f87171' },
  low:         { label:'Mild',        color:'#94a3b8' },
};

const PLANET_COLORS = {
  Sun:'#f59e0b', Moon:'#60a5fa', Mars:'#f87171',
  Mercury:'#34d399', Jupiter:'#c084fc', Venus:'#f472b6',
  Saturn:'#94a3b8', Rahu:'#818cf8', Ketu:'#fb923c'
};

function YogaCard({ yoga, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const cat    = CATEGORY_CONFIG[yoga.category] || CATEGORY_CONFIG.raj;
  const str    = STRENGTH_CONFIG[yoga.strength] || STRENGTH_CONFIG.medium;
  const isDosha = yoga.category === 'dosha';

  return (
    <div style={{
      borderRadius:12, overflow:'hidden',
      border:`1px solid ${cat.border}`,
      marginBottom:10,
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width:'100%', display:'flex', alignItems:'center',
          justifyContent:'space-between', padding:'14px 16px',
          background: open ? cat.bg : 'rgba(255,255,255,0.02)',
          border:'none', cursor:'pointer', textAlign:'left',
          transition:'background 0.2s',
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
          <span style={{ fontSize:18, flexShrink:0 }}>{cat.emoji}</span>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14, color:cat.color }}>
              {yoga.name}
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
              {yoga.sanskrit}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          {/* Planet badges */}
          <div style={{ display:'flex', gap:4 }}>
            {yoga.planets?.slice(0,2).map(p=>(
              <span key={p} style={{
                padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600,
                background:`${PLANET_COLORS[p]||'#a78bfa'}22`,
                color: PLANET_COLORS[p]||'#a78bfa',
                border:`1px solid ${PLANET_COLORS[p]||'#a78bfa'}44`,
              }}>{p}</span>
            ))}
          </div>
          {/* Strength */}
          <span style={{
            padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:600,
            background:`${str.color}18`, color:str.color, border:`1px solid ${str.color}33`,
          }}>{str.label}</span>
          <span style={{
            fontSize:10, color:'var(--text-muted)',
            transform: open?'rotate(180deg)':'none', transition:'transform 0.2s',
            display:'inline-block',
          }}>▼</span>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div style={{
          padding:'16px', background:cat.bg,
          borderTop:`1px solid ${cat.border}`,
        }}>
          {/* Description */}
          <p style={{ fontSize:14, lineHeight:1.8, color:'var(--text-primary)', marginBottom:14 }}>
            {yoga.description}
          </p>

          {/* Effects */}
          {yoga.effects && (
            <div style={{ marginBottom: yoga.remedies ? 14 : 0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:cat.color, marginBottom:8,
                textTransform:'uppercase', letterSpacing:'0.05em' }}>
                {isDosha ? 'Challenges' : 'Effects & Blessings'}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {yoga.effects.map((e,i)=>(
                  <span key={i} style={{
                    padding:'4px 10px', borderRadius:999, fontSize:12,
                    background:'rgba(255,255,255,0.06)',
                    border:'1px solid rgba(255,255,255,0.1)',
                    color:'var(--text-secondary)',
                  }}>
                    {isDosha ? '⚠️' : '✦'} {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Remedies for doshas */}
          {yoga.remedies && (
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#34d399', marginBottom:8,
                textTransform:'uppercase', letterSpacing:'0.05em', marginTop:14 }}>
                🙏 Remedies
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {yoga.remedies.map((r,i)=>(
                  <div key={i} style={{
                    fontSize:13, color:'var(--text-secondary)', lineHeight:1.6,
                    display:'flex', gap:8, alignItems:'flex-start',
                  }}>
                    <span style={{ color:'#34d399', flexShrink:0 }}>•</span>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function YogaPanel({ kundli }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    if (!kundli) return;
    calculateYogas();
  }, [kundli]);

  async function calculateYogas() {
    setLoading(true); setError('');
    try {
      const res = await api.post('/yogas/calculate', { kundli });
      setData(res.data);
    } catch(err) {
      setError('Could not calculate Yogas. Please try again.');
    } finally { setLoading(false); }
  }

  if (!kundli) return null;

  const FILTERS = [
    { id:'all',   label:`All (${data?.total||0})` },
    { id:'raj',   label:`✨ Raj (${(data?.raj_yogas||[]).length})` },
    { id:'dhana', label:`💰 Dhana (${(data?.dhana_yogas||[]).length})` },
    { id:'dosha', label:`⚠️ Dosha (${(data?.doshas||[]).length})` },
  ];

  const getFiltered = () => {
    if (!data) return [];
    if (filter === 'raj')   return data.raj_yogas   || [];
    if (filter === 'dhana') return data.dhana_yogas || [];
    if (filter === 'dosha') return data.doshas       || [];
    return data.all || [];
  };

  return (
    <div>
      {/* Summary cards */}
      {data && (
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3,1fr)',
          gap:10, marginBottom:20,
        }}>
          {[
            { label:'Raj Yogas',  value:data.summary.raj_count,   color:'#c084fc', emoji:'👑' },
            { label:'Dhana Yogas',value:data.summary.dhana_count, color:'#34d399', emoji:'💰' },
            { label:'Doshas',     value:data.summary.dosha_count, color:'#f87171', emoji:'⚠️' },
          ].map(s=>(
            <div key={s.label} style={{
              padding:'16px 12px', textAlign:'center',
              background:`${s.color}0d`, border:`1px solid ${s.color}2a`,
              borderRadius:12,
            }}>
              <div style={{ fontSize:24, marginBottom:4 }}>{s.emoji}</div>
              <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {data && (
        <div style={{
          display:'flex', gap:4, marginBottom:18,
          borderBottom:'1px solid var(--border)',
          overflowX:'auto', WebkitOverflowScrolling:'touch',
        }}>
          {FILTERS.map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)} style={{
              padding:'9px 14px', background:'none', border:'none',
              borderBottom: filter===f.id ? '2px solid var(--purple-500)' : '2px solid transparent',
              color: filter===f.id ? 'var(--purple-400)' : 'var(--text-secondary)',
              fontWeight: filter===f.id ? 600 : 400,
              fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
            }}>{f.label}</button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign:'center', padding:'40px 0' }}>
          <div className="spinner" style={{ width:36, height:36, margin:'0 auto 12px', borderWidth:3 }}/>
          <p style={{ color:'var(--text-secondary)', fontSize:14 }}>
            Scanning chart for Yogas and Doshas...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding:'12px 16px', borderRadius:10,
          background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
          color:'#f87171', fontSize:14,
        }}>{error}</div>
      )}

      {/* Yoga cards */}
      {!loading && data && (
        <div>
          {getFiltered().length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>
              <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
              <p>No {filter === 'all' ? '' : filter} yogas found in this chart.</p>
            </div>
          ) : (
            <>
              {/* Group by category when showing all */}
              {filter === 'all' ? (
                <>
                  {data.raj_yogas?.length > 0 && (
                    <div style={{ marginBottom:20 }}>
                      <div style={{
                        fontSize:12, fontWeight:700, color:'#c084fc',
                        textTransform:'uppercase', letterSpacing:'0.08em',
                        marginBottom:10, display:'flex', alignItems:'center', gap:6,
                      }}>
                        <div style={{ width:3, height:14, background:'#c084fc', borderRadius:2 }}/>
                        Raj Yogas & Panch Mahapurusha ({data.raj_yogas.length})
                      </div>
                      {data.raj_yogas.map((y,i)=>
                        <YogaCard key={y.name} yoga={y} defaultOpen={i===0}/>
                      )}
                    </div>
                  )}
                  {data.dhana_yogas?.length > 0 && (
                    <div style={{ marginBottom:20 }}>
                      <div style={{
                        fontSize:12, fontWeight:700, color:'#34d399',
                        textTransform:'uppercase', letterSpacing:'0.08em',
                        marginBottom:10, display:'flex', alignItems:'center', gap:6,
                      }}>
                        <div style={{ width:3, height:14, background:'#34d399', borderRadius:2 }}/>
                        Dhana Yogas ({data.dhana_yogas.length})
                      </div>
                      {data.dhana_yogas.map((y,i)=>
                        <YogaCard key={y.name} yoga={y} defaultOpen={false}/>
                      )}
                    </div>
                  )}
                  {data.doshas?.length > 0 && (
                    <div>
                      <div style={{
                        fontSize:12, fontWeight:700, color:'#f87171',
                        textTransform:'uppercase', letterSpacing:'0.08em',
                        marginBottom:10, display:'flex', alignItems:'center', gap:6,
                      }}>
                        <div style={{ width:3, height:14, background:'#f87171', borderRadius:2 }}/>
                        Doshas ({data.doshas.length})
                      </div>
                      {data.doshas.map((y,i)=>
                        <YogaCard key={y.name} yoga={y} defaultOpen={false}/>
                      )}
                    </div>
                  )}
                </>
              ) : (
                getFiltered().map((y,i)=>
                  <YogaCard key={y.name} yoga={y} defaultOpen={i===0}/>
                )
              )}

              {/* Footer note */}
              <div style={{
                marginTop:16, padding:'12px 16px',
                background:'rgba(255,255,255,0.02)',
                border:'1px solid var(--border)', borderRadius:10,
                fontSize:12, color:'var(--text-muted)', lineHeight:1.7,
              }}>
                💡 <strong>Note:</strong> Yoga results depend on the strength of participating planets, their dignity, aspects, and the overall chart context. A weak planet forming a Raj Yoga gives reduced results. Always consult the full chart for complete analysis.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}