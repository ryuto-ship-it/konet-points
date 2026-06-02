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
        <span className="section-number">5</span>
        <h2 className="section-title">
          리스크 & 상장 심사
          <span className="section-title-en">Risk & Listing Review</span>
        </h2>
      </div>

      {/* Overall Risk & Listing Grade Row */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div>
          <div className="metric-label" style={{ marginBottom: 'var(--space-2)' }}>
            Overall Risk Level
          </div>
          <span className={`badge ${getRiskBadgeClass(overallLevel)}`} style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-5)' }}>
            {overallLevel.toUpperCase()} RISK
          </span>
        </div>

        {data?.analysis?.overallAssessment?.listingGrade && (
          <div>
            <div className="metric-label" style={{ marginBottom: 'var(--space-2)' }}>
              Listing Feasibility Grade
            </div>
            <span 
              className={`badge`} 
              style={{ 
                fontSize: 'var(--text-sm)', 
                padding: 'var(--space-2) var(--space-5)',
                fontWeight: 700,
                background: data.analysis.overallAssessment.listingGrade === 'A' ? 'var(--accent-emerald-dim)' : 
                            data.analysis.overallAssessment.listingGrade === 'B' ? 'var(--accent-cyan-dim)' : 
                            data.analysis.overallAssessment.listingGrade === 'C' ? 'var(--accent-amber-dim)' : 'var(--accent-crimson-dim)',
                color: data.analysis.overallAssessment.listingGrade === 'A' ? 'var(--accent-emerald)' : 
                       data.analysis.overallAssessment.listingGrade === 'B' ? 'var(--accent-cyan)' : 
                       data.analysis.overallAssessment.listingGrade === 'C' ? 'var(--accent-amber)' : 'var(--accent-crimson)',
                border: `1px solid ${
                  data.analysis.overallAssessment.listingGrade === 'A' ? 'rgba(0, 220, 130, 0.25)' : 
                  data.analysis.overallAssessment.listingGrade === 'B' ? 'rgba(0, 229, 255, 0.25)' : 
                  data.analysis.overallAssessment.listingGrade === 'C' ? 'rgba(255, 184, 0, 0.25)' : 'rgba(255, 51, 102, 0.25)'
                }`
              }}
            >
              GRADE {data.analysis.overallAssessment.listingGrade}
            </span>
          </div>
        )}
      </div>

      {/* Exchange Listing Feasibility Score Matrix */}
      {data?.analysis?.overallAssessment?.listingScoreMatrix && (
        <div className="analysis-card" style={{ marginBottom: 'var(--space-6)', background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)' }}>
          <div className="analysis-card-label" style={{ color: 'var(--accent-cyan)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-8.06 3.42 3.42 0 013.438 0 3.42 3.42 0 001.946 8.06 3.42 3.42 0 013.138 3.138 3.42 3.42 0 008.06 1.946 3.42 3.42 0 010 3.438 3.42 3.42 0 00-8.06 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946 8.06 3.42 3.42 0 01-3.438 0 3.42 3.42 0 00-1.946-8.06 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-8.06-1.946 3.42 3.42 0 010-3.438 3.42 3.42 0 008.06-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Exchange Listing Score Matrix (거래소 상장 심사 세부 지표)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { label: 'Circulation (유통량 비율)', key: 'circulation', desc: '유통량 대비 발행 비율 및 락업 건전성' },
              { label: 'Volume (거래량 대 유동성)', key: 'volume', desc: '시총 대비 24시간 거래 대금 풍부도' },
              { label: 'Onchain TX (온체인 활성도)', key: 'onchain', desc: '실제 트랜잭션 건수 및 실사용 활성도' },
              { label: 'Team Transparency (팀 투명성)', key: 'team', desc: '핵심 개발진 공개 여부 및 백커 정보의 투명성' }
            ].map((item) => {
              const val = data.analysis.overallAssessment.listingScoreMatrix[item.key] || 'Fair';
              const getValBadgeClass = (v) => {
                const s = (v || '').toLowerCase();
                if (s === 'excellent') return 'badge-risk-low';
                if (s === 'good') return 'badge-solana'; // custom cyan/purple style
                if (s === 'fair') return 'badge-risk-medium';
                if (s === 'poor') return 'badge-risk-high';
                return 'badge-risk-medium';
              };
              return (
                <div key={item.key} style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-glass)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)'
                }}>
                  <div className="metric-label" style={{ fontSize: '10px', marginBottom: 0 }}>{item.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`badge ${getValBadgeClass(val)}`} style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}>
                      {val.toUpperCase()}
                    </span>
                  </div>
                  <div className="metric-sub" style={{ fontSize: '10px', marginTop: 'auto' }}>{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
