/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef, useCallback } from 'react';
import { searchTokens } from '../api/client';
import './SearchHero.css';

const SUPPORTED_CHAINS = [
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'bsc', name: 'BSC' },
  { id: 'polygon-pos', name: 'Polygon' },
  { id: 'arbitrum-one', name: 'Arbitrum' },
  { id: 'optimistic-ethereum', name: 'Optimism' },
  { id: 'solana', name: 'Solana' },
  { id: 'base', name: 'Base' }
];

export default function SearchHero({ onTokenSelect, onGoToListings, error }) {
  const [query, setQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchTokens(query, selectedChain);
        setResults(data.slice(0, 8));
        setShowDropdown(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedChain]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback((token) => {
    setQuery('');
    setShowDropdown(false);
    setResults([]);
    onTokenSelect(token);
  }, [onTokenSelect]);

  const executeSearch = () => {
    if (!query.trim()) return;
    
    if (showDropdown && results.length > 0 && activeIndex >= 0) {
      handleSelect(results[activeIndex]);
      return;
    }
    
    if (results.length > 0) {
      handleSelect(results[0]);
      return;
    }
    
    handleSelect({
      id: query.trim(),
      name: query.trim(),
      address: query.trim().startsWith('0x') ? query.trim() : null,
      chain: selectedChain,
      symbol: 'TOKEN'
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (!showDropdown || results.length === 0) return;
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      if (!showDropdown || results.length === 0) return;
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="search-hero">
      <div className="hero-background-dolphin">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none">
          <path
            d="M 1200 200 C 1000 150 800 250 600 200 C 400 150 200 250 -100 200"
            fill="none"
            stroke="var(--dolphin-blue)"
            strokeWidth="4"
            opacity="0.1"
          />
          <path
            d="M800,200 C750,150 650,100 450,100 C250,100 150,150 0,200 C-150,250 -250,200 -450,150"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2"
            opacity="0.05"
          />
        </svg>
      </div>

      <div className="hero-content">
        <div className="hero-logo animate-fade-in-up">
          <h1 className="logo-text">
            🐬 DORPHIN <span className="text-gradient">RESEARCH</span>
          </h1>
          <p className="hero-tagline">Dive deeper. Surface smarter.</p>
        </div>

        <div
          className="search-container animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
          ref={dropdownRef}
        >
          <div className="search-bar">
            <select 
              className="chain-select"
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
            >
              {SUPPORTED_CHAINS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Enter contract address or token name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              autoComplete="off"
              spellCheck="false"
            />
            
            {isSearching ? (
              <div className="search-spinner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
            ) : (
              <button onClick={executeSearch} className="search-button">
                <span>Analyze</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((token, i) => (
                <button
                  key={token.id}
                  className={`search-result ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => handleSelect(token)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <div className="result-left">
                    {token.image ? (
                      <img src={token.image} alt={token.name} className="result-image" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="result-image-fallback">{token.symbol?.charAt(0)}</div>
                    )}
                    <div className="result-info">
                      <span className="result-name">{token.name}</span>
                      <span className="result-symbol">{token.symbol?.toUpperCase()}</span>
                    </div>
                  </div>
                  {token.market_cap_rank && (
                    <span className="result-rank">#{token.market_cap_rank}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="hero-error animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        {/* New Listings shortcut */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.35s', marginBottom: '20px' }}>
          <button
            onClick={onGoToListings}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 20px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              cursor: 'pointer', width: '100%', maxWidth: '480px', margin: '0 auto',
              textAlign: 'left', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          >
            <span style={{ fontSize: '28px' }}>🔴</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', margin: 0 }}>
                실시간 신규 토큰 스크리닝
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                BSC 신규 상장 토큰을 AI가 자동 분석합니다
              </p>
            </div>
            <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>바로가기 →</span>
          </button>
        </div>

        <div className="hero-stats-bar animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="hero-stat-item">
            <span className="stat-value">12,481+</span>
            <span className="stat-label">Tokens Analyzed</span>
          </div>
          <div className="stat-divider" />
          <div className="hero-stat-item">
            <span className="stat-value">45,000+</span>
            <span className="stat-label">Reports Generated</span>
          </div>
          <div className="stat-divider" />
          <div className="hero-stat-item">
            <span className="stat-value">6+</span>
            <span className="stat-label">Supported Chains</span>
          </div>
        </div>

      </div>
    </div>
  );
}
