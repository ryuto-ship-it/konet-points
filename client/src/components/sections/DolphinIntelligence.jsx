const SEVERITY_STYLE = {
  CRITICAL: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    dot: '#ef4444',
    label: 'CRITICAL',
    labelColor: '#ef4444',
  },
  HIGH: {
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    dot: '#f59e0b',
    label: 'HIGH',
    labelColor: '#f59e0b',
  },
  MEDIUM: {
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.2)',
    dot: '#818cf8',
    label: 'MEDIUM',
    labelColor: '#818cf8',
  },
};

const GRADE_COLOR = {
  A: '#10b981',
  B: '#00d4ff',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444',
};

function SignalRow({ signal, detail, severity }) {
  const s = SEVERITY_STYLE[severity] || SEVERITY_STYLE.MEDIUM;
  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: '6px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      marginBottom: '8px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
    }}>
      <div style={{
        flexShrink: 0, marginTop: '3px',
        width: '6px', height: '6px', borderRadius: '50%',
        background: s.dot,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: s.labelColor, fontFamily: 'var(--font-mono)' }}>
            {s.label}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {signal}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{detail}</p>
      </div>
    </div>
  );
}

function TwitterRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '4px',
      padding: '12px 16px',
      background: 'var(--bg-hover)',
      borderRadius: '6px',
      border: '1px solid var(--border)',
      flex: 1, minWidth: '100px',
    }}>
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600,
        color: highlight ? 'var(--warning)' : 'var(--text-primary)',
      }}>
        {value}
      </span>
    </div>
  );
}

export default function DolphinIntelligence({ data }) {
  const d = data.dolphinAnalysis;
  const ta = data.twitterActivity;
  const ai = data.analysis?.dolphin_intelligence;

  if (!d) return null;

  const gradeColor = GRADE_COLOR[d.dolphinGrade] || '#6b7280';
  const allSignals = [
    ...(d.pumpDumpSignals || []),
    ...(d.volumeSignals || []),
    ...(d.socialSignals || []),
  ];
  const hasSignals = allSignals.length > 0;

  return (
    <section className="report-section" id="dolphin-intelligence">
      <div className="section-header">
        <h2 className="heading-3">Dolphin Intelligence</h2>
        <span className="badge" style={{ background: 'rgba(0,212,255,0.08)', color: 'var(--accent)', border: '1px solid rgba(0,212,255,0.2)' }}>
          독자 알고리즘
        </span>
      </div>

      {/* Score banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        padding: '20px 24px',
        background: 'var(--bg-card)',
        border: `1px solid ${gradeColor}30`,
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '52px', fontWeight: 600,
            color: gradeColor, lineHeight: 1,
          }}>
            {d.dolphinScore}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            / 100
          </div>
        </div>

        <div style={{ width: '1px', height: '60px', background: 'var(--border)' }} />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700,
              color: gradeColor,
            }}>
              {d.dolphinGrade}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Dolphin Score
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            {d.summary}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Dolphin Research 독자 알고리즘 — CMC/CoinGecko/CertiK 미제공 인사이트
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Warning signals */}
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            감지된 경고 신호
          </p>
          {hasSignals ? (
            allSignals.map((s, i) => (
              <SignalRow key={i} signal={s.signal} detail={s.detail} severity={s.severity} />
            ))
          ) : (
            <div style={{
              padding: '14px', borderRadius: '6px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#10b981', fontSize: '13px',
            }}>
              ✅ 이상 패턴 미탐지 — 정상 범위
            </div>
          )}

          {/* Positive signals */}
          {d.positiveSignals?.length > 0 && (
            <>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '16px 0 10px' }}>
                긍정 신호
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {d.positiveSignals.map((sig, i) => (
                  <span key={i} style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    color: '#10b981', fontWeight: 500,
                  }}>
                    ✓ {sig}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right column: Twitter + AI judgment */}
        <div>
          {/* Twitter activity */}
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            트위터 활동 분석
          </p>
          {ta ? (
            <>
              {ta.isNewAccount && (
                <div style={{
                  padding: '8px 12px', borderRadius: '6px', marginBottom: '10px',
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                  fontSize: '12px', color: '#f59e0b',
                }}>
                  ⚠️ 신규 계정 — 계정 나이 {ta.accountAgeMonths}개월
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                <TwitterRow label="팔로워" value={ta.followers?.toLocaleString() ?? '—'} />
                <TwitterRow label="계정 나이" value={ta.accountAgeMonths != null ? `${ta.accountAgeMonths}개월` : '—'} highlight={ta.isNewAccount} />
                <TwitterRow label="최근 7일 트윗" value={ta.last7daysTweets != null ? `${ta.last7daysTweets}건` : '—'} />
                <TwitterRow
                  label="활동 레벨"
                  value={ta.activityLevel ?? (ta.last7daysTweets === null ? 'Free Tier 제한' : '—')}
                  highlight={ta.activityLevel === 'LOW'}
                />
              </div>
              {ta.followerToFollowingRatio != null && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  팔로워/팔로잉 비율: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{ta.followerToFollowingRatio}:1</span>
                </p>
              )}
            </>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>트위터 데이터 없음</p>
          )}

          {/* AI judgment */}
          {ai?.final_judgment && (
            <>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '16px 0 8px' }}>
                Dolphin 독자 판단
              </p>
              <div style={{
                padding: '12px 14px', borderRadius: '6px',
                background: 'rgba(0,212,255,0.05)',
                border: '1px solid rgba(0,212,255,0.15)',
                fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6,
              }}>
                {ai.final_judgment}
              </div>
              {ai.pump_dump_verdict && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.5 }}>
                  {ai.pump_dump_verdict}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dividers: signal type breakdown */}
      {(d.pumpDumpSignals?.length > 0 || d.volumeSignals?.length > 0) && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              펌프덤프 신호 <span style={{ fontFamily: 'var(--font-mono)', color: d.pumpDumpSignals?.length > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{d.pumpDumpSignals?.length || 0}</span>
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              거래량 이상 <span style={{ fontFamily: 'var(--font-mono)', color: d.volumeSignals?.length > 0 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>{d.volumeSignals?.length || 0}</span>
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              소셜 불일치 <span style={{ fontFamily: 'var(--font-mono)', color: d.socialSignals?.length > 0 ? '#818cf8' : '#10b981', fontWeight: 700 }}>{d.socialSignals?.length || 0}</span>
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              위험 레벨 <span style={{ fontFamily: 'var(--font-mono)', color: d.riskLevel === 'CRITICAL' ? '#ef4444' : d.riskLevel === 'HIGH' ? '#f59e0b' : d.riskLevel === 'MEDIUM' ? '#818cf8' : '#10b981', fontWeight: 700 }}>{d.riskLevel}</span>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
