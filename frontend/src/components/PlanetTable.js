// src/components/PlanetTable.js
import React from 'react';

const PLANET_ICONS = {
  Sun:'☀️', Moon:'🌙', Mars:'♂', Mercury:'☿',
  Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋'
};

const ELEMENT_COLORS = {
  Fire:  { bg:'rgba(248,113,113,0.15)', color:'#f87171', border:'rgba(248,113,113,0.3)' },
  Earth: { bg:'rgba(134,239,172,0.15)', color:'#86efac', border:'rgba(134,239,172,0.3)' },
  Air:   { bg:'rgba(147,197,253,0.15)', color:'#93c5fd', border:'rgba(147,197,253,0.3)' },
  Water: { bg:'rgba(196,181,253,0.15)', color:'#c4b5fd', border:'rgba(196,181,253,0.3)' },
};

const PLANET_COLORS = {
  Sun:'#f59e0b', Moon:'#60a5fa', Mars:'#f87171',
  Mercury:'#34d399', Jupiter:'#c084fc', Venus:'#f472b6',
  Saturn:'#94a3b8', Rahu:'#818cf8', Ketu:'#fb923c'
};

// All 27 nakshatras in order — each spans 13°20' (13.333°)
const NAKSHATRAS = [
  { name:'Ashwini',         ruler:'Ketu'    },
  { name:'Bharani',         ruler:'Venus'   },
  { name:'Krittika',        ruler:'Sun'     },
  { name:'Rohini',          ruler:'Moon'    },
  { name:'Mrigashira',      ruler:'Mars'    },
  { name:'Ardra',           ruler:'Rahu'    },
  { name:'Punarvasu',       ruler:'Jupiter' },
  { name:'Pushya',          ruler:'Saturn'  },
  { name:'Ashlesha',        ruler:'Mercury' },
  { name:'Magha',           ruler:'Ketu'    },
  { name:'Purva Phalguni',  ruler:'Venus'   },
  { name:'Uttara Phalguni', ruler:'Sun'     },
  { name:'Hasta',           ruler:'Moon'    },
  { name:'Chitra',          ruler:'Mars'    },
  { name:'Swati',           ruler:'Rahu'    },
  { name:'Vishakha',        ruler:'Jupiter' },
  { name:'Anuradha',        ruler:'Saturn'  },
  { name:'Jyeshtha',        ruler:'Mercury' },
  { name:'Mula',            ruler:'Ketu'    },
  { name:'Purva Ashadha',   ruler:'Venus'   },
  { name:'Uttara Ashadha',  ruler:'Sun'     },
  { name:'Shravana',        ruler:'Moon'    },
  { name:'Dhanishta',       ruler:'Mars'    },
  { name:'Shatabhisha',     ruler:'Rahu'    },
  { name:'Purva Bhadra',    ruler:'Jupiter' },
  { name:'Uttara Bhadra',   ruler:'Saturn'  },
  { name:'Revati',          ruler:'Mercury' },
];

const RASHIS = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'
];

const RASHI_ELEMENTS = {
  Mesha:'Fire', Vrishabha:'Earth', Mithuna:'Air', Karka:'Water',
  Simha:'Fire', Kanya:'Earth', Tula:'Air', Vrishchika:'Water',
  Dhanu:'Fire', Makara:'Earth', Kumbha:'Air', Meena:'Water',
};

function getNakshatraFromDegree(rashiName, degreeInRashi) {
  // Convert to absolute sidereal longitude
  const rashiIndex = RASHIS.indexOf(rashiName);
  if (rashiIndex < 0) return { name: '—', pada: 1, ruler: '—' };

  const absoluteDeg = rashiIndex * 30 + degreeInRashi;

  // Each nakshatra = 360/27 = 13.333°
  const nakSize  = 360 / 27;
  const nakIndex = Math.floor(absoluteDeg / nakSize) % 27;
  const degInNak = absoluteDeg % nakSize;

  // Each pada = nakSize / 4
  const pada = Math.min(Math.floor(degInNak / (nakSize / 4)) + 1, 4);

  return {
    name:  NAKSHATRAS[nakIndex].name,
    pada,
    ruler: NAKSHATRAS[nakIndex].ruler,
  };
}

