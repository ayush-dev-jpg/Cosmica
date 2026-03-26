// src/pages/Nakshatra.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const COUNTRIES = [
  'India','USA','UK','Canada','Australia','UAE','Singapore',
  'Germany','France','Japan','Nepal','Sri Lanka','Other'
];

const NAKSHATRA_DATA = {
  'Ashwini':         { ruler:'Ketu',    deity:'Ashwini Kumaras', element:'Fire',  quality:'Movable', symbol:'Horse head',         nature:'Deva',     color:'Red',         gem:"Cat's Eye",      number:7, compatible:['Ashwini','Punarvasu','Pushya','Vishakha','Anuradha','Shravana'],   famous:['Sachin Tendulkar','Deepika Padukone','Amitabh Bachchan'] },
  'Bharani':         { ruler:'Venus',   deity:'Yama',            element:'Earth', quality:'Fixed',   symbol:'Yoni',               nature:'Manushya', color:'Red/Pink',    gem:'Diamond',        number:6, compatible:['Bharani','Rohini','Hasta','Swati','Purva Phalguni'],               famous:['Hrithik Roshan','Shah Rukh Khan','Priyanka Chopra'] },
  'Krittika':        { ruler:'Sun',     deity:'Agni',            element:'Fire',  quality:'Mixed',   symbol:'Razor/flame',        nature:'Rakshasa', color:'White/Red',   gem:'Ruby',           number:1, compatible:['Krittika','Rohini','Uttara Phalguni','Uttara Ashadha','Uttara Bhadra'], famous:['Narendra Modi','Indira Gandhi','Subhas Chandra Bose'] },
  'Rohini':          { ruler:'Moon',    deity:'Brahma',          element:'Earth', quality:'Fixed',   symbol:'Chariot',            nature:'Manushya', color:'White',       gem:'Pearl',          number:2, compatible:['Rohini','Mrigashira','Magha','Hasta','Shravana'],                  famous:['Sonia Gandhi','Aishwarya Rai','Ratan Tata'] },
  'Mrigashira':      { ruler:'Mars',    deity:'Soma',            element:'Earth', quality:'Soft',    symbol:'Deer head',          nature:'Deva',     color:'Silver/Gray', gem:'Coral',          number:9, compatible:['Mrigashira','Chitra','Dhanishta','Ashwini','Anuradha'],            famous:['Virat Kohli','Aamir Khan','Madhuri Dixit'] },
  'Ardra':           { ruler:'Rahu',    deity:'Rudra',           element:'Air',   quality:'Sharp',   symbol:'Teardrop',           nature:'Manushya', color:'Green',       gem:'Hessonite',      number:4, compatible:['Ardra','Punarvasu','Swati','Shatabhisha','Purva Bhadra'],          famous:['Rajinikanth','Kangana Ranaut','Bill Gates'] },
  'Punarvasu':       { ruler:'Jupiter', deity:'Aditi',           element:'Air',   quality:'Movable', symbol:'Quiver of arrows',   nature:'Deva',     color:'Yellow',      gem:'Yellow Sapphire',number:3, compatible:['Punarvasu','Pushya','Vishakha','Uttara Bhadra','Revati'],        famous:['APJ Abdul Kalam','Sundar Pichai','Mukesh Ambani'] },
  'Pushya':          { ruler:'Saturn',  deity:'Brihaspati',      element:'Water', quality:'Light',   symbol:'Lotus',              nature:'Deva',     color:'Red',         gem:'Blue Sapphire',  number:8, compatible:['Pushya','Punarvasu','Anuradha','Shravana','Revati'],               famous:['Mahatma Gandhi','Lata Mangeshkar','Dhirubhai Ambani'] },
  'Ashlesha':        { ruler:'Mercury', deity:'Nagas',           element:'Water', quality:'Sharp',   symbol:'Coiled serpent',     nature:'Rakshasa', color:'Black/Red',   gem:'Emerald',        number:5, compatible:['Ashlesha','Jyeshtha','Magha','Mula','Purva Phalguni'],             famous:['Steve Jobs','Jawaharlal Nehru','Rekha'] },
  'Magha':           { ruler:'Ketu',    deity:'Pitris',          element:'Fire',  quality:'Fierce',  symbol:'Throne',             nature:'Rakshasa', color:'Ivory',       gem:"Cat's Eye",      number:7, compatible:['Magha','Purva Phalguni','Vishakha','Jyeshtha','Purva Ashadha'],   famous:['Barack Obama','Ratan Tata','Atal Bihari Vajpayee'] },
  'Purva Phalguni':  { ruler:'Venus',   deity:'Bhaga',           element:'Fire',  quality:'Fierce',  symbol:'Hammock',            nature:'Manushya', color:'Light Pink',  gem:'Diamond',        number:6, compatible:['Purva Phalguni','Uttara Phalguni','Hasta','Magha','Bharani'],      famous:['Amitabh Bachchan','Shahrukh Khan','Katrina Kaif'] },
  'Uttara Phalguni': { ruler:'Sun',     deity:'Aryaman',         element:'Fire',  quality:'Fixed',   symbol:'Bed/cot legs',       nature:'Manushya', color:'Bright Red',  gem:'Ruby',           number:1, compatible:['Uttara Phalguni','Uttara Ashadha','Uttara Bhadra','Krittika','Rohini'], famous:['Mother Teresa','Swami Vivekananda','Indira Gandhi'] },
  'Hasta':           { ruler:'Moon',    deity:'Savitr',          element:'Earth', quality:'Light',   symbol:'Hand',               nature:'Deva',     color:'Deep Green',  gem:'Pearl',          number:2, compatible:['Hasta','Rohini','Shravana','Bharani','Swati'],                     famous:['Narendra Modi','Kalpana Chawla','AR Rahman'] },
  'Chitra':          { ruler:'Mars',    deity:'Vishwakarma',     element:'Fire',  quality:'Soft',    symbol:'Bright jewel',       nature:'Rakshasa', color:'Black',       gem:'Coral',          number:9, compatible:['Chitra','Mrigashira','Dhanishta','Vishakha','Swati'],              famous:['Leonardo da Vinci','Picasso','Mira Nair'] },
  'Swati':           { ruler:'Rahu',    deity:'Vayu',            element:'Air',   quality:'Movable', symbol:'Young plant',        nature:'Deva',     color:'Black',       gem:'Hessonite',      number:4, compatible:['Swati','Ardra','Shatabhisha','Hasta','Chitra'],                    famous:['Warren Buffett','Jeff Bezos','Elon Musk'] },
  'Vishakha':        { ruler:'Jupiter', deity:'Indra-Agni',      element:'Fire',  quality:'Mixed',   symbol:'Triumphal arch',     nature:'Rakshasa', color:'Golden',      gem:'Yellow Sapphire',number:3, compatible:['Vishakha','Anuradha','Punarvasu','Magha','Chitra'],              famous:['Dhirubhai Ambani','Sachin Tendulkar','Azim Premji'] },
  'Anuradha':        { ruler:'Saturn',  deity:'Mitra',           element:'Water', quality:'Soft',    symbol:'Lotus/staff',        nature:'Deva',     color:'Red/Brown',   gem:'Blue Sapphire',  number:8, compatible:['Anuradha','Vishakha','Jyeshtha','Mrigashira','Pushya'],           famous:['Sunil Gavaskar','Laxmi Mittal','MS Dhoni'] },
  'Jyeshtha':        { ruler:'Mercury', deity:'Indra',           element:'Water', quality:'Sharp',   symbol:'Circular amulet',   nature:'Rakshasa', color:'Cream/Red',   gem:'Emerald',        number:5, compatible:['Jyeshtha','Anuradha','Ashlesha','Mula','Shatabhisha'],             famous:['Indira Gandhi','Albert Einstein','Nikola Tesla'] },
  'Mula':            { ruler:'Ketu',    deity:'Nirrti',          element:'Fire',  quality:'Sharp',   symbol:'Tied roots',         nature:'Rakshasa', color:'Brown/Yellow',gem:"Cat's Eye",      number:7, compatible:['Mula','Purva Ashadha','Ashlesha','Jyeshtha','Purva Bhadra'],      famous:['Osho Rajneesh','Paramahansa Yogananda','Ramakrishna'] },
  'Purva Ashadha':   { ruler:'Venus',   deity:'Apas',            element:'Fire',  quality:'Fierce',  symbol:'Fan/basket',         nature:'Manushya', color:'Black',       gem:'Diamond',        number:6, compatible:['Purva Ashadha','Uttara Ashadha','Mula','Bharani','Purva Phalguni'], famous:['Jawaharlal Nehru','Subhas Bose','Napoleon Bonaparte'] },
  'Uttara Ashadha':  { ruler:'Sun',     deity:'Vishwadevas',     element:'Earth', quality:'Fixed',   symbol:'Elephant tusk',      nature:'Manushya', color:'Copper',      gem:'Ruby',           number:1, compatible:['Uttara Ashadha','Purva Ashadha','Krittika','Uttara Phalguni','Shravana'], famous:['Mahatma Gandhi','Nelson Mandela','Abraham Lincoln'] },
  'Shravana':        { ruler:'Moon',    deity:'Vishnu',          element:'Air',   quality:'Movable', symbol:'Three footprints',   nature:'Deva',     color:'Light Blue',  gem:'Pearl',          number:2, compatible:['Shravana','Rohini','Ashwini','Pushya','Hasta'],                    famous:['APJ Abdul Kalam','Vikram Sarabhai','Chandrashekhar'] },
  'Dhanishta':       { ruler:'Mars',    deity:'Vasus',           element:'Air',   quality:'Movable', symbol:'Drum/flute',         nature:'Rakshasa', color:'Silver',      gem:'Coral',          number:9, compatible:['Dhanishta','Mrigashira','Chitra','Shatabhisha','Purva Bhadra'],   famous:['Sachin Tendulkar','Leander Paes','MS Dhoni'] },
  'Shatabhisha':     { ruler:'Rahu',    deity:'Varuna',          element:'Air',   quality:'Movable', symbol:'Empty circle',       nature:'Rakshasa', color:'Blue/Green',  gem:'Hessonite',      number:4, compatible:['Shatabhisha','Ardra','Swati','Dhanishta','Purva Bhadra'],         famous:['Nikola Tesla','Alan Turing','Carl Sagan'] },
  'Purva Bhadra':    { ruler:'Jupiter', deity:'Aja Ekapada',     element:'Air',   quality:'Fixed',   symbol:'Sword/two faces',    nature:'Manushya', color:'Silver',      gem:'Yellow Sapphire',number:3, compatible:['Purva Bhadra','Uttara Bhadra','Revati','Ardra','Shatabhisha'],   famous:['Dalai Lama','Ramana Maharshi','Vivekananda'] },
  'Uttara Bhadra':   { ruler:'Saturn',  deity:'Ahir Budhnya',    element:'Water', quality:'Fixed',   symbol:'Twin serpents',      nature:'Manushya', color:'Purple',      gem:'Blue Sapphire',  number:8, compatible:['Uttara Bhadra','Purva Bhadra','Revati','Pushya','Uttara Phalguni'], famous:['Buddha','Ramakrishna Paramahamsa','Sri Aurobindo'] },
  'Revati':          { ruler:'Mercury', deity:'Pushan',          element:'Water', quality:'Soft',    symbol:'Fish/drum',          nature:'Deva',     color:'Brown',       gem:'Emerald',        number:5, compatible:['Revati','Uttara Bhadra','Purva Bhadra','Ashwini','Punarvasu'],    famous:['Rabindranath Tagore','Sarojini Naidu','Rukmini Devi'] },
};

