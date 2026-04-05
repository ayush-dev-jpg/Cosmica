// src/components/PaywallModal.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LOCKED_FEATURES = [
  '🔮 Full AI predictions for every house',
  '✨ Yoga & Dosha calculator',
  '🌟 Vimshottari Dasha timeline',
  '💑 Marriage compatibility (36 Guna)',
  '📖 Lord in house readings',
  '♾️ Unlimited chart saves',
];

export default function PaywallModal({ feature, onClose }) {
  const navigate = useNavigate();

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(5,3,15,0.85)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px',
    }}
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div style={{
        background:'var(--bg-secondary)',
        border:'1px solid rgba(139,92,246,0.4)',
        borderRadius:20, padding:'32px 28px',
        maxWidth:460, width:'100%',
        boxShadow:'0 0 60px rgba(139,92,246,0.2)',
        position:'relative',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position:'absolute', top:14, right:14,
          background:'none', border:'none', color:'var(--text-muted)',
          fontSize:18, cursor:'pointer', padding:4,
        }}>✕</button>

        {/* Lock icon */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{
            width:64, height:64, borderRadius:'50%', margin:'0 auto 14px',
            background:'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(79,70,229,0.2))',
            border:'2px solid rgba(139,92,246,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28,
          }}>🔒</div>
          <h2 style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>
            Premium Feature
          </h2>
          {feature && (
            <p style={{ color:'var(--purple-400)', fontSize:14, fontWeight:600, marginBottom:6 }}>
              {feature} requires a subscription
            </p>
          )}
          <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.7 }}>
            Unlock the full power of Vedic astrology with deep AI-powered readings backed by expert knowledge
          </p>
        </div>

        {/* Features */}
        <div style={{
          padding:'16px', borderRadius:12, marginBottom:20,
          background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.15)',
        }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--purple-400)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>
            ✦ What you unlock
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {LOCKED_FEATURES.map((f,i)=>(
              <div key={i} style={{ fontSize:13, color:'var(--text-secondary)' }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>Starting at just </span>
          <span style={{ fontSize:24, fontWeight:800, color:'var(--purple-400)' }}>₹59</span>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>/month</span>
        </div>

        {/* CTA buttons */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button
            onClick={() => navigate('/pricing')}
            style={{
              width:'100%', padding:'14px', borderRadius:12,
              background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
              border:'none', color:'white', fontSize:15, fontWeight:700,
              cursor:'pointer', boxShadow:'0 4px 20px rgba(124,58,237,0.35)',
            }}
          >
            ✨ View Plans — From ₹59/month
          </button>
          <button onClick={onClose} style={{
            width:'100%', padding:'12px', borderRadius:12,
            background:'none', border:'1px solid var(--border)',
            color:'var(--text-secondary)', fontSize:13, cursor:'pointer',
          }}>
            Maybe later
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:12 }}>
          Cancel anytime · No hidden fees
        </p>
      </div>
    </div>
  );
}