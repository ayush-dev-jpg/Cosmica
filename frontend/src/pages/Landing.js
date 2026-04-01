// src/pages/Landing.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon:'🪐', title:'Accurate Kundli',    desc:'Swiss Ephemeris with Lahiri Ayanamsa — the most accurate Vedic chart calculation.' },
  { icon:'⭐', title:'Nakshatra Analysis', desc:'Deep insights into your birth star, pada, ruling deity and its influence on your life.' },
  { icon:'🔮', title:'AI Predictions',     desc:"Personalized predictions blended with the astrologer's own knowledge and classical texts." },
  { icon:'🌙', title:'Moon Sign',          desc:'Discover your Chandra Rashi and understand your emotional nature and inner world.' },
  { icon:'💬', title:'Astrology Chatbot',  desc:'Ask anything about Vedic astrology and get answers based on your personal chart.' },
  { icon:'📚', title:'Classical Library',  desc:"Access the astrologer's curated library of classical Vedic astrology texts." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>

      {/* Navbar */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'16px 20px',
        borderBottom:'1px solid var(--border)',
        background:'rgba(15,12,26,0.9)',
        backdropFilter:'blur(12px)',
        position:'sticky', top:0, zIndex:100,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:22 }}>✨</span>
          <span className="font-cinzel gradient-text" style={{ fontSize:18, fontWeight:700 }}>COSMICA</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/login"  className="btn btn-ghost"   style={{ padding:'8px 14px', fontSize:13 }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>Sign Up</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign:'center', padding:'60px 20px 48px', position:'relative' }}>
        <div style={{
          position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)',
          width:'min(500px,90vw)', height:200, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>

        <div className="badge badge-gold" style={{ margin:'0 auto 20px', display:'inline-flex' }}>
          ✨ Vedic Astrology Platform
        </div>

        <h1 className="font-cinzel gradient-text" style={{
          fontSize:'clamp(32px,7vw,68px)',
          marginBottom:16, lineHeight:1.15,
        }}>
          Discover Your<br />Cosmic Blueprint
        </h1>

        <p style={{
          fontSize:'clamp(14px,2vw,17px)',
          color:'var(--text-secondary)',
          maxWidth:500, margin:'0 auto 32px', lineHeight:1.8,
          padding:'0 8px',
        }}>
          Enter your birth details and instantly get your complete
          Vedic birth chart — no account needed.
        </p>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <button onClick={() => navigate('/chart')} className="btn btn-primary"
            style={{ padding:'15px 40px', fontSize:15, width:'min(320px,90vw)' }}>
            ✨ Get Your Free Kundli
          </button>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={() => navigate('/nakshatra')} className="btn btn-ghost"
              style={{ padding:'11px 20px', fontSize:13 }}>
              ⭐ Find Nakshatra
            </button>
            <button onClick={() => navigate('/moon-sign')} className="btn btn-ghost"
              style={{ padding:'11px 20px', fontSize:13 }}>
              🌙 Moon Sign
            </button>
                      <button onClick={() => navigate('/compatibility')} className="btn btn-ghost"
  style={{ padding:'11px 20px', fontSize:13 }}>
  💑 Marriage Compatibility
</button>
          </div>
        </div>

        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:14 }}>
          No account required · Free forever · Instant results
        </p>
      </section>

      {/* Features */}
      <section style={{ padding:'32px 20px 60px', maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', fontSize:'clamp(20px,4vw,28px)', marginBottom:10 }}>
          Everything in One Place
        </h2>
        <p style={{ textAlign:'center', color:'var(--text-secondary)', marginBottom:32, fontSize:14 }}>
          Ancient Vedic wisdom meets modern technology
        </p>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',
          gap:14,
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ padding:20 }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{f.icon}</div>
              <h3 style={{ fontSize:15, marginBottom:6 }}>{f.title}</h3>
              <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{
        textAlign:'center', padding:'44px 20px 60px',
        borderTop:'1px solid var(--border)',
      }}>
        <h2 className="font-cinzel gradient-text" style={{ fontSize:'clamp(20px,4vw,30px)', marginBottom:12 }}>
          Begin Your Cosmic Journey
        </h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:24, fontSize:14 }}>
          Create a free account to save your charts and access the full library
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', padding:'0 20px' }}>
          <button onClick={() => navigate('/chart')} className="btn btn-primary"
            style={{ padding:'13px 32px', fontSize:14 }}>
            ✨ Try Without Account
          </button>
          <Link to="/signup" className="btn btn-ghost" style={{ padding:'13px 32px', fontSize:14 }}>
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop:'1px solid var(--border)', padding:'18px 20px',
        textAlign:'center', color:'var(--text-muted)', fontSize:12,
      }}>
        © 2024 Cosmica · Built with ✨ and Jyotish Shastra
      </footer>
    </div>
  );
}