const RULER_COLORS = {
  Sun:'#f59e0b', Moon:'#60a5fa', Mars:'#f87171', Mercury:'#34d399',
  Jupiter:'#c084fc', Venus:'#f472b6', Saturn:'#94a3b8',
  Rahu:'#818cf8', Ketu:'#fb923c'
};
const ELEMENT_COLORS = { Fire:'#f87171', Earth:'#86efac', Air:'#93c5fd', Water:'#c4b5fd' };
const ELEMENT_EMOJI  = { Fire:'🔥', Earth:'🌍', Air:'💨', Water:'💧' };

const PADA_MEANINGS = {
  1:'Falls in Aries Navamsa — this pada brings tremendous drive, ambition, and a pioneering spirit. Natives are natural initiators who charge ahead fearlessly. Leadership comes naturally, and there is an innate desire to be first in everything they pursue.',
  2:'Falls in Taurus Navamsa — this pada brings stability, sensuality, and a deep appreciation for beauty and comfort. Natives are patient builders who create lasting foundations. Material security matters deeply, and artistic sensibilities are often pronounced.',
  3:'Falls in Gemini Navamsa — this pada brings exceptional communication skills, intellectual curiosity, and adaptability. Natives are witty, versatile, and eternally curious. They excel in fields requiring mental agility, writing, or connecting with many people.',
  4:'Falls in Cancer Navamsa — this pada brings deep emotional intelligence, powerful intuition, and a nurturing heart. Natives are profoundly empathetic and family-oriented. Their inner world is rich and complex, and they often possess psychic or healing abilities.',
};

