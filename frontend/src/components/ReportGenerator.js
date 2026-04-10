// src/components/ReportGenerator.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PLANET_META = {
  Sun:{emoji:'☀️',color:'#f59e0b'},Moon:{emoji:'🌙',color:'#60a5fa'},
  Mars:{emoji:'♂',color:'#f87171'},Mercury:{emoji:'☿',color:'#34d399'},
  Jupiter:{emoji:'♃',color:'#c084fc'},Venus:{emoji:'♀',color:'#f472b6'},
  Saturn:{emoji:'♄',color:'#94a3b8'},Rahu:{emoji:'☊',color:'#818cf8'},
  Ketu:{emoji:'☋',color:'#fb923c'},
};

const RASHIS_SA = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
                   'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHIS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                   'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const REPORT_TYPES = [
  { id:'Full Life Report', emoji:'📖', label:'Full Life Report',
    desc:'30-40 pages covering all life areas with complete planetary analysis', price:'₹999', pages:'35+' },
  { id:'Career Report', emoji:'💼', label:'Career & Finance Report',
    desc:'Deep dive into career, profession, and financial prospects', price:'₹499', pages:'15-20' },
  { id:'Love Report', emoji:'💑', label:'Love & Marriage Report',
    desc:'Relationship patterns, marriage timing, and partnership analysis', price:'₹499', pages:'15-20' },
  { id:'Yearly Forecast', emoji:'🗓️', label:'Yearly Forecast Report',
    desc:'Upcoming year predictions with dasha and transit analysis', price:'₹599', pages:'20-25' },
];

const CHAPTERS = [
  { num:'01', title:'Birth Details & Overview',        icon:'📋' },
  { num:'02', title:'Planetary Positions & Chart',     icon:'🪐' },
  { num:'03', title:'Personality & Constitution',      icon:'🌟' },
  { num:'04', title:'Career & Public Life',            icon:'💼' },
  { num:'05', title:'Wealth & Finance',                icon:'💰' },
  { num:'06', title:'Love & Relationships',            icon:'💑' },
  { num:'07', title:'Health & Longevity',              icon:'🌿' },
  { num:'08', title:'Spirituality & Purpose',          icon:'🙏' },
  { num:'09', title:'Detailed Planetary Readings',     icon:'🔭' },
  { num:'10', title:'Yogas & Special Combinations',   icon:'✨' },
  { num:'11', title:'Remedies & Recommendations',      icon:'🕉️' },
  { num:'12', title:'Closing Notes',                  icon:'🌸' },
];

