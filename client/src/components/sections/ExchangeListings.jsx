import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const TIER_BADGE = {
  TIER1: { icon: '🏆', label: 'T1', color: '#FFD700' },
  TIER2: { icon: '⭐', label: 'T2', color: '#C0C0C0' },
  TIER3: { icon: '🔵', label: 'T3', color: '#4A9EFF' },
  TIER4: { icon: '⬜', label: 'T4', color: '#888' },
  TIER5: { icon: '❓', label: 'T5', color: '#444' },
};

const TIER_COLORS = {
  TIER1: '#FFD700', TIER2: '#C0C0C0', TIER3: '#4A9EFF',
  TIER4: '#666', TIER5: '#333',
};

function fmt(n) {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtPrice(p) {
  if (!p) return '—';
  if (p < 0.000001) return `$${p.toExponential(2)}`;
  if (p < 0.01) return `$${p.toFixed(8)}`;
  return `$${p.toFixed(4)}`;
}

export default function ExchangeListings({ data }) {
  const exchanges = data.exchangeListings || [];
  const interpretation = data.analysis?.exchange_listing_interpretation;
  const ls = data.listingScore?.exchange;

  // Build bar chart data (top 10 by volume)
  const chartExchanges = [...exchanges]
    .filter(e => e.volume24hUsd > 0)
    .sort((a, b) => (b.volume24hUsd || 0) - (a.volume24hUsd || 0))
    .slice(0, 10);

  const totalVol = chartExchanges.reduce((s, e) => s + (e.volume24hUsd || 0), 0);

  const barData = {
    labels: chartExchanges.map(e => e.exchangeName),
    datasets: [{
      data: chartExchanges.map(e => e.volume24hUsd || 0),
      backgroundColor: chartExchanges.map(e =>
        `${TIER_COLORS[e.tierInfo?.tier] || TIER_COLORS.TIER5}cc`
      ),
      borderColor: chartExchanges.map(e =>
        TIER_COLORS[e.tierInfo?.tier] || TIER_COLORS.TIER5
      ),
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const barOptions = {
    indexAxis: 'y',
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
          label: ctx => ` ${fmt(ctx.parsed.x)}  (${totalVol > 0 ? ((ctx.parsed.x / totalVol) * 100).toFixed(1) : 0}%)`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#556677',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: v => fmt(v),
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#aabbcc', font: { size: 12 } },
        border: { display: false },
      },
    },
  };

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">상장 거래소 현황</h2>
        <span className="badge badge-ethereum">Exchange Listings</span>
      </div>

      {/* Tier summary */}
      {ls?.tierCounts && (
        <div className="glass-card" style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>티어 분포</span>
          {Object.entries(ls.tierCounts).filter(([, n]) => n > 0).map(([tier, count]) => {
            const b = TIER_BADGE[tier] || TIER_BADGE.TIER5;
            return (
              <span key={tier} style={{
                padding: '3px 10px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${b.color}44`,
                fontSize: '12px', color: b.color, fontWeight: 600,
              }}>
                {b.icon} {b.label} × {count}
              </span>
            );
          })}
          {ls.reason && (
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
              {ls.reason}
            </span>
          )}
        </div>
      )}

      {interpretation && (
        <div className="glass-card" style={{ marginBottom: '16px' }}>
          <p className="body-base">{interpretation}</p>
        </div>
      )}

      {!exchanges || exchanges.length === 0 ? (
        <div className="glass-card">
          <p className="body-base" style={{ color: 'var(--text-tertiary)' }}>
            중앙화 거래소 미상장 — DEX 전용 또는 데이터 없음
          </p>
        </div>
      ) : (
        <>
          {/* Volume bar chart */}
          {chartExchanges.length > 0 && (
            <div className="glass-card" style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                24h 거래량 비교 (총 {fmt(totalVol)})
              </p>
              <div style={{ height: `${Math.min(chartExchanges.length * 38 + 16, 340)}px` }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ background: 'var(--bg-tertiary)' }}>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>#</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>티어</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>거래소</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>페어</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>가격</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>24h 거래량</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>비중</th>
                </tr>
              </thead>
              <tbody>
                {exchanges.map((ex, i) => {
                  const tier = ex.tierInfo?.tier || 'TIER5';
                  const badge = TIER_BADGE[tier] || TIER_BADGE.TIER5;
                  const vol = ex.volume24hUsd || 0;
                  const pct = totalVol > 0 ? (vol / totalVol * 100).toFixed(1) : '—';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-tertiary)' }}>{i + 1}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, color: badge.color,
                          background: `${badge.color}18`, padding: '2px 7px',
                          borderRadius: '12px', border: `1px solid ${badge.color}44`, whiteSpace: 'nowrap',
                        }}>
                          {badge.icon} {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>
                        {ex.tradeUrl ? (
                          <a href={ex.tradeUrl} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                            {ex.exchangeName}
                          </a>
                        ) : ex.exchangeName}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px' }}>{ex.pair}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtPrice(ex.priceUsd)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(vol)}</td>
                      <td style={{ padding: '8px 12px' }}>
                        {pct !== '—' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                            <div style={{ width: '60px', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: badge.color, borderRadius: '2px' }} />
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', width: '36px', textAlign: 'right' }}>{pct}%</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>—</span>
                        )}
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
