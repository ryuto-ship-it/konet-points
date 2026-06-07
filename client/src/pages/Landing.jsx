import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Activity, BarChart3, Search, ChevronRight, ArrowRight,
  BrainCircuit, AlertTriangle, AlertOctagon, TrendingDown, CheckCircle2, Check
} from 'lucide-react';

/* ── useCountUp ── */
function useCountUp(target, duration = 1500, trigger = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return value;
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [flipped, setFlipped] = useState({});
  const [countVisible, setCountVisible] = useState(false);
  const [scoreVisible, setScoreVisible] = useState(false);
  const countRef = useRef(null);
  const scoreRef = useRef(null);

  const score1 = useCountUp(72, 1200, scoreVisible);
  const count1 = useCountUp(12481, 1800, countVisible);
  const count2 = useCountUp(45000, 1800, countVisible);

  // Scroll + mouse tracking
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });

    // Intersection observers
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.aos').forEach(el => scrollObserver.observe(el));

    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setCountVisible(true); });
    }, { threshold: 0.3 });
    if (countRef.current) countObserver.observe(countRef.current);

    const scoreObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setScoreVisible(true); });
    }, { threshold: 0.3 });
    if (scoreRef.current) scoreObserver.observe(scoreRef.current);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
      scrollObserver.disconnect();
      countObserver.disconnect();
      scoreObserver.disconnect();
    };
  }, []);

  const toggleFlip = (id) => setFlipped(f => ({ ...f, [id]: !f[id] }));

  const scoreColor = (s) => s >= 70 ? '#2dd4a0' : s >= 40 ? '#e5a83b' : '#ef4444';

  return (
    <div style={{
      backgroundColor: '#030508', color: '#fff',
      minHeight: '100vh', fontFamily: "Inter, sans-serif",
      overflowX: 'hidden', position: 'relative',
    }}>
      <style>{`
        /* ── Scroll animations ── */
        .aos { opacity: 0; transform: translateY(36px); transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1); }
        .aos.visible { opacity: 1; transform: translateY(0); }
        .d1 { transition-delay: 100ms; }
        .d2 { transition-delay: 200ms; }
        .d3 { transition-delay: 300ms; }

        /* ── Gradient text ── */
        .tg-cyan { background: linear-gradient(135deg,#00f0ff,#0066ff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .tg-mag  { background: linear-gradient(135deg,#ff007b,#7000ff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        /* ── Glass panel ── */
        .glass {
          background: rgba(15,20,30,0.55); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 20px;
          position: relative; overflow: hidden;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .glass::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent); }
        .glass:hover { transform: translateY(-6px); border-color: rgba(0,240,255,0.28); box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,240,255,0.05); }

        /* ── Buttons ── */
        .btn-cyan { background:linear-gradient(135deg,#00f0ff,#0066ff); color:#000; font-weight:700; border:none; position:relative; z-index:1; overflow:hidden; transition:all .25s; }
        .btn-cyan::after { content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(135deg,#0066ff,#00f0ff); opacity:0; transition:opacity .25s; }
        .btn-cyan:hover::after { opacity:1; }
        .btn-cyan:hover { box-shadow:0 0 24px rgba(0,240,255,0.5); transform:translateY(-2px); }
        .btn-out { background:transparent; color:#fff; font-weight:600; border:1px solid rgba(255,255,255,0.22); transition:all .25s; }
        .btn-out:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.45); transform:translateY(-2px); }

        /* ── 3D flip card ── */
        .flip-scene { perspective: 900px; }
        .flip-card { width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 0.55s cubic-bezier(0.16,1,0.3,1); cursor:pointer; }
        .flip-card.flipped { transform:rotateY(180deg); }
        .flip-face { position:absolute; inset:0; backface-visibility:hidden; border-radius:20px; padding:40px; display:flex; flex-direction:column; }
        .flip-back { transform:rotateY(180deg); background:rgba(0,240,255,0.07); border:1px solid rgba(0,240,255,0.25); }

        /* ── Orbit ── */
        @keyframes orbit-cw  { from{transform:rotate(0deg);}   to{transform:rotate(360deg);}  }
        @keyframes orbit-ccw { from{transform:rotate(360deg);} to{transform:rotate(0deg);}    }
        .orbit1 { animation:orbit-cw  28s linear infinite; }
        .orbit2 { animation:orbit-ccw 38s linear infinite; }

        /* ── Particle float ── */
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg);}   50%{transform:translateY(-22px) rotate(6deg);}  }
        @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg);}   50%{transform:translateY(-18px) rotate(-5deg);} }
        @keyframes floatC { 0%,100%{transform:translateY(-12px) rotate(0deg);} 50%{transform:translateY(8px) rotate(4deg);} }

        /* ── Live pulse ── */
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:0.6;} 100%{transform:scale(2.2);opacity:0;} }
        .live-dot::after { content:''; position:absolute; inset:0; border:2px solid #00f0ff; border-radius:50%; animation:pulse-ring 2s ease infinite; }

        /* ── Data flow (source → center) ── */
        @keyframes dash { from{stroke-dashoffset:200;} to{stroke-dashoffset:0;} }

        /* ── Timeline line ── */
        .tl-line { position:absolute; top:0; bottom:0; left:20px; width:2px; background:linear-gradient(180deg,rgba(0,240,255,0.5),rgba(255,255,255,0.05)); }

        /* ── Responsive ── */
        @media(max-width:900px){
          .hero-cols { grid-template-columns:1fr !important; }
          .hero-visual { display:none !important; }
          .edge-cols { grid-template-columns:1fr !important; }
          .rev { order:-1; }
          .report-cols { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ── Cursor glow ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none',
        background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,240,255,0.045) 0%, transparent 70%)`,
        transition: 'background 0.08s ease',
      }} />

      {/* ── Ambient mesh ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 15% 50%, rgba(0,240,255,0.07) 0%, transparent 32%), radial-gradient(circle at 85% 30%, rgba(255,0,123,0.07) 0%, transparent 32%), radial-gradient(circle at 50% 85%, rgba(112,0,255,0.07) 0%, transparent 32%)',
      }} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: scrollY > 60 ? 'rgba(3,5,8,0.92)' : 'transparent',
        backdropFilter: scrollY > 60 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 60 ? '1px solid rgba(0,240,255,0.1)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#00f0ff,#7000ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 0 14px rgba(0,240,255,0.4)',
          }}>🐬</div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.14em' }}>DOLPHIN</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/listings')} className="btn-out" style={{ padding: '9px 18px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
            Live Feed
          </button>
          <button onClick={() => navigate('/app')} className="btn-cyan" style={{ padding: '9px 20px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
            Launch App
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '140px 24px 80px', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 48, alignItems: 'center' }} className="hero-cols">

          {/* Left */}
          <div className="aos">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 16px', borderRadius: 100, background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.22)', marginBottom: 28 }}>
              <BrainCircuit size={15} color="#00f0ff" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI-Powered Token Intelligence</span>
            </div>
            <h1 style={{ fontSize: 'clamp(46px,6vw,78px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.03em', marginBottom: 22 }}>
              Stop guessing.<br />Start <span className="tg-cyan">knowing.</span>
            </h1>
            <p style={{ fontSize: 19, color: '#A0AEC0', lineHeight: 1.65, marginBottom: 44, maxWidth: 520 }}>
              Dive deeper. Surface smarter. Get professional risk analysis across multiple data vectors in seconds.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/app')} className="btn-cyan" style={{ padding: '15px 30px', borderRadius: 12, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                Launch Research Terminal <ChevronRight size={18} />
              </button>
              <button onClick={() => navigate('/listings')} className="btn-out" style={{ padding: '15px 30px', borderRadius: 12, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                View Live Feed <Activity size={18} />
              </button>
            </div>
          </div>

          {/* Right — Orbital */}
          <div className="aos d2 hero-visual" style={{ position: 'relative', width: 400, height: 400, margin: '0 auto' }}>
            {/* Floating token icons */}
            {[
              { label: 'ETH', color: '#627EEA', top: '8%', left: '60%', delay: '0s', anim: 'floatA' },
              { label: 'BTC', color: '#F7931A', top: '70%', left: '75%', delay: '0.5s', anim: 'floatB' },
              { label: 'BNB', color: '#F3BA2F', top: '55%', left: '5%', delay: '1s', anim: 'floatC' },
              { label: 'SOL', color: '#9945FF', top: '15%', left: '12%', delay: '0.7s', anim: 'floatA' },
            ].map(t => (
              <div key={t.label} style={{
                position: 'absolute', top: t.top, left: t.left,
                width: 48, height: 48, borderRadius: '50%',
                background: `${t.color}22`, border: `1px solid ${t.color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: t.color,
                backdropFilter: 'blur(8px)',
                animation: `${t.anim} ${2.8 + parseFloat(t.delay) * 0.4}s ease-in-out ${t.delay} infinite`,
                boxShadow: `0 0 16px ${t.color}44`,
              }}>{t.label}</div>
            ))}
            {/* Rings */}
            <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', border: '1px dashed rgba(0,240,255,0.2)', borderRadius: '50%' }} className="orbit1">
              <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(0,240,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}><Shield size={18} /></div>
              <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(0,240,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}><BarChart3 size={18} /></div>
            </div>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid rgba(255,0,123,0.15)', borderRadius: '50%' }} className="orbit2">
              <div style={{ position: 'absolute', top: '50%', left: -20, transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,0,123,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff007b' }}><Activity size={18} /></div>
              <div style={{ position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,0,123,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff007b' }}><Search size={18} /></div>
            </div>
            {/* Center */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: 90, height: 90, borderRadius: '50%',
              background: 'linear-gradient(135deg,rgba(0,240,255,0.12),rgba(112,0,255,0.12))',
              border: '2px solid rgba(0,240,255,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(0,240,255,0.35)', zIndex: 10,
            }}>
              <BrainCircuit size={36} color="#fff" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — PROBLEM (flip cards)
      ════════════════════════════════════════ */}
      <section style={{ padding: '110px 24px', background: 'rgba(5,8,15,0.85)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="aos" style={{ textAlign: 'center', marginBottom: 70 }}>
            <h2 style={{ fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, marginBottom: 16 }}>The Market Is Broken for Retail</h2>
            <p style={{ color: '#A0AEC0', fontSize: 17 }}>Click each card to see how Dolphin solves it.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
            {[
              {
                id: 'prob1',
                icon: <AlertTriangle size={32} color="#ff007b" />,
                title: 'Information Asymmetry',
                desc: 'Institutions have 50-person research teams. You have a Twitter feed and a prayer.',
                solIcon: <Shield size={32} color="#00f0ff" />,
                sol: 'Dolphin runs 8+ data sources simultaneously and surfaces the signal. Institutional-grade research, automated.',
              },
              {
                id: 'prob2',
                icon: <AlertOctagon size={32} color="#ff007b" />,
                title: '99% Are Traps',
                desc: 'Every day, hundreds of tokens launch on BSC. Most are engineered to fail — after your money is in.',
                solIcon: <CheckCircle2 size={32} color="#00f0ff" />,
                sol: 'Our Pump & Dump DNA detector flags coordinated launches before you become exit liquidity.',
              },
              {
                id: 'prob3',
                icon: <TrendingDown size={32} color="#ff007b" />,
                title: 'Data Without Verdict',
                desc: 'CoinGecko shows numbers. CertiK shows security. Nobody connects the dots into a clear answer.',
                solIcon: <BrainCircuit size={32} color="#00f0ff" />,
                sol: 'The Dolphin Score (0-100) cross-references 50+ signals and gives you a single actionable verdict.',
              },
            ].map((card) => (
              <div key={card.id} className={`aos flip-scene`} style={{ height: 260 }} onClick={() => toggleFlip(card.id)}>
                <div className={`flip-card glass${flipped[card.id] ? ' flipped' : ''}`} style={{ height: '100%' }}>
                  {/* Front */}
                  <div className="flip-face" style={{ background: 'rgba(15,20,30,0.55)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20 }}>
                    <div style={{ marginBottom: 20 }}>{card.icon}</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{card.title}</h3>
                    <p style={{ fontSize: 15, color: '#A0AEC0', lineHeight: 1.55, flex: 1 }}>{card.desc}</p>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>Tap to flip →</span>
                  </div>
                  {/* Back */}
                  <div className="flip-face flip-back">
                    <div style={{ marginBottom: 20 }}>{card.solIcon}</div>
                    <p style={{ fontSize: 15, color: '#E2E4E9', lineHeight: 1.6, flex: 1 }}>{card.sol}</p>
                    <span style={{ fontSize: 12, color: 'rgba(0,240,255,0.5)', marginTop: 12 }}>← Flip back</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3 — WHY DOLPHIN (alternating)
      ════════════════════════════════════════ */}
      <section style={{ padding: '120px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="aos" style={{ textAlign: 'center', marginBottom: 100 }}>
            <h2 style={{ fontSize: 'clamp(34px,5vw,56px)', fontWeight: 800, marginBottom: 16 }}>
              Why <span className="tg-cyan">Dolphin?</span>
            </h2>
            <p style={{ color: '#A0AEC0', fontSize: 17 }}>Four unfair advantages you can't get anywhere else.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 110 }}>

            {/* EDGE 1 — Dolphin Score */}
            <div ref={scoreRef} className="aos edge-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,240,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff', fontSize: 13, fontWeight: 700 }}>01</div>
                  <h3 style={{ fontSize: 28, fontWeight: 700 }}>The Dolphin Score</h3>
                </div>
                <p style={{ fontSize: 17, color: '#A0AEC0', lineHeight: 1.65 }}>
                  While others show you raw data, we give you a verdict. Our proprietary algorithm synthesizes 50+ signals into a single 0-100 score. Low cost, high signal.
                </p>
              </div>
              <div className="glass" style={{ padding: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: '#A0AEC0' }}>Dolphin Score</span>
                  <span style={{ padding: '3px 10px', background: `${scoreColor(score1)}18`, color: scoreColor(score1), borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                    {score1 >= 70 ? 'SAFE' : score1 >= 40 ? 'CAUTION' : 'DANGER'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  <div style={{ fontSize: 68, fontWeight: 800, color: scoreColor(score1), lineHeight: 1, fontFamily: 'monospace', transition: 'color 0.3s' }}>{score1}</div>
                  <div style={{ fontSize: 22, color: '#A0AEC0', paddingBottom: 8 }}>/100</div>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginTop: 22, overflow: 'hidden' }}>
                  <div style={{ width: `${score1}%`, height: '100%', background: scoreColor(score1), borderRadius: 4, transition: 'width 0.1s linear' }} />
                </div>
              </div>
            </div>

            {/* EDGE 2 — Pump & Dump */}
            <div className="aos edge-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div className="glass rev" style={{ padding: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                  <AlertTriangle color="#ff007b" size={24} />
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Pattern Warning</span>
                </div>
                {['9-day-old token on 7 exchanges', 'Liquidity unlocked in 2 hours', 'Volume 40× surge — zero social mentions'].map((w, i) => (
                  <div key={i} style={{ padding: '11px 14px', background: 'rgba(255,0,123,0.05)', borderLeft: '2px solid #ff007b', borderRadius: '0 6px 6px 0', fontSize: 13, color: '#E2E4E9', marginBottom: 10 }}>{w}</div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,0,123,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff007b', fontSize: 13, fontWeight: 700 }}>02</div>
                  <h3 style={{ fontSize: 28, fontWeight: 700 }}>Pump & Dump DNA</h3>
                </div>
                <p style={{ fontSize: 17, color: '#A0AEC0', lineHeight: 1.65 }}>
                  We detect coordinated launches before they dump. Token age vs exchange count, social-to-volume mismatch, liquidity unlock timing — all flagged before you enter.
                </p>
              </div>
            </div>

            {/* EDGE 3 — Korean Exchange */}
            <div className="aos edge-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(112,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7000ff', fontSize: 13, fontWeight: 700 }}>03</div>
                  <h3 style={{ fontSize: 28, fontWeight: 700 }}>Korean Exchange Alpha</h3>
                </div>
                <p style={{ fontSize: 17, color: '#A0AEC0', lineHeight: 1.65 }}>
                  The only platform scoring tokens against Upbit and Bithumb's actual listing committee criteria. Exclusive intelligence for Asian market positioning.
                </p>
              </div>
              <div className="glass" style={{ padding: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Upbit Readiness</span>
                  <span style={{ fontSize: 26, fontWeight: 800, color: '#7000ff' }}>82%</span>
                </div>
                {[
                  { label: 'Circulating Supply Transparency', val: 'Pass', c: '#2dd4a0' },
                  { label: 'Key Holder Lockups', val: 'Pass', c: '#2dd4a0' },
                  { label: 'Regulatory Risk (DAXA)', val: 'Review', c: '#e5a83b' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 14 }}>
                    <span style={{ color: '#A0AEC0' }}>{r.label}</span>
                    <span style={{ color: r.c, fontWeight: 600 }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* EDGE 4 — Live Feed */}
            <div className="aos edge-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div className="glass rev" style={{ padding: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div className="live-dot" style={{ position: 'relative', width: 8, height: 8, background: '#00f0ff', borderRadius: '50%' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live BSC Feed</span>
                </div>
                {[
                  { sym: 'PEPE2', score: 12, c: '#ef4444' },
                  { sym: 'AIAgent', score: 84, c: '#2dd4a0' },
                  { sym: 'DogeX', score: 45, c: '#e5a83b' },
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.sym}</span>
                    <div style={{ padding: '2px 8px', background: `${t.c}20`, color: t.c, borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{t.score}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,240,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff', fontSize: 13, fontWeight: 700 }}>04</div>
                  <h3 style={{ fontSize: 28, fontWeight: 700 }}>Real-time New Listings</h3>
                </div>
                <p style={{ fontSize: 17, color: '#A0AEC0', lineHeight: 1.65 }}>
                  BSC scanned every 5 minutes. New tokens scored before the market even notices them. Be first, not last.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
      ════════════════════════════════════════ */}
      <section style={{ padding: '110px 24px', background: 'rgba(5,8,15,0.85)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="aos" style={{ textAlign: 'center', marginBottom: 70 }}>
            <h2 style={{ fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, marginBottom: 12 }}>How It Works</h2>
            <p style={{ color: '#A0AEC0', fontSize: 17 }}>From address to verdict in under 30 seconds.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {[
              { num: '01', title: 'SCAN', icon: <Search size={36} color="#00f0ff" />, desc: 'Paste any contract address. We pull data from 8+ sources simultaneously — market, on-chain, social, security.' },
              { num: '02', title: 'ANALYZE', icon: <BrainCircuit size={36} color="#ff007b" />, desc: 'Our AI cross-references contract code, on-chain patterns, social signals, exchange data — then runs the Dolphin algorithm.' },
              { num: '03', title: 'KNOW', icon: <CheckCircle2 size={36} color="#7000ff" />, desc: 'Get a full risk report in under 30 seconds. Not just data — a verdict you can act on.' },
            ].map((s, i) => (
              <div key={i} className={`glass aos d${i+1}`} style={{ padding: 36, textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 18, right: 24, fontSize: 44, fontWeight: 800, color: 'rgba(255,255,255,0.04)' }}>{s.num}</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>{s.icon}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14, letterSpacing: '0.04em' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#A0AEC0', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 5 — REPORT PREVIEW
      ════════════════════════════════════════ */}
      <section style={{ padding: '110px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="aos" style={{ textAlign: 'center', marginBottom: 70 }}>
            <h2 style={{ fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, marginBottom: 12 }}>See What You Get</h2>
            <p style={{ color: '#A0AEC0', fontSize: 17 }}>Every report includes all of this.</p>
          </div>

          <div className="report-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div className="aos">
              {[
                'Executive risk summary',
                'Dolphin Score (0-100)',
                'Pump & dump pattern detection',
                'Contract source code analysis',
                'Exchange tier breakdown (T1-T5)',
                'Korean exchange readiness (Upbit/Bithumb)',
                'CertiK security integration',
                'On-chain authenticity verification',
                'Community vs volume analysis',
                'Regulatory compliance check (DAXA/SEC/MiCA)',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <Check size={18} color="#00f0ff" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: '#E2E4E9' }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="glass aos d2" style={{ padding: 30 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 18 }}>
                <div style={{ width: 44, height: 44, background: '#00f0ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: 11 }}>DTKN</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Dolphin Mock Token</div>
                  <div style={{ fontSize: 12, color: '#A0AEC0', fontFamily: 'monospace' }}>0x1234...abcd</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 8 }}>Dolphin Score</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#2dd4a0' }}>88</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 8 }}>Risk Level</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2dd4a0', marginTop: 6 }}>Low Risk</div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.22)', padding: 14, borderRadius: 10, fontSize: 13, color: '#00f0ff', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <BrainCircuit size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Contract verified. Liquidity locked 12 months. Holder distribution healthy. Strong T2 exchange listing probability.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 6 — LIVE FEED PREVIEW
      ════════════════════════════════════════ */}
      <section style={{ padding: '110px 24px', background: 'rgba(5,8,15,0.85)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="aos" style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, marginBottom: 12 }}>What's Launching Right Now</h2>
            <p style={{ color: '#A0AEC0', fontSize: 17 }}>BSC new listings — risk-scored every 5 minutes.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            {[
              { sym: 'ALPHA', name: 'AlphaProtocol', age: '1m', score: 92, status: 'SAFE', c: '#2dd4a0' },
              { sym: 'MOONX', name: 'MoonX Token', age: '4m', score: 45, status: 'CAUTION', c: '#e5a83b' },
              { sym: 'SCAM', name: 'DefinitelyNotScam', age: '7m', score: 12, status: 'DANGER', c: '#ef4444' },
            ].map((t, i) => (
              <div key={i} className={`glass aos d${i+1}`} style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${t.c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.c, fontWeight: 700, fontSize: 12 }}>{t.sym[0]}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{t.sym} <span style={{ fontSize: 13, color: '#A0AEC0', fontWeight: 400, marginLeft: 6 }}>{t.name}</span></div>
                    <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>Listed {t.age} ago · PancakeSwap</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 2 }}>Score</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: t.c }}>{t.score}</div>
                  </div>
                  <div style={{ padding: '5px 14px', borderRadius: 100, border: `1px solid ${t.c}50`, color: t.c, fontSize: 11, fontWeight: 700, width: 80, textAlign: 'center' }}>{t.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="aos" style={{ textAlign: 'center' }}>
            <button onClick={() => navigate('/listings')} className="btn-out" style={{ padding: '13px 28px', borderRadius: 12, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              View Full Feed <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 7 — TRACTION
      ════════════════════════════════════════ */}
      <section ref={countRef} style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="aos" style={{ fontSize: 30, fontWeight: 800, marginBottom: 60 }}>Early Signal. Real Depth.</h2>
          <div className="aos" style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center' }}>
            {[
              { num: count1.toLocaleString() + '+', label: 'Tokens Analyzed', c: '#00f0ff' },
              { num: count2.toLocaleString() + '+', label: 'Reports Generated', c: '#ff007b' },
              { num: '8+', label: 'Data Sources', c: '#7000ff' },
              { num: '6+', label: 'Chains Supported', c: '#00f0ff' },
            ].map((t, i) => (
              <div key={i} style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: t.c, fontFamily: 'monospace', marginBottom: 8 }}>{t.num}</div>
                <div style={{ fontSize: 13, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 8 — ROADMAP
      ════════════════════════════════════════ */}
      <section style={{ padding: '110px 24px', background: 'rgba(5,8,15,0.85)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="aos" style={{ textAlign: 'center', marginBottom: 72 }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800 }}>Where We're Going</h2>
          </div>

          <div style={{ position: 'relative', paddingLeft: 44 }}>
            <div className="tl-line" />
            {[
              { phase: 'Phase 1', status: 'LIVE', title: 'Token Intelligence Terminal', active: true, c: '#2dd4a0' },
              { phase: 'Phase 2', status: 'Q3 2026', title: 'Portfolio Risk Monitoring', active: false, c: '#00f0ff' },
              { phase: 'Phase 3', status: 'Q3 2026', title: 'Telegram Alert Bot', active: false, c: '#00f0ff' },
              { phase: 'Phase 4', status: 'Q4 2026', title: '$DOLPHIN Token Launch', active: false, c: '#ff007b' },
            ].map((r, i) => (
              <div key={i} className="aos" style={{ position: 'relative', marginBottom: i === 3 ? 0 : 44 }}>
                <div style={{
                  position: 'absolute', left: -49, top: 3, width: 10, height: 10,
                  background: r.active ? r.c : '#12151B', border: `2px solid ${r.c}`, borderRadius: '50%',
                  boxShadow: r.active ? `0 0 10px ${r.c}` : 'none',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: r.c }}>{r.phase}</span>
                  <span style={{ padding: '3px 9px', background: `${r.c}20`, color: r.c, borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{r.status}</span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: r.active ? '#fff' : '#A0AEC0' }}>{r.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 9 — FINAL CTA
      ════════════════════════════════════════ */}
      <section style={{ padding: '160px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(0,240,255,0.09) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }} className="aos">
          <h2 style={{ fontSize: 'clamp(44px,6vw,72px)', fontWeight: 800, marginBottom: 20, lineHeight: 1.1 }}>
            Stop Guessing.
          </h2>
          <p style={{ fontSize: 22, color: '#A0AEC0', marginBottom: 48, lineHeight: 1.5 }}>
            Start knowing what you're really buying.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/app')} className="btn-cyan" style={{ padding: '17px 34px', borderRadius: 12, fontSize: 16, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              Launch Research Terminal <ChevronRight size={20} />
            </button>
            <button onClick={() => navigate('/listings')} className="btn-out" style={{ padding: '17px 34px', borderRadius: 12, fontSize: 16, cursor: 'pointer' }}>
              View Live Listings
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '50px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#020305',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🐬</span>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.14em' }}>DOLPHIN RESEARCH</span>
        </div>
        <p style={{ fontSize: 12, color: '#555', maxWidth: 480, textAlign: 'right' }}>
          AI-generated reports are for informational purposes only. Not financial advice. Always verify on-chain data independently. © 2026 Dolphin.
        </p>
      </footer>
    </div>
  );
}
