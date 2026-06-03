const GRADE_COLOR = {
  'A+': 'var(--accent-emerald)', 'A': 'var(--accent-emerald)',
  'B+': 'var(--accent-cyan)',    'B': 'var(--accent-cyan)',
  'C+': 'var(--accent-amber)',   'C': 'var(--accent-amber)',
  'D+': '#F97316',               'D': '#F97316',
  'F':  'var(--accent-crimson)',
};

function ScoreBar({ label, score, level, detail, weight }) {
  const color = score >= 70 ? 'var(--accent-emerald)' : score >= 40 ? 'var(--accent-amber)' : 'var(--accent-crimson)';
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>
          {label}
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>
            (가중치 {weight}%)
          </span>
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color }}>
          {score}/100
          {level && <span style={{ fontSize: '11px', marginLeft: '6px', color: 'var(--text-tertiary)' }}>— {level}</span>}
        </span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`,
          background: color, borderRadius: '3px',
          transition: 'width 0.5s ease',
        }} />
      </div>
      {detail && <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{detail}</p>}
    </div>
  );
}

export default function ListingAssessment({ data }) {
  const assessment = data.analysis?.listing_assessment || {};
  const ls = data.listingScore;
  const grade = assessment.grade || ls?.compositeGrade || '?';
  const gradeColor = GRADE_COLOR[grade] || 'var(--text-tertiary)';

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">상장 심사 종합</h2>
        <span className="badge badge-ethereum">Listing Assessment</span>
      </div>

      {/* Overall grade */}
      <div className="glass-card" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{
          fontSize: '52px', fontWeight: 800, color: gradeColor,
          background: `${gradeColor}18`,
          padding: '16px 36px', borderRadius: '16px',
          border: `1px solid ${gradeColor}44`,
          minWidth: '100px', textAlign: 'center',
          flexShrink: 0,
        }}>
          {grade}
        </div>
        <div style={{ flex: 1 }}>
          {ls && (
            <p style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
              종합 점수: <span style={{ color: gradeColor }}>{ls.composite}/100</span>
            </p>
          )}
          <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
            {assessment.summary || '—'}
          </p>
        </div>
      </div>

      {/* Score breakdown */}
      {ls && (
        <div className="glass-card">
          <h4 className="heading-4" style={{ marginBottom: '16px' }}>점수 산출 기준</h4>

          <ScoreBar
            label="거래소 점수"
            score={ls.exchange.score}
            level={ls.exchange.grade}
            detail={ls.exchange.reason}
            weight={40}
          />
          <ScoreBar
            label="온체인 활동"
            score={ls.onchain.score}
            level={ls.onchain.level}
            detail={ls.onchain.dailyTx ? `일일 추정 TX: ${ls.onchain.dailyTx.toLocaleString()}건` : null}
            weight={30}
          />
          <ScoreBar
            label="가격 안정성"
            score={ls.priceStability.score}
            level={ls.priceStability.level}
            detail={`ATH 대비 ${ls.priceStability.athDropPct}% 하락`}
            weight={30}
          />

          {/* Tier counts summary */}
          {ls.exchange.tierCounts && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>거래소 티어 분포</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[['TIER1','T1','#FFD700'],['TIER2','T2','#C0C0C0'],['TIER3','T3','#4A9EFF'],['TIER4','T4','#888'],['TIER5','T5','#555']].map(([key, label, color]) => {
                  const count = ls.exchange.tierCounts[key] || 0;
                  return count > 0 ? (
                    <span key={key} style={{
                      fontSize: '12px', fontWeight: 600, color,
                      padding: '2px 8px', borderRadius: '10px',
                      background: `${color}18`, border: `1px solid ${color}44`,
                    }}>
                      {label}: {count}개
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
