import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, BarChart3, Globe, Radio, Layers, Search, Zap, Wallet, ChevronRight, BrainCircuit, Network, Cpu } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [scrollY, setScrollY] = useState(0);

  // Scroll animations and parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

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
          transform: translateY(40px) scale(0.95);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

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

        /* ── Animated Background Gradients ── */
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bg-animated-mesh {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: 
            radial-gradient(circle at 15% 50%, rgba(0, 240, 255, 0.15), transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(255, 0, 123, 0.15), transparent 25%),
            radial-gradient(circle at 50% 80%, rgba(112, 0, 255, 0.15), transparent 25%);
          z-index: 0;
          pointer-events: none;
        }

        /* ── Orbital System ── */
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .orbital-system {
          position: relative;
          width: 500px;
          height: 500px;
          margin: 0 auto;
        }
        .orbit-ring-1 {
          position: absolute; top: 10%; left: 10%; right: 10%; bottom: 10%;
          border: 1px dashed rgba(0, 240, 255, 0.3);
          border-radius: 50%;
          animation: rotate-slow 30s linear infinite;
        }
        .orbit-ring-2 {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          border: 1px solid rgba(255, 0, 123, 0.2);
          border-radius: 50%;
          animation: rotate-reverse 40s linear infinite;
        }
        .orbital-node {
          position: absolute;
          width: 60px; height: 60px;
          background: rgba(10, 15, 30, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 240, 255, 0.5);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #00f0ff;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0,240,255,0.2);
        }
        .orbital-node.magenta {
          border-color: rgba(255, 0, 123, 0.5);
          color: #ff007b;
          box-shadow: 0 0 20px rgba(255, 0, 123, 0.4), inset 0 0 10px rgba(255,0,123,0.2);
        }
        .orbital-node:nth-child(1) { top: -30px; left: 50%; transform: translateX(-50%); }
        .orbital-node:nth-child(2) { bottom: -30px; left: 50%; transform: translateX(-50%); }
        .orbital-node:nth-child(3) { top: 50%; left: -30px; transform: translateY(-50%); }
        .orbital-node:nth-child(4) { top: 50%; right: -30px; transform: translateY(-50%); }

        .orbital-center {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 120px; height: 120px;
          background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(112,0,255,0.2));
          border: 2px solid rgba(0, 240, 255, 0.8);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 50px rgba(0, 240, 255, 0.6);
          z-index: 10;
        }

        /* ── Glass Cards ── */
        .glass-panel {
          background: rgba(15, 20, 30, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          position: relative;
          overflow: hidden;
        }
        .glass-panel::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        }
        
        .hover-card-3d {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        }
        .hover-card-3d:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: rgba(0, 240, 255, 0.5) !important;
          box-shadow: 0 30px 60px rgba(0, 240, 255, 0.15), 0 0 20px rgba(0, 240, 255, 0.2) inset;
        }

        /* ── Buttons ── */
        .btn-glow-cyan {
          background: linear-gradient(135deg, #00f0ff, #0066ff);
          color: #000;
          font-weight: 700;
          border: none;
          position: relative;
          z-index: 1;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-glow-cyan::after {
          content: ''; position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(135deg, #0066ff, #00f0ff);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .btn-glow-cyan:hover::after { opacity: 1; }
        .btn-glow-cyan:hover {
          box-shadow: 0 0 30px rgba(0, 240, 255, 0.6);
          transform: translateY(-2px);
        }

        .btn-outline-magenta {
          background: transparent;
          color: #fff;
          font-weight: 600;
          border: 1px solid #ff007b;
          box-shadow: 0 0 15px rgba(255, 0, 123, 0.2);
          transition: all 0.3s ease;
        }
        .btn-outline-magenta:hover {
          background: rgba(255, 0, 123, 0.1);
          box-shadow: 0 0 25px rgba(255, 0, 123, 0.6);
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .orbital-system { transform: scale(0.7); margin-top: 40px; }
        }
      `}</style>

      {/* Global Animated Background */}
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
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 0 15px rgba(0,240,255,0.5)'
          }}>🐬</div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.15em' }}>
            DORPHIN
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => alert('Wallet connection initializing...')}
            className="btn-outline-magenta"
            style={{
              padding: '10px 20px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Wallet size={16} /> Connect Wallet
          </button>
          <button 
            onClick={() => navigate('/app')}
            className="btn-glow-cyan"
            style={{
              padding: '10px 24px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer'
            }}
          >
            Launch App <ChevronRight size={18} />
          </button>
        </div>
      </nav>

      {/* SECTION 1: Hero */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 24px 60px',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }} className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          
          <div style={{ zIndex: 2 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '8px 16px', borderRadius: '100px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              marginBottom: '32px',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
            }}>
              <BrainCircuit size={16} color="#00f0ff" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#00f0ff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Advanced AI Neural Engine
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(48px, 6vw, 84px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: '24px'
            }}>
              Total <span className="text-gradient-cyan">Awareness.</span><br />
              Absolute <span className="text-gradient-magenta">Control.</span>
            </h1>
            
            <p style={{
              fontSize: '20px', color: '#A0AEC0', lineHeight: 1.6,
              marginBottom: '48px', maxWidth: '540px', fontWeight: 400
            }}>
              Don't just look at data. <strong>Understand it.</strong> Our deep-learning AI dissects smart contracts in real-time, surfacing invisible risks before they become your losses.
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/app')}
                className="btn-glow-cyan"
                style={{
                  padding: '18px 36px', borderRadius: '16px',
                  fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <Zap size={20} /> Access AI Terminal
              </button>
            </div>
            
            <div style={{ marginTop: '48px', display: 'flex', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#00f0ff' }}>0.2s</div>
                <div style={{ fontSize: '13px', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>AI Processing Time</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#ff007b' }}>99.9%</div>
                <div style={{ fontSize: '13px', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Scam Detection Rate</div>
              </div>
            </div>
          </div>

          <div style={{ zIndex: 1, position: 'relative' }}>
            <div className="orbital-system">
              <div className="orbit-ring-1">
                <div className="orbital-node"><Network size={24} /></div>
                <div className="orbital-node"><Activity size={24} /></div>
              </div>
              <div className="orbit-ring-2">
                <div className="orbital-node magenta"><Shield size={24} /></div>
                <div className="orbital-node magenta"><Search size={24} /></div>
              </div>
              <div className="orbital-center">
                <BrainCircuit size={48} color="#fff" />
              </div>
              {/* Center glow effect */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,240,255,0.2) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 0
              }} />
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: AI Intelligence Gap */}
      <section style={{ padding: '120px 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800, marginBottom: '24px' }}>
              The <span className="text-gradient-magenta">AI Intelligence</span> Gap
            </h2>
            <p style={{ color: '#A0AEC0', fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
              Human analysis cannot scale to the speed of modern decentralized markets. 
              By the time you read the code, the liquidity is already gone.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
            {[
              { title: 'Invisible Rug Pulls', icon: <Shield size={32} color="#ff007b" />, desc: 'Malicious code is obfuscated. Our AI decompiles and analyzes bytecode patterns instantly, flagging honeypots before you swap.' },
              { title: 'Wash Trade Illusions', icon: <Activity size={32} color="#00f0ff" />, desc: 'High volume doesn\'t mean high liquidity. The neural engine maps holder networks to detect coordinated pump schemas.' },
              { title: 'Information Asymmetry', icon: <Cpu size={32} color="#7000ff" />, desc: 'Institutions use algorithmic trading. Now you have an AI agent working for you, 24/7, processing millions of signals per second.' }
            ].map((p, i) => (
              <div key={i} className="glass-panel hover-card-3d animate-on-scroll" style={{ padding: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '16px', 
                  background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {p.icon}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{p.title}</h3>
                <p style={{ fontSize: '16px', color: '#A0AEC0', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Deep AI Features */}
      <section style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Background ambient glow */}
        <div style={{ position: 'absolute', top: '50%', right: '-20%', transform: 'translateY(-50%)', width: '80%', height: '800px', background: 'radial-gradient(ellipse, rgba(112,0,255,0.1) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="animate-on-scroll" style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800 }}>
              The Ultimate <span className="text-gradient-cyan">Risk Engine</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            {[
              { icon: <BrainCircuit size={28}/>, title: 'Algorithmic Dorphin Score', color: '#00f0ff', desc: 'A dynamically calculated score (0-100) generated by our neural network analyzing contract safety, liquidity depth, and creator history.' },
              { icon: <Search size={28}/>, title: 'Smart Contract Forensics', color: '#ff007b', desc: 'Deep-dive security scanning powered by GoPlus. We automatically identify hidden mints, fee modifiers, and proxy vulnerabilities.' },
              { icon: <Activity size={28}/>, title: 'Predictive Listing Models', color: '#7000ff', desc: 'Machine learning models predict the probability of tier-1 centralized exchange listings (Binance, Upbit, Coinbase) based on chain metrics.' },
              { icon: <Radio size={28}/>, title: 'Real-time Sonar Feed', color: '#00f0ff', desc: 'Live mempool scanning. The moment a liquidity pair is created on BSC, our AI evaluates and scores it before the UI even updates.' }
            ].map((f, i) => (
              <div key={i} className="glass-panel hover-card-3d animate-on-scroll" style={{
                padding: '48px',
                background: 'linear-gradient(180deg, rgba(15,20,30,0.8) 0%, rgba(10,15,20,0.9) 100%)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', 
                    background: `rgba(${f.color === '#00f0ff' ? '0,240,255' : f.color === '#ff007b' ? '255,0,123' : '112,0,255'}, 0.1)`,
                    border: `1px solid ${f.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: f.color, boxShadow: `0 0 20px rgba(${f.color === '#00f0ff' ? '0,240,255' : f.color === '#ff007b' ? '255,0,123' : '112,0,255'}, 0.4)`
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 700 }}>{f.title}</h3>
                </div>
                <p style={{ fontSize: '16px', color: '#A0AEC0', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Huge CTA */}
      <section style={{ padding: '160px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(0,240,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }} className="animate-on-scroll">
          <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, marginBottom: '32px', lineHeight: 1.1 }}>
            Stop guessing.<br/>
            Start <span className="text-gradient-cyan">knowing.</span>
          </h2>
          <p style={{ fontSize: '20px', color: '#A0AEC0', marginBottom: '48px' }}>
            Plug any contract address into our AI terminal and get a full risk assessment in under 5 seconds.
          </p>
          
          <div style={{
            display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.6)',
            border: '2px solid rgba(0,240,255,0.4)', borderRadius: '20px', padding: '10px',
            boxShadow: '0 0 40px rgba(0,240,255,0.2)', maxWidth: '600px', margin: '0 auto'
          }}>
            <input 
              type="text" 
              placeholder="0x... paste contract address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                padding: '0 24px', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '16px'
              }}
            />
            <button 
              onClick={() => navigate('/app')}
              className="btn-glow-cyan"
              style={{
                padding: '16px 32px', borderRadius: '12px', fontSize: '16px', cursor: 'pointer'
              }}
            >
              Analyze Token
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '60px 32px', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        background: '#020305',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🐬</span>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.15em', background: 'linear-gradient(90deg, #00f0ff, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
