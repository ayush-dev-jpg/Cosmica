// src/pages/MoonSign.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const COUNTRIES = [
  'India','USA','UK','Canada','Australia','UAE','Singapore',
  'Germany','France','Japan','Nepal','Sri Lanka','Other'
];

const RASHI_DATA = {
  'Mesha': {
    english:'Aries', symbol:'♈', element:'Fire', quality:'Cardinal',
    ruler:'Mars', color:'Red', gem:'Red Coral', number:9,
    traits:['Bold','Pioneering','Energetic','Impulsive','Courageous','Independent'],
    compatible:['Simha','Dhanu','Kumbha','Mithuna'],
    famous:['Narendra Modi','Lady Gaga','Mariah Carey'],
    desc:`The Moon in Mesha (Aries) creates a soul that is perpetually charged with the energy of new beginnings. You are emotionally direct, instinctively brave, and feel most alive when pioneering something new. Your emotional responses are immediate and honest — there is no guile or pretence in how you feel. When you are moved, everyone knows it. When you are excited, the room feels it. This lunar placement gives you tremendous emotional resilience — you recover from setbacks with remarkable speed, preferring to charge forward rather than dwell in pain.`,
  },
  'Vrishabha': {
    english:'Taurus', symbol:'♉', element:'Earth', quality:'Fixed',
    ruler:'Venus', color:'Green/Pink', gem:'Diamond', number:6,
    traits:['Patient','Sensual','Reliable','Stubborn','Artistic','Grounded'],
    compatible:['Kanya','Makara','Karka','Meena'],
    famous:['Aishwarya Rai','Adele','George Clooney'],
    desc:`The Moon in Vrishabha (Taurus) is considered one of its most auspicious placements — the Moon is exalted here, meaning it expresses its fullest, most nourishing qualities. You are emotionally steady, deeply sensual, and profoundly connected to the physical world. Beauty, comfort, and abundance are not mere luxuries to you — they are emotional necessities. You find peace in nature, music, good food, and the warmth of lasting relationships. Your emotional world is rich, patient, and deeply devoted.`,
  },
  'Mithuna': {
    english:'Gemini', symbol:'♊', element:'Air', quality:'Mutable',
    ruler:'Mercury', color:'Yellow/Green', gem:'Emerald', number:5,
    traits:['Curious','Witty','Adaptable','Restless','Communicative','Dual'],
    compatible:['Tula','Kumbha','Mesha','Simha'],
    famous:['Johnny Depp','Angelina Jolie','Kanye West'],
    desc:`The Moon in Mithuna (Gemini) creates an emotionally agile, intellectually alive soul who processes feelings through the mind. You are endlessly curious about people, ideas, and experiences — your emotional world is a vast library of impressions, stories, and connections. Communication is your emotional lifeblood. You need mental stimulation to feel truly nourished, and your moods shift with the wind of your thoughts. You are charming, funny, and remarkably perceptive about others' inner states.`,
  },
  'Karka': {
    english:'Cancer', symbol:'♋', element:'Water', quality:'Cardinal',
    ruler:'Moon', color:'White/Silver', gem:'Pearl', number:2,
    traits:['Nurturing','Intuitive','Protective','Emotional','Psychic','Family-oriented'],
    compatible:['Vrishchika','Meena','Vrishabha','Kanya'],
    famous:['Princess Diana','Selena Gomez','Tom Hanks'],
    desc:`The Moon in Karka (Cancer) is in its own sign — the most natural, powerful expression of lunar energy possible. You are the embodiment of emotional intelligence, intuition, and nurturing wisdom. Your feelings run deep as the ocean, and like the ocean, they have tides — ebbing and flowing with the cycles of life. Home and family are your sacred sanctuary. You absorb the emotions of those around you with an almost psychic sensitivity, and your greatest gift is the ability to make others feel truly seen and cared for.`,
  },
  'Simha': {
    english:'Leo', symbol:'♌', element:'Fire', quality:'Fixed',
    ruler:'Sun', color:'Gold/Orange', gem:'Ruby', number:1,
    traits:['Generous','Proud','Creative','Dramatic','Loyal','Regal'],
    compatible:['Mesha','Dhanu','Mithuna','Tula'],
    famous:['Barack Obama','Jennifer Lopez','Madonna'],
    desc:`The Moon in Simha (Leo) creates a soul whose emotional world is grand, warm, and theatrical. You feel most yourself when you are seen, appreciated, and able to express your creativity freely. There is a regal quality to your emotional nature — you give generously, love dramatically, and expect your devotion to be honoured in return. Pride is central to your emotional identity. You need to feel respected and admired to truly thrive. Your warmth and magnetism naturally draw people toward you.`,
  },
  'Kanya': {
    english:'Virgo', symbol:'♍', element:'Earth', quality:'Mutable',
    ruler:'Mercury', color:'Navy/Brown', gem:'Emerald', number:5,
    traits:['Analytical','Helpful','Precise','Anxious','Humble','Discerning'],
    compatible:['Vrishabha','Makara','Karka','Vrishchika'],
    famous:['Beyoncé','Keanu Reeves','Freddie Mercury'],
    desc:`The Moon in Kanya (Virgo) creates a soul who experiences emotion through a filter of analysis, refinement, and service. You process feelings by thinking about them, categorising them, and finding practical meaning within them. Your emotional intelligence is expressed through helpfulness — you show love by doing, fixing, improving, and being utterly reliable. The emotional need for order and perfection runs deep. Chaos disturbs you at a visceral level, and you find genuine peace in environments that are clean, organised, and purposeful.`,
  },
  'Tula': {
    english:'Libra', symbol:'♎', element:'Air', quality:'Cardinal',
    ruler:'Venus', color:'Blue/Pink', gem:'Diamond', number:6,
    traits:['Harmonious','Diplomatic','Charming','Indecisive','Aesthetic','Fair'],
    compatible:['Mithuna','Kumbha','Simha','Dhanu'],
    famous:['Kim Kardashian','Will Smith','Eminem'],
    desc:`The Moon in Tula (Libra) creates a soul whose emotional world is defined by the search for beauty, balance, and harmonious connection. You are deeply discomforted by conflict, ugliness, or injustice — your emotional wellbeing depends on environments of grace and fairness. Relationships are your emotional oxygen. You come alive in partnership, and you have an extraordinary gift for making others feel understood and valued. Your natural diplomacy and charm are not performances — they arise from a genuine need for peace and mutual appreciation.`,
  },
  'Vrishchika': {
    english:'Scorpio', symbol:'♏', element:'Water', quality:'Fixed',
    ruler:'Mars', color:'Deep Red/Black', gem:'Red Coral', number:9,
    traits:['Intense','Perceptive','Transformative','Secretive','Powerful','Magnetic'],
    compatible:['Karka','Meena','Kanya','Makara'],
    famous:['Leonardo DiCaprio','Ryan Gosling','Katy Perry'],
    desc:`The Moon in Vrishchika (Scorpio) is considered debilitated in traditional Vedic astrology, meaning the Moon's natural softness is placed in the sign of maximum intensity and transformation. You feel everything at a profound, almost unbearable depth. Emotions are not passing experiences for you — they are total immersions. You are drawn to the hidden, the mysterious, and the transformative aspects of life. Your emotional world is complex, layered, and extraordinarily powerful. You see through surfaces with unnerving accuracy.`,
  },
  'Dhanu': {
    english:'Sagittarius', symbol:'♐', element:'Fire', quality:'Mutable',
    ruler:'Jupiter', color:'Yellow/Purple', gem:'Yellow Sapphire', number:3,
    traits:['Philosophical','Optimistic','Adventurous','Blunt','Generous','Spiritual'],
    compatible:['Mesha','Simha','Tula','Kumbha'],
    famous:['Brad Pitt','Taylor Swift','Miley Cyrus'],
    desc:`The Moon in Dhanu (Sagittarius) creates an emotionally expansive, philosophically inclined soul who finds genuine nourishment in freedom, wisdom, and adventure. You are emotionally most alive when you are learning, travelling, or engaging with ideas that stretch the boundaries of your understanding. Optimism is your emotional default — you instinctively reach for meaning and silver linings even in difficult circumstances. Your emotional generosity is boundless, and your enthusiasm for life is genuinely infectious.`,
  },
  'Makara': {
    english:'Capricorn', symbol:'♑', element:'Earth', quality:'Cardinal',
    ruler:'Saturn', color:'Black/Dark Blue', gem:'Blue Sapphire', number:8,
    traits:['Ambitious','Disciplined','Reserved','Patient','Responsible','Stoic'],
    compatible:['Vrishabha','Kanya','Vrishchika','Meena'],
    famous:['Michelle Obama','David Bowie','Denzel Washington'],
    desc:`The Moon in Makara (Capricorn) creates a soul whose emotional world is characterised by depth, discipline, and an extraordinary capacity for endurance. You do not wear your heart on your sleeve — your feelings are processed internally, shaped by a powerful sense of duty and responsibility. You are emotionally reserved, but this should not be mistaken for coldness. Beneath the composed exterior lies a deeply loyal, profoundly committed heart. You show love through steadfast reliability, practical support, and the quiet constancy of your presence.`,
  },
  'Kumbha': {
    english:'Aquarius', symbol:'♒', element:'Air', quality:'Fixed',
    ruler:'Saturn', color:'Blue/Turquoise', gem:'Blue Sapphire', number:8,
    traits:['Independent','Humanitarian','Eccentric','Detached','Innovative','Visionary'],
    compatible:['Mithuna','Tula','Mesha','Dhanu'],
    famous:['Oprah Winfrey','Ellen DeGeneres','Bob Marley'],
    desc:`The Moon in Kumbha (Aquarius) creates a soul whose emotional world is simultaneously vast and somewhat detached. You feel most deeply not for individuals but for humanity as a whole — injustice, suffering, and the collective struggles of people move you profoundly. Your emotional intelligence is expressed through ideas, innovation, and the desire to change what is broken in the world. You are emotionally independent to an unusual degree, needing significant personal freedom even within close relationships.`,
  },
  'Meena': {
    english:'Pisces', symbol:'♓', element:'Water', quality:'Mutable',
    ruler:'Jupiter', color:'Sea Green/Purple', gem:'Yellow Sapphire', number:3,
    traits:['Compassionate','Dreamy','Intuitive','Selfless','Artistic','Spiritual'],
    compatible:['Karka','Vrishchika','Vrishabha','Makara'],
    famous:['Rihanna','Justin Bieber','Albert Einstein'],
    desc:`The Moon in Meena (Pisces) creates the most spiritually sensitive, emotionally boundless placement of the lunar cycle. You are a soul without hard edges — your empathy flows beyond the normal boundaries of self, and you absorb the emotional atmosphere of everyone around you like a sponge. Your inner world is extraordinarily rich, imaginative, and deeply connected to dimensions that others rarely perceive. Art, music, dreams, and spiritual practice are not hobbies for you — they are emotional necessities that keep you anchored.`,
  },
};

