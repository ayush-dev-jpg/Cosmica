// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const location                     = useLocation();
  const navigate                     = useNavigate();
  const [menuOpen, setMenuOpen]      = useState(false);
  const [dropOpen, setDropOpen]      = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const USER_LINKS = [
    { path:'/dashboard',  label:'🔮 Dashboard' },
    { path:'/chart',      label:'🪐 Kundli' },
    { path:'/nakshatra',  label:'⭐ Nakshatra' },
    { path:'/moon-sign',  label:'🌙 Moon Sign' },
    { path:'/panchang', label:'🗓️ Panchang' },
    { path:'/tara-balam', label:'⭐ Tara Balam' }

  ];
  const ADMIN_LINKS = [
    { path:'/my-knowledge', label:'📖 My Knowledge' },
    { path:'/admin',        label:'📚 Books Upload' },
  ];

  const isAdmin  = user?.role === 'admin';
  const navLinks = isAdmin ? [...USER_LINKS, ...ADMIN_LINKS] : USER_LINKS;

  const linkStyle = (path) => ({
    padding:'8px 12px', borderRadius:'var(--radius)',
    fontSize:13, fontWeight:500, textDecoration:'none',
    color: location.pathname === path ? 'var(--purple-400)' : 'var(--text-secondary)',
    background: location.pathname === path ? 'rgba(168,85,247,0.1)' : 'transparent',
    transition:'all 0.2s', whiteSpace:'nowrap',
  });

  return (
    <>
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(15,12,26,0.92)',
        backdropFilter:'blur(16px)',
        borderBottom:'1px solid var(--border)',
        padding:'0 20px', height:60,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        {/* Logo */}
        <Link to={isLoggedIn ? '/dashboard' : '/'} style={{
          textDecoration:'none', display:'flex', alignItems:'center', gap:8, flexShrink:0,
        }}>
          <span style={{ fontSize:22 }}>✨</span>
          <span className="font-cinzel gradient-text" style={{ fontSize:17, fontWeight:700 }}>
            COSMICA
          </span>
        </Link>

        {/* Desktop nav links */}
        {isLoggedIn && (
          <div style={{
            display:'flex', gap:2, alignItems:'center',
            overflow:'hidden',
          }} className="hide-on-mobile">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} style={linkStyle(link.path)}>
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          {isLoggedIn ? (
            <>
              {/* Desktop user dropdown */}
              <div style={{ position:'relative' }} className="hide-on-mobile">
                <button onClick={() => setDropOpen(!dropOpen)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'7px 12px',
                  background:'var(--bg-card)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius)', cursor:'pointer', color:'var(--text-primary)', fontSize:13,
                }}>
                  <div style={{
                    width:26, height:26, borderRadius:'50%',
                    background:'linear-gradient(135deg,var(--purple-600),var(--indigo-400))',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700, color:'white', flexShrink:0,
                  }}>{user?.name?.[0]?.toUpperCase()||'U'}</div>
                  <span style={{ maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user?.name||'User'}
                  </span>
                  <span style={{ fontSize:9, color:'var(--text-muted)', transform: dropOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}>▼</span>
                </button>
                {dropOpen && (
                  <div style={{
                    position:'absolute', right:0, top:'110%',
                    background:'var(--bg-secondary)', border:'1px solid var(--border)',
                    borderRadius:'var(--radius)', minWidth:180, overflow:'hidden',
                    boxShadow:'var(--shadow)', zIndex:200,
                  }}>
                    <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{user?.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{user?.email}</div>
                      {isAdmin && (
                        <span style={{
                          marginTop:4, fontSize:10, fontWeight:600, color:'var(--purple-400)',
                          background:'rgba(168,85,247,0.1)', padding:'2px 8px', borderRadius:999, display:'inline-block',
                        }}>Admin</span>
                      )}
                    </div>
                    <button onClick={handleLogout} style={{
                      width:'100%', padding:'12px 16px', background:'none', border:'none',
                      color:'#f87171', fontSize:13, cursor:'pointer', textAlign:'left',
                      display:'flex', alignItems:'center', gap:8,
                    }}>🚪 Sign Out</button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="show-on-mobile"
                style={{
                  background:'none', border:'1px solid var(--border)',
                  borderRadius:8, padding:'7px 10px', cursor:'pointer',
                  color:'var(--text-primary)', fontSize:16, display:'none',
                }}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="btn btn-ghost"   style={{ padding:'8px 14px', fontSize:13 }}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && isLoggedIn && (
        <div style={{
          position:'fixed', top:60, left:0, right:0, bottom:0, zIndex:99,
          background:'rgba(10,8,20,0.97)', backdropFilter:'blur(16px)',
          padding:'20px', overflowY:'auto',
          display:'none',
        }} className="mobile-menu">
          {/* User info */}
          <div style={{
            display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
            background:'rgba(255,255,255,0.04)', borderRadius:12, marginBottom:16,
            border:'1px solid var(--border)',
          }}>
            <div style={{
              width:40, height:40, borderRadius:'50%',
              background:'linear-gradient(135deg,var(--purple-600),var(--indigo-400))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, fontWeight:700, color:'white',
            }}>{user?.name?.[0]?.toUpperCase()||'U'}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:600 }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:16 }}>
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding:'14px 16px', borderRadius:10, textDecoration:'none',
                  fontSize:15, fontWeight:500,
                  color: location.pathname === link.path ? 'var(--purple-400)' : 'var(--text-primary)',
                  background: location.pathname === link.path ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.03)',
                  border:`1px solid ${location.pathname === link.path ? 'rgba(168,85,247,0.25)' : 'var(--border)'}`,
                }}
              >{link.label}</Link>
            ))}
          </div>

          <button onClick={handleLogout} style={{
            width:'100%', padding:'14px 16px', borderRadius:10,
            background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
            color:'#f87171', fontSize:15, fontWeight:500, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>🚪 Sign Out</button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: flex !important; }
          .mobile-menu    { display: block !important; }
        }
      `}</style>
    </>
  );
}