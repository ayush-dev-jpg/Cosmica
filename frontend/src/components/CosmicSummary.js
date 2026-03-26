// src/components/CosmicSummary.js
// Displays the key astrological summary: Nakshatra, Rashi, Lagna

import React from 'react';

const INFO_ITEMS = [
  { key: 'nakshatra', label: 'Nakshatra (Birth Star)', emoji: '⭐', getValue: k => `${k.name} — Pada ${k.pada}` },
  { key: 'ruler',     label: 'Nakshatra Ruler',        emoji: '🪐', getValue: (_, k) => k?.nakshatra?.ruler },
  { key: 'deity',     label: 'Ruling Deity',           emoji: '🙏', getValue: (_, k) => k?.nakshatra?.deity },
  { key: 'moon',      label: 'Moon Rashi (Chandra)',   emoji: '🌙', getValue: (_, k) => k?.moon_rashi },
  { key: 'sun',       label: 'Sun Rashi (Surya)',      emoji: '☀️', getValue: (_, k) => k?.sun_rashi },
  { key: 'lagna',     label: 'Lagna (Ascendant)',      emoji: '🔮', getValue: (_, k) => `${k?.lagna?.name} (${k?.lagna?.english})` },
];

export default function CosmicSummary({ kundli }) {
  if (!kundli) return null;
  const nak = kundli.nakshatra || {};

  return (
    <div className="card">
      <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>✨</span> Your Cosmic Blueprint
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[
          { label: 'Nakshatra (Birth Star)', emoji: '⭐', value: `${nak.name} — Pada ${nak.pada}` },
          { label: 'Nakshatra Ruler',        emoji: '🪐', value: nak.ruler },
          { label: 'Ruling Deity',           emoji: '🙏', value: nak.deity },
          { label: 'Moon Rashi',             emoji: '🌙', value: kundli.moon_rashi },
          { label: 'Sun Rashi',              emoji: '☀️', value: kundli.sun_rashi },
          { label: 'Lagna (Ascendant)',      emoji: '🔮', value: `${kundli.lagna?.name} (${kundli.lagna?.english})` },
          { label: 'Ayanamsa System',        emoji: '📐', value: kundli.ayanamsa || 'Lahiri' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: i < 6 ? '1px solid rgba(167,139,250,0.08)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, width: 24 }}>{item.emoji}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.label}</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', textAlign: 'right' }}>
              {item.value || '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Nakshatra quality */}
      {nak.quality && (
        <div style={{
          marginTop: 16, padding: '12px 16px',
          background: 'rgba(168,85,247,0.07)',
          border: '1px solid rgba(168,85,247,0.15)',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
        }}>
          ✨ <strong style={{ color: 'var(--purple-400)' }}>Nakshatra Quality:</strong> {nak.quality}
        </div>
      )}
    </div>
  );
}
