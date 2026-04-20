// src/pages/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GOOGLE_CLIENT_ID = "508207275158-oj5lm0k6veiqvm2d130bm6aum5t5jsa0.apps.googleusercontent.com";

function GoogleButton({ onSuccess, onError }) {
  React.useEffect(() => {
    const init = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (r) => r.credential ? onSuccess(r.credential) : onError('Google sign-up failed'),
        auto_select: false,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signup-btn'),
        { theme:'filled_black', size:'large', text:'signup_with', shape:'rectangular', width:320 }
      );
    };
    if (window.google) { init(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    script.onload = init;
    if (!document.querySelector('script[src*="accounts.google.com"]'))
      document.head.appendChild(script);
  }, []);
  return <div id="google-signup-btn" style={{ width:'100%', minHeight:44 }}/>;
}

export default function Signup() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]     = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]   = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        name: form.name, email: form.email, password: form.password
      });
      login(res.data.user, res.data.access_token);
      navigate('/dashboard');
    } catch(err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  }

  async function handleGoogleSuccess(credential) {
    setError(''); setGLoading(true);
    try {
      const res = await api.post('/auth/google', { credential });
      login(res.data.user, res.data.access_token);
      navigate('/dashboard');
    } catch(err) {
      setError(err.response?.data?.detail || 'Google sign-up failed. Please try again.');
    } finally { setGLoading(false); }
  }

  const inp = {
    width:'100%', padding:'12px 14px',
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:10, color:'#f8f4ff', fontSize:14, outline:'none', fontFamily:'inherit',
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>✨</div>
            <div className="font-cinzel gradient-text" style={{ fontSize:22, fontWeight:700 }}>COSMICA</div>
          </Link>
          <h2 style={{ fontSize:20, fontWeight:700, marginTop:12, marginBottom:4 }}>Create Your Account</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Start your Vedic astrology journey</p>
        </div>

        <div className="card" style={{ padding:28 }}>
          {error && (
            <div style={{ padding:'11px 14px', marginBottom:16, borderRadius:8,
              background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
              color:'#f87171', fontSize:13 }}>⚠️ {error}</div>
          )}

          {/* Google Button */}
          <div style={{ marginBottom:16 }}>
            {gLoading ? (
              <div style={{ padding:'12px', borderRadius:10, textAlign:'center',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                fontSize:13, color:'var(--text-secondary)' }}>
                <span className="spinner" style={{ marginRight:8 }}/>
                Creating account with Google...
              </div>
            ) : (
              <GoogleButton onSuccess={handleGoogleSuccess} onError={setError}/>
            )}
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }}/>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>or sign up with email</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }}/>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600,
                  color:'var(--text-muted)', textTransform:'uppercase',
                  letterSpacing:'0.06em', marginBottom:6 }}>Full Name</label>
                <input style={inp} type="text" placeholder="e.g. Arjun Sharma"
                  value={form.name} onChange={e=>set('name',e.target.value)}
                  autoComplete="name" required/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600,
                  color:'var(--text-muted)', textTransform:'uppercase',
                  letterSpacing:'0.06em', marginBottom:6 }}>Email Address</label>
                <input style={inp} type="email" placeholder="you@example.com"
                  value={form.email} onChange={e=>set('email',e.target.value)}
                  autoComplete="email" required/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600,
                  color:'var(--text-muted)', textTransform:'uppercase',
                  letterSpacing:'0.06em', marginBottom:6 }}>Password</label>
                <input style={inp} type="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={e=>set('password',e.target.value)}
                  autoComplete="new-password" required/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600,
                  color:'var(--text-muted)', textTransform:'uppercase',
                  letterSpacing:'0.06em', marginBottom:6 }}>Confirm Password</label>
                <input style={inp} type="password" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)}
                  autoComplete="new-password" required/>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width:'100%', padding:'13px', fontSize:14 }}>
              {loading ? <><span className="spinner"/> Creating account...</> : '🚀 Create Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--purple-400)', textDecoration:'none', fontWeight:600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}