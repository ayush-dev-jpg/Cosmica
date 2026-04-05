// src/components/KundliChart.js
// KEY CHANGE: Your knowledge loads instantly from DB.
// AI reading loads separately only when user clicks "Generate AI Reading"

import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';

const RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
                'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHI_LORD = ['Mars','Venus','Mercury','Moon','Sun','Mercury',
                    'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const RASHI_NATURE = ['Fire','Earth','Air','Water','Fire','Earth',
                      'Air','Water','Fire','Earth','Air','Water'];
const RASHI_COLOR = { Fire:'#e8603c', Earth:'#7ab648', Air:'#5ba4cf', Water:'#9b6bcc' };

const PS = { Sun:'Su',Moon:'Mo',Mars:'Ma',Mercury:'Me',Jupiter:'Ju',Venus:'Ve',Saturn:'Sa',Rahu:'Ra',Ketu:'Ke' };
const PC = { Sun:'#f59e0b',Moon:'#60a5fa',Mars:'#f87171',Mercury:'#34d399',Jupiter:'#c084fc',Venus:'#f472b6',Saturn:'#94a3b8',Rahu:'#818cf8',Ketu:'#fb923c' };

const HOUSE_MEANINGS = [
  'Body, self, personality, appearance, vitality',
  'Wealth, family, speech, accumulated assets',
  'Siblings, courage, communication, short travels',
  'Mother, home, vehicles, property, happiness',
  'Children, intelligence, past life merit, creativity',
  'Enemies, diseases, debts, service, daily work',
  'Spouse, partnership, business, marriage',
  'Longevity, occult, inheritance, transformation',
  'Luck, dharma, father, higher learning, fortune',
  'Career, profession, public status, authority',
  'Gains, elder siblings, friends, aspirations',
  'Expenses, foreign lands, spirituality, liberation'
];

const SCALE=2, W=460, H=420;
const CW=W*SCALE, CH=H*SCALE;
const l=4*SCALE,t=4*SCALE,r=CW-4*SCALE,b=CH-4*SCALE;
const cx=CW/2,cy=CH/2;
const TL=[l,t],TR=[r,t],BR=[r,b],BL=[l,b];
const TM=[cx,t],RM=[r,cy],BM=[cx,b],LM=[l,cy];
const C=[cx,cy];
const ix=(cx-l)*0.48,iy=(cy-t)*0.48;
const P=[cx-ix,cy-iy],Q=[cx+ix,cy-iy],R=[cx+ix,cy+iy],S=[cx-ix,cy+iy];

const HOUSE_POLYS = {
  1:[TM,Q,C,P],2:[TL,TM,P],3:[TL,LM,P],4:[LM,P,C,S],5:[BL,LM,S],6:[BM,BL,S],
  7:[BM,S,C,R],8:[BR,BM,R],9:[RM,BR,R],10:[Q,RM,R,C],11:[TR,RM,Q],12:[TM,TR,Q],
};