function ProgressStep({ step, current }) {
  const done   = current > step;
  const active = current === step;
  const color  = done ? '#10b981' : active ? '#c084fc' : 'rgba(255,255,255,0.15)';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{
        width:28, height:28, borderRadius:'50%', flexShrink:0,
        background: done ? '#10b981' : active ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.05)',
        border:`2px solid ${color}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:12, fontWeight:700, color,
        transition:'all 0.3s',
      }}>
        {done ? '✓' : step}
      </div>
    </div>
  );
}

function ReportPreviewCard({ status }) {
  if (!status) return null;
  return (
    <div style={{
      padding:'20px', borderRadius:16,
      background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.06))',
      border:'1px solid rgba(139,92,246,0.3)',
      marginBottom:20,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <div style={{ width:48,height:48,borderRadius:12,background:'rgba(124,58,237,0.2)',
          border:'1px solid rgba(139,92,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>📋</div>
        <div>
          <div style={{ fontWeight:800,fontSize:16 }}>Report Ready to Generate</div>
          <div style={{ fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2 }}>For {status.person_name}</div>
        </div>
        <div style={{ marginLeft:'auto',textAlign:'right' }}>
          <div style={{ fontSize:26,fontWeight:800,color:'#c084fc' }}>~{status.estimated_pages}</div>
          <div style={{ fontSize:10,color:'rgba(255,255,255,0.35)' }}>PAGES</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {[
          {label:'DB Readings',value:status.db_readings,icon:'📚',color:'#c084fc'},
          {label:'AI Sections', value:status.ai_sections,icon:'🤖',color:'#60a5fa'},
          {label:'Chapters',    value:status.chapters,   icon:'📖',color:'#f59e0b'},
        ].map(s=>(
          <div key={s.label} style={{ padding:'12px',borderRadius:10,background:`${s.color}0d`,border:`1px solid ${s.color}22`,textAlign:'center' }}>
            <div style={{ fontSize:18,marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontWeight:800,fontSize:18,color:s.color }}>{s.value}</div>
            <div style={{ fontSize:10,color:'rgba(255,255,255,0.35)' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChapterList() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8 }}>
      {CHAPTERS.map((ch,i)=>(
        <div key={ch.num} style={{
          padding:'10px 12px', borderRadius:10, display:'flex', alignItems:'center', gap:10,
          background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)',
          animation:`fadeUp 0.4s ease ${i*0.04}s both`,
        }}>
          <span style={{ fontSize:16 }}>{ch.icon}</span>
          <div>
            <div style={{ fontSize:9,color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:'0.06em' }}>CH {ch.num}</div>
            <div style={{ fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.75)' }}>{ch.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GeneratingAnimation({ stage }) {
  const stages = [
    {label:'Gathering planetary knowledge from database',icon:'📚'},
    {label:'Analyzing your planetary positions',icon:'🪐'},
    {label:'Generating AI insights for all life areas',icon:'🤖'},
    {label:'Drawing Kundli charts and tables',icon:'📊'},
    {label:'Composing your personalized report',icon:'✍️'},
    {label:'Finalizing and formatting PDF',icon:'📄'},
  ];
  return (
    <div style={{ padding:'32px 20px', textAlign:'center' }}>
      <div style={{ position:'relative', width:80, height:80, margin:'0 auto 20px' }}>
        <div style={{
          width:80, height:80, borderRadius:'50%',
          border:'3px solid rgba(139,92,246,0.15)',
          borderTop:'3px solid #c084fc',
          animation:'spin 1s linear infinite',
          position:'absolute',
        }}/>
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>
          {stages[Math.min(stage,stages.length-1)].icon}
        </div>
      </div>
      <h3 style={{ fontSize:16,fontWeight:700,marginBottom:8 }}>Generating Your Report</h3>
      <p style={{ color:'rgba(255,255,255,0.5)',fontSize:13,marginBottom:20,lineHeight:1.6 }}>
        {stages[Math.min(stage,stages.length-1)].label}...
      </p>
      {/* Progress bar */}
      <div style={{ maxWidth:300, margin:'0 auto 16px', background:'rgba(255,255,255,0.06)', borderRadius:999, height:6, overflow:'hidden' }}>
        <div style={{
          width:`${Math.round((Math.min(stage,stages.length-1)+1)/stages.length*100)}%`,
          height:'100%', background:'linear-gradient(90deg,#7c3aed,#c084fc)',
          borderRadius:999, transition:'width 1s ease',
        }}/>
      </div>
      {/* Stage indicators */}
      <div style={{ display:'flex', justifyContent:'center', gap:6, flexWrap:'wrap', maxWidth:300, margin:'0 auto' }}>
        {stages.map((s,i)=>(
          <div key={i} style={{
            width:8, height:8, borderRadius:'50%',
            background: i <= stage ? '#c084fc' : 'rgba(255,255,255,0.1)',
            transition:'background 0.3s',
          }}/>
        ))}
      </div>
      <p style={{ fontSize:11,color:'rgba(255,255,255,0.25)',marginTop:16 }}>
        This takes 30-60 seconds · Please don't close this page
      </p>
    </div>
  );
}

export default function ReportGenerator({ kundli, lagna, personName, birthDetails, isPremium }) {
  const navigate                       = useNavigate();
  const [selectedType, setSelectedType]= useState('Full Life Report');
  const [status, setStatus]            = useState(null);
  const [generating, setGenerating]    = useState(false);
  const [genStage, setGenStage]        = useState(0);
  const [error, setError]              = useState('');
  const [showChapters, setShowChapters]= useState(false);

  const RASHIS_SA_LOCAL = RASHIS_SA;

  useEffect(() => {
    if (kundli && lagna) checkStatus();
  }, [kundli, lagna]);

  async function checkStatus() {
    try {
      const res = await api.post('/report/preview-status', {
        kundli, lagna,
        person_name:  personName,
        birth_date:   birthDetails?.date || '',
        birth_time:   birthDetails?.time || '',
        birth_place:  `${birthDetails?.city || ''}, ${birthDetails?.country || ''}`,
        report_type:  selectedType,
      });
      setStatus(res.data);
    } catch { /* silent */ }
  }

  async function generateReport() {
    if (!isPremium) { navigate('/pricing'); return; }
    setError(''); setGenerating(true); setGenStage(0);

    // Simulate stage progression
    const interval = setInterval(() => {
      setGenStage(prev => Math.min(prev + 1, 5));
    }, 8000);

    try {
      const res = await api.post('/report/generate', {
        kundli, lagna,
        person_name:  personName,
        birth_date:   birthDetails?.date || '',
        birth_time:   birthDetails?.time || '',
        birth_place:  `${birthDetails?.city || ''}, ${birthDetails?.country || ''}`,
        report_type:  selectedType,
      }, { responseType:'blob', timeout:120000 });

      clearInterval(interval);

      // Trigger download
      const url  = window.URL.createObjectURL(new Blob([res.data], {type:'application/pdf'}));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `Cosmica_${personName?.replace(/\s+/g,'_')}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      clearInterval(interval);
      setError('Report generation failed. Please try again.');
    } finally {
      setGenerating(false); setGenStage(0);
    }
  }

  if (!kundli || !lagna) return null;

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      {/* Hero header */}
      <div style={{
        padding:'24px', borderRadius:18, marginBottom:20,
        background:'linear-gradient(135deg,rgba(15,10,30,0.9),rgba(30,15,60,0.8))',
        border:'1px solid rgba(139,92,246,0.25)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Decorative background glows */}
        <div style={{ position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(124,58,237,0.12),transparent)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:-30,left:-30,width:100,height:100,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(245,158,11,0.08),transparent)',pointerEvents:'none' }}/>

        <div style={{ position:'relative' }}>
          <div style={{ fontSize:10,fontWeight:700,color:'#c084fc',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8 }}>
            ✦ PREMIUM FEATURE
          </div>
          <h2 style={{ fontSize:'clamp(18px,3vw,24px)',fontWeight:800,marginBottom:6 }}>
            Full Life Report PDF
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)',fontSize:13,lineHeight:1.7,marginBottom:16,maxWidth:500 }}>
            A complete 30-40 page personalized Vedic astrology report — combining your astrologer's knowledge base with AI synthesis — delivered as a beautiful PDF.
          </p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              '📚 DB Knowledge', '🤖 AI Synthesis', '🪐 Kundli Chart',
              '📊 Planet Tables', '12 Chapters', '✨ Yogas Analysis',
            ].map(f=>(
              <span key={f} style={{ padding:'4px 10px',borderRadius:999,fontSize:11,
                background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',
                color:'rgba(255,255,255,0.6)' }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Report type selector */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10 }}>
          Select Report Type
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
          {REPORT_TYPES.map(rt=>{
            const sel = selectedType === rt.id;
            return (
              <button key={rt.id} onClick={()=>setSelectedType(rt.id)} style={{
                padding:'14px', borderRadius:12, border:`2px solid ${sel?'rgba(139,92,246,0.6)':'rgba(255,255,255,0.07)'}`,
                background: sel?'rgba(124,58,237,0.12)':'rgba(255,255,255,0.02)',
                cursor:'pointer', textAlign:'left', color:'inherit', fontFamily:'inherit',
                transition:'all 0.2s',
                boxShadow: sel?'0 0 20px rgba(124,58,237,0.15)':'none',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <span style={{ fontSize:22 }}>{rt.emoji}</span>
                  <span style={{ fontSize:12,fontWeight:700,color:'#c084fc' }}>{rt.price}</span>
                </div>
                <div style={{ fontWeight:700,fontSize:13,marginBottom:4,color:sel?'#c084fc':'rgba(255,255,255,0.8)' }}>{rt.label}</div>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.35)',lineHeight:1.5,marginBottom:6 }}>{rt.desc}</div>
                <div style={{ fontSize:10,color:'rgba(255,255,255,0.25)' }}>~{rt.pages} pages</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status card */}
      <ReportPreviewCard status={status}/>

      {/* What's included */}
      <div style={{ marginBottom:20 }}>
        <button onClick={()=>setShowChapters(!showChapters)} style={{
          width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'14px 16px', borderRadius:12,
          background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)',
          cursor:'pointer', color:'inherit', fontFamily:'inherit',
        }}>
          <span style={{ fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)' }}>📋 What's included in your report ({CHAPTERS.length} chapters)</span>
          <span style={{ fontSize:10,color:'rgba(255,255,255,0.3)',transform:showChapters?'rotate(180deg)':'none',transition:'transform 0.2s',display:'inline-block' }}>▼</span>
        </button>
        {showChapters && (
          <div style={{ marginTop:8 }}>
            <ChapterList/>
          </div>
        )}
      </div>

      {/* Generating animation */}
      {generating && (
        <div style={{ borderRadius:16,border:'1px solid rgba(139,92,246,0.3)',
          background:'rgba(15,10,35,0.9)',marginBottom:20,overflow:'hidden' }}>
          <GeneratingAnimation stage={genStage}/>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding:'12px 16px',borderRadius:10,marginBottom:16,
          background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:13 }}>
          ⚠️ {error}
          <button onClick={()=>setError('')} style={{ marginLeft:10,background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:12 }}>✕</button>
        </div>
      )}

      {/* Generate button */}
      {!generating && (
        <div>
          {isPremium ? (
            <button onClick={generateReport} style={{
              width:'100%', padding:'18px', borderRadius:14, border:'none',
              background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
              color:'white', fontSize:16, fontWeight:700, cursor:'pointer',
              boxShadow:'0 4px 24px rgba(124,58,237,0.4)',
              transition:'transform 0.2s,box-shadow 0.2s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              fontFamily:'inherit',
            }}
              onMouseEnter={e=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 8px 32px rgba(124,58,237,0.5)'}}
              onMouseLeave={e=>{e.target.style.transform='none';e.target.style.boxShadow='0 4px 24px rgba(124,58,237,0.4)'}}
            >
              <span>📄</span>
              Generate & Download PDF Report
              <span style={{ fontSize:13,opacity:0.7,fontWeight:400 }}>(30-60 seconds)</span>
            </button>
          ) : (
            <div>
              <button onClick={()=>navigate('/pricing')} style={{
                width:'100%', padding:'18px', borderRadius:14, border:'none',
                background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
                color:'white', fontSize:16, fontWeight:700, cursor:'pointer',
                boxShadow:'0 4px 24px rgba(124,58,237,0.35)', fontFamily:'inherit',
              }}>
                💎 Upgrade to Premium to Generate Reports
              </button>
              <p style={{ textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.3)',marginTop:8 }}>
                Premium plans start at ₹59/month
              </p>
            </div>
          )}

          {/* Sample report note */}
          <div style={{ marginTop:12,padding:'12px 16px',borderRadius:10,
            background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',
            fontSize:12,color:'rgba(255,255,255,0.3)',lineHeight:1.7 }}>
            💡 The PDF will download automatically after generation. Your report includes all available knowledge from the database plus AI-generated synthesis for each life area. Quality improves as more knowledge is added to the database.
          </div>
        </div>
      )}
    </div>
  );
}