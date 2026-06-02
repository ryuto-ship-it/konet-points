import './sections.css';

export default function TeamInvestors({ data }) {
  const team = data?.analysis?.teamInvestors || {};
  const coreTeam = team.coreTeam || '';
  const backingInvestors = team.backingInvestors || '';
  const rating = team.transparencyRating || 'medium';

  const getRatingBadgeClass = (rate) => {
    const r = (rate || '').toLowerCase();
    if (r === 'high') return 'badge-risk-low'; // high transparency = low risk (green)
    if (r === 'medium') return 'badge-risk-medium'; // yellow
    if (r === 'low') return 'badge-risk-high'; // red
    return 'badge-risk-medium';
  };

  return (
    <section className="report-section" id="team-investors">
      <div className="section-header">
        <span className="section-number">2</span>
        <h2 className="section-title">
          팀 & 투자자 정보
          <span className="section-title-en">Team & Investors</span>
        </h2>
      </div>

      {/* Transparency Rating Card */}
      {rating && (
        <div style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="metric-label" style={{ marginBottom: 0 }}>
            Team Transparency Rating (팀 정보 투명성 등급)
          </div>
          <span className={`badge ${getRatingBadgeClass(rating)}`} style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}>
            {rating.toUpperCase()} TRANSPARENCY
          </span>
        </div>
      )}

      {/* Core Team Section */}
      {coreTeam && (
        <div className="analysis-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="analysis-card-label" style={{ color: 'var(--accent-cyan)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Core Technical Leadership (핵심 창립진 & 기술 리더십)
          </div>
          <div className="analysis-text">{coreTeam}</div>
        </div>
      )}

      {/* Backing Investors Section */}
      {backingInvestors && (
        <div className="analysis-card">
          <div className="analysis-card-label" style={{ color: 'var(--accent-emerald)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Lead Investors & Institutional Backers (주요 투자기관 및 벤처 캐피탈)
          </div>
          <div className="analysis-text">{backingInvestors}</div>
        </div>
      )}
    </section>
  );
}
