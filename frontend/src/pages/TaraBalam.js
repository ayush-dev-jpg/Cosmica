// src/pages/TaraBalam.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ── Complete Nakshatra data ───────────────────────────────────
const NAKSHATRAS = [
  { name:'Ashwini',         ruler:'Ketu',    num:1  },
  { name:'Bharani',         ruler:'Venus',   num:2  },
  { name:'Krittika',        ruler:'Sun',     num:3  },
  { name:'Rohini',          ruler:'Moon',    num:4  },
  { name:'Mrigashira',      ruler:'Mars',    num:5  },
  { name:'Ardra',           ruler:'Rahu',    num:6  },
  { name:'Punarvasu',       ruler:'Jupiter', num:7  },
  { name:'Pushya',          ruler:'Saturn',  num:8  },
  { name:'Ashlesha',        ruler:'Mercury', num:9  },
  { name:'Magha',           ruler:'Ketu',    num:10 },
  { name:'Purva Phalguni',  ruler:'Venus',   num:11 },
  { name:'Uttara Phalguni', ruler:'Sun',     num:12 },
  { name:'Hasta',           ruler:'Moon',    num:13 },
  { name:'Chitra',          ruler:'Mars',    num:14 },
  { name:'Swati',           ruler:'Rahu',    num:15 },
  { name:'Vishakha',        ruler:'Jupiter', num:16 },
  { name:'Anuradha',        ruler:'Saturn',  num:17 },
  { name:'Jyeshtha',        ruler:'Mercury', num:18 },
  { name:'Mula',            ruler:'Ketu',    num:19 },
  { name:'Purva Ashadha',   ruler:'Venus',   num:20 },
  { name:'Uttara Ashadha',  ruler:'Sun',     num:21 },
  { name:'Shravana',        ruler:'Moon',    num:22 },
  { name:'Dhanishta',       ruler:'Mars',    num:23 },
  { name:'Shatabhisha',     ruler:'Rahu',    num:24 },
  { name:'Purva Bhadra',    ruler:'Jupiter', num:25 },
  { name:'Uttara Bhadra',   ruler:'Saturn',  num:26 },
  { name:'Revati',          ruler:'Mercury', num:27 },
];

