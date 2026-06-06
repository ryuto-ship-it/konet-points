import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [chain, setChain] = useState('bsc');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Mock routing logic for demo
    navigate(`/report/${query}`, { state: { token: { id: query, address: query, chain } } });
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
      background: 'var(--ocean-bg)',
      overflow: 'hidden'
    }}>
      {/* Sonar Background Elements */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '800px', height: '800px', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
        <div className="sonar-ring" style={{ width: '100%', height: '100%' }} />
        <div className="sonar-ring" style={{ width: '100%', height: '100%' }} />
        <div className="sonar-ring" style={{ width: '100%', height: '100%' }} />
      </div>

      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(rgba(0,240,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        animation: 'grid-move 20s linear infinite',
        pointerEvents: 'none'
      }} />

      {/* Typography */}
      <div style={{ textAlign: 'center', zIndex: 10, maxWidth: '800px', animation: 'float-gentle 6s ease-in-out infinite' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)', color: 'var(--sonar-cyan)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '32px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sonar-cyan)', boxShadow: '0 0 10px var(--sonar-cyan)' }} />
          DORPHIN RESEARCH TERMINAL
        </div>
        
        <h1 className="heading-outfit" style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 700, color: '#ffffff', lineHeight: 1.1, margin: 0, textShadow: '0 0 40px rgba(0, 240, 255, 0.3)' }}>
          Institutional Token <br/> Intelligence.
        </h1>
        <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', marginTop: '20px', marginBottom: '56px', fontWeight: 400 }}>
          Dive deeper. Surface smarter.
        </p>
      </div>

      {/* Search Bar - Main CTA */}
      <div className="glass-panel" style={{ zIndex: 10, width: '100%', maxWidth: '720px', padding: '8px', borderRadius: '40px', transition: 'all 0.3s ease', transform: isFocused ? 'scale(1.02)' : 'scale(1)', boxShadow: isFocused ? '0 0 40px rgba(0, 240, 255, 0.2)' : '0 10px 30px rgba(0,0,0,0.5)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', width: '100%', height: '64px' }}>
          
          <select 
            value={chain} 
            onChange={e => setChain(e.target.value)}
            style={{
              background: 'transparent', border: 'none', borderRight: '1px solid rgba(255,255,255,0.1)',
              padding: '0 24px', fontSize: '15px', fontWeight: 600, color: 'var(--sonar-cyan)',
              outline: 'none', cursor: 'pointer', appearance: 'none',
              textTransform: 'uppercase'
            }}
          >
            <option value="bsc" style={{background:'#0a1128'}}>BSC</option>
            <option value="ethereum" style={{background:'#0a1128'}}>ETH</option>
            <option value="solana" style={{background:'#0a1128'}}>SOL</option>
          </select>
          
          <Search size={20} color="rgba(255,255,255,0.4)" style={{ marginLeft: '20px' }} />
          
          <input
            type="text"
            className="heading-mono"
            placeholder="Enter contract address..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#fff', padding: '0 16px' }}
          />
          
          <button 
            type="submit"
            style={{
              background: 'var(--sonar-cyan)', border: 'none', borderRadius: '32px',
              padding: '0 32px', height: '100%', fontWeight: 700, fontSize: '15px', color: '#000',
              cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            Scan
          </button>
        </form>
      </div>

      {/* Quick Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px', zIndex: 10 }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Trending Sonar Hits:</span>
        {['$DORPHIN', '$ALPHA', '$DEEP'].map(tag => (
          <button
            key={tag}
            onClick={() => { setQuery(tag); setIsFocused(true); }}
            style={{
              background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: 'var(--sonar-cyan)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)'; }}
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
}
