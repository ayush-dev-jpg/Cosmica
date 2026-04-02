// src/components/DashaTimeline.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
                'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const NAK_SIZE = 360 / 27;

function getMoonLongitude(kundli) {
  const moon = kundli?.planetary_positions?.Moon;
  if (!moon) return null;
  const rashiIdx = RASHIS.indexOf(moon.rashi);
  if (rashiIdx < 0) return null;
  return rashiIdx * 30 + parseFloat(moon.degree_in_rashi || 0);
}

function PlanetDot({ color, emoji, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `${color}22`, border: `2px solid ${color}66`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45,
    }}>{emoji}</div>
  );
}

function DashaBar({ dasha, totalYears = 120, birthYear, isCurrent, onClick, isSelected }) {
  const widthPct = (dasha.duration_years / totalYears) * 100;
  const today = new Date();
  const start = new Date(dasha.start);
  const end   = new Date(dasha.end);
  const elapsed = isCurrent
    ? Math.min(1, (today - start) / (end - start))
    : (today > end ? 1 : 0);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
        background: isSelected ? `${dasha.color}14` : isCurrent ? `${dasha.color}0a` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? dasha.color+'55' : isCurrent ? dasha.color+'33' : 'var(--border)'}`,
        transition: 'all 0.2s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Current indicator */}
      {isCurrent && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${elapsed * 100}%`,
          background: `${dasha.color}08`,
          borderRight: `2px solid ${dasha.color}`,
          transition: 'width 0.5s',
        }}/>
      )}

      <PlanetDot color={dasha.color} emoji={dasha.emoji} />

      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: dasha.color }}>{dasha.planet}</span>
            {isCurrent && (
              <span style={{
                padding: '1px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                background: dasha.color, color: 'white', animation: 'pulse 2s infinite',
              }}>ACTIVE</span>
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
            {dasha.duration_years}y
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
          {new Date(dasha.start).getFullYear()} – {new Date(dasha.end).getFullYear()}
          {' · '}Age {Math.round(dasha.start_age)}–{Math.round(dasha.end_age)}
        </div>
        {/* Progress bar */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 4 }}>
          <div style={{
            width: `${elapsed * 100}%`, height: '100%',
            background: dasha.color, borderRadius: 999,
          }}/>
        </div>
      </div>

      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
        {isSelected ? '▲' : '▼'}
      </span>
    </div>
  );
}