// ── 9 Taras in order ─────────────────────────────────────────
const TARAS = [
  {
    num:1, name:'Janma',    sanskrit:'जन्म',
    nature:'Neutral', color:'#94a3b8',
    icon:'🌟', quality:'Mixed',
    meaning:'Birth Star',
    general:'This is your own birth nakshatra. It represents your fundamental nature, physical body and core life patterns.',
    positive:'Strong sense of identity, natural confidence, good physical vitality when planets here are benefic.',
    negative:'Planets here can also bring challenges related to self, health and personality if malefic.',
    planet_effect: {
      benefic:'A benefic planet in Janma tara strengthens your personality, brings confidence and good health.',
      malefic:'A malefic planet here can cause health issues, identity struggles and physical challenges.',
    }
  },
  {
    num:2, name:'Sampat',   sanskrit:'सम्पत्',
    nature:'Auspicious', color:'#10b981',
    icon:'💰', quality:'Excellent',
    meaning:'Wealth Star',
    general:'The 2nd tara from your birth star. Planets here bring wealth, prosperity and abundance.',
    positive:'Financial gains, accumulation of assets, good family life, excellent for business and investments.',
    negative:'Very few negatives — even malefic planets here tend to bring wealth through hard work.',
    planet_effect: {
      benefic:'Exceptional wealth, easy money flow, strong family bonds and luxurious comforts.',
      malefic:'Wealth comes through hard work and struggle, but ultimately the native prospers.',
    }
  },
  {
    num:3, name:'Vipat',    sanskrit:'विपत्',
    nature:'Inauspicious', color:'#ef4444',
    icon:'⚡', quality:'Difficult',
    meaning:'Danger Star',
    general:'The 3rd tara — one of the most challenging positions. Planets here bring sudden dangers, obstacles and reversals.',
    positive:'The native develops resilience, courage and street wisdom through challenges.',
    negative:'Accidents, sudden losses, health crises, unexpected obstacles and reversals of fortune.',
    planet_effect: {
      benefic:'Even benefics here bring mixed results — temporary gains followed by challenges. Stay vigilant.',
      malefic:'Serious danger to health, finances and relationships. Requires strong remedies and precautions.',
    }
  },
  {
    num:4, name:'Kshema',   sanskrit:'क्षेम',
    nature:'Auspicious', color:'#10b981',
    icon:'🛡️', quality:'Excellent',
    meaning:'Prosperity Star',
    general:'The 4th tara brings comfort, security, protection and steady prosperity. One of the most beneficial positions.',
    positive:'Stable income, good health, domestic happiness, protection from enemies, mental peace.',
    negative:'May bring complacency or over-comfort that leads to laziness.',
    planet_effect: {
      benefic:'Outstanding results — wealth, health, happiness and protection from all hardships.',
      malefic:'Even malefics here become softened — challenges are manageable and often resolved favorably.',
    }
  },
  {
    num:5, name:'Pratyak',  sanskrit:'प्रत्यक्',
    nature:'Inauspicious', color:'#f97316',
    icon:'🌀', quality:'Challenging',
    meaning:'Obstacle Star',
    general:'The 5th tara brings obstacles, confusion and indirect challenges. Things may not go as planned.',
    positive:'Forces the native to be innovative, find alternative paths and develop patience.',
    negative:'Plans get derailed, hidden enemies, misunderstandings, deception and indirect harm.',
    planet_effect: {
      benefic:'Obstacles exist but the native can navigate through with effort and divine grace.',
      malefic:'Hidden dangers, enemies in disguise, financial leakage and health through neglect.',
    }
  },
  {
    num:6, name:'Sadhana',  sanskrit:'साधन',
    nature:'Auspicious', color:'#10b981',
    icon:'✨', quality:'Excellent',
    meaning:'Achievement Star',
    general:'The 6th tara is highly auspicious for achievement, goals, success and fulfillment of desires.',
    positive:'Hard work gets rewarded, goals achieved, enemies defeated, diseases overcome, debts cleared.',
    negative:'Success may require sustained effort — results come to those who persist.',
    planet_effect: {
      benefic:'Tremendous success, achievement of life goals, victory over obstacles and enemies.',
      malefic:'Success comes after overcoming significant resistance — ultimate victory is indicated.',
    }
  },
  {
    num:7, name:'Naidhana', sanskrit:'नैधन',
    nature:'Inauspicious', color:'#dc2626',
    icon:'💀', quality:'Most Difficult',
    meaning:'Death/Destruction Star',
    general:'The 7th tara is the most challenging — associated with death-like experiences, major losses and transformations.',
    positive:'Profound transformation, spiritual awakening, letting go of the old to make way for the new.',
    negative:'Major losses, health crises, relationship breakdowns, career setbacks, near-death experiences.',
    planet_effect: {
      benefic:'Transformation is intense but leads to renewal. Some losses occur but new beginnings follow.',
      malefic:'Extremely challenging period. Serious precautions, remedies and spiritual practices are essential.',
    }
  },
  {
    num:8, name:'Mitra',    sanskrit:'मित्र',
    nature:'Auspicious', color:'#3b82f6',
    icon:'🤝', quality:'Good',
    meaning:'Friend Star',
    general:'The 8th tara brings friendship, alliances, helpful people and social support.',
    positive:'Good friends, helpful colleagues, social recognition, alliances that bring benefits.',
    negative:'Over-dependence on others, friendships that don\'t serve long-term interests.',
    planet_effect: {
      benefic:'Excellent social connections, powerful allies, mutual benefit in all partnerships.',
      malefic:'Some friends may prove unreliable, but genuine support is still available.',
    }
  },
  {
    num:9, name:'Parama Mitra', sanskrit:'परम मित्र',
    nature:'Auspicious', color:'#8b5cf6',
    icon:'💜', quality:'Excellent',
    meaning:'Best Friend Star',
    general:'The 9th tara is the most auspicious — representing divine friendship, grace and supreme blessings.',
    positive:'Divine favor, unexpected blessings, grace in all areas, spiritual advancement, supreme good fortune.',
    negative:'Almost no negatives — this is the most favorable position.',
    planet_effect: {
      benefic:'Exceptional divine grace, supreme blessings and outstanding results in all life areas.',
      malefic:'Even malefics here behave like benefics — supreme protection and favor is indicated.',
    }
  },
];

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
const PLANET_META = {
  Sun:     { emoji:'☀️', color:'#f59e0b', nature:'malefic' },
  Moon:    { emoji:'🌙', color:'#60a5fa', nature:'benefic' },
  Mars:    { emoji:'♂',  color:'#f87171', nature:'malefic' },
  Mercury: { emoji:'☿',  color:'#34d399', nature:'benefic' },
  Jupiter: { emoji:'♃',  color:'#c084fc', nature:'benefic' },
  Venus:   { emoji:'♀',  color:'#f472b6', nature:'benefic' },
  Saturn:  { emoji:'♄',  color:'#94a3b8', nature:'malefic' },
  Rahu:    { emoji:'☊',  color:'#818cf8', nature:'malefic' },
  Ketu:    { emoji:'☋',  color:'#fb923c', nature:'malefic' },
};

