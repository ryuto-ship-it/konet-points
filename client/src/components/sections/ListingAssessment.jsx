import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const GRADE_COLOR = {
  'A+': '#10b981', 'A': '#10b981',
  'B+': '#00e5ff', 'B': '#00e5ff',
  'C+': '#f59e0b', 'C': '#f59e0b',
  'D+': '#f97316', 'D': '#f97316',
  'F':  '#ef4444',
};

function ScoreBar({ label, score, level, detail, weight }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>
          {label}
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>({weight}%)</span>
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color }}>
          {score}/100
          {level && <span style={{ fontSize: '11px', marginLeft: '6px', color: 'var(--text-tertiary)' }}>— {level}</span>}
        </span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`, background: color,
          borderRadius: '3px', transition: 'width 0.5s ease',
        }} />
      </div>
      {detail && <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{detail}</p>}
    </div>
  );
}

export default function ListingAssessment({ data }) {
  const assessment = data.analysis?.listing_assessment || {};
  const ls = data.listingScore;
  const certik = data.certik;
  const sa = data.socialAnalysis;

  const grade = assessment.grade || ls?.compositeGrade || '?';
  const gradeColor = GRADE_COLOR[grade] || 'var(--text-tertiary)';

  // 6-axis radar: 거래소 / 온체인 / 가격안정성 / 보안(CertiK) / 커뮤니티 / 유동성
  const gp = data.goplusSecurity;

  // Security: CertiK score (0-100) or GoPlus-derived estimate
  const securityScore = certik
    ? Math.round(certik.score)                          // 0–100 direct
    : gp
      ? (!gp.isHoneypot && gp.isOpenSource && !gp.isMintable ? 65
        : gp.isHoneypot ? 5
        : 40)
      : 35;

  // Community: Twitter health score
  const communityScore = sa?.healthScore
    ?? (data.twitterData?.followersCount
      ? Math.min(100, Math.round(Math.log10(data.twitterData.followersCount + 1) / 5 * 100))
      : 30);

  // Liquidity: from liquidityAnalysis or dexData
  const la = data.liquidityAnalysis;
  const liquidityScore = la
    ? (la.liquidityHealth === 'STRONG' ? 100
      : la.liquidityHealth === 'MODERATE' ? 70
      : la.liquidityHealth === 'WEAK' ? 40
      : 10)
    : (data.marketData?.dexData?.liquidity
      ? Math.min(100, Math.round(Math.log10(data.marketData.dexData.liquidity + 1) / 6 * 100))
      : 30);

  const radarScores = [
    ls?.exchange?.score ?? 0,
    ls?.onchain?.score ?? 0,
    ls?.priceStability?.score ?? 0,
    securityScore,
    communityScore,
    liquidityScore,
  ];

  const radarData = {
    labels: ['거래소', '온체인', '가격안정성', '보안', '커뮤니티', '유동성'],
    datasets: [{
      label: '점수',
      data: radarScores,
      backgroundColor: 'rgba(0, 229, 255, 0.12)',
      borderColor: '#00e5ff',
      borderWidth: 2,
      pointBackgroundColor: '#00e5ff',
      pointBorderColor: '#0a0b0f',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,11,15,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#8899aa',
        bodyColor: '#e8ecf4',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed.r}/100`,
        },
      },
    },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: {
          stepSize: 25,
          color: '#445566',
          font: { size: 9 },
          backdropColor: 'transparent',
        },
        grid: { color: 'rgba(255,255,255,0.06)' },
        angleLines: { color: 'rgba(255,255,255,0.06)' },
        pointLabels: {
          color: '#8899aa',
          font: { size: 12, family: 'Inter' },
        },
      },
    },
  };

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">상장 심사 종합</h2>
        <span className="badge badge-ethereum">Listing Assessment</span>
      </div>

      {/* Grade + radar side by side */}
      <div className="glass-card" style={{ display: 'flex', gap: '24px', alignItems: 'stretch', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Grade */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '120px' }}>
          <div style={{
            fontSize: '60px', fontWeight: 800, color: gradeColor,
            background: `${gradeColor}18`, padding: '16px 32px',
            borderRadius: '16px', border: `1px solid ${gradeColor}44`,
            textAlign: 'center', lineHeight: 1,
          }}>
            {grade}
          </div>
          {ls && (
            <p style={{ fontSize: '14px', fontWeight: 700, marginTop: '10px', color: gradeColor }}>
              {ls.composite}/100
            </p>
          )}
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: 'center' }}>종합 점수</p>
        </div>

        {/* Radar chart */}
        <div style={{ flex: 1, minWidth: '260px', height: '260px' }}>
          <Radar data={radarData} options={radarOptions} />
        </div>
      </div>

      {/* AI summary */}
      {assessment.summary && (
        <div className="glass-card" style={{ marginBottom: '16px' }}>
          <p className="body-base">{assessment.summary}</p>
        </div>
      )}

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

          {/* Security & Community (참고) */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>참고 지표 (레이더 차트)</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: '보안', score: securityScore, src: certik ? `CertiK ${certik.score.toFixed(1)}/100` : 'GoPlus 추정' },
                { label: '커뮤니티', score: communityScore, src: sa ? `Twitter ${sa.healthGrade}` : '—' },
                { label: '유동성', score: liquidityScore, src: la ? `DexScreener ${la.liquidityHealth}` : '—' },
              ].map(({ label, score, src }) => {
                const c = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={label} style={{ flex: '1 1 140px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: 'var(--border-glass) 1px solid' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: c }}>{score}/100</p>
                    <p style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{src}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier counts */}
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
