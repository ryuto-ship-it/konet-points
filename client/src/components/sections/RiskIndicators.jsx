import './sections.css';

export default function RiskIndicators({ data }) {
  const risk = data?.analysis?.riskAnalysis || {};
  const overallLevel = risk.overallRiskLevel || 'Unknown';

  const riskMetrics = [
    {
      label: 'Wallet Concentration Risk',
      level: risk.concentrationRisk || 'N/A',
      description: 'Risk from top holder wallet concentration',
    },
    {
      label: 'Liquidity vs Market Cap',
      level: risk.liquidityRisk || 'N/A',
      description: 'Ratio of liquidity to total market capitalization',
    },
    {
      label: 'Volume Anomaly Detection',
      level: risk.volumeAnomaly || 'N/A',
      description: 'Unusual volume pattern detection',
    },
  ];

  const getRiskBadgeClass = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'low' || l === 'none') return 'badge-risk-low';
    if (l === 'medium' || l === 'possible') return 'badge-risk-medium';
    if (l === 'high' || l === 'detected') return 'badge-risk-high';
    if (l === 'critical') return 'badge-risk-critical';
    return 'badge-risk-medium';
  };

  const getRiskDotClass = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'low' || l === 'none') return 'low';
    if (l === 'medium' || l === 'possible') return 'medium';
    if (l === 'high' || l === 'detected') return 'high';
    if (l === 'critical') return 'critical';
    return 'medium';
  };

  return (
    <section className="report-section" id="risk-indicators">
      <div className="section-header">
        <span className="section-number">4</span>
        <h2 className="section-title">
          리스크 지표
          <span className="section-title-en">Risk Indicators</span>
        </h2>
      </div>

      {/* Overall Risk Badge */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="metric-label" style={{ marginBottom: 'var(--space-3)' }}>
          Overall Risk Level
        </div>
        <span className={`badge ${getRiskBadgeClass(overallLevel)}`} style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-5)' }}>
          {overallLevel}
        </span>
      </div>

      {/* Risk Metric Cards */}
      <div className="metric-grid">
        {riskMetrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <div className="metric-label">{metric.label}</div>
            <div className="risk-indicator" style={{ marginTop: 'var(--space-3)' }}>
              <div className={`risk-dot ${getRiskDotClass(metric.level)}`} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {metric.level}
              </span>
            </div>
            <div className="metric-sub" style={{ marginTop: 'var(--space-2)' }}>
              {metric.description}
            </div>
          </div>
        ))}
      </div>

      {/* Risk Analysis Text */}
      {risk.details && (
        <div className="analysis-card">
          <div className="analysis-card-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Risk Analysis
          </div>
          <div className="analysis-text">{risk.details}</div>
        </div>
      )}
    </section>
  );
}
