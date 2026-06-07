import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Activity, BarChart3, Globe, Radio, Search, Zap, Wallet, ChevronRight, 
  BrainCircuit, Network, Cpu, AlertTriangle, AlertOctagon, TrendingDown, CheckCircle2,
  FileText, Check
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  // Scroll animations
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{
      backgroundColor: '#030508',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: "var(--font-sans, 'Inter', sans-serif)",
      overflowX: 'hidden',
      position: 'relative'
    }}>
      <style>{`
        /* ── Base Animations ── */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }

        /* ── Gradient Text ── */
        .text-gradient-cyan {
          background: linear-gradient(135deg, #00f0ff 0%, #0066ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-magenta {
          background: linear-gradient(135deg, #ff007b 0%, #7000ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Animated Background ── */
        .bg-animated-mesh {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: 
            radial-gradient(circle at 15% 50%, rgba(0, 240, 255, 0.08), transparent 30%),
            radial-gradient(circle at 85% 30%, rgba(255, 0, 123, 0.08), transparent 30%),
            radial-gradient(circle at 50% 80%, rgba(112, 0, 255, 0.08), transparent 30%);
          z-index: 0;
          pointer-events: none;
        }

        /* ── Orbital System ── */
        @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rotate-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .orbital-system { position: relative; width: 400px; height: 400px; margin: 0 auto; }
        .orbit-ring-1 {
          position: absolute; top: 10%; left: 10%; right: 10%; bottom: 10%;
          border: 1px dashed rgba(0, 240, 255, 0.2); border-radius: 50%;
          animation: rotate-slow 30s linear infinite;
        }
        .orbit-ring-2 {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          border: 1px solid rgba(255, 0, 123, 0.15); border-radius: 50%;
          animation: rotate-reverse 40s linear infinite;
        }
        .orbital-node {
          position: absolute; width: 50px; height: 50px;
          background: rgba(10, 15, 30, 0.9); backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 240, 255, 0.5); border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: #00f0ff;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0,240,255,0.2);
        }
        .orbital-node.magenta {
          border-color: rgba(255, 0, 123, 0.5); color: #ff007b;
          box-shadow: 0 0 20px rgba(255, 0, 123, 0.3), inset 0 0 10px rgba(255,0,123,0.2);
        }
        .orbital-node:nth-child(1) { top: -25px; left: 50%; transform: translateX(-50%); }
        .orbital-node:nth-child(2) { bottom: -25px; left: 50%; transform: translateX(-50%); }
        .orbital-node:nth-child(3) { top: 50%; left: -25px; transform: translateY(-50%); }
        .orbital-node:nth-child(4) { top: 50%; right: -25px; transform: translateY(-50%); }
        .orbital-center {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 100px; height: 100px;
          background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(112,0,255,0.1));
          border: 2px solid rgba(0, 240, 255, 0.5); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 40px rgba(0, 240, 255, 0.4); z-index: 10;
        }

        /* ── Glass Cards ── */
        .glass-panel {
          background: rgba(15, 20, 30, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
        }
        .glass-panel:hover {
          transform: translateY(-8px);
          border-color: rgba(0, 240, 255, 0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0, 240, 255, 0.1) inset;
        }
        .glass-panel::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }

        /* ── Buttons ── */
        .btn-glow-cyan {
          background: linear-gradient(135deg, #00f0ff, #0066ff);
          color: #000; font-weight: 700; border: none;
          position: relative; z-index: 1; overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-glow-cyan::after {
          content: ''; position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(135deg, #0066ff, #00f0ff);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .btn-glow-cyan:hover::after { opacity: 1; }
        .btn-glow-cyan:hover { box-shadow: 0 0 24px rgba(0, 240, 255, 0.5); transform: translateY(-2px); }

        .btn-outline {
          background: transparent;
          color: #fff; font-weight: 600;
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.4);
          transform: translateY(-2px);
        }

        /* ── Pulse Animation ── */
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        .live-pulse {
          position: relative;
        }
        .live-pulse::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          border: 2px solid #00f0ff; border-radius: 50%;
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        /* ── Timeline ── */
        .timeline-line {
          position: absolute; top: 0; bottom: 0; left: 24px; width: 2px;
          background: linear-gradient(180deg, rgba(0,240,255,0.5) 0%, rgba(255,255,255,0.1) 100%);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-buttons { justify-content: center; }
          .orbital-system { display: none; }
          .edge-grid { grid-template-columns: 1fr !important; }
          .edge-text { padding-right: 0 !important; margin-bottom: 32px; }
          .edge-reverse { flex-direction: column-reverse !important; }
        }
      `}</style>

      {/* Global Background */}
      <div className="bg-animated-mesh" />

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: scrollY > 50 ? 'rgba(5, 8, 15, 0.9)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(0,240,255,0.1)' : '1px solid transparent',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', boxShadow: '0 0 15px rgba(0,240,255,0.4)'
          }}>🐬</div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.15em' }}>DORPHIN</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate('/app')}
            className="btn-glow-cyan"
            style={{ padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* SECTION 1: Hero */}
      <section style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '140px 24px 80px', zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }} className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'center' }}>
          
          <div className="animate-on-scroll">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '6px 16px', borderRadius: '100px',
              background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)',
              marginBottom: '28px'
            }}>
              <BrainCircuit size={16} color="#00f0ff" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#00f0ff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                AI-Powered Token Intelligence
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(44px, 6vw, 76px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '24px' }}>
              Stop guessing.<br />
              Start <span className="text-gradient-cyan">knowing.</span>
            </h1>
            
            <p style={{ fontSize: '20px', color: '#A0AEC0', lineHeight: 1.6, marginBottom: '48px', maxWidth: '540px' }}>
              Dive deeper. Surface smarter. Get professional risk analysis across multiple data vectors in seconds.
            </p>

            <div className="hero-buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/app')}
                className="btn-glow-cyan"
                style={{ padding: '16px 32px', borderRadius: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                Launch Research Terminal <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => navigate('/listings')}
                className="btn-outline"
                style={{ padding: '16px 32px', borderRadius: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                View Live Feed <Activity size={20} />
              </button>
            </div>
          </div>

          <div className="animate-on-scroll delay-200" style={{ position: 'relative' }}>
            <div className="orbital-system">
              <div className="orbit-ring-1">
                <div className="orbital-node"><Shield size={20} /></div>
                <div className="orbital-node"><BarChart3 size={20} /></div>
              </div>
              <div className="orbit-ring-2">
                <div className="orbital-node magenta"><Activity size={20} /></div>
                <div className="orbital-node magenta"><Search size={20} /></div>
              </div>
              <div className="orbital-center">
                <BrainCircuit size={40} color="#fff" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Market Problem */}
      <section style={{ padding: '120px 24px', background: 'rgba(5, 8, 15, 0.8)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: '20px' }}>The Market Is Broken for Retail</h2>
            <p style={{ color: '#A0AEC0', fontSize: '18px' }}>You are competing against machines and research desks with a severe handicap.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {[
              { icon: <AlertTriangle size={32} color="#ff007b" />, title: 'Information Asymmetry', desc: 'Institutions have 50-person research teams. You have a Twitter feed and a prayer.' },
              { icon: <AlertOctagon size={32} color="#ff007b" />, title: '99% Are Traps', desc: 'Every day, hundreds of new tokens launch on BSC. The vast majority are engineered to fail — after your money is in.' },
              { icon: <TrendingDown size={32} color="#ff007b" />, title: 'Data Without Intelligence', desc: 'CoinGecko shows you numbers. CertiK shows you security. Nobody connects the dots into a verdict.' }
            ].map((p, i) => (
              <div key={i} className={`glass-panel animate-on-scroll delay-${(i+1)*100}`} style={{ padding: '40px' }}>
                <div style={{ marginBottom: '24px' }}>{p.icon}</div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>{p.title}</h3>
                <p style={{ fontSize: '16px', color: '#A0AEC0', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Our Edge (Alternating layout) */}
      <section style={{ padding: '120px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '100px' }}>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, marginBottom: '20px' }}>Our <span className="text-gradient-cyan">Edge</span></h2>
            <p style={{ color: '#A0AEC0', fontSize: '18px' }}>What makes Dorphin different from everything else.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '120px' }}>
            {/* Edge 1 */}
            <div className="edge-grid animate-on-scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div className="edge-text" style={{ paddingRight: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,240,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}>01</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Proprietary Dorphin Score</h3>
                </div>
                <p style={{ fontSize: '18px', color: '#A0AEC0', lineHeight: 1.6 }}>
                  Not just a security scan. Our algorithm cross-references 8+ data sources to produce a single 0-100 score that tells you what the data actually means.
                </p>
              </div>
              <div className="glass-panel" style={{ padding: '40px', background: 'rgba(10,12,18,0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', color: '#A0AEC0' }}>Risk Assessment</div>
                  <div style={{ padding: '4px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>DANGER</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                  <div style={{ fontSize: '64px', fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>35</div>
                  <div style={{ fontSize: '24px', color: '#A0AEC0', paddingBottom: '8px' }}>/ 100</div>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '24px', overflow: 'hidden' }}>
                  <div style={{ width: '35%', height: '100%', background: '#ef4444' }} />
                </div>
              </div>
            </div>

            {/* Edge 2 */}
            <div className="edge-grid edge-reverse animate-on-scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div className="glass-panel" style={{ padding: '40px', background: 'rgba(10,12,18,0.8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <AlertTriangle color="#ff007b" size={28} />
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>Pattern Warning</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['Top 10 holders own 84%', 'Liquidity unlocked in 2 hours', 'Volume spikes without social mentions'].map((w, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: 'rgba(255,0,123,0.05)', borderLeft: '2px solid #ff007b', fontSize: '14px', color: '#E2E4E9' }}>
                      {w}
                    </div>
                  ))}
                </div>
              </div>
              <div className="edge-text" style={{ paddingLeft: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,0,123,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff007b' }}>02</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Pump & Dump Detection</h3>
                </div>
                <p style={{ fontSize: '18px', color: '#A0AEC0', lineHeight: 1.6 }}>
                  We detect the patterns that precede the crash — before the crash happens. Token age vs exchange count, social-to-volume mismatch, coordinated launch signals.
                </p>
              </div>
            </div>

            {/* Edge 3 */}
            <div className="edge-grid animate-on-scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div className="edge-text" style={{ paddingRight: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(112,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7000ff' }}>03</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Korean Exchange Readiness</h3>
                </div>
                <p style={{ fontSize: '18px', color: '#A0AEC0', lineHeight: 1.6 }}>
                  The only platform that scores tokens against Upbit and Bithumb's actual listing criteria. If you're building for Asian markets, this is non-negotiable.
                </p>
              </div>
              <div className="glass-panel" style={{ padding: '40px', background: 'rgba(10,12,18,0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>Upbit Compliance</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#7000ff' }}>82%</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Circulating Supply Transparency', val: 'Pass', color: '#2dd4a0' },
                    { label: 'Key Holder Lockups', val: 'Pass', color: '#2dd4a0' },
                    { label: 'Regulatory Risk (DAXA)', val: 'Review', color: '#e5a83b' }
                  ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#A0AEC0' }}>{c.label}</span>
                      <span style={{ color: c.color, fontWeight: 600 }}>{c.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Edge 4 */}
            <div className="edge-grid edge-reverse animate-on-scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div className="glass-panel" style={{ padding: '32px', background: 'rgba(10,12,18,0.8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div className="live-pulse" style={{ width: '8px', height: '8px', background: '#00f0ff', borderRadius: '50%' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live BSC Feed</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { sym: 'PEPE2', age: '2m', score: 12, color: '#ef4444' },
                    { sym: 'AIAgent', age: '5m', score: 84, color: '#2dd4a0' },
                    { sym: 'DogeX', age: '12m', score: 45, color: '#e5a83b' }
                  ].map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{t.sym}</span>
                        <span style={{ fontSize: '12px', color: '#A0AEC0' }}>{t.age}</span>
                      </div>
                      <div style={{ padding: '2px 8px', background: `${t.color}20`, color: t.color, borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{t.score}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="edge-text" style={{ paddingLeft: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,240,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}>04</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Real-time New Listings</h3>
                </div>
                <p style={{ fontSize: '18px', color: '#A0AEC0', lineHeight: 1.6 }}>
                  BSC scanned every 5 minutes. New tokens scored before the market even notices them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: How It Works */}
      <section style={{ padding: '120px 24px', background: 'rgba(5, 8, 15, 0.8)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: '20px' }}>How It Works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
              { num: '01', title: 'SCAN', icon: <Search size={40} color="#00f0ff" />, desc: 'Paste any contract address. We pull data from 8+ sources simultaneously.' },
              { num: '02', title: 'ANALYZE', icon: <BrainCircuit size={40} color="#ff007b" />, desc: 'Our AI cross-references everything — contract code, on-chain patterns, social signals, exchange data — and runs the Dorphin algorithm.' },
              { num: '03', title: 'KNOW', icon: <CheckCircle2 size={40} color="#7000ff" />, desc: 'Get a full risk report in under 30 seconds. Not just data. A verdict.' }
            ].map((step, i) => (
              <div key={i} className={`glass-panel animate-on-scroll delay-${(i+1)*100}`} style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 800, color: 'rgba(255,255,255,0.05)', position: 'absolute', top: '20px', right: '30px' }}>{step.num}</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.05em' }}>{step.title}</h3>
                <p style={{ fontSize: '16px', color: '#A0AEC0', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Data Sources */}
      <section style={{ padding: '120px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: '20px' }}>Intelligence From Every Angle</h2>
            <p style={{ color: '#A0AEC0', fontSize: '18px' }}>8 specialized data sources, unified into one report</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { name: 'CoinGecko', desc: 'Market data & price history' },
              { name: 'CoinMarketCap', desc: 'Exchange listings & project info' },
              { name: 'DexScreener', desc: 'DEX liquidity & trading patterns' },
              { name: 'Etherscan / BscScan', desc: 'On-chain transaction data' },
              { name: 'CertiK', desc: 'Security scores & audit status' },
              { name: 'GoPlus Security', desc: 'Contract vulnerability scanning' },
              { name: 'Twitter API', desc: 'Social metrics & community health' },
              { name: 'Contract Source', desc: 'Direct code analysis' }
            ].map((s, i) => (
              <div key={i} className={`animate-on-scroll delay-${(i%4)*100}`} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-mono)', marginBottom: '8px', color: '#00f0ff' }}>{s.name}</div>
                <div style={{ fontSize: '14px', color: '#A0AEC0' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Report Preview */}
      <section style={{ padding: '120px 24px', background: 'rgba(5, 8, 15, 0.8)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: '20px' }}>See What You Get</h2>
            <p style={{ color: '#A0AEC0', fontSize: '18px' }}>Every report includes all of this</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div className="animate-on-scroll">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  'Executive risk summary',
                  'Dorphin Score (0-100)',
                  'Pump & dump pattern detection',
                  'Contract source code analysis',
                  'Exchange tier breakdown (T1-T5)',
                  'Korean exchange readiness (Upbit/Bithumb)',
                  'CertiK security integration',
                  'On-chain authenticity verification',
                  'Community vs volume analysis',
                  'Regulatory compliance check (DAXA/SEC/MiCA)'
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Check size={20} color="#00f0ff" />
                    <span style={{ fontSize: '16px', color: '#E2E4E9' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel animate-on-scroll delay-200" style={{ padding: '32px', background: '#0a0d14' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: '#00f0ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800 }}>DTKN</div>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: 700 }}>Dorphin Mock Token</h4>
                  <div style={{ fontSize: '13px', color: '#A0AEC0', fontFamily: 'var(--font-mono)' }}>0x1234...abcd</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#A0AEC0', marginBottom: '8px' }}>Dorphin Score</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#2dd4a0' }}>88</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#A0AEC0', marginBottom: '8px' }}>Risk Level</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#2dd4a0', marginTop: '8px' }}>Low Risk</div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.2)', padding: '16px', borderRadius: '8px', fontSize: '14px', color: '#00f0ff', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <BrainCircuit size={20} style={{ flexShrink: 0 }} />
                <div>Contract verified. Liquidity is locked for 12 months. Holder distribution is healthy. Strong probability for T2 exchange listing.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Live Feed Preview */}
      <section style={{ padding: '120px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: '20px' }}>What's Launching Right Now</h2>
            <p style={{ color: '#A0AEC0', fontSize: '18px' }}>BSC new listings — risk-scored every 5 minutes</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
            {[
              { sym: 'ALPHA', name: 'AlphaProtocol', age: '1m', score: 92, status: 'SAFE', color: '#2dd4a0' },
              { sym: 'MOONX', name: 'MoonX Token', age: '4m', score: 45, status: 'CAUTION', color: '#e5a83b' },
              { sym: 'SCAM', name: 'DefinitelyNotScam', age: '7m', score: 12, status: 'DANGER', color: '#ef4444' }
            ].map((t, i) => (
              <div key={i} className={`glass-panel animate-on-scroll delay-${i*100}`} style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${t.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color, fontWeight: 700 }}>{t.sym[0]}</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{t.sym} <span style={{ fontSize: '14px', color: '#A0AEC0', fontWeight: 400, marginLeft: '8px' }}>{t.name}</span></div>
                    <div style={{ fontSize: '13px', color: '#A0AEC0', marginTop: '4px' }}>Listed {t.age} ago on PancakeSwap</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#A0AEC0', marginBottom: '4px' }}>Score</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: t.color }}>{t.score}</div>
                  </div>
                  <div style={{ padding: '6px 16px', borderRadius: '100px', border: `1px solid ${t.color}50`, color: t.color, fontSize: '12px', fontWeight: 700, width: '90px', textAlign: 'center' }}>
                    {t.status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="animate-on-scroll" style={{ textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/listings')}
              className="btn-outline"
              style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              View Full Feed <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 8: Traction */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, rgba(5,8,15,0.8) 0%, rgba(3,5,8,1) 100%)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="animate-on-scroll" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '60px' }}>Early Signal. Real Depth.</h2>
          <div className="animate-on-scroll" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
            {[
              { num: '12,481+', label: 'Tokens Analyzed', color: '#00f0ff' },
              { num: '45,000+', label: 'Reports Generated', color: '#ff007b' },
              { num: '8+', label: 'Data Sources', color: '#7000ff' },
              { num: '6+', label: 'Chains Supported', color: '#00f0ff' }
            ].map((t, i) => (
              <div key={i} style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '48px', fontWeight: 800, color: t.color, fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>{t.num}</div>
                <div style={{ fontSize: '14px', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: Roadmap */}
      <section style={{ padding: '120px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>Where We're Going</h2>
          </div>

          <div style={{ position: 'relative', paddingLeft: '48px' }}>
            <div className="timeline-line" />
            {[
              { phase: 'Phase 1', status: 'LIVE', title: 'Token Intelligence Terminal', active: true, color: '#2dd4a0' },
              { phase: 'Phase 2', status: 'Q3 2026', title: 'Portfolio Risk Monitoring', active: false, color: '#00f0ff' },
              { phase: 'Phase 3', status: 'Q3 2026', title: 'Telegram Alert Bot', active: false, color: '#00f0ff' },
              { phase: 'Phase 4', status: 'Q4 2026', title: '$DORPHIN Token Launch', active: false, color: '#ff007b' }
            ].map((r, i) => (
              <div key={i} className="animate-on-scroll" style={{ position: 'relative', marginBottom: i === 3 ? 0 : '48px' }}>
                <div style={{
                  position: 'absolute', left: '-53px', top: '2px', width: '12px', height: '12px',
                  background: r.active ? r.color : '#12151B', border: `2px solid ${r.color}`, borderRadius: '50%',
                  boxShadow: r.active ? `0 0 10px ${r.color}` : 'none'
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: r.color }}>{r.phase}</span>
                  <span style={{ padding: '4px 10px', background: `${r.color}20`, color: r.color, borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{r.status}</span>
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: r.active ? '#fff' : '#A0AEC0' }}>{r.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: Final CTA */}
      <section style={{ padding: '160px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(0,240,255,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }} className="animate-on-scroll">
          <h2 style={{ fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1 }}>
            Stop Guessing.
          </h2>
          <p style={{ fontSize: '24px', color: '#A0AEC0', marginBottom: '48px' }}>
            Start knowing what you're really buying.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/app')}
              className="btn-glow-cyan"
              style={{ padding: '18px 36px', borderRadius: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              Launch Research Terminal <ChevronRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/listings')}
              className="btn-outline"
              style={{ padding: '18px 36px', borderRadius: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              View Live Listings
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '60px 32px', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        background: '#020305',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🐬</span>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.15em', color: '#fff' }}>
            DORPHIN RESEARCH
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#666', maxWidth: '500px', textAlign: 'right' }}>
          AI-generated reports are for informational purposes only. This does not constitute financial advice. Always verify onchain data independently. © 2026 Dorphin.
        </p>
      </footer>
    </div>
  );
}
