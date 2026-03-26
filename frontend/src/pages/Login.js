// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.access_token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to access your cosmic dashboard"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius)',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <div>
          <label className="label">Email Address</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <><span className="spinner" /> Signing in...</> : '✨ Sign In'}
        </button>
      </form>

      <div className="divider" />

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'none' }}>
          Create one free
        </Link>
      </p>
    </AuthLayout>
  );
}

// Shared auth layout
export function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(ellipse at top, #1a0a3a 0%, var(--bg-primary) 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
            <div className="font-cinzel gradient-text" style={{ fontSize: 28, fontWeight: 700 }}>COSMICA</div>
          </Link>
          <h2 style={{ marginTop: 24, fontSize: 22, fontWeight: 600 }}>{title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>{subtitle}</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
