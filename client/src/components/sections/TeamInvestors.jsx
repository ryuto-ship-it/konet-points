export default function TeamInvestors({ data }) {
  const text = data.analysis?.team_investors || "데이터 없음";
  const tw = data.twitterData;
  const sa = data.socialAnalysis;

  // Prefer socialAnalysis (richer) over raw twitterData
  const twitterInfo = sa || (tw ? {
    username: tw.handle,
    followers: tw.followersCount,
    tweetCount: tw.tweetCount,
    accountAgeMonths: tw.createdAt
      ? Math.floor((Date.now() - new Date(tw.createdAt)) / (1000 * 60 * 60 * 24 * 30))
      : null,
    verified: tw.verified,
    recentTweetCount7d: tw.recentTweetCount7d,
    healthGrade: null,
    healthScore: null,
    isNewAccount: null,
  } : null);

  const healthColor = grade => {
    if (grade === 'HEALTHY') return 'var(--accent-emerald)';
    if (grade === 'MODERATE') return 'var(--accent-amber)';
    return 'var(--accent-crimson)';
  };

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">팀 & 투자자</h2>
        <span className="badge badge-ethereum">Team & Investors</span>
      </div>

      {/* Twitter metrics card */}
      {twitterInfo && (
        <div className="glass-card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              🐦 Twitter
              {twitterInfo.username && (
                <span style={{ fontSize: '13px', color: 'var(--accent-cyan)', marginLeft: '8px' }}>
                  @{twitterInfo.username}
                </span>
              )}
            </span>
            {twitterInfo.healthGrade && (
              <span style={{
                fontSize: '12px', fontWeight: 700,
                color: healthColor(twitterInfo.healthGrade),
                padding: '2px 8px', borderRadius: '12px',
                background: `${healthColor(twitterInfo.healthGrade)}18`,
                border: `1px solid ${healthColor(twitterInfo.healthGrade)}44`,
              }}>
                {twitterInfo.healthGrade}
                {twitterInfo.healthScore != null && ` (${twitterInfo.healthScore}/100)`}
              </span>
            )}
          </div>

          {twitterInfo.isNewAccount && (
            <p style={{ fontSize: '12px', color: 'var(--accent-amber)', marginBottom: '10px' }}>
              ⚠️ 신규 계정 ({twitterInfo.accountAgeMonths}개월)
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            {[
              { label: '팔로워', value: twitterInfo.followers != null ? twitterInfo.followers.toLocaleString() + '명' : null },
              { label: '계정 나이', value: twitterInfo.accountAgeMonths != null ? `${twitterInfo.accountAgeMonths}개월` : null },
              { label: '트윗 수', value: twitterInfo.tweetCount != null ? twitterInfo.tweetCount.toLocaleString() + '개' : null },
              { label: '최근 7일 트윗', value: twitterInfo.recentTweetCount7d != null ? `${twitterInfo.recentTweetCount7d}건` : null, warn: twitterInfo.recentTweetCount7d === 0 },
              twitterInfo.followerRatio != null
                ? { label: '팔로워/팔로잉', value: `${twitterInfo.followerRatio}x` }
                : null,
            ].filter(Boolean).filter(item => item.value != null).map(({ label, value, warn }) => (
              <div key={label} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: warn ? '1px solid rgba(239,68,68,0.2)' : '1px solid var(--border-glass)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{label}</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: warn ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI analysis text */}
      <div className="glass-card">
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