const NAKSHATRA_DESCRIPTIONS = {
  'Ashwini':'Ashwini is the first of the 27 Nakshatras, and its energy is therefore raw, primal, and full of the enthusiasm of beginnings. Ruled by Ketu and presided over by the divine twin physicians known as the Ashwini Kumaras, this star carries the essence of healing, speed, and miraculous transformation. Those born under Ashwini possess an almost electric vitality — they move quickly, think quickly, and often achieve results that others consider impossible. Their healing touch, whether literal or metaphorical, can restore what was broken.',
  'Bharani':'Bharani is the nakshatra of carrying, endurance, and transformation through struggle. Ruled by Venus and governed by Yama, the lord of death and dharma, Bharani natives carry within them an understanding of life\'s deepest cycles. They know what it means to hold something precious and bear it through difficulty. This star bestows tremendous creative power and sensuality, but also demands that its natives face the consequences of their actions with courage and integrity.',
  'Rohini':'Rohini is perhaps the most beloved of all Nakshatras — the Moon\'s favourite dwelling place. Ruled by the Moon itself and presided over by Brahma the creator, Rohini natives possess an extraordinary magnetism, beauty, and creative force. They are natural artists, builders, and lovers of all things beautiful and abundant. The earth loves them and they love the earth. Material comforts come naturally, and their presence often brings a sense of fertility and growth to everything around them.',
  'Krittika':'Krittika is the star of purification, sharp discernment, and the courage to cut away what is false. Ruled by the Sun and presided over by Agni, the fire deity, Krittika bestows a razor-sharp intellect and an uncompromising commitment to truth. Natives of this star are natural leaders who cannot tolerate pretence or mediocrity. Their fiery nature may make them demanding, but it also makes them extraordinarily effective at achieving what they set their minds upon.',
  'Mrigashira':'Mrigashira is the nakshatra of the eternal seeker — gentle, curious, and forever in search of something just beyond the horizon. Ruled by Mars and presided over by Soma, the Moon god, this star creates beings who are simultaneously tender and fierce, always questing for beauty, knowledge, or the perfect experience. Like the deer whose head it symbolises, Mrigashira natives are alert, graceful, and drawn toward whatever captures their imagination.',
};

