// src/components/DivisionalChart.js
// Simplified stateless divisional chart renderer (D9, D10, etc.)
import React, { useEffect, useRef } from 'react';

const RASHIS = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'
];
const RASHI_EN = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];
const RASHI_NATURE = [
  'Fire','Earth','Air','Water','Fire','Earth',
  'Air','Water','Fire','Earth','Air','Water'
];
const RASHI_COLOR = {
  Fire:'#e8603c', Earth:'#7ab648', Air:'#5ba4cf', Water:'#9b6bcc'
};
const PS = {
  Sun:'Su', Moon:'Mo', Mars:'Ma', Mercury:'Me',
  Jupiter:'Ju', Venus:'Ve', Saturn:'Sa', Rahu:'Ra', Ketu:'Ke'
};
const PC = {
  Sun:'#f59e0b', Moon:'#60a5fa', Mars:'#f87171',
  Mercury:'#34d399', Jupiter:'#c084fc', Venus:'#f472b6',
  Saturn:'#94a3b8', Rahu:'#818cf8', Ketu:'#fb923c'
};

const SCALE = 2;
const W = 460, H = 420;
const CW = W * SCALE, CH = H * SCALE;
const l=4*SCALE, t=4*SCALE, r=CW-4*SCALE, b=CH-4*SCALE;
const cx=CW/2, cy=CH/2;
const TL=[l,t], TR=[r,t], BR=[r,b], BL=[l,b];
const TM=[cx,t], RM=[r,cy], BM=[cx,b], LM=[l,cy];
const C=[cx,cy];
const ix=(cx-l)*0.48, iy=(cy-t)*0.48;
const P=[cx-ix,cy-iy], Q=[cx+ix,cy-iy];
const R=[cx+ix,cy+iy], S=[cx-ix,cy+iy];

const HOUSE_POLYS = {
  1:[TM,Q,C,P], 2:[TL,TM,P], 3:[TL,LM,P],
  4:[LM,P,C,S], 5:[BL,LM,S], 6:[BM,BL,S],
  7:[BM,S,C,R], 8:[BR,BM,R], 9:[RM,BR,R],
  10:[Q,RM,R,C], 11:[TR,RM,Q], 12:[TM,TR,Q],
};

function polyCenter(poly){
  return [poly.reduce((a,p)=>a+p[0],0)/poly.length, poly.reduce((a,p)=>a+p[1],0)/poly.length];
}

function convertChartData(chartData){
  const positions={};
  const planets=chartData?.planetary_positions||{};
  Object.entries(planets).forEach(([name,data])=>{
    const ri=RASHIS.indexOf(data.rashi);
    positions[name]={rashi:ri>=0?ri:0,deg:parseFloat(data.degree_in_rashi)||0,retro:data.retrograde||false};
  });
  const lagnaName=chartData?.lagna?.name||'Mesha';
  const lagnaIndex=RASHIS.indexOf(lagnaName);
  return{positions,lagnaIndex:lagnaIndex>=0?lagnaIndex:0};
}

function planetsInHouse(h,positions,lagnaIdx){
  const ri=(lagnaIdx+h-1)%12;
  return Object.entries(positions).filter(([,d])=>d.rashi===ri).map(([n])=>n);
}

function drawDivisionalChart(canvas,positions,lagnaIdx){
  const ctx=canvas.getContext('2d');
  const dark=window.matchMedia('(prefers-color-scheme:dark)').matches;
  const bgCol=dark?'#12101e':'#faf7ff';
  const outerBorder=dark?'rgba(167,139,250,0.9)':'rgba(109,40,217,0.85)';
  const innerLine=dark?'rgba(167,139,250,0.45)':'rgba(109,40,217,0.35)';
  const lgnFill=dark?'rgba(139,92,246,0.18)':'rgba(139,92,246,0.10)';
  const numCol=dark?'rgba(216,180,254,0.6)':'rgba(109,40,217,0.55)';
  const textCol=dark?'#ede9fe':'#1e1b4b';
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle=bgCol; ctx.fillRect(0,0,CW,CH);
  // Highlight lagna house (house 1)
  Object.entries(HOUSE_POLYS).forEach(([hStr,poly])=>{
    const h=parseInt(hStr);
    if(h===1){
      ctx.beginPath();
      poly.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
      ctx.closePath();
      ctx.fillStyle=lgnFill;
      ctx.fill();
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
    const rCol=RASHI_COLOR[nature];
    ctx.fillStyle=dark?rCol+'bb':rCol+'99';
    ctx.font=`bold ${13*SCALE}px -apple-system,sans-serif`;
    ctx.fillText(ri+1,pcx,pcy-7*SCALE);
    ctx.fillStyle=dark?'rgba(216,180,254,0.5)':'rgba(109,40,217,0.42)';
    ctx.font=`${9*SCALE}px -apple-system,sans-serif`;
    ctx.fillText(RASHI_EN[ri].slice(0,3),pcx,pcy+5*SCALE);
  }
  const[lx,ly]=polyCenter(HOUSE_POLYS[1]);
  ctx.fillStyle=dark?'rgba(196,181,253,0.9)':'rgba(109,40,217,0.85)';
  ctx.font=`bold italic ${8*SCALE}px -apple-system,sans-serif`;
  ctx.textAlign='center';
  ctx.fillText('Asc',lx,ly-18*SCALE);
  for(let h=1;h<=12;h++){
    const plist=planetsInHouse(h,positions,lagnaIdx);
    if(!plist.length)continue;
    const[pcx,pcy]=polyCenter(HOUSE_POLYS[h]);
    const lineH=13*SCALE;
    const totalH=plist.length*lineH;
    let py=pcy+14*SCALE-totalH/2;
    plist.forEach(pname=>{
      const abbr=PS[pname]||pname.slice(0,2);
      const retro=positions[pname]?.retro;
      const col=PC[pname];
      ctx.shadowColor=col+'66';ctx.shadowBlur=4*SCALE;
      ctx.fillStyle=col;
      ctx.font=`${retro?'italic ':''}bold ${11*SCALE}px -apple-system,sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(abbr+(retro?'℞':''),pcx,py);
      ctx.shadowBlur=0;
      py+=lineH;
    });
  }
}

export default function DivisionalChart({chartData,title}){
  const canvasRef=useRef(null);

  useEffect(()=>{
    if(!chartData||!canvasRef.current)return;
    const{positions,lagnaIndex}=convertChartData(chartData);
    drawDivisionalChart(canvasRef.current,positions,lagnaIndex);
  },[chartData]);

  if(!chartData)return null;

  return(
    <div style={{
      background:'var(--bg-card)',border:'1px solid var(--border)',
      borderRadius:'var(--radius-lg)',padding:20,
    }}>
      <h3 style={{marginBottom:14,fontSize:15,display:'flex',alignItems:'center',gap:8}}>
        <span>🪐</span> {title}
        <span style={{fontSize:11,color:'var(--text-muted)',fontWeight:400}}>
          North Indian · Lahiri Ayanamsa
        </span>
      </h3>
      <canvas ref={canvasRef} width={CW} height={CH}
        style={{width:'100%',maxWidth:W,height:'auto',display:'block',margin:'0 auto',borderRadius:6}}
      />
    </div>
  );
}