function DashaDetail({ dasha, currentAntar }) {
  const desc = dasha.description || {};
  return (
    <div style={{
      marginTop: 4, padding: '16px',
      background: `${dasha.color}06`,
      border: `1px solid ${dasha.color}22`,
      borderTop: 'none',
      borderRadius: '0 0 10px 10px',
    }}>
      {/* Theme */}
      <div style={{
        padding: '8px 14px', borderRadius: 8, marginBottom: 14,
        background: `${dasha.color}12`, border: `1px solid ${dasha.color}33`,
        fontSize: 13, color: dasha.color, fontWeight: 600,
      }}>
        🎯 {desc.theme}
      </div>

      {/* Positive / Challenging */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 6, textTransform: 'uppercase' }}>✨ Positive</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc.positive}</div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginBottom: 6, textTransform: 'uppercase' }}>⚠️ Challenges</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc.challenging}</div>
        </div>
      </div>

      {/* Advice */}
      <div style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 14,
        background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-400)', marginBottom: 5, textTransform: 'uppercase' }}>💡 Guidance</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc.advice}</div>
      </div>

      {/* Antardasha list */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Sub-periods (Antardasha)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {dasha.antardasha?.map((a, i) => {
            const isCurrentAntar = currentAntar && currentAntar.planet === a.planet &&
              currentAntar.start === a.start;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                borderRadius: 7, fontSize: 12,
                background: isCurrentAntar ? `${a.color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isCurrentAntar ? a.color+'44' : 'var(--border)'}`,
              }}>
                <span style={{ fontSize: 14 }}>{a.emoji}</span>
                <span style={{ fontWeight: 600, color: a.color, width: 70 }}>{a.planet}</span>
                <span style={{ color: 'var(--text-muted)', flex: 1 }}>
                  {new Date(a.start).toLocaleDateString('en-IN',{month:'short',year:'numeric'})} –{' '}
                  {new Date(a.end).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{a.duration_months}m</span>
                {isCurrentAntar && (
                  <span style={{ padding:'1px 6px', borderRadius:999, fontSize:9, fontWeight:700,
                    background:a.color, color:'white' }}>NOW</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashaTimeline({ kundli, birthDate }) {
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!kundli || !birthDate) return;
    calculateDasha();
  }, [kundli, birthDate]);

  async function calculateDasha() {
    const moonLong = getMoonLongitude(kundli);
    if (moonLong === null) { setError('Could not find Moon position'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/dasha/calculate', {
        birth_date:     birthDate,
        moon_longitude: moonLong,
        name:           kundli?.person_name,
      });
      setData(res.data);
      // Auto-select current dasha
      if (res.data.current_mahadasha) {
        setSelected(res.data.current_mahadasha.planet + res.data.current_mahadasha.start);
      }
    } catch(err) {
      setError('Could not calculate dasha periods.');
    } finally { setLoading(false); }
  }

  if (!kundli) return null;

  if (loading) return (
    <div style={{ textAlign:'center', padding:'40px 0' }}>
      <div className="spinner" style={{ width:36,height:36,margin:'0 auto 12px',borderWidth:3 }}/>
      <p style={{ color:'var(--text-secondary)',fontSize:13 }}>Calculating dasha timeline...</p>
    </div>
  );

  if (error) return (
    <div style={{ padding:'14px 16px',borderRadius:10,background:'rgba(239,68,68,0.1)',
      border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:13 }}>{error}</div>
  );

  if (!data) return null;

  const current = data.current_mahadasha;
  const today   = new Date();

  return (
    <div>
      {/* Current dasha highlight */}
      {current && (
        <div style={{
          padding:'20px', borderRadius:14, marginBottom:20,
          background:`${current.color}0f`, border:`2px solid ${current.color}44`,
        }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)',
            textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
            🌟 Currently Active
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <PlanetDot color={current.color} emoji={current.emoji} size={48}/>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:current.color }}>
                {current.planet} Mahadasha
              </div>
              <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:3 }}>
                {new Date(current.start).getFullYear()} – {new Date(current.end).getFullYear()}
                {' · '}{current.duration_years} years total
              </div>
              {data.current_antardasha && (
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  marginTop:6, padding:'3px 10px', borderRadius:999,
                  background:`${data.current_antardasha.color}18`,
                  border:`1px solid ${data.current_antardasha.color}44`,
                  fontSize:12, color:data.current_antardasha.color, fontWeight:600,
                }}>
                  {data.current_antardasha.emoji} {data.current_antardasha.planet} Antardasha
                  <span style={{ color:'var(--text-muted)', fontWeight:400 }}>
                    · until {new Date(data.current_antardasha.end).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop:12, fontSize:13, color:'var(--text-secondary)', lineHeight:1.7,
            padding:'10px 14px', background:'rgba(255,255,255,0.04)', borderRadius:8 }}>
            {current.description?.theme && <><strong style={{ color:current.color }}>Theme: </strong>{current.description.theme}<br/></>}
            {current.description?.advice}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ marginBottom:8, fontSize:11, fontWeight:600, color:'var(--text-muted)',
        textTransform:'uppercase', letterSpacing:'0.06em' }}>
        📅 Full 120-Year Vimshottari Dasha Timeline
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {data.dashas.map((dasha) => {
          const key = dasha.planet + dasha.start;
          const isCurrent = current && current.planet === dasha.planet && current.start === dasha.start;
          const isSelected = selected === key;
          const isPast    = new Date(dasha.end) < today;

          return (
            <div key={key} style={{ opacity: isPast && !isCurrent ? 0.55 : 1 }}>
              <DashaBar
                dasha={dasha}
                isCurrent={isCurrent}
                isSelected={isSelected}
                birthYear={new Date(data.birth_date).getFullYear()}
                onClick={() => setSelected(isSelected ? null : key)}
              />
              {isSelected && (
                <DashaDetail
                  dasha={dasha}
                  currentAntar={isCurrent ? data.current_antardasha : null}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div style={{ marginTop:16, padding:'12px 16px', borderRadius:10,
        background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)',
        fontSize:12, color:'var(--text-muted)', lineHeight:1.7 }}>
        💡 <strong>Vimshottari Dasha</strong> is a 120-year cycle based on your Moon's nakshatra at birth.
        Click any period to see detailed predictions and sub-periods (Antardasha). Past periods are dimmed.
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
    </div>
  );
}