const RULER_COLORS = {
  Mars:'#f87171', Venus:'#f472b6', Mercury:'#34d399',
  Moon:'#60a5fa', Sun:'#f59e0b', Jupiter:'#c084fc', Saturn:'#94a3b8'
};
const ELEMENT_COLORS = { Fire:'#f87171', Earth:'#86efac', Air:'#93c5fd', Water:'#c4b5fd' };
const ELEMENT_EMOJI  = { Fire:'🔥', Earth:'🌍', Air:'💨', Water:'💧' };

export default function MoonSign() {
  const { isLoggedIn } = useAuth();
  const [form, setForm]           = useState({ date:'', time:'', city:'', country:'India' });
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [browsedSign, setBrowsedSign] = useState(null);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/moon-sign/find', form);
      setResult(res.data);
      setActiveTab('overview');
      setBrowsedSign(null);
      window.scrollTo({ top:0, behavior:'smooth' });
    } catch(err) {
      setError(err.response?.data?.detail || 'Could not calculate. Please check your details.');
    } finally { setLoading(false); }
  }

  const rashi   = result ? RASHI_DATA[result.moon_rashi] : null;
  const rulCol  = rashi ? RULER_COLORS[rashi.ruler]    : '#c084fc';
  const elemCol = rashi ? ELEMENT_COLORS[rashi.element] : '#c084fc';

  const TABS = [
    { id:'overview',    label:'🌙 Overview' },
    { id:'personality', label:'✨ Personality' },
    { id:'knowledge',   label:'📖 Reading' },
    { id:'lucky',       label:'🍀 Lucky' },
    { id:'compatible',  label:'💫 Compatible' },
    { id:'famous',      label:'🌟 Famous' },
    { id:'browse',      label:'🌌 Browse All' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>

      {/* Navbar */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'16px 32px', borderBottom:'1px solid var(--border)',
        background:'rgba(15,12,26,0.9)', backdropFilter:'blur(16px)',
        position:'sticky', top:0, zIndex:100,
      }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:22 }}>✨</span>
          <span className="font-cinzel gradient-text" style={{ fontSize:18, fontWeight:700 }}>COSMICA</span>
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/nakshatra" className="btn btn-ghost" style={{ padding:'8px 14px', fontSize:13 }}>⭐ Nakshatra</Link>
          <Link to="/chart"     className="btn btn-ghost" style={{ padding:'8px 14px', fontSize:13 }}>🪐 Kundli</Link>
          {isLoggedIn
            ? <Link to="/dashboard" className="btn btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>Dashboard</Link>
            : <Link to="/signup"    className="btn btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>Sign Up Free</Link>
          }
        </div>
      </nav>

      <main style={{ maxWidth:860, margin:'0 auto', padding:'48px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:44, position:'relative' }}>
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:400, height:200, borderRadius:'50%',
            background:'radial-gradient(ellipse, rgba(96,165,250,0.1) 0%, transparent 70%)',
            pointerEvents:'none',
          }}/>
          <div style={{ fontSize:56, marginBottom:14 }}>🌙</div>
          <h1 className="font-cinzel gradient-text" style={{
            fontSize:'clamp(28px,5vw,52px)', marginBottom:16, letterSpacing:'0.02em',
          }}>
            Moon Sign Calculator
          </h1>
          <p style={{
            color:'var(--text-secondary)', fontSize:16, lineHeight:1.9,
            maxWidth:580, margin:'0 auto',
          }}>
            In Vedic astrology, your Moon sign — called <em>Chandra Rashi</em> — is considered
            far more significant than your Sun sign. It reveals your emotional nature, subconscious
            mind, instinctive reactions, and the inner self that only those closest to you will ever know.
          </p>
        </div>

        {/* Form */}
        <div style={{
          background:'var(--bg-card)',
          border:'1px solid rgba(96,165,250,0.2)',
          borderRadius:20, padding:28, marginBottom:32,
          boxShadow:'0 0 40px rgba(96,165,250,0.05)',
        }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Calculate Your Moon Sign</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:20, lineHeight:1.6 }}>
            The Moon moves through all 12 signs roughly every 28 days — exact birth time gives the most accurate result
          </p>

          {error && (
            <div style={{
              padding:'12px 16px', marginBottom:16, borderRadius:10,
              background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
              color:'#f87171', fontSize:14,
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:18 }}>
              <div>
                <label className="label">Date of Birth</label>
                <input className="input" type="date" value={form.date}
                  onChange={e=>set('date',e.target.value)}
                  max={new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <label className="label">Time of Birth</label>
                <input className="input" type="time" value={form.time}
                  onChange={e=>set('time',e.target.value)} required />
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Use local birth time</p>
              </div>
              <div>
                <label className="label">Birth City</label>
                <input className="input" type="text" placeholder="e.g. Mumbai"
                  value={form.city} onChange={e=>set('city',e.target.value)} required />
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" style={{ cursor:'pointer' }}
                  value={form.country} onChange={e=>set('country',e.target.value)}>
                  {COUNTRIES.map(c=><option key={c} value={c} style={{ background:'#1a1530' }}>{c}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', padding:'15px', fontSize:15, borderRadius:12 }}>
              {loading ? <><span className="spinner"/> Calculating...</> : '🌙 Reveal My Moon Sign'}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div className="spinner" style={{ width:44, height:44, margin:'0 auto 16px', borderWidth:3 }}/>
            <h3 style={{ marginBottom:6 }}>Reading the Moon...</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:14 }}>
              Calculating the Moon's exact position at your birth moment
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && result && rashi && (
          <div className="fade-in">

            {/* Hero result */}
            <div style={{
              borderRadius:20, overflow:'hidden',
              border:`1px solid ${rulCol}33`, marginBottom:20,
              boxShadow:`0 0 60px ${rulCol}10`,
            }}>
              {/* Banner */}
              <div style={{
                padding:'40px 32px 32px', textAlign:'center', position:'relative',
                background:`linear-gradient(135deg, ${rulCol}25 0%, ${elemCol}15 60%, rgba(15,12,26,0.8) 100%)`,
                borderBottom:`1px solid ${rulCol}22`,
              }}>
                <div style={{
                  position:'absolute', top:0, left:0, right:0, bottom:0,
                  background:`radial-gradient(ellipse at 50% 0%, ${rulCol}18 0%, transparent 60%)`,
                  pointerEvents:'none',
                }}/>
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:999, padding:'5px 16px', fontSize:12,
                  color:'var(--text-muted)', marginBottom:16, letterSpacing:'0.08em',
                }}>
                  YOUR MOON SIGN (CHANDRA RASHI)
                </div>

                <div style={{ fontSize:52, marginBottom:8 }}>{rashi.symbol}</div>
                <h2 className="font-cinzel" style={{
                  fontSize:'clamp(32px,5vw,56px)', fontWeight:800,
                  color:rulCol, marginBottom:4, lineHeight:1,
                  textShadow:`0 0 40px ${rulCol}44`,
                }}>
                  {result.moon_rashi}
                </h2>
                <p style={{ fontSize:18, color:'var(--text-secondary)', marginBottom:24 }}>
                  {rashi.english} · {rashi.element} Sign · {rashi.quality}
                </p>

                <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                  {[
                    ['Ruler',   rashi.ruler,   rulCol],
                    ['Element', rashi.element, elemCol],
                    ['Symbol',  rashi.symbol,  '#a78bfa'],
                    ['Quality', rashi.quality, '#f59e0b'],
                  ].map(([label,val,col])=>(
                    <div key={label} style={{
                      padding:'6px 16px', background:col+'18',
                      border:`1px solid ${col}44`, borderRadius:999, fontSize:13,
                    }}>
                      <span style={{ color:'var(--text-muted)', fontSize:11 }}>{label}: </span>
                      <span style={{ fontWeight:700, color:col }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Moon position bar */}
              <div style={{
                padding:'16px 32px', display:'flex', gap:32, flexWrap:'wrap',
                background:'var(--bg-card)',
              }}>
                {[
                  ['Moon Rashi',    `${result.moon_rashi} (${rashi.english})`],
                  ['Moon Degree',   `${result.moon_degree?.toFixed(3)}°`],
                  ['Nakshatra',     result.nakshatra],
                  ['Nakshatra Pada',`Pada ${result.pada}`],
                ].map(([label,val])=>(
                  <div key={label}>
                    <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display:'flex', gap:2, marginBottom:20,
              borderBottom:'1px solid var(--border)', overflowX:'auto',
            }}>
              {TABS.map(tab=>(
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                  padding:'11px 14px', background:'none', border:'none',
                  borderBottom: activeTab===tab.id ? `2px solid ${rulCol}` : '2px solid transparent',
                  color: activeTab===tab.id ? rulCol : 'var(--text-secondary)',
                  fontWeight: activeTab===tab.id ? 700 : 400,
                  fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
                }}>{tab.label}</button>
              ))}
            </div>

            {/* Overview */}
            {activeTab==='overview' && (
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:20, padding:28,
              }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:8, marginBottom:14,
                  paddingBottom:12, borderBottom:`1px solid ${rulCol}22`,
                }}>
                  <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(${rulCol}, ${elemCol})` }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:rulCol, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                    Moon in {rashi.english}
                  </span>
                </div>
                <p style={{ fontSize:16, lineHeight:2.1, color:'var(--text-secondary)', fontStyle:'italic', marginBottom:24 }}>
                  {rashi.desc}
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
                  {[
                    ['🌙','Moon Sign',    `${result.moon_rashi} (${rashi.english})`],
                    [ELEMENT_EMOJI[rashi.element],'Element', rashi.element],
                    ['🪐','Ruling Planet',rashi.ruler],
                    ['⚡','Quality',      rashi.quality],
                    ['🔮','Symbol',       rashi.symbol],
                    ['⭐','Nakshatra',    result.nakshatra],
                  ].map(([icon,label,val])=>(
                    <div key={label} style={{
                      padding:'14px 16px', background:'rgba(255,255,255,0.03)',
                      border:'1px solid rgba(255,255,255,0.07)', borderRadius:12,
                    }}>
                      <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personality */}
            {activeTab==='personality' && (
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:20, padding:28,
              }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:8, marginBottom:14,
                  paddingBottom:12, borderBottom:`1px solid ${rulCol}22`,
                }}>
                  <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(${rulCol}, ${elemCol})` }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:rulCol, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                    Core Traits
                  </span>
                </div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:28 }}>
                  {rashi.traits.map((trait,i)=>(
                    <span key={trait} style={{
                      padding:'8px 18px', borderRadius:999, fontSize:14, fontWeight:600,
                      background:`${rulCol}${['18','15','12','18','15','12'][i]}`,
                      color:rulCol, border:`1px solid ${rulCol}44`,
                    }}>{trait}</span>
                  ))}
                </div>

                <div style={{
                  display:'flex', alignItems:'center', gap:8, marginBottom:14,
                  paddingBottom:12, borderBottom:`1px solid ${elemCol}22`,
                }}>
                  <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(${elemCol}, ${rulCol})` }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:elemCol, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                    Emotional Nature
                  </span>
                </div>
                <p style={{ fontSize:15, lineHeight:2.1, color:'var(--text-secondary)' }}>
                  {rashi.desc}
                </p>
              </div>
            )}

            {/* Reading */}
            {activeTab==='knowledge' && (
              <div>
                {result.your_knowledge ? (
                  <div style={{
                    background:'var(--bg-card)', border:`1px solid ${rulCol}33`,
                    borderRadius:20, padding:28, marginBottom:16,
                  }}>
                    <div style={{
                      display:'flex', alignItems:'center', gap:8, marginBottom:16,
                      paddingBottom:12, borderBottom:'1px solid rgba(139,92,246,0.2)',
                    }}>
                      <div style={{ width:3, height:20, borderRadius:2, background:'linear-gradient(#a78bfa, #7c3aed)' }}/>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--purple-400)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                        Astrologer's Knowledge
                      </span>
                    </div>
                    <p style={{ fontSize:15, lineHeight:2.1, color:'var(--text-primary)', whiteSpace:'pre-wrap' }}>
                      {result.your_knowledge}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    background:'var(--bg-card)', border:'1px solid var(--border)',
                    borderRadius:20, padding:28, marginBottom:16,
                    textAlign:'center', color:'var(--text-muted)',
                  }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>📖</div>
                    <p>No personal knowledge added for {result.moon_rashi} yet.</p>
                    <p style={{ fontSize:12, marginTop:4 }}>Add it in My Knowledge → Rashi tab</p>
                  </div>
                )}
                {result.ai_reading && (
                  <div style={{
                    background:'var(--bg-card)', border:'1px solid rgba(99,102,241,0.25)',
                    borderRadius:20, padding:28,
                  }}>
                    <div style={{
                      display:'flex', alignItems:'center', gap:8, marginBottom:16,
                      paddingBottom:12, borderBottom:'1px solid rgba(99,102,241,0.2)',
                    }}>
                      <div style={{ width:3, height:20, borderRadius:2, background:'linear-gradient(#818cf8, #4f46e5)' }}/>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--indigo-400)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                        AI Reading
                      </span>
                    </div>
                    <p style={{ fontSize:15, lineHeight:2.1, color:'var(--text-primary)', whiteSpace:'pre-wrap' }}>
                      {result.ai_reading}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Lucky */}
            {activeTab==='lucky' && (
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:20, padding:28,
              }}>
                <p style={{ color:'var(--text-secondary)', fontSize:15, lineHeight:1.9, marginBottom:24 }}>
                  In Vedic astrology, aligning with your Moon sign's associated colors, gemstones, and numbers
                  can strengthen the lunar energy in your chart, bringing emotional stability, intuition, and inner peace.
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14 }}>
                  {[
                    { icon:'🎨', label:'Lucky Color',   value:rashi.color,           col:rulCol,   desc:'Wear to enhance emotional harmony' },
                    { icon:'💎', label:'Lucky Gemstone',value:rashi.gem,             col:elemCol,  desc:'Strengthens Moon energy when worn' },
                    { icon:'🔢', label:'Lucky Number',  value:rashi.number.toString(),col:'#f59e0b',desc:'Auspicious for major decisions' },
                    { icon:'🪐', label:'Ruling Planet', value:rashi.ruler,           col:rulCol,   desc:'Meditate on this planet for peace' },
                    { icon:ELEMENT_EMOJI[rashi.element],'label':'Element', value:rashi.element, col:elemCol, desc:'Your emotional foundation' },
                    { icon:'⚡', label:'Quality',       value:rashi.quality,         col:'#a78bfa',desc:'How you initiate emotional action' },
                  ].map(item=>(
                    <div key={item.label} style={{
                      padding:'20px 16px', textAlign:'center',
                      background:`${item.col}0c`, border:`1px solid ${item.col}2a`,
                      borderRadius:16,
                    }}>
                      <div style={{ fontSize:28, marginBottom:10 }}>{item.icon}</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{item.label}</div>
                      <div style={{ fontSize:15, fontWeight:800, color:item.col, marginBottom:6 }}>{item.value}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.5 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compatible */}
            {activeTab==='compatible' && (
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:20, padding:28,
              }}>
                <p style={{ color:'var(--text-secondary)', fontSize:15, lineHeight:1.9, marginBottom:24 }}>
                  Moon sign compatibility in Vedic astrology reveals emotional resonance between two people —
                  how naturally you understand each other, how well your emotional rhythms align, and
                  whether your inner worlds speak the same language. These Moon signs harmonise most naturally with {rashi.english}.
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                  {rashi.compatible.map((compRashi,i)=>{
                    const cr = RASHI_DATA[compRashi];
                    const cc = cr ? RULER_COLORS[cr.ruler] : '#a78bfa';
                    const ce = cr ? ELEMENT_COLORS[cr.element] : '#c4b5fd';
                    return (
                      <div key={compRashi} style={{
                        padding:'16px', background:`${cc}0d`,
                        border:`1px solid ${cc}2a`, borderRadius:14,
                        display:'flex', alignItems:'center', gap:12,
                      }}>
                        <div style={{
                          width:40, height:40, borderRadius:10, flexShrink:0,
                          background:`linear-gradient(135deg, ${cc}33, ${ce}22)`,
                          border:`1px solid ${cc}44`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:18,
                        }}>{cr?.symbol || '🌙'}</div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:cc }}>{compRashi}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                            {cr?.english} · {cr?.ruler}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Famous */}
            {activeTab==='famous' && (
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:20, padding:28,
              }}>
                <p style={{ color:'var(--text-secondary)', fontSize:15, lineHeight:1.9, marginBottom:24 }}>
                  These remarkable personalities share your Moon sign of {rashi.english}. The Moon sign shapes
                  the emotional core, the instinctive reactions, and the inner life — so while their public
                  personas may differ, at the emotional level, you share a common language.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {rashi.famous.map(person=>(
                    <div key={person} style={{
                      display:'flex', alignItems:'center', gap:16,
                      padding:'16px 20px', background:'rgba(255,255,255,0.025)',
                      border:'1px solid rgba(255,255,255,0.07)', borderRadius:14,
                    }}>
                      <div style={{
                        width:44, height:44, borderRadius:'50%', flexShrink:0,
                        background:`linear-gradient(135deg, ${rulCol}44, ${elemCol}33)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:18, fontWeight:800, color:rulCol,
                      }}>{person[0]}</div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700 }}>{person}</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                          Moon in {rashi.english} · Ruled by {rashi.ruler}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Browse */}
            {activeTab==='browse' && (
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:20, padding:28,
              }}>
                <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:18 }}>
                  Your Moon sign is marked with ★ — click any sign to explore
                </p>
                <BrowseGrid
                  selectedSign={result.moon_rashi}
                  browsedSign={browsedSign}
                  setBrowsedSign={setBrowsedSign}
                />
              </div>
            )}
          </div>
        )}

        {/* No result — show browse */}
        {!loading && !result && (
          <div style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:20, padding:28,
          }}>
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>🌌 Explore All 12 Moon Signs</h3>
            <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:20, lineHeight:1.7 }}>
              Click any Moon sign to discover its emotional nature, personality traits,
              compatible signs, lucky details, and famous personalities.
            </p>
            <BrowseGrid selectedSign={null} browsedSign={browsedSign} setBrowsedSign={setBrowsedSign} />
          </div>
        )}
      </main>
    </div>
  );
}

