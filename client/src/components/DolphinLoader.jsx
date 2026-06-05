import { useState, useEffect } from 'react';
import './DolphinLoader.css';

export default function DolphinLoader({ tokenName = 'Token', onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Fetching market data',
    'Analyzing on-chain metrics',
    'Checking security',
    'Generating AI analysis'
  ];

  // Auto-progress the steps for visual effect
  useEffect(() => {
    if (stepIndex >= steps.length) {
      if (onComplete) onComplete();
      return;
    }
    const timer = setTimeout(() => {
      setStepIndex(prev => prev + 1);
    }, 1200 + Math.random() * 800);
    return () => clearTimeout(timer);
  }, [stepIndex, steps.length, onComplete]);

  return (
    <div className="dolphin-loader-overlay">
      <div className="loader-content">
        
        {/* Dolphin SVG Animation */}
        <div className="dolphin-container">
          <svg className="dolphin-svg" viewBox="0 0 120 80" width="120" height="80">
            <defs>
              <linearGradient id="dolphin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#0066ff" />
              </linearGradient>
            </defs>
            <path
              d="M110,40 C110,35 100,25 80,25 C60,25 50,30 35,35 C20,40 10,35 5,30 C5,45 15,55 35,50 C50,45 65,55 85,55 C100,55 110,45 110,40 Z"
              fill="url(#dolphin-grad)"
            />
            {/* Dorsal fin */}
            <path d="M70,26 C75,15 85,10 80,25 Z" fill="url(#dolphin-grad)" />
            {/* Pectoral fin */}
            <path d="M65,48 C60,55 55,60 70,52 Z" fill="#00ccbb" />
            {/* Tail fin */}
            <path d="M5,30 C0,20 -5,35 10,40 Z" fill="url(#dolphin-grad)" />
            {/* Eye */}
            <circle cx="95" cy="38" r="1.5" fill="#040e1f" />
          </svg>

          {/* Bubbles */}
          <div className="bubble b1"></div>
          <div className="bubble b2"></div>
          <div className="bubble b3"></div>
          <div className="bubble b4"></div>
          <div className="bubble b5"></div>
        </div>

        {/* Loading Text */}
        <div className="loading-status">
          <h2 className="loading-title">Analyzing {tokenName}...</h2>
          
          <ul className="loading-steps">
            {steps.map((step, idx) => {
              const isCompleted = idx < stepIndex;
              const isCurrent = idx === stepIndex;
              return (
                <li key={idx} className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <span className="step-icon">
                    {isCompleted ? '✓' : isCurrent ? '●' : '○'}
                  </span>
                  {step}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="loading-footer">
          🐬 Diving deep into the data...
        </p>
      </div>

      {/* Background Waves */}
      <div className="ocean-waves">
        <svg className="wave w1" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path d="M0,50 Q250,0 500,50 T1000,50 L1000,100 L0,100 Z" fill="rgba(0, 229, 255, 0.1)" />
        </svg>
        <svg className="wave w2" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path d="M0,50 Q250,100 500,50 T1000,50 L1000,100 L0,100 Z" fill="rgba(0, 102, 255, 0.15)" />
        </svg>
        <svg className="wave w3" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path d="M0,70 Q250,20 500,70 T1000,70 L1000,100 L0,100 Z" fill="rgba(0, 204, 187, 0.05)" />
        </svg>
      </div>
    </div>
  );
}
