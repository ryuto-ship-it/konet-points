import './sections.css';

export default function UtilityAnalysis({ data }) {
  const utility = data?.analysis?.utilityAnalysis || {};
  const text = utility.text || '';

  const features = [
    {
      label: 'Token Burn',
      enabled: utility.hasBurn,
      icon: '🔥',
    },
    {
      label: 'Staking',
      enabled: utility.hasStaking,
      icon: '📊',
    },
    {
      label: 'Governance',
      enabled: utility.hasGovernance,
      icon: '🗳️',
    },
  ];

  return (
    <section className="report-section" id="utility-analysis">
      <div className="section-header">
        <span className="section-number">3</span>
        <h2 className="section-title">
          토큰 유틸리티 분석
          <span className="section-title-en">Utility Analysis</span>
        </h2>
      </div>

      {/* Feature Badges */}
      <div className="feature-badges">
        {features.map((feature) => (
          <div
            key={feature.label}
            className={`feature-badge ${feature.enabled ? 'badge-feature-yes' : 'badge-feature-no'}`}
          >
            <span>{feature.icon}</span>
            <span>{feature.label}</span>
            <span style={{ marginLeft: '4px', fontSize: 'var(--text-xs)' }}>
              {feature.enabled ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>

      {/* Analysis Text */}
      {text && (
        <div className="analysis-card">
          <div className="analysis-card-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Utility Analysis
          </div>
          <div className="analysis-text">{text}</div>
        </div>
      )}

      {!text && (
        <div className="no-data-notice">
          <span>Utility analysis data is not available for this token</span>
        </div>
      )}
    </section>
  );
}