const QUALITY_CONFIG = {
  'Excellent':      { bg:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.35)',  text:'#10b981', badge:'rgba(16,185,129,0.2)'  },
  'Good':           { bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.35)',  text:'#60a5fa', badge:'rgba(59,130,246,0.2)'  },
  'Mixed':          { bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.25)', text:'#94a3b8', badge:'rgba(148,163,184,0.15)' },
  'Challenging':    { bg:'rgba(249,115,22,0.1)',   border:'rgba(249,115,22,0.3)',   text:'#f97316', badge:'rgba(249,115,22,0.18)'  },
  'Difficult':      { bg:'rgba(239,68,68,0.1)',    border:'rgba(239,68,68,0.3)',    text:'#ef4444', badge:'rgba(239,68,68,0.18)'   },
  'Most Difficult': { bg:'rgba(220,38,38,0.12)',   border:'rgba(220,38,38,0.4)',    text:'#dc2626', badge:'rgba(220,38,38,0.22)'   },
};

// ── Core calculation ──────────────────────────────────────────
function getTaraBalam(birthNakIdx, targetNakIdx) {
  const diff = ((targetNakIdx - birthNakIdx) + 27) % 27;
  const taraNum = (diff % 9) + 1;
  return { tara: TARAS[taraNum - 1], diff, cycle: Math.floor(diff / 9) + 1 };
}

function calcAllTaras(birthNakIdx, planetPositions) {
  return PLANET_ORDER
    .filter(p => planetPositions[p] !== undefined)
    .map(planet => {
      const nakIdx = planetPositions[planet];
      const { tara, diff, cycle } = getTaraBalam(birthNakIdx, nakIdx);
      const meta = PLANET_META[planet];
      const isNatBenefic = meta.nature === 'benefic';
      return { planet, nakIdx, nak: NAKSHATRAS[nakIdx], tara, diff, cycle, isNatBenefic, meta };
    })
    .sort((a, b) => {
      const order = ['Excellent','Good','Mixed','Challenging','Difficult','Most Difficult'];
      return order.indexOf(a.tara.quality) - order.indexOf(b.tara.quality);
    });
}

// ── Components ────────────────────────────────────────────────

