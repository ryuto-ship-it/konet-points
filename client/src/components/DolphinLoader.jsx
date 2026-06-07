import { useState, useEffect } from 'react';

const STEPS = [
  { id: 1, label: 'Fetching market data',       duration: 3 },
  { id: 2, label: 'Scanning contract source',    duration: 4 },
  { id: 3, label: 'Analyzing on-chain metrics',  duration: 4 },
  { id: 4, label: 'Checking security signals',   duration: 3 },
  { id: 5, label: 'Running Dolphin algorithm',   duration: 4 },
  { id: 6, label: 'Generating AI report',        duration: 8 },
];

const TOTAL = STEPS.reduce((s, x) => s + x.duration, 0);

export default function DolphinLoader({ tokenName = 'Token', tokenSymbol = '', tokenLogo = null }) {
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => {
        const next = Math.min(prev + 0.1, TOTAL);
        let cum = 0;
        for (let i = 0; i < STEPS.length; i++) {
          cum += STEPS[i].duration;
          if (next < cum) { setCurrentStep(i); break; }
          if (i === STEPS.length - 1) setCurrentStep(i);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const remaining = Math.max(0, Math.ceil(TOTAL - elapsed));
  const totalPct  = (elapsed / TOTAL) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(180deg, #020812 0%, #040e1f 50%, #020c18 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <style>{`
        @keyframes dolphinSwim {
          0%   { transform: translateY(0px)   rotate(-5deg) scaleX(1);    }
          25%  { transform: translateY(-20px) rotate(0deg)  scaleX(1.05); }
          50%  { transform: translateY(-10px) rotate(5deg)  scaleX(1);    }
          75%  { transform: translateY(-25px) rotate(-2deg) scaleX(1.03); }
          100% { transform: translateY(0px)   rotate(-5deg) scaleX(1);    }
        }
        @keyframes tailWag {
          0%, 100% { transform: rotate(-10deg); }
          50%       { transform: rotate(10deg);  }
        }
        @keyframes bubble {
          0%   { transform: translateY(0)     scale(1);   opacity: 0.6; }
          100% { transform: translateY(-60px) scale(0.3); opacity: 0;   }
        }
        @keyframes wave1 {
          0%   { transform: translateX(0);    }
          100% { transform: translateX(-50%); }
        }
        @keyframes wave2 {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0);    }
        }
        @keyframes dlPulse {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.3; }
        }
      `}</style>

      {/* Ocean waves */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', overflow: 'hidden', opacity: 0.15 }}>
        <svg viewBox="0 0 1440 200" style={{ position: 'absolute', bottom: 0, width: '200%', animation: 'wave1 8s linear infinite' }}>
          <path d="M0,100 C360,20 720,180 1080,100 C1260,60 1380,140 1440,100 L1440,200 L0,200 Z" fill="#00e5ff" opacity="0.5" />
        </svg>
        <svg viewBox="0 0 1440 200" style={{ position: 'absolute', bottom: 0, width: '200%', animation: 'wave2 12s linear infinite' }}>
          <path d="M0,120 C360,40 720,160 1080,80 C1260,40 1380,160 1440,120 L1440,200 L0,200 Z" fill="#0066ff" opacity="0.3" />
        </svg>
      </div>

      {/* Dolphin SVG */}
      <div style={{
        animation: 'dolphinSwim 2.5s ease-in-out infinite',
        marginBottom: '40px',
        filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.5))',
      }}>
        <svg width="120" height="80" viewBox="0 0 120 80">
          <defs>
            <linearGradient id="dlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#00ccbb" />
              <stop offset="100%" stopColor="#0066ff" />
            </linearGradient>
          </defs>
          <ellipse cx="55" cy="42" rx="42" ry="18" fill="url(#dlGrad)" />
          <ellipse cx="55" cy="46" rx="30" ry="10" fill="rgba(255,255,255,0.2)" />
          <path d="M55 24 Q65 12 72 22 Q65 26 55 24 Z" fill="url(#dlGrad)" />
          <path d="M96 38 Q108 40 106 44 Q98 46 94 42 Z" fill="url(#dlGrad)" />
          <circle cx="88" cy="38" r="3"   fill="#fff" />
          <circle cx="89" cy="38" r="1.5" fill="#003366" />
          <g style={{ transformOrigin: '14px 42px', animation: 'tailWag 1.2s ease-in-out infinite' }}>
            <path d="M14 42 Q4 28 0 22 Q8 36 14 42 Q4 56 0 62 Q8 48 14 42 Z" fill="url(#dlGrad)" />
          </g>
        </svg>
      </div>

      {/* Bubbles */}
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          position: 'absolute',
          left: `${45 + i * 3}%`,
          bottom: '30%',
          width:  `${4 + i * 2}px`,
          height: `${4 + i * 2}px`,
          borderRadius: '50%',
          background: 'rgba(0,229,255,0.4)',
          animation: `bubble ${1.5 + i * 0.3}s ease-out ${i * 0.4}s infinite`,
        }} />
      ))}

      {/* Token identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        {tokenLogo ? (
          <img
            src={tokenLogo}
            width="40" height="40"
            style={{ borderRadius: '50%', flexShrink: 0 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #00ccbb, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '700', color: '#fff',
          }}>
            {tokenSymbol?.[0] || tokenName?.[0] || '?'}
          </div>
        )}
        <div style={{ textAlign: 'left' }}>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>
            {tokenName}{tokenSymbol ? ` (${tokenSymbol.toUpperCase()})` : ''}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
            Analyzing...
          </div>
        </div>
      </div>

      {/* Current step label */}
      <div style={{
        color: '#00e5ff', fontSize: '14px', marginBottom: '32px',
        fontFamily: 'JetBrains Mono, monospace',
        animation: 'dlPulse 1.5s ease-in-out infinite',
      }}>
        {STEPS[currentStep]?.label}...
      </div>

      {/* Total progress bar */}
      <div style={{ width: '320px', marginBottom: '16px' }}>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${totalPct}%`,
            background: 'linear-gradient(90deg, #0066ff, #00e5ff)',
            borderRadius: '2px',
            transition: 'width 0.1s linear',
            boxShadow: '0 0 8px rgba(0,229,255,0.6)',
          }} />
        </div>
      </div>

      {/* Step list */}
      <div style={{ width: '320px', marginBottom: '24px' }}>
        {STEPS.map((step, i) => {
          const done    = i < currentStep;
          const current = i === currentStep;
          return (
            <div key={step.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '5px 0',
              opacity: i > currentStep ? 0.3 : 1,
              transition: 'opacity 0.3s',
            }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                background: done ? '#00e87a' : current ? '#00e5ff' : 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px',
                boxShadow: current ? '0 0 8px rgba(0,229,255,0.6)' : 'none',
              }}>
                {done ? '✓' : ''}
              </div>
              <span style={{
                fontSize: '13px',
                fontFamily: 'JetBrains Mono, monospace',
                color: done ? '#00e87a' : current ? '#00e5ff' : '#4a5568',
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Remaining time */}
      <div style={{ color: '#4a5568', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
        ~{remaining}s remaining
      </div>

      <div style={{ position: 'absolute', bottom: '32px', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
        🐬 Diving deep into the data...
      </div>
    </div>
  );
}
