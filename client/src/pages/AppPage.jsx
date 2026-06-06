import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTokens } from '../api/client';
import { useRef, useEffect, useCallback } from 'react';

const SUPPORTED_CHAINS = [
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'bsc', name: 'BSC' },
  { id: 'polygon-pos', name: 'Polygon' },
  { id: 'arbitrum-one', name: 'Arbitrum' },
  { id: 'optimistic-ethereum', name: 'Optimism' },
  { id: 'solana', name: 'Solana' },
  { id: 'base', name: 'Base' },
];

export default function AppPage() {
  const [query, setQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState('bsc');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, selectedChain]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback((token) => {
    setQuery('');
    setShowDropdown(false);
    setResults([]);
    navigate(`/report/${encodeURIComponent(token.id)}`, {
      state: { token: { id: token.id, address: token.address || null, chain: token.chain || selectedChain, name: token.name, symbol: token.symbol || '' } },
    });
  }, [navigate, selectedChain]);

  const executeSearch = () => {
    if (!query.trim()) return;
    if (showDropdown && results.length > 0 && activeIndex >= 0) { handleSelect(results[activeIndex]); return; }
    if (results.length > 0) { handleSelect(results[0]); return; }
    handleSelect({
      id: query.trim(),
      name: query.trim(),
      address: query.trim().startsWith('0x') ? query.trim() : null,
      chain: selectedChain,
      symbol: 'TOKEN',
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { if (!showDropdown || !results.length) return; e.preventDefault(); setActiveIndex(p => (p < results.length - 1 ? p + 1 : 0)); }
    else if (e.key === 'ArrowUp') { if (!showDropdown || !results.length) return; e.preventDefault(); setActiveIndex(p => (p > 0 ? p - 1 : results.length - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); executeSearch(); }
    else if (e.key === 'Escape') { setShowDropdown(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '70vh', padding: '120px 24px 40px', position: 'relative',
      }}>
        {/* Subtle glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,158,191,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ textAlign: 'center', zIndex: 1, maxWidth: '640px', width: '100%' }}>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, lineHeight: 1.15,
            letterSpacing: '-0.025em', marginBottom: '12px',
          }}>Token Analysis</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '36px' }}>
            Paste a contract address or search by name to generate a full risk report.
          </p>

          {/* Search */}
          <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
            <div style={{
              display: 'flex', alignItems: 'center', height: '50px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
              borderRadius: '10px', overflow: 'hidden',
            }}>
              <select
                value={selectedChain}
                onChange={e => setSelectedChain(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  borderRight: '1px solid var(--border)', padding: '0 12px',
                  fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                  cursor: 'pointer', height: '100%', minWidth: '80px',
                }}
              >
                {SUPPORTED_CHAINS.map(c => (
                  <option key={c.id} value={c.id} style={{ background: 'var(--bg-card)' }}>{c.name}</option>
                ))}
              </select>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder="Contract address or token name…"
                autoComplete="off"
                spellCheck="false"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  padding: '0 16px', fontFamily: 'var(--font-mono)', fontSize: '13px',
                  color: 'var(--text-primary)',
                }}
              />

              <button
                onClick={executeSearch}
                style={{
                  height: '36px', margin: '0 7px', padding: '0 20px',
                  background: 'var(--accent)', border: 'none', borderRadius: '7px',
                  fontSize: '13px', fontWeight: 500, color: '#fff', flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                {isSearching ? '...' : 'Analyze'}
              </button>
            </div>

            {/* Dropdown */}
            {showDropdown && results.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
                borderRadius: '10px', overflow: 'hidden', zIndex: 100,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {results.map((token, i) => (
                  <button
                    key={token.id}
                    onClick={() => handleSelect(token)}
                    onMouseEnter={() => setActiveIndex(i)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '10px 16px', textAlign: 'left',
                      background: i === activeIndex ? 'var(--bg-hover)' : 'transparent',
                      borderBottom: i < results.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {token.image ? (
                        <img src={token.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 600, color: 'var(--accent)',
                        }}>{token.symbol?.charAt(0)}</div>
                      )}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{token.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{token.symbol?.toUpperCase()}</div>
                      </div>
                    </div>
                    {token.market_cap_rank && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>#{token.market_cap_rank}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Supports Ethereum, BSC, Solana, Base, Polygon, Arbitrum, Optimism
          </p>
        </div>
      </div>

      {/* Quick link to listings */}
      <div style={{
        maxWidth: '640px', margin: '0 auto', padding: '0 24px 60px',
      }}>
        <button
          onClick={() => navigate('/listings')}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '16px 20px', borderRadius: '10px', width: '100%',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <span style={{ fontSize: '24px' }}>📡</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>New Listings Feed</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              BSC 신규 토큰 실시간 스크리닝 · 자동 리스크 분석
            </p>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 500 }}>→</span>
        </button>
      </div>
    </div>
  );
}
