// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: 24,
    }}>
      <div>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🌌</div>
        <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 12 }} className="gradient-text">404</h1>
        <h2 style={{ marginBottom: 12 }}>Lost in the Cosmos</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          This page has drifted into another dimension.
        </p>
        <Link to="/" className="btn btn-primary">← Return to Cosmica</Link>
      </div>
    </div>
  );
}