function polyCenter(poly){
  return[poly.reduce((a,p)=>a+p[0],0)/poly.length,poly.reduce((a,p)=>a+p[1],0)/poly.length];
}
function pointInPolyScaled(x,y,poly){
  const sx=x*SCALE,sy=y*SCALE;
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const[xi,yi]=poly[i],[xj,yj]=poly[j];
    if(((yi>sy)!==(yj>sy))&&(sx<(xj-xi)*(sy-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
function convertData(kundli){
  const positions={};
  Object.entries(kundli?.planetary_positions||{}).forEach(([name,data])=>{
    const ri=RASHIS.indexOf(data.rashi);
    positions[name]={rashi:ri>=0?ri:0,deg:parseFloat(data.degree_in_rashi)||0,retro:data.retrograde||false};
  });
  const lagnaName=kundli?.lagna?.name||'Mesha';
  const lagnaIndex=RASHIS.indexOf(lagnaName);
  return{positions,lagnaIndex:lagnaIndex>=0?lagnaIndex:0};
}
function planetsInHouse(h,positions,lagnaIdx){
  const ri=(lagnaIdx+h-1)%12;
  return Object.entries(positions).filter(([,d])=>d.rashi===ri).map(([n])=>n);
}

function drawChart(canvas,positions,lagnaIdx,selectedHouse){
  const ctx=canvas.getContext('2d');
  const bgCol='#12101e', outerBorder='rgba(167,139,250,0.9)',
        innerLine='rgba(167,139,250,0.45)', lgnFill='rgba(139,92,246,0.18)',
        selFill='rgba(167,139,250,0.22)';
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle=bgCol; ctx.fillRect(0,0,CW,CH);
  Object.entries(HOUSE_POLYS).forEach(([hStr,poly])=>{
    const h=parseInt(hStr);
    if(h===selectedHouse||h===1){
      ctx.beginPath(); poly.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
      ctx.closePath(); ctx.fillStyle=h===selectedHouse?selFill:lgnFill; ctx.fill();
    }
  });
  function ln(a,b){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
  ctx.strokeStyle=outerBorder; ctx.lineWidth=3*SCALE; ctx.lineJoin='miter';
  ctx.strokeRect(l,t,r-l,b-t);
  ctx.strokeStyle=innerLine; ctx.lineWidth=1.2*SCALE;
  ctx.beginPath();ctx.moveTo(...TM);ctx.lineTo(...RM);ctx.lineTo(...BM);ctx.lineTo(...LM);ctx.closePath();ctx.stroke();
  ln(TL,C);ln(TR,C);ln(BR,C);ln(BL,C);
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let h=1;h<=12;h++){
    const poly=HOUSE_POLYS[h];
    const[pcx,pcy]=polyCenter(poly);
    const ri=(lagnaIdx+h-1)%12;
    const nature=RASHI_NATURE[ri];
    ctx.fillStyle=RASHI_COLOR[nature]+'bb'; ctx.font=`bold ${13*SCALE}px -apple-system,sans-serif`;
    ctx.fillText(ri+1,pcx,pcy-7*SCALE);
    ctx.fillStyle='rgba(196,181,253,0.5)'; ctx.font=`${9*SCALE}px -apple-system,sans-serif`;
    ctx.fillText(RASHI_EN[ri].slice(0,3),pcx,pcy+5*SCALE);
  }
  for(let h=1;h<=12;h++){
    const plist=planetsInHouse(h,positions,lagnaIdx);
    if(!plist.length)continue;
    const[pcx,pcy]=polyCenter(HOUSE_POLYS[h]);
    const lineH=13*SCALE; const totalH=plist.length*lineH;
    let py=pcy+14*SCALE-totalH/2;
    plist.forEach(pname=>{
      const abbr=PS[pname]||pname.slice(0,2);
      const retro=positions[pname]?.retro;
      const col=PC[pname];
      ctx.shadowColor=col+'66';ctx.shadowBlur=4*SCALE;
      ctx.fillStyle=col; ctx.font=`${retro?'italic ':''}bold ${11*SCALE}px -apple-system,sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(abbr+(retro?'℞':''),pcx,py); ctx.shadowBlur=0; py+=lineH;
    });
  }
}

// Collapsible section
function KnowledgeSection({emoji,title,text,color,defaultOpen=false,children}){
  const[open,setOpen]=useState(defaultOpen);
  if(!text&&!children)return null;
  return(
    <div style={{marginBottom:10}}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'10px 14px',background:open?`${color}10`:'rgba(255,255,255,0.03)',
        border:`1px solid ${open?color+'44':'var(--border)'}`,
        borderRadius:open?'10px 10px 0 0':10,cursor:'pointer',transition:'all 0.2s',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:15}}>{emoji}</span>
          <span style={{fontSize:12,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'0.06em'}}>{title}</span>
        </div>
        <span style={{fontSize:12,color:'var(--text-muted)',transition:'transform 0.2s',transform:open?'rotate(180deg)':'none'}}>▼</span>
      </button>
      {open&&(
        <div style={{
          padding:'14px 16px',background:`${color}07`,border:`1px solid ${color}33`,
          borderTop:'none',borderRadius:'0 0 10px 10px',
          fontSize:14,lineHeight:1.85,color:'var(--text-primary)',whiteSpace:'pre-wrap',
        }}>
          {text||children}
        </div>
      )}
    </div>
  );
}

export default function KundliChart({kundli,kundliId}){
  const canvasRef=useRef(null);
  const posRef=useRef(null);
  const lagnaRef=useRef(0);
  const[selHouse,setSelHouse]=useState(null);
  const[houseInfo,setHouseInfo]=useState(null);
  const[aiLoading,setAiLoading]=useState(false);
  const[aiText,setAiText]=useState(null);

  useEffect(()=>{
    if(!kundli||!canvasRef.current)return;
    const{positions,lagnaIndex}=convertData(kundli);
    posRef.current=positions; lagnaRef.current=lagnaIndex;
    setSelHouse(null);setHouseInfo(null);setAiText(null);
    drawChart(canvasRef.current,positions,lagnaIndex,null);
  },[kundli]);

  useEffect(()=>{
    if(!canvasRef.current||!posRef.current)return;
    drawChart(canvasRef.current,posRef.current,lagnaRef.current,selHouse);
  },[selHouse]);

  async function handleClick(e){
    if(!posRef.current)return;
    const canvas=canvasRef.current;
    const rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)*(W/rect.width);
    const y=(e.clientY-rect.top)*(H/rect.height);
    for(let h=1;h<=12;h++){
      if(pointInPolyScaled(x,y,HOUSE_POLYS[h])){
        const ri=(lagnaRef.current+h-1)%12;
        const plist=planetsInHouse(h,posRef.current,lagnaRef.current);
        setSelHouse(h); setAiText(null);
        setHouseInfo({h,ri,plist,positions:posRef.current,loading:true,
          planetHouseParts:[],lordHouseParts:[],planetSignParts:[]});
        try{
          // ⚡ FAST — only DB lookups, no AI
          const lagna=RASHIS[lagnaRef.current];
          const res=await api.post('/knowledge-editor/house-description',{
            house:h,lagna,planets:plist,kundli_id:kundliId||null,
          });
          setHouseInfo(prev=>({
            ...prev, loading:false,
            planetHouseParts: res.data.planet_house_parts||[],
            lordHouseParts:   res.data.lord_house_parts||[],
            planetSignParts:  res.data.planet_sign_parts||[],
            lagna, plist,
            ri: RASHIS.indexOf(res.data.house_rashi)>=0?RASHIS.indexOf(res.data.house_rashi):prev.ri,
            // Store for AI request later
            house_rashi:     res.data.house_rashi,
            house_rashi_en:  res.data.house_rashi_en,
            house_lord:      res.data.house_lord,
          }));
        }catch{
          setHouseInfo(prev=>({...prev,loading:false}));
        }
        break;
      }
    }
  }

  async function generateAIReading(){
    if(!houseInfo||aiLoading)return;
    setAiLoading(true); setAiText(null);
    try{
      // Build your knowledge text for AI context
      const knowledgeText = [
        ...houseInfo.planetHouseParts.map(p=>`${p.title}:\n${p.text}`),
        ...houseInfo.lordHouseParts.map(p=>`${p.title}:\n${p.text}`),
        ...houseInfo.planetSignParts.map(p=>`${p.title}:\n${p.text}`),
      ].join('\n\n');

      const res = await api.post('/knowledge-editor/ai-reading',{
        house:         houseInfo.h,
        lagna:         houseInfo.lagna,
        planets:       houseInfo.plist,
        house_rashi:   houseInfo.house_rashi,
        house_rashi_en:houseInfo.house_rashi_en,
        house_lord:    houseInfo.house_lord,
        your_knowledge_text: knowledgeText,
      });
      setAiText(res.data.ai_description);
    }catch{
      setAiText('Could not generate AI reading. Please try again.');
    }finally{setAiLoading(false);}
  }

  function handleMouseMove(e){
    if(!posRef.current)return;
    const canvas=canvasRef.current;
    const rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)*(W/rect.width);
    const y=(e.clientY-rect.top)*(H/rect.height);
    const hit=Object.values(HOUSE_POLYS).some(poly=>pointInPolyScaled(x,y,poly));
    canvas.style.cursor=hit?'pointer':'default';
  }

  if(!kundli)return null;

  return(
    <div>
      {/* Chart canvas */}
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:20,marginBottom:14}}>
        <h3 style={{marginBottom:14,fontSize:15,display:'flex',alignItems:'center',gap:8}}>
          <span>🪐</span> Kundli Chart
          <span style={{fontSize:11,color:'var(--text-muted)',fontWeight:400}}>North Indian · Lahiri Ayanamsa</span>
        </h3>
        <canvas ref={canvasRef} width={CW} height={CH}
          style={{width:'100%',maxWidth:W,height:'auto',display:'block',margin:'0 auto',cursor:'pointer',borderRadius:6}}
          onClick={handleClick} onMouseMove={handleMouseMove}/>
        <p style={{fontSize:11,color:'var(--text-muted)',textAlign:'center',marginTop:10}}>
          Click any house for instant readings
        </p>
      </div>

      {/* House info panel */}
      {houseInfo&&(
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:20}}>
          {/* Header */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <div style={{
              width:38,height:38,borderRadius:10,flexShrink:0,
              background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:16,fontWeight:700,color:'var(--purple-400)',
            }}>{houseInfo.h}</div>
            <div>
              <div style={{fontWeight:700,fontSize:16}}>
                House {houseInfo.h} —{' '}
                <span style={{color:RASHI_COLOR[RASHI_NATURE[houseInfo.ri]]}}>
                  {RASHI_EN[houseInfo.ri]}
                </span>
              </div>
              <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:3}}>
                {HOUSE_MEANINGS[houseInfo.h-1]}
              </div>
            </div>
          </div>

          {/* Sign details */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
            {[['Sign',RASHI_EN[houseInfo.ri]],['Lord',RASHI_LORD[houseInfo.ri]],['Element',RASHI_NATURE[houseInfo.ri]]].map(([l,v])=>(
              <div key={l} style={{padding:'4px 12px',background:'rgba(139,92,246,0.07)',borderRadius:6,border:'1px solid rgba(139,92,246,0.15)',fontSize:12}}>
                <span style={{color:'var(--text-secondary)'}}>{l}: </span>
                <span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>

          {/* Planets */}
          {houseInfo.plist.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--text-secondary)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em'}}>
                Planets in House {houseInfo.h}
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {houseInfo.plist.map(pname=>{
                  const col=PC[pname];
                  const deg=houseInfo.positions[pname]?.deg?.toFixed(1);
                  const retro=houseInfo.positions[pname]?.retro;
                  return(
                    <span key={pname} style={{padding:'6px 14px',borderRadius:999,background:col+'1a',color:col,border:`1px solid ${col}44`,fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:6}}>
                      {pname}
                      {retro&&<span style={{fontSize:10,opacity:0.8}}>℞</span>}
                      {deg&&<span style={{fontSize:11,opacity:0.65}}>{deg}°</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{height:1,background:'var(--border)',marginBottom:14}}/>

          {/* Loading spinner for DB fetch */}
          {houseInfo.loading&&(
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div className="spinner" style={{margin:'0 auto 10px',width:24,height:24,borderWidth:2}}/>
              <p style={{color:'var(--text-secondary)',fontSize:13}}>Loading readings...</p>
            </div>
          )}

          {/* Knowledge sections — instant from DB */}
          {!houseInfo.loading&&(
            <div>
              {houseInfo.planetHouseParts?.map((part,i)=>(
                <KnowledgeSection key={`ph-${i}`} emoji="🪐" title={part.title}
                  text={part.text} color="#c084fc" defaultOpen={true}/>
              ))}
              {houseInfo.lordHouseParts?.map((part,i)=>(
                <KnowledgeSection key={`lh-${i}`} emoji="🏛️" title={part.title}
                  text={part.text} color="#f59e0b" defaultOpen={true}/>
              ))}
              {houseInfo.planetSignParts?.map((part,i)=>(
                <KnowledgeSection key={`ps-${i}`} emoji="♈" title={part.title}
                  text={part.text} color="#60a5fa" defaultOpen={false}/>
              ))}

              {/* Empty state */}
              {!houseInfo.planetHouseParts?.length && !houseInfo.lordHouseParts?.length && !houseInfo.planetSignParts?.length&&(
                <div style={{textAlign:'center',padding:'16px 0',color:'var(--text-muted)',fontSize:13}}>
                  {houseInfo.plist.length===0
                    ?'No planets in this house. Themes are active through the sign lord.'
                    :'No specific knowledge added for this combination yet.'}
                </div>
              )}

              {/* AI Reading — lazy loaded on demand */}
              <div style={{marginTop:10}}>
                {!aiText&&!aiLoading&&(
                  <button onClick={generateAIReading} style={{
                    width:'100%',padding:'11px',borderRadius:10,
                    background:'rgba(129,140,248,0.08)',border:'1px solid rgba(129,140,248,0.25)',
                    color:'#818cf8',fontSize:13,fontWeight:600,cursor:'pointer',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                    transition:'all 0.2s',
                  }}>
                    <span>🤖</span> Generate AI Reading
                    <span style={{fontSize:11,color:'var(--text-muted)',fontWeight:400}}>(takes ~5 sec)</span>
                  </button>
                )}
                {aiLoading&&(
                  <div style={{textAlign:'center',padding:'14px',background:'rgba(129,140,248,0.06)',borderRadius:10,border:'1px solid rgba(129,140,248,0.2)'}}>
                    <div className="spinner" style={{margin:'0 auto 8px',width:22,height:22,borderWidth:2,borderColor:'#818cf8'}}/>
                    <p style={{color:'#818cf8',fontSize:13}}>Generating AI reading...</p>
                  </div>
                )}
                {aiText&&(
                  <KnowledgeSection emoji="🤖" title="AI Reading"
                    text={aiText} color="#818cf8" defaultOpen={true}/>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}