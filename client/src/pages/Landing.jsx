import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, BarChart3, Globe, Radio, Layers, Search, Zap, Database, ArrowRight, ExternalLink, Wallet, ChevronRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      background: 'var(--bg-base, #0B0D11)',
      color: 'var(--text-primary, #E2E4E9)',
      minHeight: '100vh',
      fontFamily: "var(--font-sans, 'Inter', sans-serif)",
      overflowX: 'hidden'
    }}>
      <style>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
        }

        .orbital-item {
          position: absolute;
          top: 50%;
          left: 50%;
          margin: -24px 0 0 -24px;
          width: 48px;
          height: 48px;
          background: var(--bg-surface, #12151B);
          border: 1px solid var(--border-strong, rgba(255,255,255,0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justifyContent: center;
          color: var(--accent, #3B9EBF);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          animation: orbit 20s linear infinite;
        }

        .orbital-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: rgba(59,158,191,0.1);
          border: 1px solid rgba(59,158,191,0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          box-shadow: 0 0 32px rgba(59,158,191,0.2);
          z-index: 10;
        }

        .orbit-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 280px;
          height: 280px;
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 50%;
        }

        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59,158,191,0.3) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .pipeline-line {
          height: 2px;
          background: repeating-linear-gradient(90deg, rgba(59,158,191,0.5) 0, rgba(59,158,191,0.5) 4px, transparent 4px, transparent 8px);
          flex: 1;
          margin: 0 16px;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .hero-split { flex-direction: column; text-align: center; }
          .hero-split > div { width: 100% !important; }
          .hero-split .buttons { justify-content: center; }
          .orbital-container { display: none; }
          .pipeline-row { flex-direction: column; align-items: center; }
          .pipeline-line { width: 2px; height: 32px; margin: 16px 0; background: repeating-linear-gradient(180deg, rgba(59,158,191,0.5) 0, rgba(59,158,191,0.5) 4px, transparent 4px, transparent 8px); }
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '64px',
        background: 'rgba(11,13,17,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🐬</span>
          <span style={{
            fontSize: '14px', fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>DORPHIN</span>
        </div>
        <button 
          onClick={() => navigate('/app')}
          style={{
            padding: '8px 16px',
            background: 'var(--accent, #3B9EBF)',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.2s',
            cursor: 'pointer',
            border: 'none'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover, #4DB3D4)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent, #3B9EBF)'}
        >
          Launch App
        </button>
      </nav>

      {/* SECTION 1: Hero */}
      <section style={{
        minHeight: '100vh',
        padding: '120px 24px 80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '50vh',
          background: 'radial-gradient(ellipse at top, rgba(59,158,191,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1120px', width: '100%', margin: '0 auto' }}>
          <div className="hero-split" style={{ display: 'flex', alignItems: 'center', gap: '64px' }}>
            <div className="animate-on-scroll" style={{ width: '50%', zIndex: 1 }}>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(59,158,191,0.3)',
                background: 'rgba(59,158,191,0.1)',
                color: 'var(--accent, #3B9EBF)',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '24px'
              }}>
                AI-Powered Token Intelligence
              </div>
              <h1 style={{
                fontSize: 'clamp(40px, 5vw, 64px)',
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '20px'
              }}>
                Institutional-Grade<br />Token Research.
              </h1>
              <p style={{
                fontSize: '18px',
                color: 'var(--text-secondary, #8B8F99)',
                lineHeight: 1.6,
                marginBottom: '40px',
                maxWidth: '480px'
              }}>
                Dive deeper. Surface smarter. 
                Get professional risk analysis across 8+ data sources in seconds.
              </p>
              
              <div className="buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button 
                  onClick={() => navigate('/app')}
                  style={{
                    padding: '14px 24px',
                    background: 'var(--accent, #3B9EBF)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  Launch Research Terminal <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => alert('Wallet Connect coming soon')}
                  style={{
                    padding: '14px 24px',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: '1px solid var(--border-strong, rgba(255,255,255,0.1))',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <Wallet size={18} /> Connect Wallet
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted, #4A4E57)' }}>
                No signup required · Free to use
              </p>
            </div>

            <div className="orbital-container animate-on-scroll" style={{ width: '50%', position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="orbit-ring"></div>
              <div className="orbital-center">🐬</div>
              {[
                { icon: <Shield size={20} />, delay: '0s' },
                { icon: <Activity size={20} />, delay: '-3.3s' },
                { icon: <Database size={20} />, delay: '-6.6s' },
                { icon: <BarChart3 size={20} />, delay: '-10s' },
                { icon: <Radio size={20} />, delay: '-13.3s' },
                { icon: <Zap size={20} />, delay: '-16.6s' }
              ].map((item, i) => (
                <div key={i} className="orbital-item" style={{ animationDelay: item.delay, display: 'flex', justifyContent: 'center' }}>
                  {item.icon}
                </div>
              ))}
            </div>
          </div>

          <div className="animate-on-scroll" style={{
            display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
            marginTop: '100px', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)'
          }}>
            {['AI-Powered', '8+ Data Sources', 'Real-time', 'Institutional Grade', 'BSC · ETH · SOL'].map(tag => (
              <span key={tag} style={{
                padding: '6px 14px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '12px', color: 'var(--text-secondary)'
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: Problem Definition */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-surface, #12151B)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '16px' }}>The crypto intelligence gap.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              Trading decisions are made in seconds, but research takes hours.
              The tools available to retail investors aren't built for the speed of modern crypto.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🎭', title: 'Hundreds of new tokens daily', desc: 'Over 99% are scams, rug pulls, or pump-and-dump schemes. Manual vetting is impossible.' },
              { icon: '🔍', title: 'Data without analysis', desc: 'CMC and CoinGecko show numbers — price, volume, market cap — but don\'t reveal malicious code.' },
              { icon: '💀', title: 'No rug pull detection', desc: 'By the time you realize the liquidity was pulled, your investment is already gone.' },
              { icon: '🏛️', title: 'Institutions have teams', desc: 'Whales have dedicated researchers. Retail investors have nothing but Twitter sentiment.' }
            ].map((p, i) => (
              <div key={i} className="animate-on-scroll hover-card" style={{
                background: 'var(--bg-card, #181C24)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid var(--border-strong, rgba(255,255,255,0.1))'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '20px' }}>{p.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{p.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Solution */}
      <section style={{ padding: '120px 24px', position: 'relative' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '16px' }}>From contract to intelligence in seconds.</h2>
            <p style={{ color: 'var(--text-secondary)' }}>A fully automated pipeline replacing hours of manual research.</p>
          </div>

          <div className="pipeline-row animate-on-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[
              { title: 'Paste Address', icon: <Search size={24} /> },
              { title: 'Aggregate Data', icon: <Database size={24} />, sub: '8 sources' },
              { title: 'AI Analysis', icon: <Zap size={24} /> },
              { title: 'Risk Report', icon: <Shield size={24} />, highlight: true }
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div style={{
                  padding: '24px', width: '180px', textAlign: 'center',
                  background: step.highlight ? 'rgba(59,158,191,0.1)' : 'var(--bg-surface)',
                  border: `1px solid ${step.highlight ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  color: step.highlight ? 'var(--accent)' : 'var(--text-primary)'
                }}>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>{step.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{step.title}</div>
                  {step.sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{step.sub}</div>}
                </div>
                {i < arr.length - 1 && <div className="pipeline-line" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Core Features */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ marginBottom: '56px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 600 }}>Built for serious investors.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {[
              { icon: <BarChart3 size={24}/>, title: 'Dorphin Score', desc: 'Proprietary risk algorithm scoring tokens from 0 to 100 based on security, liquidity, and holder distribution.' },
              { icon: <Activity size={24}/>, title: 'Pump & Dump Detection', desc: 'Pattern recognition across volume and holder concentration to flag coordinated buy/sell activity.' },
              { icon: <Shield size={24}/>, title: 'Contract Security', desc: 'GoPlus-powered smart contract audit. Detects mint functions, proxy contracts, and blacklist mechanisms.' },
              { icon: <Globe size={24}/>, title: 'Exchange Listing Score', desc: 'Algorithmic estimation of CEX listing probability based on project maturity and metrics.' },
              { icon: <Layers size={24}/>, title: 'Korean Exchange Readiness', desc: 'Evaluates compliance with Upbit and Bithumb listing criteria and regulatory standards.' },
              { icon: <Radio size={24}/>, title: 'Real-time New Listings', desc: 'Live BSC token feed with automatic risk scoring within seconds of onchain detection.' }
            ].map((f, i) => (
              <div key={i} className="animate-on-scroll hover-card" style={{
                background: 'var(--bg-card)', padding: '32px', borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ color: 'var(--accent)', marginBottom: '20px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Data Sources */}
      <section style={{ padding: '80px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', textAlign: 'center' }}>
          <p className="animate-on-scroll" style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>
            8 sources. One report.
          </p>
          <div className="animate-on-scroll" style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px',
            fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)'
          }}>
            {['CoinGecko', 'CoinMarketCap', 'DexScreener', 'GoPlus', 'BscScan', 'CertiK', 'DefiLlama', 'TradingView'].map(s => (
              <span key={s} style={{ opacity: 0.6 }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Traction */}
      <section style={{ padding: '100px 24px' }}>
        <div className="animate-on-scroll" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between' }}>
          {[
            { num: '12,481+', label: 'Tokens Analyzed' },
            { num: '45,000+', label: 'Reports Generated' },
            { num: '6+', label: 'Chains Supported' }
          ].map(t => (
            <div key={t.label} style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '48px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                {t.num}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: Roadmap */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="animate-on-scroll" style={{ fontSize: '32px', fontWeight: 600, marginBottom: '48px', textAlign: 'center' }}>What's next.</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { phase: 'Phase 1', title: 'Token Intelligence', status: 'LIVE', active: true },
              { phase: 'Phase 2', title: 'Portfolio Monitoring', status: 'Q3 2026' },
              { phase: 'Phase 3', title: 'Telegram Alerts', status: 'Q4 2026' },
              { phase: 'Phase 4', title: '$DORPHIN Token', status: '2027' }
            ].map((r, i) => (
              <div key={i} className="animate-on-scroll" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '24px 32px', background: 'var(--bg-card)', borderRadius: '12px',
                border: r.active ? '1px solid var(--accent)' : '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{r.phase}</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: r.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r.title}</div>
                </div>
                <div style={{
                  padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  background: r.active ? 'rgba(45,212,160,0.1)' : 'var(--bg-surface)',
                  color: r.active ? 'var(--success, #2DD4A0)' : 'var(--text-muted)'
                }}>
                  {r.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: Final CTA */}
      <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 className="animate-on-scroll" style={{ fontSize: '40px', fontWeight: 600, marginBottom: '40px' }}>Start analyzing. It's free.</h2>
          
          <div className="animate-on-scroll" style={{
            display: 'flex', alignItems: 'center', background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)', borderRadius: '12px', padding: '6px'
          }}>
            <input 
              type="text" 
              placeholder="0x... contract address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                padding: '0 16px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)'
              }}
            />
            <button 
              onClick={() => navigate('/app')}
              style={{
                padding: '12px 24px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer'
              }}
            >
              Analyze
            </button>
          </div>
          <p className="animate-on-scroll" style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '20px' }}>
            No signup · No wallet required · Unlimited reports
          </p>
        </div>
      </section>

      {/* SECTION 9: Footer */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🐬</span>
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>DORPHIN RESEARCH</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '400px', textAlign: 'right' }}>
          This platform provides informational analysis only. Not financial advice. © 2026 Dorphin Research.
        </p>
      </footer>
    </div>
  );
}
