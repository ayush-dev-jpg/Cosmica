// src/components/ChatBot.js
import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const SUGGESTIONS = [
  'What does my Nakshatra say about my personality?',
  'What is the significance of my Lagna?',
  'What are remedies for Saturn in my chart?',
  'Explain the concept of Vimshottari Dasha',
  'What is the meaning of retrograde planets?',
];

export default function ChatBot({ kundliData }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '🙏 Namaste! I am Cosmica, your personal Vedic astrology guide. Ask me anything about your birth chart, Nakshatras, Rashis, planetary influences, or Vedic astrology in general.',
    }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setInput('');

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/chat/ask', {
        message: text,
        kundli_context: kundliData || null,
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.data.answer,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '⚠️ Sorry, I encountered an error. Please try again.',
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Chat bubble button
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 60, height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--purple-600), var(--indigo-400))',
          border: 'none',
          color: 'white',
          fontSize: 26,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 500,
          transition: 'transform 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        🔮
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      width: 380, height: 560,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      zIndex: 500,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2))',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🔮</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Cosmica AI</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Vedic Astrology Guide</div>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}
        >✕</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, var(--purple-600), var(--indigo-400))'
                : msg.isError ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              fontSize: 13,
              lineHeight: 1.6,
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 6, padding: '4px 0' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--purple-500)',
                animation: `twinkle 1s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}

        {/* Quick suggestions */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Suggested questions
            </div>
            {SUGGESTIONS.slice(0, 3).map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} style={{
                padding: '8px 12px', borderRadius: 10,
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.15)',
                color: 'var(--text-secondary)', fontSize: 12,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s',
              }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8,
      }}>
        <input
          className="input"
          style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
          placeholder="Ask about Vedic astrology..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{ padding: '10px 14px', minWidth: 'unset' }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
