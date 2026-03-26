// src/pages/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from './Login';
import api from '../services/api';

export default function Signup() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        name:     form.name,
        email:    form.email,
        password: form.password,
      });
      login(res.data.access_token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Start your Vedic astrology journey"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          <label className="label">Full Name</label>
          <input className="input" type="text" placeholder="Arjun Sharma"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Email Address</label>
          <input className="input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input className="input" type="password" placeholder="Repeat password"
            value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <><span className="spinner" /> Creating account...</> : '🚀 Create Account'}
        </button>
      </form>

      <div className="divider" />

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
