import { useState, useEffect, useRef } from 'react';
import './LoadingOverlay.css';

const STEPS = [
  { label: 'Fetching market data...', icon: 'market' },
  { label: 'Analyzing on-chain metrics...', icon: 'chain' },
  { label: 'Checking DeFi protocols...', icon: 'defi' },
  { label: 'Generating AI analysis...', icon: 'ai' },
];

export default function LoadingOverlay({ tokenName, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const stepDurations = [800, 900, 700, 1000]; // ms per step
    let step = 0;
    let elapsed = 0;
    const totalDuration = stepDurations.reduce((a, b) => a + b, 0);

    const tick = () => {
      elapsed += 50;
      const currentProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(currentProgress);

      // Calculate which step we're on
      let acc = 0;
      for (let i = 0; i < stepDurations.length; i++) {
        acc += stepDurations[i];
        if (elapsed < acc) {
          step = i;
          break;
        }
        if (i === stepDurations.length - 1) {
          step = stepDurations.length;
        }
      }
      setCurrentStep(step);

      if (elapsed >= totalDuration && !completedRef.current) {
        completedRef.current = true;
        clearInterval(timerRef.current);
        // Small delay after 100% before transitioning
        setTimeout(() => {
          onComplete?.();
        }, 400);
      }
    };

    timerRef.current = setInterval(tick, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onComplete]);

  // If data arrives early but animation hasn't finished, wait for animation
  // If animation finishes but no data, the onComplete will trigger ReportView
  // which shows the data we already have

  return (
    <div className="loading-overlay">
      <div className="loading-backdrop" />
      <div className="loading-card glass-panel animate-fade-in-up">
        <div className="loading-header">
          <div className="loading-logo-pulse">
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="14" fill="var(--bg-tertiary)" />
              <path d="M18 46V18h4l12 17.5V18h4v28h-4L22 28.5V46h-4z" fill="var(--accent-cyan)" />
            </svg>
          </div>
          <div>
            <h3 className="loading-title">Analyzing {tokenName}</h3>
            <p className="loading-subtitle">Generating comprehensive report...</p>
          </div>
        </div>

        <div className="loading-steps">
          {STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;

            return (
              <div
                key={i}
                className={`loading-step ${isDone ? 'step-done' : ''} ${isActive ? 'step-active' : ''}`}
              >
                <div className="step-indicator">
                  {isDone ? (
                    <svg className="step-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 'checkmark 0.3s ease forwards' }} />
                    </svg>
                  ) : isActive ? (
                    <div className="step-spinner" />
                  ) : (
                    <div className="step-dot" />
                  )}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        <div className="loading-progress-track">
          <div
            className="loading-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loading-percentage mono">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}
