import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CHAINS = [
  { id: 'bsc',      label: 'BSC' },
  { id: 'ethereum', label: 'ETH' },
  { id: 'solana',   label: 'SOL' },
  { id: 'base',     label: 'BASE' },
];

const STATS = [
  { value: '12,481+', label: 'TOKENS ANALYZED' },
  { value: '45,000+', label: 'REPORTS GENERATED' },
  { value: '8+',      label: 'DATA SOURCES' },
];

export default function HeroSection() {
  const [query, setQuery]   = useState('');
  const [chain, setChain]   = useState('bsc');
  const navigate            = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/report/${encodeURIComponent(q)}`, {
      state: { token: { id: q, address: q.startsWith('0x') ? q : null, chain, name: q, symbol: '' } },
    });
  };

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 24px 80px',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      {/* Subtle top glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50vh',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '64px', zIndex: 10,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M20 10C20 14.4183 16.4183 18 12 18C9.62852 18 7.51064 16.9617 6.07613 15.3125C5.00518 16.3307 3.49757 17 2 17C3.5 14.5 3.5 12.5 2 10C4 9 5 7.5 5 5.5C5 3.5 6 2 8 2C10 2 12 4 12 6C14 4 16 3 18 3C20 3 22 5 22 7C22 8.09319 21.6283 9.11305 21 9.92289C20.3717 10.7328 20 11.9 20 13" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 18C12 20.2091 10.2091 22 8 22C7 22 6.5 21.5 6 21" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px', fontWeight: 600,
          letterSpacing: '0.18em',
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
        }}>DORPHIN</span>
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', zIndex: 10, maxWidth: '720px', marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          Institutional-Grade<br />Token Intelligence.
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          fontWeight: 400,
          marginTop: '16px',
        }}>
          Dive deeper. Surface smarter.
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: '600px',
          display: 'flex', alignItems: 'center',
          height: '52px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: '8px',
          zIndex: 10, marginBottom: '12px',
          overflow: 'hidden',
        }}
      >
        <select
          value={chain}
          onChange={e => setChain(e.target.value)}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            borderRight: '1px solid var(--border)',
            padding: '0 14px',
            fontSize: '13px', fontWeight: 500,
            color: 'var(--text-secondary)',
            cursor: 'pointer', height: '100%',
            appearance: 'none',
          }}
        >
          {CHAINS.map(c => (
            <option key={c.id} value={c.id} style={{ background: 'var(--bg-card)' }}>{c.label}</option>
          ))}
        </select>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Contract address or token name"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: '0 16px',
            fontFamily: 'var(--font-mono)', fontSize: '13px',
            color: 'var(--text-primary)',
          }}
        />

        <button
          type="submit"
          style={{
            height: '36px', margin: '0 8px',
            padding: '0 20px',
            background: 'var(--accent)',
            border: 'none', borderRadius: '6px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px', fontWeight: 500,
            color: '#000', cursor: 'pointer',
            flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Analyze
        </button>
      </form>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', zIndex: 10, marginBottom: '64px' }}>
        Popular: BTC · ETH · BNB
      </p>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: '0', zIndex: 10,
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'var(--bg-card)',
      }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{
            padding: '20px 36px', textAlign: 'center',
            borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '24px', fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginBottom: '6px',
            }}>{s.value}</div>
            <div style={{
              fontSize: '10px', fontWeight: 400,
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