export default function PlanetTable({ planets }) {
  if (!planets) return null;

  const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  const rows = PLANET_ORDER.filter(p => planets[p]);

  return (
    <div style={{
      background:   'var(--bg-card)',
      border:       '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow:     'hidden',
    }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
        <h3 style={{ fontSize:15, display:'flex', alignItems:'center', gap:8 }}>
          <span>🌌</span> Planetary Positions
        </h3>
      </div>

      {/* Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              {['Planet','Sign (Rashi)','Degree','Nakshatra','Pada','Nak. Ruler','Element','Status'].map(col=>(
                <th key={col} style={{
                  padding:'10px 16px', textAlign:'left',
                  fontSize:11, fontWeight:600,
                  color:'var(--text-muted)',
                  textTransform:'uppercase', letterSpacing:'0.06em',
                  whiteSpace:'nowrap',
                }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((planetName, i) => {
              const data     = planets[planetName];
              const element  = RASHI_ELEMENTS[data.rashi] || 'Fire';
              const elemStyle= ELEMENT_COLORS[element] || ELEMENT_COLORS.Fire;
              const pColor   = PLANET_COLORS[planetName] || '#a78bfa';
              const icon     = PLANET_ICONS[planetName]  || '🪐';
              const isRetro  = data.retrograde;
              const deg      = parseFloat(data.degree_in_rashi).toFixed(2);

              // Calculate Nakshatra from rashi + degree
              const nak = getNakshatraFromDegree(data.rashi, parseFloat(data.degree_in_rashi));

              return (
                <tr key={planetName} style={{
                  borderBottom: i < rows.length-1 ? '1px solid var(--border)' : 'none',
                  transition:'background 0.15s',
                }}>
                  {/* Planet */}
                  <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:18 }}>{icon}</span>
                      <span style={{ fontWeight:600, fontSize:14, color:pColor }}>
                        {planetName}
                      </span>
                    </div>
                  </td>

                  {/* Sign */}
                  <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                    <div style={{ fontWeight:500, fontSize:14 }}>{data.rashi}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                      {data.rashi_english || ''}
                    </div>
                  </td>

                  {/* Degree */}
                  <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                    <span style={{
                      fontFamily:'monospace', fontSize:14,
                      fontWeight:600, color:'var(--text-primary)',
                    }}>{deg}°</span>
                  </td>

                  {/* Nakshatra */}
                  <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                    <div style={{
                      fontWeight:600, fontSize:13,
                      color: PLANET_COLORS[nak.ruler] || '#a78bfa',
                    }}>
                      {nak.name}
                    </div>
                  </td>

                  {/* Pada */}
                  <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                    <div style={{
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      width:28, height:28, borderRadius:'50%',
                      background:'rgba(139,92,246,0.15)',
                      border:'1px solid rgba(139,92,246,0.3)',
                      fontSize:13, fontWeight:700, color:'var(--purple-400)',
                    }}>
                      {nak.pada}
                    </div>
                  </td>

                  {/* Nakshatra Ruler */}
                  <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14 }}>{PLANET_ICONS[nak.ruler] || '🪐'}</span>
                      <span style={{
                        fontSize:12, fontWeight:500,
                        color: PLANET_COLORS[nak.ruler] || '#a78bfa',
                      }}>{nak.ruler}</span>
                    </div>
                  </td>

                  {/* Element */}
                  <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                    <span style={{
                      padding:'4px 10px', borderRadius:999, fontSize:12, fontWeight:600,
                      background: elemStyle.bg, color: elemStyle.color, border:`1px solid ${elemStyle.border}`,
                    }}>{element}</span>
                  </td>

                  {/* Status */}
                  <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                    {isRetro ? (
                      <span style={{
                        padding:'4px 10px', borderRadius:999, fontSize:12, fontWeight:600,
                        background:'rgba(251,146,60,0.15)', color:'#fb923c',
                        border:'1px solid rgba(251,146,60,0.3)',
                      }}>℞ Retrograde</span>
                    ) : (
                      <span style={{
                        padding:'4px 10px', borderRadius:999, fontSize:12, fontWeight:600,
                        background:'rgba(52,211,153,0.15)', color:'#34d399',
                        border:'1px solid rgba(52,211,153,0.3)',
                      }}>Direct</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}