// src/pages/Pricing.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES_FREE = [
  '2 Kundli charts per month',
  'Basic planetary positions',
  'Nakshatra calculator',
  'Moon sign calculator',
  'Basic birth chart view',
];

const FEATURES_PREMIUM = [
  'Unlimited Kundli charts',
  'Full AI-powered predictions',
  'Yoga & Dosha calculator',
  'Vimshottari Dasha timeline',
  'Marriage compatibility (36 Guna)',
  'House-by-house detailed readings',
  'Lord in house predictions',
  'Planet in sign interpretations',
  'Navamsa & divisional charts',
  'Save unlimited charts',
  'Priority support',
  'New features first',
];

const TESTIMONIALS = [
  { name:'Priya S.',     city:'Mumbai',    text:'Finally an astrology app that actually uses real Vedic knowledge. The predictions are incredibly accurate!', stars:5 },
  { name:'Rahul M.',     city:'Bangalore', text:'Worth every rupee. The dasha timeline alone helped me plan my career move. Highly recommend!', stars:5 },
  { name:'Ananya K.',    city:'Delhi',     text:'I was skeptical but the house readings are so detailed and personal. Much better than AstroSage!', stars:5 },
  { name:'Vikram T.',    city:'Chennai',   text:'The yoga calculator is amazing. Shows yogas I never knew I had. The AI reading is spot on.', stars:5 },
];

function StarRating({ count = 5 }) {
  return <span style={{ color:'#f59e0b', fontSize:14 }}>{'★'.repeat(count)}</span>;
}

