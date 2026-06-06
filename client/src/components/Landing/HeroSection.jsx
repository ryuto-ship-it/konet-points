import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchTokens } from '../../api/client';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [chain, setChain] = useState('bsc');
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      // Direct pass to the report page if we assume backend can resolve it, 
      // or we can hit search API first like the old SearchHero.
      const res = await searchTokens(query, chain);
      if (res.results && res.results.length > 0) {
        // Go to first result
        const token = res.results[0];
        // Our backend now uses the token ID or slug directly for reports.
        navigate(`/report/${token.id || token.address}`, { state: { token: { ...token, chain } } });
      } else {
        setError('Token not found. Try a contract address.');
      }
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const setPopular = (tag) => {
    setQuery(tag);
    // Normally you'd submit immediately, but we'll let user click
  };

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 20px 80px',
      background: '#0a0b0f',
      overflow: 'hidden'
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,229,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      {/* Top Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '40px',
        zIndex: 10
      }}>
        <svg 
          width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: 'swim 3s ease-in-out infinite' }}
        >
          <path d="M12 2C7 2 3 5 3 10c0 3.3 1.8 6.4 5 8v2a1 1 0 0 0 1.6.8l2.8-2.1c1.2.2 2.4.3 3.6.3 5 0 9-3 9-8s-4-8-9-8z" />
          <path d="M9 14l-2 2" />
          <path d="M12 2v4" />
        </svg>
        <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', color: '#fff' }}>DORPHIN RESEARCH</span>
      </div>

      {/* Typography */}
      <div style={{ textAlign: 'center', zIndex: 10, maxWidth: '800px' }}>
        <h1 className="heading-space" style={{
          fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.1,
          margin: 0
        }}>
          AI-Powered Token Intelligence
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '12px',
          marginBottom: '48px'
        }}>
          Dive deeper. Surface smarter.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ zIndex: 10, width: '100%', maxWidth: '680px' }}>
        <form 
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '64px',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${isFocused ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '32px',
            padding: '0 8px 0 24px',
            boxShadow: isFocused ? '0 0 0 3px rgba(0,229,255,0.1)' : 'none',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
        >
          <select 
            value={chain} 
            onChange={e => setChain(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '24px',
              padding: '8px 16px',
              fontSize: '14px',
              color: '#fff',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              marginRight: '12px'
            }}
          >
            <option value="bsc">BSC</option>
            <option value="ethereum">ETH</option>
            <option value="polygon">Polygon</option>
            <option value="base">Base</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
          
          <input
            type="text"
            className="heading-mono"
            placeholder="Contract address or token name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'rgba(255,255,255,0.8)'
            }}
          />
          
          <button 
            type="submit"
            disabled={isSearching}
            style={{
              background: 'linear-gradient(135deg, #00e5ff, #0066ff)',
              border: 'none',
              borderRadius: '24px',
              padding: '12px 28px',
              fontWeight: 600,
              fontSize: '15px',
              color: '#000',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: isSearching ? 0.7 : 1
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            {isSearching ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {error && (
          <p style={{ color: '#ff3d5a', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>{error}</p>
        )}

        {/* Popular Tags */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginRight: '4px' }}>Popular:</span>
          {['BTC', 'ETH', 'BNB', 'WALLI'].map(tag => (
            <button
              key={tag}
              onClick={() => setPopular(tag)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '4px 14px',
                fontSize: '13px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        marginTop: '60px',
        zIndex: 10
      }}>
        {[
          { num: '12,481+', label: 'TOKENS ANALYZED' },
          { num: '45,000+', label: 'REPORTS GENERATED' },
          { num: '6+', label: 'SUPPORTED CHAINS' }
        ].map((stat, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            paddingRight: i < 2 ? '40px' : '0'
          }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#00e5ff' }}>{stat.num}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* New Listings Link */}
      <div style={{ marginTop: '40px', zIndex: 10 }}>
        <a 
          href="#!"
          onClick={(e) => { e.preventDefault(); navigate('/listings'); }}
          style={{
            fontSize: '14px',
            color: '#00e5ff',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
        >
          🔴 실시간 신규 토큰 스크리닝 보기 →
        </a>
      </div>
    </section>
  );
}
