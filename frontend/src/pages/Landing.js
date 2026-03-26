// src/pages/Landing.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '🪐', title: 'Accurate Kundli',      desc: 'Swiss Ephemeris with Lahiri Ayanamsa — the most accurate Vedic chart calculation.' },
  { icon: '⭐', title: 'Nakshatra Analysis',    desc: 'Deep insights into your birth star, pada, ruling deity and its influence on your life.' },
  { icon: '🔮', title: 'AI Predictions',        desc: 'Personalized predictions blended with the astrologer\'s own knowledge and classical texts.' },
  { icon: '📊', title: 'Divisional Charts',     desc: 'D1 through D60 — all 16 divisional charts for deeper life area analysis.' },
  { icon: '💬', title: 'Astrology Chatbot',     desc: 'Ask anything about Vedic astrology and get answers based on your personal chart.' },
  { icon: '📚', title: 'Classical Library',     desc: 'Access the astrologer\'s curated library of classical Vedic astrology texts.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 48px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(15,12,26,0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>✨</span>
          <span className="font-cinzel gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>
            COSMICA
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login"  className="btn btn-ghost"   style={{ padding: '9px 18px', fontSize: 13 }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>Create Account</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: '90px 24px 60px',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Floating stars */}
        {Array.from({length:30}).map((_,i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random()*2+1, height: Math.random()*2+1,
            borderRadius: '50%', background: 'white',
            top: `${Math.random()*100}%`, left: `${Math.random()*100}%`,
            opacity: Math.random()*0.6+0.1,
            animation: `twinkle ${Math.random()*3+2}s ease-in-out infinite`,
            animationDelay: `${Math.random()*3}s`,
            pointerEvents: 'none',
          }} />
        ))}

        <div className="badge badge-gold" style={{ margin: '0 auto 24px', display: 'inline-flex' }}>
          ✨ Vedic Astrology Platform
        </div>

        <h1 className="font-cinzel gradient-text" style={{
          fontSize: 'clamp(38px, 6vw, 72px)',
          marginBottom: 20, lineHeight: 1.15,
        }}>
          Discover Your<br />Cosmic Blueprint
        </h1>

        <p style={{
          fontSize: 17, color: 'var(--text-secondary)',
          maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.8,
        }}>
          Enter your birth details below and instantly get your complete
          Vedic birth chart — no account needed.
        </p>

        {/* Big CTA button */}
        <button
          onClick={() => navigate('/chart')}
          className="btn btn-primary"
          style={{ padding: '16px 48px', fontSize: 16, marginBottom: 12 }}
        >
          ✨ Get Your Free Kundli
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          No account required · Free forever · Instant results
        </p>
      </section>

      {/* Features */}
      <section style={{ padding: '40px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, marginBottom: 10 }}>
          Everything in One Place
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 40, fontSize: 14 }}>
          Ancient Vedic wisdom meets modern technology
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{
        textAlign: 'center', padding: '50px 24px 70px',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 className="font-cinzel gradient-text" style={{ fontSize: 30, marginBottom: 12 }}>
          Begin Your Cosmic Journey
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>
          Create a free account to save your charts and access the full library
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/chart')}
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: 15 }}
          >
            ✨ Try Without Account
          </button>
          <Link to="/signup" className="btn btn-ghost" style={{ padding: '14px 36px', fontSize: 15 }}>
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '20px 48px',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: 12,
      }}>
        © 2024 Cosmica · Built with ✨ and Jyotish Shastra
      </footer>
    </div>
  );
}