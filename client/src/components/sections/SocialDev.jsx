export default function SocialDev({ data }) {
  const sa = data.socialAnalysis;
  const gh = data.githubActivity;

  if (!sa && !gh) return null;

  const healthColor = (grade) => {
    if (grade === 'HEALTHY') return 'var(--accent-emerald)';
    if (grade === 'MODERATE') return 'var(--accent-amber)';
    return 'var(--accent-crimson)';
  };

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">소셜 & 개발 활동</h2>
        <span className="badge badge-ethereum">Social & Dev</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sa && gh ? '1fr 1fr' : '1fr', gap: '16px' }}>

        {/* Twitter */}
        {sa && (
          <div className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="heading-4">🐦 Twitter / X</h4>
              <span style={{
                fontSize: '12px', fontWeight: 700,
                color: healthColor(sa.healthGrade),
                padding: '2px 8px', borderRadius: '12px',
                background: `${healthColor(sa.healthGrade)}18`,
                border: `1px solid ${healthColor(sa.healthGrade)}44`,
              }}>
                {sa.healthGrade} ({sa.healthScore}/100)
              </span>
            </div>

            {sa.isNewAccount && (
              <p style={{ fontSize: '12px', color: 'var(--accent-amber)', marginBottom: '10px' }}>
                ⚠️ 신규 계정 ({sa.accountAgeMonths}개월)
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: '팔로워', value: sa.followers?.toLocaleString() || '—' },
                { label: '팔로워/팔로잉 비율', value: `${sa.followerRatio}x` },
                { label: '트윗 수', value: sa.tweetCount?.toLocaleString() || '—' },
                { label: '계정 나이', value: `${sa.accountAgeMonths}개월` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GitHub */}
        {gh && (
          <div className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="heading-4">🔧 GitHub</h4>
              <span style={{
                fontSize: '12px', fontWeight: 700,
                color: gh.isDormant ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
                padding: '2px 8px', borderRadius: '12px',
                background: gh.isDormant ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                border: gh.isDormant ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
              }}>
                {gh.isDormant ? '⚠️ 개발 중단' : '✅ 활성'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: '스타', value: gh.stars?.toLocaleString() || '0' },
                { label: '포크', value: gh.forks?.toLocaleString() || '0' },
                { label: '최근 4주 커밋', value: `${gh.recentCommits}회` },
                { label: '전체 커밋', value: `${gh.totalCommits}회` },
                { label: '마지막 업데이트', value: gh.lastUpdate ? gh.lastUpdate.slice(0, 10) : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