function BrowseGrid({ selectedSign, browsedSign, setBrowsedSign }) {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
        {Object.entries(RASHI_DATA).map(([name, data])=>{
          const isSelected = name === selectedSign;
          const isBrowsing = name === browsedSign;
          const rc = RULER_COLORS[data.ruler];
          const ec = ELEMENT_COLORS[data.element];
          return (
            <div key={name}
              onClick={()=>setBrowsedSign(isBrowsing ? null : name)}
              style={{
                padding:'14px', borderRadius:14, textAlign:'center',
                border:`1px solid ${isSelected ? rc+'88' : isBrowsing ? rc+'55' : 'rgba(255,255,255,0.07)'}`,
                background: isSelected
                  ? `linear-gradient(135deg, ${rc}20, ${ec}12)`
                  : isBrowsing ? `${rc}0f` : 'rgba(255,255,255,0.02)',
                cursor:'pointer', transition:'all 0.2s',
              }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{data.symbol}</div>
              <div style={{
                fontSize:12, fontWeight: isSelected||isBrowsing ? 700 : 500,
                color: isSelected||isBrowsing ? rc : 'var(--text-primary)', marginBottom:2,
              }}>
                {name} {isSelected ? '★' : ''}
              </div>
              <div style={{ fontSize:10, color:'var(--text-muted)' }}>{data.english} · {data.ruler}</div>
            </div>
          );
        })}
      </div>

      {browsedSign && RASHI_DATA[browsedSign] && (
        <SignDetailPanel
          name={browsedSign}
          isYours={browsedSign === selectedSign}
          onClose={()=>setBrowsedSign(null)}
        />
      )}
    </div>
  );
}

