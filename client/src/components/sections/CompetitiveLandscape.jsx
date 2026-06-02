import './sections.css';

export default function CompetitiveLandscape({ data }) {
  const landscape = data?.analysis?.competitiveLandscape || {};
  const summary = landscape.summary || '';
  const competitors = landscape.competitors || [];

  return (
    <section className="report-section" id="competitive-landscape">
      <div className="section-header">
        <span className="section-number">3</span>
        <h2 className="section-title">
          경쟁 환경 분석
          <span className="section-title-en">Competitive Landscape</span>
        </h2>
      </div>

      {/* Competitors Comparison Table */}
      {competitors.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div className="metric-label" style={{ marginBottom: 'var(--space-3)' }}>
            Sector Peer Comparison (동종 카테고리 주요 경쟁사 비교)
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>프로젝트명 (Project)</th>
                  <th>시가총액 (Market Cap)</th>
                  <th>총예치액 (TVL)</th>
                  <th>핵심 강점 및 차별점 (Core Advantage)</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((peer, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{peer.name}</td>
                    <td className="mono-cell" style={{ color: 'var(--accent-cyan)' }}>{peer.marketCap || 'N/A'}</td>
                    <td className="mono-cell" style={{ color: 'var(--accent-emerald)' }}>{peer.tvl || 'N/A'}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{peer.strength || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Competitive Landscape Summary */}
      {summary && (
        <div className="analysis-card">
          <div className="analysis-card-label" style={{ color: 'var(--accent-purple)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Market Position Analysis (시장 내 포지셔닝 분석)
          </div>
          <div className="analysis-text">{summary}</div>
        </div>
      )}
    </section>
  );
}
