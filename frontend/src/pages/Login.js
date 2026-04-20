// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GOOGLE_CLIENT_ID = "508207275158-oj5lm0k6veiqvm2d130bm6aum5t5jsa0.apps.googleusercontent.com";

function GoogleButton({ onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) onSuccess(response.credential);
          else onError('Google sign-in failed');
        },
        auto_select: false,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme:'filled_black', size:'large', text:'signin_with',
          shape:'rectangular', width: 320 }
      );
    };
    if (!document.querySelector('script[src*="accounts.google.com"]')) {
      document.head.appendChild(script);
    } else if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) onSuccess(response.credential);
          else onError('Google sign-in failed');
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme:'filled_black', size:'large', text:'signin_with', shape:'rectangular', width:320 }
      );
    }
  }, []);

  return <div id="google-btn" style={{ width:'100%', minHeight:44 }}/>;
}

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]     = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]   = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.access_token);
      navigate('/dashboard');
    } catch(err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  }

  async function handleGoogleSuccess(credential) {
    setError(''); setGLoading(true);
    try {
      const res = await api.post('/auth/google', { credential });
      login(res.data.user, res.data.access_token);
      navigate('/dashboard');
    } catch(err) {
      setError(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
    } finally { setGLoading(false); }
  }

  const inp = {
    width:'100%', padding:'12px 14px',
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:10, color:'#f8f4ff', fontSize:14, outline:'none',
    fontFamily:'inherit',
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>

      <div style={{ width:'100%', maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>✨</div>
            <div className="font-cinzel gradient-text" style={{ fontSize:22, fontWeight:700 }}>
              COSMICA
            </div>
          </Link>
          <h2 style={{ fontSize:20, fontWeight:700, marginTop:12, marginBottom:4 }}>Welcome Back</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>
            Login to access your cosmic dashboard
          </p>
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
                Signing in with Google...
              </div>
            ) : (
              <GoogleButton onSuccess={handleGoogleSuccess} onError={setError}/>
            )}
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }}/>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>or continue with email</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }}/>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600,
                color:'var(--text-muted)', textTransform:'uppercase',
                letterSpacing:'0.06em', marginBottom:6 }}>Email Address</label>
              <input style={inp} type="email" placeholder="you@example.com"
                value={form.email} onChange={e=>set('email',e.target.value)}
                autoComplete="email" required/>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600,
                color:'var(--text-muted)', textTransform:'uppercase',
                letterSpacing:'0.06em', marginBottom:6 }}>Password</label>
              <input style={inp} type="password" placeholder="••••••••"
                value={form.password} onChange={e=>set('password',e.target.value)}
                autoComplete="current-password" required/>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width:'100%', padding:'13px', fontSize:14 }}>
              {loading ? <><span className="spinner"/> Signing in...</> : '✨ Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:16, fontSize:13,
            color:'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color:'var(--purple-400)', textDecoration:'none', fontWeight:600 }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}