function SignDetailPanel({ name, isYours, onClose }) {
  const d   = RASHI_DATA[name];
  if (!d) return null;
  const rc  = RULER_COLORS[d.ruler];
  const ec  = ELEMENT_COLORS[d.element];

  return (
    <div style={{
      marginTop:16, borderRadius:20, overflow:'hidden',
      border:`1px solid ${rc}33`, background:'var(--bg-card)',
      boxShadow:`0 0 30px ${rc}10`,
    }}>
      {/* Header */}
      <div style={{
        padding:'24px 28px 20px',
        background:`linear-gradient(135deg, ${rc}20, ${ec}12)`,
        borderBottom:`1px solid ${rc}22`,
        display:'flex', alignItems:'center', gap:16,
      }}>
        <div style={{ fontSize:40 }}>{d.symbol}</div>
        <div style={{ flex:1 }}>
          <h3 style={{ fontSize:22, fontWeight:800, color:rc, marginBottom:4 }}>
            {name} ({d.english})
            {isYours && (
              <span style={{
                marginLeft:10, fontSize:11, fontWeight:600, color:'var(--purple-400)',
                background:'rgba(139,92,246,0.15)', padding:'2px 10px', borderRadius:999,
              }}>Your Sign</span>
            )}
          </h3>
          <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
            Ruler: <strong style={{ color:rc }}>{d.ruler}</strong> ·
            Element: <strong>{d.element}</strong> ·
            Quality: <strong>{d.quality}</strong>
          </div>
        </div>
        <button onClick={onClose} style={{
          background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:'50%', width:32, height:32,
          color:'var(--text-muted)', cursor:'pointer', fontSize:16,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>✕</button>
      </div>

      <div style={{ padding:'24px 28px' }}>
        {/* Description */}
        <div style={{ marginBottom:24 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:8, marginBottom:12,
            paddingBottom:10, borderBottom:`1px solid ${rc}22`,
          }}>
            <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(${rc}, ${ec})` }}/>
            <span style={{ fontSize:12, fontWeight:700, color:rc, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Moon in {d.english}
            </span>
          </div>
          <p style={{ fontSize:15, lineHeight:2, color:'var(--text-secondary)', fontStyle:'italic' }}>
            {d.desc}
          </p>
        </div>

        {/* Traits */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>Core Traits</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {d.traits.map(trait=>(
              <span key={trait} style={{
                padding:'5px 14px', borderRadius:999,
                background:rc+'15', color:rc, border:`1px solid ${rc}33`, fontSize:12, fontWeight:600,
              }}>{trait}</span>
            ))}
          </div>
        </div>

        {/* Lucky */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:20 }}>
          {[['🎨',d.color,'Color'],['💎',d.gem,'Gem'],['🔢',d.number,'Number']].map(([icon,val,label])=>(
            <div key={label} style={{
              padding:'12px', textAlign:'center',
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)', borderRadius:12,
            }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:13, fontWeight:700 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Compatible */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Compatible Moon Signs</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {d.compatible.map(cr=>{
              const cd = RASHI_DATA[cr];
              const cc = cd ? RULER_COLORS[cd.ruler] : '#a78bfa';
              return (
                <span key={cr} style={{
                  padding:'4px 12px', borderRadius:999,
                  background:cc+'15', color:cc, border:`1px solid ${cc}33`,
                  fontSize:12, fontWeight:500,
                }}>{cd?.symbol} {cr}</span>
              );
            })}
          </div>
        </div>

        {/* Famous */}
        <div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Famous Natives</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {d.famous.map(person=>(
              <span key={person} style={{
                padding:'5px 14px', borderRadius:999,
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
                fontSize:12, color:'var(--text-secondary)',
              }}>🌟 {person}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}