function NakshatraDetailPanel({ name, onClose, isYours }) {
  const bn = NAKSHATRA_DATA[name];
  const [knowledge, setKnowledge] = useState(null);
  const [knLoading, setKnLoading] = useState(true);

  useEffect(() => {
    setKnLoading(true);
    setKnowledge(null);
    api.get(`/nakshatra/knowledge/${encodeURIComponent(name)}`)
      .then(res => setKnowledge(res.data.your_knowledge))
      .catch(() => setKnowledge(null))
      .finally(() => setKnLoading(false));
  }, [name]);

  if (!bn) return null;
  const brc  = RULER_COLORS[bn.ruler];
  const bec  = ELEMENT_COLORS[bn.element];
  const desc = NAKSHATRA_DESCRIPTIONS[name];

  return (
    <div style={{
      marginTop:16,
      borderRadius:20,
      overflow:'hidden',
      border:`1px solid ${brc}33`,
      background:'var(--bg-card)',
      boxShadow:`0 0 40px ${brc}12`,
    }}>
      {/* Banner */}
      <div style={{
        padding:'28px 28px 24px',
        background:`linear-gradient(135deg, ${brc}20 0%, ${bec}12 50%, transparent 100%)`,
        borderBottom:`1px solid ${brc}22`,
        position:'relative',
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:16, right:16,
          background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:'50%', width:32, height:32,
          color:'var(--text-muted)', cursor:'pointer', fontSize:16,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>✕</button>

        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
          <div style={{
            width:56, height:56, borderRadius:16,
            background:`linear-gradient(135deg, ${brc}33, ${bec}22)`,
            border:`1px solid ${brc}44`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:24,
          }}>
            {ELEMENT_EMOJI[bn.element]}
          </div>
          <div>
            <div style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>
              Nakshatra {Object.keys(NAKSHATRA_DATA).indexOf(name)+1} of 27
            </div>
            <h3 style={{ fontSize:28, fontWeight:800, color:brc, lineHeight:1 }}>
              {name}
              {isYours && (
                <span style={{
                  marginLeft:10, fontSize:11, fontWeight:600,
                  color:'var(--purple-400)', background:'rgba(139,92,246,0.15)',
                  padding:'3px 10px', borderRadius:999, verticalAlign:'middle',
                }}>Your Star</span>
              )}
            </h3>
          </div>
        </div>

        {/* Attribute pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[
            ['Ruler',   bn.ruler,   brc],
            ['Deity',   bn.deity,   '#a78bfa'],
            ['Element', bn.element, bec],
            ['Quality', bn.quality, '#f59e0b'],
            ['Nature',  bn.nature,  '#34d399'],
            ['Symbol',  bn.symbol,  '#94a3b8'],
          ].map(([label,val,col])=>(
            <div key={label} style={{
              padding:'5px 14px', borderRadius:999,
              background:col+'18', border:`1px solid ${col}44`,
              fontSize:12, display:'flex', gap:5, alignItems:'center',
            }}>
              <span style={{ color:'var(--text-muted)', fontSize:10 }}>{label}</span>
              <span style={{ fontWeight:700, color:col }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'24px 28px' }}>

        {/* Static description (always shown) */}
        {desc && (
          <div style={{ marginBottom:24 }}>
            <div style={{
              display:'flex', alignItems:'center', gap:8, marginBottom:12,
              paddingBottom:10, borderBottom:`1px solid ${brc}22`,
            }}>
              <div style={{
                width:3, height:20, borderRadius:2,
                background:`linear-gradient(${brc}, ${bec})`,
              }}/>
              <span style={{ fontSize:13, fontWeight:700, color:brc, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                The Essence of {name}
              </span>
            </div>
            <p style={{
              fontSize:15, lineHeight:2, color:'var(--text-secondary)',
              fontStyle:'italic', letterSpacing:'0.01em',
            }}>
              {desc}
            </p>
          </div>
        )}

        {/* YOUR knowledge */}
        {knLoading ? (
          <div style={{ textAlign:'center', padding:'20px 0', marginBottom:24 }}>
            <div className="spinner" style={{ margin:'0 auto 8px', width:22, height:22, borderWidth:2 }}/>
            <p style={{ color:'var(--text-muted)', fontSize:12 }}>Loading knowledge...</p>
          </div>
        ) : knowledge ? (
          <div style={{ marginBottom:24 }}>
            <div style={{
              display:'flex', alignItems:'center', gap:8, marginBottom:12,
              paddingBottom:10, borderBottom:'1px solid rgba(139,92,246,0.2)',
            }}>
              <div style={{ width:3, height:20, borderRadius:2, background:'linear-gradient(#a78bfa, #7c3aed)' }}/>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--purple-400)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                Astrologer's Knowledge
              </span>
            </div>
            <p style={{ fontSize:15, lineHeight:2, color:'var(--text-primary)', whiteSpace:'pre-wrap', letterSpacing:'0.01em' }}>
              {knowledge}
            </p>
          </div>
        ) : null}

        {/* Lucky section */}
        <div style={{ marginBottom:24 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:8, marginBottom:14,
            paddingBottom:10, borderBottom:`1px solid rgba(245,158,11,0.2)`,
          }}>
            <div style={{ width:3, height:20, borderRadius:2, background:'linear-gradient(#f59e0b, #d97706)' }}/>
            <span style={{ fontSize:13, fontWeight:700, color:'#f59e0b', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Lucky Details
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[
              ['🎨','Lucky Color',  bn.color,  '#f472b6'],
              ['💎','Gemstone',     bn.gem,    '#a78bfa'],
              ['🔢','Lucky Number', bn.number, '#f59e0b'],
            ].map(([icon,label,val,col])=>(
              <div key={label} style={{
                padding:'14px 12px', textAlign:'center',
                background:`${col}0d`, border:`1px solid ${col}28`,
                borderRadius:12,
              }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:col }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compatible */}
        <div style={{ marginBottom:24 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:8, marginBottom:12,
            paddingBottom:10, borderBottom:'1px solid rgba(52,211,153,0.2)',
          }}>
            <div style={{ width:3, height:20, borderRadius:2, background:'linear-gradient(#34d399, #059669)' }}/>
            <span style={{ fontSize:13, fontWeight:700, color:'#34d399', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Most Compatible
            </span>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {bn.compatible.map(cn=>{
              const cc = NAKSHATRA_DATA[cn] ? RULER_COLORS[NAKSHATRA_DATA[cn].ruler] : '#a78bfa';
              return (
                <span key={cn} style={{
                  padding:'6px 14px', borderRadius:999,
                  background:cc+'15', color:cc, border:`1px solid ${cc}44`,
                  fontSize:13, fontWeight:500,
                }}>✦ {cn}</span>
              );
            })}
          </div>
        </div>

        {/* Famous */}
        <div>
          <div style={{
            display:'flex', alignItems:'center', gap:8, marginBottom:12,
            paddingBottom:10, borderBottom:'1px solid rgba(96,165,250,0.2)',
          }}>
            <div style={{ width:3, height:20, borderRadius:2, background:'linear-gradient(#60a5fa, #3b82f6)' }}/>
            <span style={{ fontSize:13, fontWeight:700, color:'#60a5fa', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Famous Natives
            </span>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {bn.famous.map(person=>(
              <div key={person} style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'8px 14px', borderRadius:999,
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  background:`linear-gradient(135deg, ${brc}44, ${bec}33)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700, color:brc, flexShrink:0,
                }}>{person[0]}</div>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{person}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowseGrid({ selectedNak, browsedNak, setBrowsedNak }) {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:8 }}>
        {Object.entries(NAKSHATRA_DATA).map(([name, data], i)=>{
          const isSelected = name === selectedNak;
          const isBrowsing = name === browsedNak;
          const rc = RULER_COLORS[data.ruler];
          const ec = ELEMENT_COLORS[data.element];
          return (
            <div key={name}
              onClick={()=>setBrowsedNak(isBrowsing ? null : name)}
              style={{
                padding:'12px 14px', borderRadius:12,
                border:`1px solid ${isSelected ? rc+'88' : isBrowsing ? rc+'55' : 'rgba(255,255,255,0.07)'}`,
                background: isSelected
                  ? `linear-gradient(135deg, ${rc}20, ${ec}12)`
                  : isBrowsing
                  ? `${rc}0f`
                  : 'rgba(255,255,255,0.02)',
                cursor:'pointer', transition:'all 0.2s',
                display:'flex', alignItems:'center', gap:10,
              }}>
              <div style={{
                width:28, height:28, borderRadius:8, flexShrink:0,
                background:`linear-gradient(135deg, ${rc}33, ${ec}22)`,
                border:`1px solid ${rc}33`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13,
              }}>
                {ELEMENT_EMOJI[data.element]}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{
                  fontSize:12, fontWeight: isSelected||isBrowsing ? 700 : 500,
                  color: isSelected||isBrowsing ? rc : 'var(--text-primary)',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}>
                  {name} {isSelected ? '★' : ''}
                </div>
                <div style={{ fontSize:10, color:'var(--text-muted)' }}>
                  {i+1} · {data.ruler}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {browsedNak && (
        <NakshatraDetailPanel
          name={browsedNak}
          isYours={browsedNak === selectedNak}
          onClose={()=>setBrowsedNak(null)}
        />
      )}
    </div>
  );
}

export default function Nakshatra() {
  const { isLoggedIn } = useAuth();
  const [form, setForm]             = useState({ date:'', time:'', city:'', country:'India' });
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('overview');
  const [browsedNak, setBrowsedNak] = useState(null);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/nakshatra/find', form);
      setResult(res.data);
      setActiveTab('overview');
      setBrowsedNak(null);
      window.scrollTo({ top:0, behavior:'smooth' });
    } catch(err) {
      setError(err.response?.data?.detail || 'Could not calculate. Please check your details.');
    } finally { setLoading(false); }
  }

  const nak     = result ? NAKSHATRA_DATA[result.nakshatra_name] : null;
  const rulCol  = nak ? RULER_COLORS[nak.ruler]    : '#c084fc';
  const elemCol = nak ? ELEMENT_COLORS[nak.element] : '#c084fc';

  const TABS = [
    { id:'overview',   label:'⭐ Overview' },
    { id:'knowledge',  label:'📖 Reading' },
    { id:'lucky',      label:'🍀 Lucky' },
    { id:'compatible', label:'💫 Compatible' },
    { id:'famous',     label:'🌟 Famous' },
    { id:'browse',     label:'🌌 Browse All' },
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
          <Link to="/chart" className="btn btn-ghost" style={{ padding:'8px 14px', fontSize:13 }}>🪐 Kundli</Link>
          {isLoggedIn
            ? <Link to="/dashboard" className="btn btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>Dashboard</Link>
            : <Link to="/signup"    className="btn btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>Sign Up Free</Link>
          }
        </div>
      </nav>

      <main style={{ maxWidth:860, margin:'0 auto', padding:'48px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:44, position:'relative' }}>
          {/* Ambient glow */}
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:400, height:200, borderRadius:'50%',
            background:'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)',
            pointerEvents:'none',
          }}/>
          <div style={{ fontSize:56, marginBottom:14 }}>⭐</div>
          <h1 className="font-cinzel gradient-text" style={{
            fontSize:'clamp(28px,5vw,52px)',
            marginBottom:16, letterSpacing:'0.02em',
          }}>
            Discover Your Nakshatra
          </h1>
          <p style={{
            color:'var(--text-secondary)', fontSize:16, lineHeight:1.9,
            maxWidth:560, margin:'0 auto',
          }}>
            In Vedic astrology, your Nakshatra — or lunar mansion — is the star cluster
            the Moon occupied at the moment of your birth. It is considered more
            personal and revealing than even your Sun sign.
          </p>
        </div>

        {/* Form */}
        <div style={{
          background:'var(--bg-card)',
          border:'1px solid rgba(139,92,246,0.2)',
          borderRadius:20, padding:28, marginBottom:32,
          boxShadow:'0 0 40px rgba(139,92,246,0.06)',
        }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Find Your Birth Star</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:20, lineHeight:1.6 }}>
            Enter your exact birth details for an accurate calculation using Swiss Ephemeris
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
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Use local birth time for accuracy</p>
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
              {loading ? <><span className="spinner"/> Calculating your birth star...</> : '⭐ Reveal My Nakshatra'}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div className="spinner" style={{ width:44, height:44, margin:'0 auto 16px', borderWidth:3 }}/>
            <h3 style={{ marginBottom:6 }}>Reading the stars...</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:14 }}>
              Calculating the Moon's exact position at your birth moment
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && result && nak && (
          <div className="fade-in">

            {/* Hero result card */}
            <div style={{
              borderRadius:20, overflow:'hidden',
              border:`1px solid ${rulCol}33`,
              marginBottom:20,
              boxShadow:`0 0 60px ${rulCol}10`,
            }}>
              {/* Big banner */}
              <div style={{
                padding:'40px 32px 32px',
                background:`linear-gradient(135deg, ${rulCol}25 0%, ${elemCol}15 60%, rgba(15,12,26,0.8) 100%)`,
                borderBottom:`1px solid ${rulCol}22`,
                textAlign:'center', position:'relative',
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
                  YOUR BIRTH STAR
                </div>
                <h2 className="font-cinzel" style={{
                  fontSize:'clamp(36px,6vw,60px)', fontWeight:800,
                  color:rulCol, marginBottom:8, lineHeight:1,
                  textShadow:`0 0 40px ${rulCol}44`,
                }}>
                  {result.nakshatra_name}
                </h2>
                <p style={{ color:'var(--text-secondary)', fontSize:16, marginBottom:24 }}>
                  Pada {result.pada} · {nak.symbol} · {nak.element} Element
                </p>
                <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                  {[
                    ['Ruler',   nak.ruler,   rulCol],
                    ['Element', nak.element, elemCol],
                    ['Deity',   nak.deity,   '#a78bfa'],
                    ['Nature',  nak.nature,  '#34d399'],
                    ['Quality', nak.quality, '#f59e0b'],
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

              {/* Moon details bar */}
              <div style={{
                padding:'16px 32px', display:'flex', gap:32, flexWrap:'wrap',
                background:'var(--bg-card)',
              }}>
                {[
                  ['Moon Rashi',     result.moon_rashi],
                  ['Moon Longitude', `${result.moon_degree?.toFixed(3)}°`],
                  ['Pada',           `${result.pada} of 4`],
                  ['Star Number',    `${Object.keys(NAKSHATRA_DATA).indexOf(result.nakshatra_name)+1} of 27`],
                ].map(([label,val])=>(
                  <div key={label}>
                    <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</div>
                    <div style={{ fontSize:15, fontWeight:700 }}>{val}</div>
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
                  padding:'11px 16px', background:'none', border:'none',
                  borderBottom: activeTab===tab.id ? `2px solid ${rulCol}` : '2px solid transparent',
                  color: activeTab===tab.id ? rulCol : 'var(--text-secondary)',
                  fontWeight: activeTab===tab.id ? 700 : 400,
                  fontSize:13, cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap',
                  transition:'all 0.15s',
                }}>{tab.label}</button>
              ))}
            </div>

            {/* Overview */}
            {activeTab==='overview' && (
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:20, padding:28,
              }}>
                {/* Essence paragraph */}
                {NAKSHATRA_DESCRIPTIONS[result.nakshatra_name] && (
                  <div style={{ marginBottom:24 }}>
                    <div style={{
                      display:'flex', alignItems:'center', gap:8, marginBottom:14,
                      paddingBottom:12, borderBottom:`1px solid ${rulCol}22`,
                    }}>
                      <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(${rulCol}, ${elemCol})` }}/>
                      <span style={{ fontSize:13, fontWeight:700, color:rulCol, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                        The Essence of {result.nakshatra_name}
                      </span>
                    </div>
                    <p style={{ fontSize:16, lineHeight:2.1, color:'var(--text-secondary)', fontStyle:'italic' }}>
                      {NAKSHATRA_DESCRIPTIONS[result.nakshatra_name]}
                    </p>
                  </div>
                )}

                {/* Pada meaning */}
                <div style={{ marginBottom:24 }}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:8, marginBottom:14,
                    paddingBottom:12, borderBottom:'1px solid rgba(139,92,246,0.2)',
                  }}>
                    <div style={{ width:3, height:20, borderRadius:2, background:'linear-gradient(#a78bfa, #7c3aed)' }}/>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--purple-400)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                      Your Pada — {['First','Second','Third','Fourth'][result.pada-1]} Quarter
                    </span>
                  </div>
                  <p style={{ fontSize:15, lineHeight:2, color:'var(--text-secondary)' }}>
                    {PADA_MEANINGS[result.pada]}
                  </p>
                </div>

                {/* Attribute grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10 }}>
                  {[
                    ['Symbol',          nak.symbol,  '🔮'],
                    ['Ruling Planet',   nak.ruler,   '🪐'],
                    ['Presiding Deity', nak.deity,   '🙏'],
                    ['Nature (Gana)',   nak.nature,  '🌿'],
                    ['Element',         nak.element, ELEMENT_EMOJI[nak.element]],
                    ['Quality',         nak.quality, '✨'],
                  ].map(([label,val,icon])=>(
                    <div key={label} style={{
                      padding:'14px 16px',
                      background:'rgba(255,255,255,0.03)',
                      border:'1px solid rgba(255,255,255,0.07)',
                      borderRadius:12,
                    }}>
                      <div style={{ fontSize:18, marginBottom:6 }}>{icon}</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                      <div style={{ fontSize:14, fontWeight:600 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reading */}
            {activeTab==='knowledge' && (
              <div>
                {result.your_knowledge ? (
                  <div style={{
                    background:'var(--bg-card)',
                    border:`1px solid ${rulCol}33`,
                    borderRadius:20, padding:28, marginBottom:16,
                    boxShadow:`0 0 30px ${rulCol}08`,
                  }}>
                    <div style={{
                      display:'flex', alignItems:'center', gap:8, marginBottom:16,
                      paddingBottom:12, borderBottom:`1px solid ${rulCol}22`,
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
                    <p>No personal knowledge added for {result.nakshatra_name} yet.</p>
                  </div>
                )}
                {result.ai_reading && (
                  <div style={{
                    background:'var(--bg-card)', border:'1px solid rgba(99,102,241,0.25)',
                    borderRadius:20, padding:28,
                    boxShadow:'0 0 30px rgba(99,102,241,0.05)',
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
                  According to Vedic tradition, wearing your Nakshatra's associated color and gemstone,
                  and aligning important decisions with your lucky number, can strengthen the positive
                  cosmic energies flowing through your chart.
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14 }}>
                  {[
                    { icon:'🎨', label:'Lucky Color',   value:nak.color,           col:rulCol,   desc:'Wear this color to attract positive energy' },
                    { icon:'💎', label:'Lucky Gemstone',value:nak.gem,             col:elemCol,  desc:'Set in gold or silver for best results' },
                    { icon:'🔢', label:'Lucky Number',  value:nak.number.toString(),col:'#f59e0b',desc:'Use for important dates and decisions' },
                    { icon:'⭐', label:'Ruling Planet', value:nak.ruler,           col:rulCol,   desc:'Strengthen through mantras and rituals' },
                    { icon:'🙏', label:'Deity',         value:nak.deity,           col:'#a78bfa',desc:'Offer prayers for blessings' },
                    { icon:'🌿', label:'Gana (Nature)', value:nak.nature,          col:'#34d399', desc:'Guides compatibility and temperament' },
                  ].map(item=>(
                    <div key={item.label} style={{
                      padding:'20px 16px', textAlign:'center',
                      background:`${item.col}0c`, border:`1px solid ${item.col}2a`,
                      borderRadius:16,
                    }}>
                      <div style={{ fontSize:30, marginBottom:10 }}>{item.icon}</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{item.label}</div>
                      <div style={{ fontSize:16, fontWeight:800, color:item.col, marginBottom:8 }}>{item.value}</div>
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
                  In Vedic astrology, Nakshatra compatibility — known as <em>Kuta matching</em> — is the foundation
                  of relationship harmony. The following star clusters share a natural resonance with {result.nakshatra_name},
                  creating ease in communication, shared values, and mutual support.
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                  {nak.compatible.map((compNak,i)=>{
                    const cd = NAKSHATRA_DATA[compNak];
                    const cc = cd ? RULER_COLORS[cd.ruler] : '#a78bfa';
                    const ce = cd ? ELEMENT_COLORS[cd.element] : '#c4b5fd';
                    return (
                      <div key={compNak} style={{
                        padding:'16px', background:`${cc}0d`,
                        border:`1px solid ${cc}2a`, borderRadius:14,
                        display:'flex', alignItems:'center', gap:12,
                      }}>
                        <div style={{
                          width:38, height:38, borderRadius:10, flexShrink:0,
                          background:`linear-gradient(135deg, ${cc}33, ${ce}22)`,
                          border:`1px solid ${cc}44`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:13, fontWeight:700, color:cc,
                        }}>{i+1}</div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:cc }}>{compNak}</div>
                          {cd && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{cd.ruler} · {cd.element}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{
                  marginTop:20, padding:'14px 18px',
                  background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.18)',
                  borderRadius:12, fontSize:13, color:'var(--text-secondary)', lineHeight:1.75,
                }}>
                  ✨ <strong>Note:</strong> Full compatibility assessment in Vedic astrology involves comparing all 36 Kuta points across both horoscopes. This list shows Nakshatras with natural affinity.
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
                  These remarkable individuals share the same birth Nakshatra as you. While every chart is unique,
                  the core energies of {result.nakshatra_name} — its ruler, deity, and elemental nature —
                  leave a recognisable signature on all who are born under its light.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {nak.famous.map(person=>(
                    <div key={person} style={{
                      display:'flex', alignItems:'center', gap:16,
                      padding:'16px 20px', background:'rgba(255,255,255,0.025)',
                      border:'1px solid rgba(255,255,255,0.07)',
                      borderRadius:14,
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
                          {result.nakshatra_name} Nakshatra · Ruled by {nak.ruler}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Browse All */}
            {activeTab==='browse' && (
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:20, padding:28,
              }}>
                <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:18, lineHeight:1.7 }}>
                  Your Nakshatra is marked with ★ — click any star to explore its full details
                </p>
                <BrowseGrid selectedNak={result.nakshatra_name} browsedNak={browsedNak} setBrowsedNak={setBrowsedNak} />
              </div>
            )}
          </div>
        )}

        {/* No result yet — show browse immediately */}
        {!loading && !result && (
          <div style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:20, padding:28,
          }}>
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>🌌 Explore All 27 Nakshatras</h3>
            <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:20, lineHeight:1.7 }}>
              Click any Nakshatra below to discover its ruling planet, presiding deity, compatible stars,
              lucky gemstone, and famous personalities born under it.
            </p>
            <BrowseGrid selectedNak={null} browsedNak={browsedNak} setBrowsedNak={setBrowsedNak} />
          </div>
        )}
      </main>
    </div>
  );
}