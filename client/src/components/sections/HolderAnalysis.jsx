import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function fmtBalance(n) {
  if (n == null) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
}

// Custom plugin to draw center text on doughnut
const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, data, chartArea: { top, bottom, left, right } } = chart;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const pct = data.datasets[0].data[0];
    const isHighRisk = pct > 50;

    ctx.save();
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = isHighRisk ? '#ef4444' : '#00e5ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${pct}%`, cx, cy - 8);

    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#8899aa';
    ctx.fillText('TOP 10', cx, cy + 14);
    ctx.restore();
  },
};

export default function HolderAnalysis({ data }) {
  const ha = data.holderAnalysis;
  const wa = data.walletAgeAnalysis;
  const dp = data.distributionPattern;
  const interpretation = data.analysis?.holder_analysis_interpretation;

  const walletAgeMap = {};
  if (wa?.walletDetails) {
    wa.walletDetails.forEach(w => { walletAgeMap[w.address?.toLowerCase()] = w; });
  }

  const top10Pct = ha?.top10TotalPercent ?? 0;
  const othersPct = parseFloat(Math.max(0, 100 - top10Pct).toFixed(2));

  const doughnutData = {
    labels: ['상위 10개 지갑', '나머지'],
    datasets: [{
      data: [top10Pct, othersPct],
      backgroundColor: [
        ha?.isHighRisk ? '#ef444499' : '#00e5ff99',
        '#1e203088',
      ],
      borderColor: [
        ha?.isHighRisk ? '#ef4444' : '#00e5ff',
        '#2a2d3e',
      ],
      borderWidth: 2,
      hoverOffset: 4,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8899aa',
          font: { size: 12 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10,11,15,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#8899aa',
        bodyColor: '#e8ecf4',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">홀더 분석</h2>
        <span className="badge badge-ethereum">Holder Analysis</span>
      </div>

      {interpretation && (
        <div className="section-card" style={{ marginBottom: '16px' }}>
          <p className="body-base">{interpretation}</p>
        </div>
      )}

      {/* Airdrop / distribution warnings */}
      {(wa?.isAirdropPattern || dp?.isAirdropLaunch) && (
        <div className="section-card" style={{ marginBottom: '16px', borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)' }}>
          <p style={{ fontSize: '13px', color: 'var(--accent-crimson)', fontWeight: 600 }}>⚠️ 에어드랍/봇 패턴 감지</p>
          {wa?.isAirdropPattern && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              상위 홀더의 {wa.newWalletRatio}%가 신생 지갑(3개월 미만) — 에어드랍 또는 봇 의심
            </p>
          )}
          {dp?.isAirdropLaunch && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              배포 후 24시간 내 {dp.initialReceivers}개 지갑으로 분산 — 에어드랍 런치 패턴
            </p>
          )}
        </div>
      )}
      {wa && !wa.isAirdropPattern && wa.isOrganicHolders && (
        <div className="section-card" style={{ marginBottom: '16px', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
          <p style={{ fontSize: '13px', color: 'var(--accent-emerald)' }}>
            ✅ 실유저 기반 — 상위 홀더 신생 지갑 비율 {wa.newWalletRatio}% (낮음)
          </p>
        </div>
      )}

      {!ha ? (
        <div className="section-card">
          <p className="body-base" style={{ color: 'var(--text-tertiary)' }}>홀더 데이터 없음 — Etherscan Pro 플랜 필요 (BSC 홀더 조회 제한)</p>
        </div>
      ) : (
        <>
          {/* Doughnut + concentration bar */}
          <div className="section-card" style={{ marginBottom: '16px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Doughnut chart */}
            <div style={{ width: '200px', height: '200px', flexShrink: 0 }}>
              <Doughnut data={doughnutData} options={doughnutOptions} plugins={[centerTextPlugin]} />
            </div>

            {/* Stats */}
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>상위 10개 지갑 집중도</span>
                  <span style={{
                    fontWeight: 700, fontSize: '18px',
                    color: ha.isHighRisk ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
                  }}>
                    {ha.top10TotalPercent}%
                    {ha.isHighRisk && <span style={{ fontSize: '14px', marginLeft: '6px' }}>⚠️ HIGH RISK</span>}
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(ha.top10TotalPercent, 100)}%`,
                    background: ha.isHighRisk
                      ? 'linear-gradient(90deg, var(--accent-amber), var(--accent-crimson))'
                      : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                  47%+ → ⚠️ 집중도 위험  /  50% 초과 → HIGH RISK [Etherscan]
                </p>
              </div>
              {ha.totalHolders && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  총 홀더: <strong style={{ color: 'var(--text-primary)' }}>{Number(ha.totalHolders).toLocaleString()}명</strong>
                </p>
              )}
            </div>
          </div>

          {/* Holder table */}
          <div className="section-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-tertiary)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>순위</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>주소</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>보유량</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>비율</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600 }}>지갑 나이</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>비율 바</th>
                </tr>
              </thead>
              <tbody>
                {ha.holders.map((h, i) => {
                  const waInfo = walletAgeMap[h.address?.toLowerCase()];
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-tertiary)' }}>{h.rank ?? i + 1}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px' }}>
                        {h.label
                          ? <span style={{ color: 'var(--accent-cyan)' }}>{h.label}</span>
                          : shortAddr(h.address)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px' }}>
                        {fmtBalance(h.balance)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {h.percentage}%
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {waInfo ? (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: waInfo.isNewWallet ? 'var(--accent-crimson)' : 'var(--accent-emerald)' }}>
                            {waInfo.isNewWallet ? '🔴' : '🟢'} {waInfo.walletAgeMonths}개월
                          </span>
                        ) : <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>—</span>}
                      </td>
                      <td style={{ padding: '8px 12px', minWidth: '100px' }}>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(h.percentage * 2, 100)}%`,
                            background: 'var(--accent-cyan)',
                            borderRadius: '3px',
                          }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