export default function Pricing() {
  const { isLoggedIn } = useAuth();
  const navigate       = useNavigate();
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'

  const monthlyPrice = 59;
  const yearlyPrice  = 499;
  const yearlyMonthly= Math.round(yearlyPrice / 12);
  const saving       = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>

      {/* Navbar */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'14px 20px', borderBottom:'1px solid var(--border)',
        background:'rgba(15,12,26,0.92)', backdropFilter:'blur(12px)',
        position:'sticky', top:0, zIndex:100,
      }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>✨</span>
          <span className="font-cinzel gradient-text" style={{ fontSize:17, fontWeight:700 }}>COSMICA</span>
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          {isLoggedIn
            ? <Link to="/dashboard" className="btn btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>Dashboard</Link>
            : <>
                <Link to="/login"  className="btn btn-ghost"   style={{ padding:'7px 12px', fontSize:13 }}>Sign In</Link>
                <Link to="/signup" className="btn btn-primary" style={{ padding:'7px 12px', fontSize:13 }}>Sign Up</Link>
              </>
          }
        </div>
      </nav>

      <main style={{ maxWidth:1000, margin:'0 auto', padding:'48px 20px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{
            display:'inline-block', padding:'6px 18px', borderRadius:999, marginBottom:16,
            background:'rgba(168,85,247,0.12)', border:'1px solid rgba(168,85,247,0.3)',
            fontSize:13, fontWeight:600, color:'var(--purple-400)',
          }}>
            ✨ Vedic Astrology Powered by Ancient Wisdom + AI
          </div>
          <h1 className="font-cinzel gradient-text" style={{
            fontSize:'clamp(28px,6vw,52px)', marginBottom:14, lineHeight:1.2,
          }}>
            Unlock Your Complete<br/>Cosmic Blueprint
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'clamp(14px,2vw,17px)', maxWidth:520, margin:'0 auto', lineHeight:1.8 }}>
            Join thousands who use Cosmica for accurate Vedic astrology readings.
            Start free, upgrade anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:36 }}>
          <div style={{
            display:'flex', background:'rgba(255,255,255,0.05)',
            border:'1px solid var(--border)', borderRadius:999, padding:4,
          }}>
            {['monthly','yearly'].map(b=>(
              <button key={b} onClick={()=>setBilling(b)} style={{
                padding:'8px 22px', borderRadius:999, border:'none',
                background: billing===b ? 'var(--purple-600)' : 'transparent',
                color: billing===b ? 'white' : 'var(--text-secondary)',
                fontSize:13, fontWeight:600, cursor:'pointer',
                transition:'all 0.2s', display:'flex', alignItems:'center', gap:6,
              }}>
                {b==='monthly' ? 'Monthly' : 'Yearly'}
                {b==='yearly' && (
                  <span style={{
                    padding:'1px 7px', borderRadius:999, fontSize:10,
                    background:'#10b981', color:'white', fontWeight:700,
                  }}>SAVE {saving}%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',
          gap:20, marginBottom:64,
        }}>
          {/* Free plan */}
          <div style={{
            borderRadius:20, padding:28,
            background:'rgba(255,255,255,0.02)',
            border:'1px solid var(--border)',
          }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Free
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:4, marginBottom:6 }}>
                <span style={{ fontSize:42, fontWeight:800 }}>₹0</span>
                <span style={{ color:'var(--text-muted)', fontSize:14, marginBottom:8 }}>/month</span>
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>
                Perfect for exploring Vedic astrology basics
              </p>
            </div>

            <button
              onClick={() => navigate(isLoggedIn ? '/chart' : '/signup')}
              style={{
                width:'100%', padding:'13px', borderRadius:10, marginBottom:24,
                background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)',
                color:'var(--text-primary)', fontSize:14, fontWeight:600, cursor:'pointer',
              }}
            >
              {isLoggedIn ? 'Continue Free' : 'Get Started Free'}
            </button>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {FEATURES_FREE.map((f,i)=>(
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:13, color:'var(--text-secondary)' }}>
                  <span style={{ color:'#34d399', flexShrink:0 }}>✓</span> {f}
                </div>
              ))}
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:13, color:'var(--text-muted)' }}>
                <span style={{ flexShrink:0 }}>✗</span> AI predictions & yogas
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:13, color:'var(--text-muted)' }}>
                <span style={{ flexShrink:0 }}>✗</span> Dasha timeline
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:13, color:'var(--text-muted)' }}>
                <span style={{ flexShrink:0 }}>✗</span> Marriage compatibility
              </div>
            </div>
          </div>

          {/* Premium plan */}
          <div style={{
            borderRadius:20, padding:28, position:'relative',
            background:'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.08))',
            border:'2px solid rgba(139,92,246,0.5)',
            boxShadow:'0 0 40px rgba(139,92,246,0.15)',
          }}>
            {/* Popular badge */}
            <div style={{
              position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)',
              padding:'4px 18px', borderRadius:999,
              background:'linear-gradient(90deg,#7c3aed,#4f46e5)',
              fontSize:12, fontWeight:700, color:'white', whiteSpace:'nowrap',
              boxShadow:'0 4px 12px rgba(124,58,237,0.4)',
            }}>
              ⭐ MOST POPULAR
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--purple-400)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Cosmica Premium
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:4, marginBottom:6 }}>
                <span style={{ fontSize:42, fontWeight:800, color:'var(--purple-400)' }}>
                  ₹{billing==='monthly' ? monthlyPrice : yearlyMonthly}
                </span>
                <span style={{ color:'var(--text-muted)', fontSize:14, marginBottom:8 }}>/month</span>
              </div>
              {billing==='yearly' && (
                <div style={{ fontSize:12, color:'#10b981', marginBottom:6 }}>
                  ₹{yearlyPrice}/year · Save ₹{monthlyPrice*12 - yearlyPrice}
                </div>
              )}
              <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>
                Full access to all Vedic astrology features
              </p>
            </div>

            <button
              onClick={() => navigate(isLoggedIn ? '/subscribe' : '/signup?next=subscribe')}
              style={{
                width:'100%', padding:'14px', borderRadius:10, marginBottom:24,
                background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
                border:'none', color:'white', fontSize:15, fontWeight:700,
                cursor:'pointer', boxShadow:'0 4px 20px rgba(124,58,237,0.4)',
                transition:'transform 0.2s',
              }}
              onMouseEnter={e=>e.target.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.target.style.transform='translateY(0)'}
            >
              ✨ Start Premium — ₹{billing==='monthly' ? monthlyPrice : yearlyPrice}/{billing==='monthly'?'mo':'yr'}
            </button>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {FEATURES_PREMIUM.map((f,i)=>(
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:13, color:'var(--text-primary)' }}>
                  <span style={{ color:'#c084fc', flexShrink:0, fontWeight:700 }}>✦</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
          gap:16, marginBottom:64,
          padding:'28px', borderRadius:16,
          background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)',
        }}>
          {[
            { emoji:'🔒', title:'Secure Payment',   desc:'256-bit SSL encrypted' },
            { emoji:'↩️', title:'Cancel Anytime',   desc:'No long-term commitment' },
            { emoji:'🎯', title:'Highly Accurate',   desc:'Swiss Ephemeris + expert knowledge' },
            { emoji:'🙏', title:'Made in India',    desc:'Built for Indian astrology seekers' },
          ].map((t,i)=>(
            <div key={i} style={{ textAlign:'center', padding:'8px' }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{t.emoji}</div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>{t.title}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{ marginBottom:64 }}>
          <h2 style={{ textAlign:'center', fontSize:'clamp(20px,4vw,28px)', marginBottom:10 }}>
            Loved by Thousands
          </h2>
          <p style={{ textAlign:'center', color:'var(--text-secondary)', marginBottom:28, fontSize:14 }}>
            Join astrology seekers across India who trust Cosmica
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} style={{
                padding:'18px', borderRadius:14,
                background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)',
              }}>
                <StarRating count={t.stars}/>
                <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7, margin:'10px 0' }}>
                  "{t.text}"
                </p>
                <div style={{ fontWeight:600, fontSize:13 }}>{t.name}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{t.city}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom:48 }}>
          <h2 style={{ textAlign:'center', fontSize:'clamp(18px,4vw,26px)', marginBottom:28 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:680, margin:'0 auto' }}>
            {[
              { q:'Can I cancel anytime?', a:'Yes! Cancel your subscription anytime with one click. No questions asked, no fees.' },
              { q:'What payment methods are accepted?', a:'UPI, all debit/credit cards, net banking, and wallets — all major Indian payment methods.' },
              { q:'Is the yearly plan auto-renewed?', a:'Yes, subscriptions auto-renew. You can turn this off anytime from your account settings.' },
              { q:'How is Cosmica different from AstroSage?', a:'Cosmica uses a real astrologer\'s personal knowledge combined with AI — not just generic computer-generated readings. Every interpretation is reviewed and written by an expert.' },
              { q:'What happens to my free charts after subscribing?', a:'All your charts are saved and accessible. Subscribing unlocks deeper readings for all your existing charts too.' },
            ].map((faq,i)=><FaqItem key={i} q={faq.q} a={faq.a}/>)}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          textAlign:'center', padding:'48px 24px', borderRadius:20,
          background:'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.06))',
          border:'1px solid rgba(139,92,246,0.2)',
        }}>
          <h2 className="font-cinzel gradient-text" style={{ fontSize:'clamp(20px,4vw,30px)', marginBottom:10 }}>
            Begin Your Cosmic Journey
          </h2>
          <p style={{ color:'var(--text-secondary)', marginBottom:24, fontSize:14 }}>
            Your stars have a story. Let Cosmica tell it.
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? '/subscribe' : '/signup?next=subscribe')}
            className="btn btn-primary"
            style={{ padding:'15px 48px', fontSize:16 }}
          >
            ✨ Get Premium for ₹{billing==='monthly'?monthlyPrice:yearlyPrice}/{billing==='monthly'?'month':'year'}
          </button>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:12 }}>
            Cancel anytime · Secure payment · Instant access
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'18px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:12 }}>
        © 2024 Cosmica · Built with ✨ and Jyotish Shastra
      </footer>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius:10, overflow:'hidden',
      border:'1px solid var(--border)',
    }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'14px 16px', background:'rgba(255,255,255,0.02)',
        border:'none', cursor:'pointer', color:'var(--text-primary)',
        fontSize:14, fontWeight:600, textAlign:'left',
      }}>
        {q}
        <span style={{ transform:open?'rotate(180deg)':'none', transition:'transform 0.2s', flexShrink:0, marginLeft:8, color:'var(--text-muted)' }}>▼</span>
      </button>
      {open && (
        <div style={{ padding:'0 16px 14px', fontSize:13, color:'var(--text-secondary)', lineHeight:1.7, borderTop:'1px solid var(--border)' }}>
          {a}
        </div>
      )}
    </div>
  );
}