function NakshatraWheel({ birthIdx, hoveredIdx }) {
  const size = 200;
  const cx = size / 2, cy = size / 2;
  const outerR = 88, innerR = 52;

  return (
    <svg width={size} height={size} style={{ overflow:'visible' }}>
      {NAKSHATRAS.map((nak, i) => {
        const angle = (i / 27) * 2 * Math.PI - Math.PI / 2;
        const nextAngle = ((i + 1) / 27) * 2 * Math.PI - Math.PI / 2;
        const midAngle = (angle + nextAngle) / 2;
        const isBirth = i === birthIdx;
        const isHovered = i === hoveredIdx;

        const x1o = cx + outerR * Math.cos(angle);
        const y1o = cy + outerR * Math.sin(angle);
        const x2o = cx + outerR * Math.cos(nextAngle);
        const y2o = cy + outerR * Math.sin(nextAngle);
        const x1i = cx + innerR * Math.cos(angle);
        const y1i = cy + innerR * Math.sin(angle);
        const x2i = cx + innerR * Math.cos(nextAngle);
        const y2i = cy + innerR * Math.sin(nextAngle);

        const d = `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${outerR} ${outerR} 0 0 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerR} ${innerR} 0 0 0 ${x1i} ${y1i}`;

        const fill = isBirth ? '#7c3aed' : isHovered ? '#1e1048' : 'rgba(255,255,255,0.03)';
        const stroke = isBirth ? '#c084fc' : isHovered ? '#7c3aed' : 'rgba(255,255,255,0.1)';

        const lx = cx + (innerR + (outerR - innerR) / 2) * Math.cos(midAngle);
        const ly = cy + (innerR + (outerR - innerR) / 2) * Math.sin(midAngle);

        return (
          <g key={i}>
            <path d={d} fill={fill} stroke={stroke} strokeWidth={isBirth ? 1.5 : 0.5}
              style={{ transition:'fill 0.3s' }}/>
            {isBirth && (
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fontSize="4.5" fill="#f8f4ff" fontWeight="700">
                {nak.name.split(' ')[0].slice(0,3)}
              </text>
            )}
          </g>
        );
      })}
      {/* Center circle */}
      <circle cx={cx} cy={cy} r={innerR - 4} fill="rgba(124,58,237,0.08)"
        stroke="rgba(124,58,237,0.3)" strokeWidth={1}/>
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="8" fill="#c084fc" fontWeight="700">
        {birthIdx >= 0 ? NAKSHATRAS[birthIdx].name.split(' ')[0] : '?'}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.4)">
        Birth Star
      </text>
    </svg>
  );
}

