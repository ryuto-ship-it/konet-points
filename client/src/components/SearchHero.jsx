import { useState, useEffect, useRef, useCallback } from 'react';
import { searchTokens } from '../api/client';
import './SearchHero.css';

const QUICK_TOKENS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', chain: 'ethereum' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', chain: 'bsc' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', chain: 'ethereum' },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', image: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg', chain: 'ethereum' },
  { id: 'aave', name: 'Aave', symbol: 'AAVE', image: 'https://assets.coingecko.com/coins/images/12645/small/aave-token.png', chain: 'ethereum' },
];

const SUPPORTED_CHAINS = [
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'bsc', name: 'BSC' },
  { id: 'polygon-pos', name: 'Polygon' },
  { id: 'arbitrum-one', name: 'Arbitrum' },
  { id: 'optimistic-ethereum', name: 'Optimism' },
  { id: 'solana', name: 'Solana' },
  { id: 'base', name: 'Base' }
];

export default function SearchHero({ onTokenSelect, error }) {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      {/* Animated background grid */}
      <div className="hero-grid-bg">
        <div className="grid-lines" />
        <div className="grid-glow grid-glow-1" />
        <div className="grid-glow grid-glow-2" />
        <div className="grid-dots" />
      </div>

      <div className="hero-content">
        {/* Logo */}
        <div className="hero-logo animate-fade-in-up">
          <div className="logo-mark">
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="14" fill="var(--bg-secondary)" />
              <rect x="2" y="2" width="60" height="60" rx="12" stroke="var(--accent-cyan)" strokeWidth="2" strokeOpacity="0.5" />
              <path d="M22 18h12c8.8 0 16 7.2 16 16s-7.2 16-16 16H22V18zm5 5v22h7c6 0 11-5 11-11s-5-11-11-11h-7z" fill="var(--accent-cyan)" />
              <circle cx="44" cy="20" r="4" fill="var(--accent-emerald)" opacity="0.8" />
            </svg>
          </div>
          <h1 className="logo-text">
            Dorphin <span className="text-gradient">Research</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="hero-tagline animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          AI-Powered Token Intelligence Platform
        </p>
        <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Institutional-grade token analysis reports, powered by AI
        </p>

        {/* Search Bar */}
        <div
          className="search-container animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
          ref={dropdownRef}
        >
          <div className={`search-bar ${query ? 'search-bar--active' : ''}`} style={{ display: 'flex', gap: '8px' }}>
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
              placeholder="Search token name or contract address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              autoComplete="off"
              spellCheck="false"
              style={{ flex: 1 }}
            />
            {isSearching ? (
              <div className="search-spinner" style={{ marginRight: '16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
            ) : (
              <button 
                onClick={executeSearch}
                className="search-button"
                style={{
                  background: 'rgba(51,204,204,0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(51,204,204,0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 16px',
                  margin: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(51,204,204,0.25)';
                  e.target.style.borderColor = 'rgba(51,204,204,0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(51,204,204,0.15)';
                  e.target.style.borderColor = 'rgba(51,204,204,0.3)';
                }}
              >
                검색하기
              </button>
            )}
          </div>
          <div className="search-glow" />

          {/* Autocomplete Dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((token, i) => (
                <button
                  key={token.id}
                  className={`search-result ${i === activeIndex ? 'search-result--active' : ''}`}
                  onClick={() => handleSelect(token)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <div className="result-left">
                    {token.image ? (
                      <img
                        src={token.image}
                        alt={token.name}
                        className="result-image"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="result-image-fallback">
                        {token.symbol?.charAt(0)}
                      </div>
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

        {/* Quick Access Tokens */}
        <div className="quick-tokens animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <span className="quick-label">Popular:</span>
          {QUICK_TOKENS.map((token) => (
            <button
              key={token.id}
              className="quick-chip"
              onClick={() => handleSelect(token)}
            >
              <img
                src={token.image}
                alt={token.symbol}
                className="chip-image"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span>{token.symbol}</span>
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="hero-error animate-fade-in-up">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="hero-footer animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          Powered by CoinGecko · DefiLlama · Etherscan · Claude AI
        </div>
      </div>
    </div>
  );
}
