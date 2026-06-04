import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip,
} from 'chart.js';
import './ScorePanel.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

function scoreColor(s) {
  if (s >= 80) return '#00ff88';
  if (s >= 60) return '#ffaa00';
  if (s >= 40) return '#ff8c00';
  return '#ff4444';
}

const AXES = ['보안', '시장', '커뮤니티', '온체인', '거래소', '펀더멘탈'];

export default function ScorePanel({ data }) {
  const ls   = data.listingScore;
  const certik = data.certik;
  const gp   = data.goplusSecurity;
  const sa   = data.socialAnalysis;
  const la   = data.liquidityAnalysis;

  const composite = ls?.composite ?? 0;
  const grade     = ls?.compositeGrade ?? '?';
  const color     = scoreColor(composite);

  const secScore = certik
    ? Math.round(certik.score)
    : gp
      ? (!gp.isHoneypot && gp.isOpenSource && !gp.isMintable ? 65 : gp.isHoneypot ? 5 : 40)
      : 35;

  const commScore = sa?.healthScore
    ?? (data.twitterData?.followersCount
      ? Math.min(100, Math.round(Math.log10(data.twitterData.followersCount + 1) / 5 * 100))
      : 30);

  const liqScore = la
    ? (la.liquidityHealth === 'STRONG' ? 100 : la.liquidityHealth === 'MODERATE' ? 70 : la.liquidityHealth === 'WEAK' ? 40 : 10)
    : (data.marketData?.dexData?.liquidity
      ? Math.min(100, Math.round(Math.log10(data.marketData.dexData.liquidity + 1) / 6 * 100))
      : 30);

  const axisScores = [
    secScore,
    ls?.priceStability?.score ?? 0,
    commScore,
    ls?.onchain?.score ?? 0,
    ls?.exchange?.score ?? 0,
    liqScore,
  ];

  const radarData = {
    labels: AXES,
    datasets: [{
      data: axisScores,
      backgroundColor: 'rgba(0,229,255,0.08)',
      borderColor: '#00e5ff',
      borderWidth: 1.5,
      pointBackgroundColor: '#00e5ff',
      pointBorderColor: '#111318',
      pointBorderWidth: 1.5,
      pointRadius: 3,
    }],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(6,11,20,0.95)',
        borderColor: '#1e2430',
        borderWidth: 1,
        titleColor: '#8899aa',
        bodyColor: '#e8ecf4',
        padding: 8,
        cornerRadius: 6,
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.r}/100` },
      },
    },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { stepSize: 25, color: '#2a3a4a', font: { size: 7 }, backdropColor: 'transparent' },
        grid: { color: 'rgba(255,255,255,0.04)' },
        angleLines: { color: 'rgba(255,255,255,0.04)' },
        pointLabels: { color: '#556677', font: { size: 10, family: 'Inter' } },
      },
    },
  };

  const badges = [
    { label: '감사 완료', active: !!certik },
    { label: '팀 KYC', active: false },
    { label: '버그바운티', active: !!(certik?.bugBounty) },
    { label: '컨트랙트 검증', active: gp?.isOpenSource === true },
  ];

  return (
    <aside className="score-panel">
      {/* ── Composite Score ── */}
      <div className="sp-score-block">
        <div className="sp-label">종합 점수</div>
        <div className="sp-score" style={{ color }}>
          {composite.toFixed(2)}
        </div>
        <div className="sp-grade" style={{ color, borderColor: color, background: `${color}12` }}>
          {grade}
        </div>
      </div>

      <div className="sp-divider" />

      {/* ── Radar Chart ── */}
      <div className="sp-radar-title">평가 레이더</div>
      <div className="sp-radar">
        <Radar data={radarData} options={radarOptions} />
      </div>

      {/* ── Axis Bars ── */}
      <div className="sp-axes">
        {AXES.map((label, i) => {
          const s = axisScores[i];
          const c = scoreColor(s);
          return (
            <div key={label} className="sp-axis-row">
              <span className="sp-axis-label">{label}</span>
              <div className="sp-axis-track">
                <div className="sp-axis-fill" style={{ width: `${s}%`, background: c }} />
              </div>
              <span className="sp-axis-val" style={{ color: c }}>{s}</span>
            </div>
          );
        })}
      </div>

      <div className="sp-divider" />

      {/* ── Security Badges ── */}
      <div className="sp-label sp-label--badges">보안 인증</div>
      <div className="sp-badges">
        {badges.map(b => (
          <div key={b.label} className={`sp-badge ${b.active ? 'sp-badge--on' : 'sp-badge--off'}`}>
            <span className="sp-badge-dot" />
            <span>{b.label}</span>
          </div>
        ))}
      </div>

      {/* CertiK score if available */}
      {certik && (
        <>
          <div className="sp-divider" />
          <div className="sp-certik">
            <div className="sp-label">CertiK Skynet</div>
            <div className="sp-certik-score" style={{ color: scoreColor(certik.score) }}>
              {certik.score.toFixed(1)}
              <span className="sp-certik-max">/100</span>
            </div>
            {certik.rank && (
              <div className="sp-certik-rank">Rank #{certik.rank}</div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
