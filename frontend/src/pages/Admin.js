// src/pages/Admin.js
// Admin page: upload astrology books, manage knowledge base

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const CATEGORIES = [
  { id: 'general',   label: '📚 General',       desc: 'General astrology content' },
  { id: 'nakshatra', label: '⭐ Nakshatra',      desc: 'Nakshatra interpretations' },
  { id: 'rashi',     label: '♈ Rashi',          desc: 'Zodiac sign descriptions' },
  { id: 'planets',   label: '🪐 Planets',        desc: 'Planetary meanings' },
  { id: 'remedies',  label: '🙏 Remedies',       desc: 'Vedic remedies & mantras' },
  { id: 'yoga',      label: '🔗 Yogas',          desc: 'Planetary yoga combinations' },
  { id: 'dasha',     label: '📅 Dasha',          desc: 'Dasha period interpretations' },
  { id: 'rules',     label: '📋 Custom Rules',   desc: 'Your own astrology rules' },
];

export default function Admin() {
  const [sources, setSources]           = useState([]);
  const [uploading, setUploading]       = useState(false);
  const [uploadMsg, setUploadMsg]       = useState(null);
  const [category, setCategory]         = useState('general');
  const [activeTab, setActiveTab]       = useState('upload'); // 'upload' | 'rule' | 'search'
  const [rule, setRule]                 = useState({ title: '', content: '', category: 'rules' });
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]       = useState(false);
  const fileRef                         = useRef();

  useEffect(() => { loadSources(); }, []);

  const loadSources = async () => {
    try {
      const res = await api.get('/admin/knowledge-sources');
      setSources(res.data.sources || []);
    } catch {}
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return setUploadMsg({ type: 'error', text: 'Please select a file' });

    setUploading(true);
    setUploadMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const res = await api.post(`/admin/upload-knowledge?category=${category}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMsg({ type: 'success', text: res.data.message });
      fileRef.current.value = '';
      loadSources();
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.response?.data?.detail || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!rule.title || !rule.content) return;
    try {
      await api.post('/admin/add-rule', rule);
      setUploadMsg({ type: 'success', text: '✅ Rule added to knowledge base!' });
      setRule({ title: '', content: '', category: 'rules' });
      loadSources();
    } catch {
      setUploadMsg({ type: 'error', text: 'Failed to add rule' });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/admin/search-knowledge?query=${encodeURIComponent(searchQuery)}&limit=5`);
      setSearchResults(res.data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleDeleteSource = async (name) => {
    if (!window.confirm(`Delete all content from "${name}"?`)) return;
    try {
      await api.delete(`/admin/knowledge-source/${encodeURIComponent(name)}`);
      loadSources();
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>📚 Knowledge Base</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Upload astrology books and rules to enhance AI predictions
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Sources Uploaded', value: sources.length, emoji: '📚' },
            { label: 'Total Chunks', value: sources.reduce((a, s) => a + (s.chunks || 0), 0), emoji: '🧩' },
            { label: 'Categories', value: [...new Set(sources.map(s => s.category))].length, emoji: '🏷️' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.emoji}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--purple-400)' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feedback message */}
        {uploadMsg && (
          <div style={{
            padding: '14px 18px', marginBottom: 20, borderRadius: 'var(--radius)',
            background: uploadMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${uploadMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: uploadMsg.type === 'success' ? '#34d399' : '#f87171',
            fontSize: 14,
          }}>
            {uploadMsg.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'upload', label: '📤 Upload Book' },
            { id: 'rule',   label: '✍️ Add Rule' },
            { id: 'search', label: '🔍 Search Knowledge' },
            { id: 'manage', label: '⚙️ Manage Sources' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 18px', background: 'none', border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--purple-500)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--purple-400)' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 600 : 400,
              fontSize: 13, cursor: 'pointer', marginBottom: -1,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Upload tab */}
        {activeTab === 'upload' && (
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Upload Astrology Book</h3>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">File (PDF or TXT)</label>
                <input ref={fileRef} type="file" accept=".pdf,.txt,.md"
                  style={{
                    width: '100%', padding: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer', fontSize: 14,
                  }} />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Supports PDF, TXT, and Markdown files. Max recommended: 50MB
                </p>
              </div>

              <div>
                <label className="label">Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '10px 8px', borderRadius: 'var(--radius)',
                        border: '1px solid',
                        borderColor: category === cat.id ? 'var(--purple-500)' : 'var(--border)',
                        background: category === cat.id ? 'rgba(168,85,247,0.1)' : 'transparent',
                        color: category === cat.id ? 'var(--purple-400)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 12, textAlign: 'center',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={uploading}>
                {uploading ? <><span className="spinner" /> Processing...</> : '📤 Upload to Knowledge Base'}
              </button>
            </form>
          </div>
        )}

        {/* Add Rule tab */}
        {activeTab === 'rule' && (
          <div className="card">
            <h3 style={{ marginBottom: 6 }}>Add Custom Astrology Rule</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
              Add your own interpretations, rules, or notes directly to the knowledge base
            </p>
            <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Rule Title</label>
                <input className="input" type="text"
                  placeholder="e.g. Sun in Ashwini Nakshatra interpretation"
                  value={rule.title} onChange={e => setRule({ ...rule, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Rule Content</label>
                <textarea className="input" rows={8}
                  placeholder="Write your astrology rule, interpretation, or note here..."
                  style={{ resize: 'vertical', lineHeight: 1.7 }}
                  value={rule.content} onChange={e => setRule({ ...rule, content: e.target.value })} required />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={rule.category}
                  onChange={e => setRule({ ...rule, category: e.target.value })}
                  style={{ cursor: 'pointer' }}>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#1a1530' }}>{c.label}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" type="submit">
                ✅ Add Rule to Knowledge Base
              </button>
            </form>
          </div>
        )}

        {/* Search tab */}
        {activeTab === 'search' && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Search Knowledge Base</h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <input className="input" style={{ flex: 1 }}
                placeholder="Search for Nakshatra, remedies, planetary effects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
                {searching ? <span className="spinner" /> : '🔍 Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Found {searchResults.length} relevant passages:
                </p>
                {searchResults.map((result, i) => (
                  <div key={i} style={{
                    padding: '14px 16px',
                    background: 'rgba(168,85,247,0.05)',
                    border: '1px solid rgba(168,85,247,0.12)',
                    borderRadius: 'var(--radius)',
                    fontSize: 13, lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--purple-400)', marginBottom: 8, fontWeight: 600 }}>
                      Result {i + 1}
                    </div>
                    {result.slice(0, 400)}{result.length > 400 ? '...' : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manage sources tab */}
        {activeTab === 'manage' && (
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Knowledge Sources ({sources.length})</h3>
            {sources.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p>No sources yet. Upload a book to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sources.map((source, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>📄 {source.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        Category: {source.category} · {source.chunks} text chunks stored
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteSource(source.name)}
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
