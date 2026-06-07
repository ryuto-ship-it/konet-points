/* eslint-disable react-hooks/purity */
export default function TeamInvestors({ data }) {
  const text = data.analysis?.team_investors || "데이터 없음";
  const tw = data.twitterData;
  const sa = data.socialAnalysis;
  const cd = data.certikData;

  // Resolve Twitter handle from any available source
  const twitterHandle = tw?.handle
    || sa?.username
    || data.twitterHandle
    || (data.marketData?.cmciDetail?.twitter
        ? data.marketData.cmciDetail.twitter.split('/').filter(Boolean).pop()
        : null);

  const hasApiData = !!(tw || sa);

  // Normalize to unified shape
  const twitterInfo = sa
    ? {
        username: sa.username,
        followers: sa.followers,
        tweetCount: sa.tweetCount,
        accountAgeMonths: sa.accountAgeMonths,
        verified: null,
        recentTweetCount7d: null,
        followerRatio: sa.followerRatio,
        healthGrade: sa.healthGrade,
        healthScore: sa.healthScore,
        isNewAccount: sa.isNewAccount,
      }
    : tw
    ? {
        username: tw.handle,
        followers: tw.followersCount,
        tweetCount: tw.tweetCount,
        accountAgeMonths: tw.createdAt
          ? Math.floor((Date.now() - new Date(tw.createdAt)) / (1000 * 60 * 60 * 24 * 30))
          : null,
        verified: tw.verified,
        recentTweetCount7d: tw.recentTweetCount7d,
        followerRatio: null,
        healthGrade: null,
        healthScore: null,
        isNewAccount: tw.createdAt
          ? Math.floor((Date.now() - new Date(tw.createdAt)) / (1000 * 60 * 60 * 24 * 30)) < 6
          : null,
      }
    : null;

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

      {/* Twitter card — always shown if handle is known */}
      {twitterHandle && (
        <div className="section-card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              🐦 Twitter / X
              <a
                href={`https://twitter.com/${twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: 'var(--accent-cyan)', marginLeft: '8px', textDecoration: 'none' }}
              >
                @{twitterHandle}
              </a>
            </span>
            {twitterInfo?.healthGrade && (
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

          {twitterInfo?.isNewAccount && (
            <p style={{ fontSize: '12px', color: 'var(--accent-amber)', marginBottom: '10px' }}>
              ⚠️ 신규 계정 ({twitterInfo.accountAgeMonths}개월)
            </p>
          )}

          {hasApiData && twitterInfo ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {[
                { label: '팔로워', value: twitterInfo.followers != null ? twitterInfo.followers.toLocaleString() + '명' : null },
                { label: '계정 나이', value: twitterInfo.accountAgeMonths != null ? `${twitterInfo.accountAgeMonths}개월` : null },
                { label: '트윗 수', value: twitterInfo.tweetCount != null ? twitterInfo.tweetCount.toLocaleString() + '개' : null },
                twitterInfo.recentTweetCount7d != null
                  ? { label: '최근 7일 트윗', value: `${twitterInfo.recentTweetCount7d}건`, warn: twitterInfo.recentTweetCount7d === 0 }
                  : null,
                twitterInfo.followerRatio != null
                  ? { label: '팔로워/팔로잉', value: `${twitterInfo.followerRatio}x` }
                  : null,
              ].filter(Boolean).filter(item => item.value != null).map(({ label, value, warn }) => (
                <div key={label} style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: warn ? '1px solid rgba(239,68,68,0.2)' : '1px solid var(--border-glass)',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: warn ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              소셜 데이터 없음
            </p>
          )}
        </div>
      )}

      {/* CMC holder stats + project launch date */}
      {cd && (cd.cmcHolderCount || cd.cmcDailyActiveHolders || cd.dateLaunched) && (
        <div className="section-card" style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
            프로젝트 통계 (CoinMarketCap)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {cd.cmcHolderCount != null && (
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>총 홀더 (CMC)</p>
                <p style={{ fontSize: '15px', fontWeight: 700 }}>{cd.cmcHolderCount.toLocaleString()}명</p>
              </div>
            )}
            {cd.cmcDailyActiveHolders != null && (
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>일일 활성 홀더</p>
                <p style={{ fontSize: '15px', fontWeight: 700 }}>{cd.cmcDailyActiveHolders.toLocaleString()}명</p>
              </div>
            )}
            {cd.dateLaunched && (
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>토큰 출시일</p>
                <p style={{ fontSize: '14px', fontWeight: 700 }}>{new Date(cd.dateLaunched).toLocaleDateString('ko-KR')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI analysis text */}
      <div className="section-card">
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