function PlanetTaraCard({ result, index }) {
  const [open, setOpen] = useState(false);
  const { planet, nak, tara, isNatBenefic, meta } = result;
  const qcfg = QUALITY_CONFIG[tara.quality] || QUALITY_CONFIG['Mixed'];
  const planetColor = meta.color;
  const effectKey = isNatBenefic ? 'benefic' : 'malefic';

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${open ? qcfg.border : 'rgba(255,255,255,0.07)'}`,
      background: open ? qcfg.bg : 'rgba(255,255,255,0.02)',
      transition: 'all 0.25s',
      animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
      boxShadow: open ? `0 4px 24px ${tara.color}15` : 'none',
    }}>
      {/* Card header */}
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
        background: 'transparent', color: 'inherit', fontFamily: 'inherit',
      }}>
        {/* Planet orb */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `radial-gradient(circle at 35% 35%, ${planetColor}44, ${planetColor}11)`,
          border: `2px solid ${planetColor}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>{meta.emoji}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: planetColor }}>{planet}</span>
            <span style={{
              padding: '1px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              background: `${planetColor}18`, color: planetColor, border: `1px solid ${planetColor}33`,
            }}>in {nak.name}</span>
            <span style={{
              padding: '1px 7px', borderRadius: 999, fontSize: 10, fontWeight: 600,
              background: isNatBenefic ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: isNatBenefic ? '#10b981' : '#f87171',
            }}>{isNatBenefic ? 'Benefic' : 'Malefic'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{tara.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: tara.color }}>{tara.name} Tara</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>— {tara.meaning}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
            background: qcfg.badge, color: qcfg.text, border: `1px solid ${qcfg.border}`,
          }}>{tara.quality}</span>
          <span style={{
            fontSize: 10, color: 'rgba(255,255,255,0.25)',
            transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block',
          }}>▼</span>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${tara.color}18` }}>
          {/* Tara meaning */}
          <div style={{
            padding: '12px 14px', borderRadius: 10, marginBottom: 12, marginTop: 12,
            background: `${tara.color}10`, border: `1px solid ${tara.color}25`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tara.color,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              {tara.icon} {tara.name} Tara — {tara.meaning}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              {tara.general}
            </div>
          </div>

          {/* Planet-specific effect */}
          <div style={{
            padding: '12px 14px', borderRadius: 10, marginBottom: 10,
            background: isNatBenefic ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
            border: `1px solid ${isNatBenefic ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: isNatBenefic ? '#10b981' : '#f87171',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
            }}>
              {meta.emoji} {planet} as {isNatBenefic ? 'Benefic' : 'Malefic'} in {tara.name} Tara
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>
              {tara.planet_effect[effectKey]}
            </div>
          </div>

          {/* Positive/Negative */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ padding: '10px 12px', borderRadius: 8,
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>✨ Positive</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {tara.positive}
              </div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 8,
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f87171',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>⚠️ Caution</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {tara.negative}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaraWheel({ results, birthIdx }) {
  // Group planets by tara number
  const byTara = {};
  results.forEach(r => {
    const t = r.tara.num;
    if (!byTara[t]) byTara[t] = [];
    byTara[t].push(r);
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
      {TARAS.map(tara => {
        const planets = byTara[tara.num] || [];
        const qcfg = QUALITY_CONFIG[tara.quality];
        return (
          <div key={tara.num} style={{
            padding: '10px 12px', borderRadius: 10,
            background: planets.length > 0 ? qcfg.bg : 'rgba(255,255,255,0.02)',
            border: `1px solid ${planets.length > 0 ? qcfg.border : 'rgba(255,255,255,0.05)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 14 }}>{tara.icon}</span>
                <div style={{ fontSize: 10, fontWeight: 700, color: tara.color, marginTop: 2 }}>
                  {tara.name}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{tara.meaning}</div>
              </div>
              <span style={{
                padding: '1px 6px', borderRadius: 999, fontSize: 9, fontWeight: 700,
                background: qcfg.badge, color: qcfg.text,
              }}>{tara.quality}</span>
            </div>
            {planets.length > 0 ? (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {planets.map(p => (
                  <span key={p.planet} style={{
                    fontSize: 14, title: p.planet,
                  }}>{p.meta.emoji}</span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>No planets</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function TaraBalam() {
  const [birthNak, setBirthNak]         = useState('');
  const [planetNaks, setPlanetNaks]     = useState({});
  const [results, setResults]           = useState(null);
  const [step, setStep]                 = useState(1); // 1=birth, 2=planets, 3=results
  const [filterQuality, setFilterQuality] = useState('all');

  const birthIdx = birthNak ? NAKSHATRAS.findIndex(n => n.name === birthNak) : -1;

  function handleBirthSubmit() {
    if (birthIdx < 0) return;
    setStep(2);
  }

  function handleCalculate() {
    if (birthIdx < 0) return;
    const planetIdxs = {};
    Object.entries(planetNaks).forEach(([planet, nakName]) => {
      if (nakName) {
        const idx = NAKSHATRAS.findIndex(n => n.name === nakName);
        if (idx >= 0) planetIdxs[planet] = idx;
      }
    });
    if (Object.keys(planetIdxs).length === 0) return;
    const res = calcAllTaras(birthIdx, planetIdxs);
    setResults(res);
    setStep(3);
  }

  const filteredResults = results ? (
    filterQuality === 'all' ? results :
    filterQuality === 'good' ? results.filter(r => ['Excellent','Good'].includes(r.tara.quality)) :
    filterQuality === 'bad'  ? results.filter(r => ['Difficult','Most Difficult','Challenging'].includes(r.tara.quality)) :
    results.filter(r => r.tara.quality === 'Mixed')
  ) : [];

  const inp = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#f8f4ff',
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    appearance: 'none',
  };
  const lbl = {
    display: 'block', fontSize: 10, fontWeight: 700,
    color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: 6,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06030f', color: '#f8f4ff',
      fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0 }
        ::-webkit-scrollbar { width:4px } ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(124,58,237,0.3); border-radius:999px }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        select option { background:#0d0820 }
      `}</style>

      {/* Stars bg */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[...Array(50)].map((_,i)=>(
          <div key={i} style={{
            position:'absolute', borderRadius:'50%',
            width:Math.random()*2+0.5, height:Math.random()*2+0.5,
            left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
            background:'white', opacity:Math.random()*0.35+0.05,
          }}/>
        ))}
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'10%', left:'15%', width:300, height:300,
          background:'radial-gradient(circle,rgba(124,58,237,0.08),transparent)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', bottom:'20%', right:'10%', width:250, height:250,
          background:'radial-gradient(circle,rgba(16,185,129,0.06),transparent)', borderRadius:'50%' }}/>
      </div>

      {/* Navbar */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        backdropFilter:'blur(16px)', background:'rgba(6,3,15,0.92)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>✨</span>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700,
            background:'linear-gradient(90deg,#c084fc,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            COSMICA
          </span>
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/chart" style={{ padding:'7px 14px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            color:'rgba(255,255,255,0.55)', fontSize:12, textDecoration:'none' }}>Kundli</Link>
          <Link to="/panchang" style={{ padding:'7px 14px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            color:'rgba(255,255,255,0.55)', fontSize:12, textDecoration:'none' }}>Panchang</Link>
        </div>
      </nav>

      <main style={{ maxWidth:800, margin:'0 auto', padding:'32px 16px 80px', position:'relative', zIndex:1 }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:36, animation:'fadeUp 0.6s ease' }}>
          <div style={{ fontSize:52, marginBottom:12 }}>⭐</div>
          <h1 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:'clamp(28px,6vw,48px)', fontWeight:700, lineHeight:1.15, marginBottom:10,
            background:'linear-gradient(135deg,#f8f4ff,#c084fc,#818cf8)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>Tara Balam Calculator</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, lineHeight:1.8, maxWidth:480, margin:'0 auto' }}>
            Discover how each planet's nakshatra relates to your birth star through the
            ancient Vedic system of 9 Taras — from Janma to Parama Mitra
          </p>

          {/* Tara legend */}
          <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap', marginTop:16 }}>
            {TARAS.map(t => (
              <div key={t.num} title={t.meaning} style={{
                padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600,
                background:`${t.color}12`, color:t.color, border:`1px solid ${t.color}25`,
                cursor:'default',
              }}>{t.icon} {t.name}</div>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28, justifyContent:'center' }}>
          {[
            {n:1, label:'Birth Star'},
            {n:2, label:'Planet Stars'},
            {n:3, label:'Results'},
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{
                  width:32, height:32, borderRadius:'50%',
                  background: step >= s.n ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${step >= s.n ? '#c084fc' : 'rgba(255,255,255,0.1)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:700,
                  color: step >= s.n ? 'white' : 'rgba(255,255,255,0.3)',
                  transition:'all 0.3s',
                }}>{step > s.n ? '✓' : s.n}</div>
                <div style={{ fontSize:10, color: step >= s.n ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}>
                  {s.label}
                </div>
              </div>
              {i < 2 && (
                <div style={{
                  height:2, width:60, margin:'0 4px 16px',
                  background: step > s.n ? 'linear-gradient(90deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.08)',
                  borderRadius:999, transition:'background 0.4s',
                }}/>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Birth Star ── */}
        {step === 1 && (
          <div style={{ animation:'fadeUp 0.4s ease', maxWidth:500, margin:'0 auto' }}>
            <div style={{ padding:24, borderRadius:16,
              background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <NakshatraWheel birthIdx={birthIdx} hoveredIdx={-1}/>
                <div>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:6 }}>
                    Your Birth Nakshatra
                  </h2>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:1.6 }}>
                    This is the nakshatra where your Moon was placed at birth. All Tara calculations are measured from this star.
                  </p>
                </div>
              </div>

              <label style={lbl}>Select Your Birth Nakshatra (Janma Nakshatra)</label>
              <select style={{ ...inp, cursor:'pointer' }} value={birthNak}
                onChange={e => setBirthNak(e.target.value)}>
                <option value="">— Choose your birth star —</option>
                {NAKSHATRAS.map(n => (
                  <option key={n.name} value={n.name}>
                    {n.num}. {n.name} (Ruler: {n.ruler})
                  </option>
                ))}
              </select>

              {birthNak && (
                <div style={{
                  marginTop:14, padding:'12px 14px', borderRadius:10,
                  background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.25)',
                  fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.7,
                }}>
                  ✦ <strong style={{ color:'#c084fc' }}>{birthNak}</strong> — Ruled by{' '}
                  <strong>{NAKSHATRAS[birthIdx]?.ruler}</strong>. This is your Janma Tara.
                  All other nakshatras will be measured from here.
                </div>
              )}

              <button disabled={!birthNak} onClick={handleBirthSubmit} style={{
                width:'100%', marginTop:16, padding:'13px', borderRadius:10,
                background: birthNak ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.05)',
                border:'none', color: birthNak ? 'white' : 'rgba(255,255,255,0.3)',
                fontSize:14, fontWeight:700, cursor: birthNak ? 'pointer' : 'not-allowed',
                fontFamily:'inherit', transition:'all 0.2s',
              }}>
                Continue → Enter Planet Positions
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Planet Nakshatras ── */}
        {step === 2 && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ padding:24, borderRadius:16,
              background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:8 }}>
                <div>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, marginBottom:4 }}>
                    Enter Planet Nakshatras
                  </h2>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>
                    Birth Star: <strong style={{ color:'#c084fc' }}>{birthNak}</strong> · Enter at least 1 planet
                  </p>
                </div>
                <button onClick={() => setStep(1)} style={{
                  padding:'6px 12px', borderRadius:8, background:'none',
                  border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)',
                  fontSize:12, cursor:'pointer', fontFamily:'inherit',
                }}>← Change Birth Star</button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
                {PLANET_ORDER.map(planet => {
                  const meta = PLANET_META[planet];
                  const val  = planetNaks[planet] || '';
                  const idx  = val ? NAKSHATRAS.findIndex(n => n.name === val) : -1;
                  const taraInfo = idx >= 0 ? getTaraBalam(birthIdx, idx) : null;
                  const qcfg = taraInfo ? QUALITY_CONFIG[taraInfo.tara.quality] : null;

                  return (
                    <div key={planet} style={{
                      padding:'12px', borderRadius:12,
                      background: val ? `${meta.color}08` : 'rgba(255,255,255,0.02)',
                      border:`1px solid ${val ? meta.color+'33' : 'rgba(255,255,255,0.06)'}`,
                      transition:'all 0.2s',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        <span style={{ fontSize:18 }}>{meta.emoji}</span>
                        <span style={{ fontWeight:700, fontSize:13, color:meta.color }}>{planet}</span>
                        <span style={{
                          padding:'1px 6px', borderRadius:999, fontSize:9, fontWeight:600,
                          background: meta.nature === 'benefic' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: meta.nature === 'benefic' ? '#10b981' : '#f87171',
                        }}>{meta.nature}</span>
                      </div>
                      <select style={{ ...inp, fontSize:12, padding:'8px 10px', cursor:'pointer' }}
                        value={val}
                        onChange={e => setPlanetNaks(prev => ({ ...prev, [planet]: e.target.value }))}>
                        <option value="">— Select Nakshatra —</option>
                        {NAKSHATRAS.map(n => (
                          <option key={n.name} value={n.name}>{n.num}. {n.name}</option>
                        ))}
                      </select>
                      {taraInfo && qcfg && (
                        <div style={{
                          marginTop:6, padding:'4px 8px', borderRadius:6, fontSize:11,
                          background:qcfg.badge, color:qcfg.text, fontWeight:600,
                          display:'flex', alignItems:'center', gap:4,
                        }}>
                          {taraInfo.tara.icon} {taraInfo.tara.name} — {taraInfo.tara.quality}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                disabled={Object.values(planetNaks).filter(Boolean).length === 0}
                onClick={handleCalculate} style={{
                width:'100%', marginTop:16, padding:'14px',
                borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit',
                background:Object.values(planetNaks).filter(Boolean).length>0
                  ?'linear-gradient(135deg,#7c3aed,#4f46e5)':'rgba(255,255,255,0.05)',
                color:Object.values(planetNaks).filter(Boolean).length>0?'white':'rgba(255,255,255,0.3)',
                fontSize:15, fontWeight:700, transition:'all 0.2s',
              }}>
                ⭐ Calculate Tara Balam
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && results && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            {/* Summary header */}
            <div style={{
              padding:'22px', borderRadius:18, marginBottom:20,
              background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.06))',
              border:'1px solid rgba(139,92,246,0.25)',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'#c084fc',
                    textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
                    ⭐ Tara Balam Analysis
                  </div>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:4 }}>
                    Birth Star: {birthNak}
                  </h2>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>
                    Ruled by {NAKSHATRAS[birthIdx].ruler} · Nakshatra #{NAKSHATRAS[birthIdx].num}
                  </p>
                </div>
                <button onClick={() => { setStep(1); setResults(null); setPlanetNaks({}); setBirthNak(''); }} style={{
                  padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)',
                  fontSize:12, cursor:'pointer', fontFamily:'inherit',
                }}>🔄 Recalculate</button>
              </div>

              {/* Stats */}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[
                  { label:'Excellent/Good', count:results.filter(r=>['Excellent','Good'].includes(r.tara.quality)).length, color:'#10b981' },
                  { label:'Mixed', count:results.filter(r=>r.tara.quality==='Mixed').length, color:'#94a3b8' },
                  { label:'Challenging+', count:results.filter(r=>['Challenging','Difficult','Most Difficult'].includes(r.tara.quality)).length, color:'#f87171' },
                ].map(s=>(
                  <div key={s.label} style={{ padding:'8px 14px', borderRadius:10,
                    background:`${s.color}10`, border:`1px solid ${s.color}25` }}>
                    <div style={{ fontWeight:800, fontSize:20, color:s.color }}>{s.count}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tara wheel overview */}
            <div style={{ padding:'16px', borderRadius:14, marginBottom:20,
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)',
                textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
                Overview — All 9 Taras
              </div>
              <TaraWheel results={results} birthIdx={birthIdx}/>
            </div>

            {/* Filter tabs */}
            <div style={{ display:'flex', gap:4, marginBottom:16, borderBottom:'1px solid rgba(255,255,255,0.07)',
              overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
              {[
                {id:'all',  label:`All (${results.length})`},
                {id:'good', label:'✨ Auspicious'},
                {id:'bad',  label:'⚠️ Challenging'},
                {id:'mixed',label:'~ Mixed'},
              ].map(f => (
                <button key={f.id} onClick={() => setFilterQuality(f.id)} style={{
                  padding:'9px 14px', background:'none', border:'none',
                  borderBottom:`2px solid ${filterQuality===f.id?'#7c3aed':'transparent'}`,
                  color: filterQuality===f.id ? '#c084fc' : 'rgba(255,255,255,0.4)',
                  fontWeight: filterQuality===f.id ? 700 : 400,
                  fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
                  fontFamily:'inherit',
                }}>{f.label}</button>
              ))}
            </div>

            {/* Planet cards */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filteredResults.map((result, i) => (
                <PlanetTaraCard key={result.planet} result={result} index={i}/>
              ))}
            </div>

            {/* Legend */}
            <div style={{ marginTop:20, padding:'14px 16px', borderRadius:12,
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
              fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.8 }}>
              💡 <strong style={{ color:'rgba(255,255,255,0.5)' }}>How to use Tara Balam: </strong>
              During a planet's Dasha/Antardasha period, check its Tara from your birth star.
              Planets in Sampat (2), Kshema (4), Sadhana (6), Mitra (8) and Parama Mitra (9)
              Taras are generally auspicious. Vipat (3), Pratyak (5) and Naidhana (7) require
              extra caution and remedies during those periods.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}