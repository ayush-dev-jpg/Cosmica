// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const location                     = useLocation();
  const navigate                     = useNavigate();
  const [open, setOpen]              = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

const USER_LINKS = [
  { path: '/dashboard', label: '🔮 Dashboard' },
  { path: '/chart',     label: '🪐 Kundli' },
  { path: '/nakshatra', label: '⭐ Nakshatra' },
  { path: '/moon-sign', label: '🌙 Moon Sign' },
];

  const ADMIN_LINKS = [
    { path: '/my-knowledge', label: '📖 My Knowledge' },
    { path: '/admin',        label: '📚 Books Upload' },
  ];

  const isAdmin  = user?.role === 'admin';
  const navLinks = isAdmin ? [...USER_LINKS, ...ADMIN_LINKS] : USER_LINKS;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15,12,26,0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link
        to={isLoggedIn ? '/dashboard' : '/'}
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <span style={{ fontSize: 24 }}>✨</span>
        <span className="font-cinzel gradient-text" style={{ fontSize: 18, fontWeight: 700 }}>
          COSMICA
        </span>
      </Link>

      {/* Nav links — only shown when logged in */}
      {isLoggedIn && (
        <div style={{ display: 'flex', gap: 4 }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius)',
                fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
                color: location.pathname === link.path
                  ? 'var(--purple-400)' : 'var(--text-secondary)',
                background: location.pathname === link.path
                  ? 'rgba(168,85,247,0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Right side */}
      {isLoggedIn ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--purple-600), var(--indigo-400))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▼</span>
          </button>

          {open && (
            <div style={{
              position: 'absolute', right: 0, top: '110%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              minWidth: 180, overflow: 'hidden',
              boxShadow: 'var(--shadow)', zIndex: 200,
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                {isAdmin && (
                  <div style={{
                    marginTop: 4, fontSize: 10, fontWeight: 600,
                    color: 'var(--purple-400)',
                    background: 'rgba(168,85,247,0.1)',
                    padding: '2px 8px', borderRadius: 999, display: 'inline-block',
                  }}>
                    Admin
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'none', border: 'none',
                  color: '#f87171', fontSize: 13,
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login"  className="btn btn-ghost"   style={{ padding: '8px 16px', fontSize: 13 }}>
            Sign In
          </Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}