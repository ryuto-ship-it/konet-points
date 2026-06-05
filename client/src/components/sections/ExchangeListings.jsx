import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const TIER_BADGE = {
  TIER1: { label: 'TIER 1', bg: '#FFD700', color: '#000' },
  TIER2: { label: 'TIER 2', bg: '#C0C0C0', color: '#000' },
  TIER3: { label: 'TIER 3', bg: '#4A90D9', color: '#fff' },
  TIER4: { label: 'TIER 4', bg: '#374151', color: '#9CA3AF' },
  TIER5: { label: 'TIER 5', bg: '#1F2937', color: '#6B7280' },
};

const TIER_COLORS = {
  TIER1: '#FFD700', TIER2: '#C0C0C0', TIER3: '#4A90D9',
  TIER4: '#374151', TIER5: '#1F2937',
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
        <div className="section-card" style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
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
        <div className="section-card" style={{ marginBottom: '16px' }}>
          <p className="body-base">{interpretation}</p>
        </div>
      )}

      {!exchanges || exchanges.length === 0 ? (
        <div className="section-card">
          <p className="body-base" style={{ color: 'var(--text-tertiary)' }}>
            중앙화 거래소 미상장 — DEX 전용 또는 데이터 없음
          </p>
        </div>
      ) : (
        <>
          {/* Volume bar chart */}
          {chartExchanges.length > 0 && (
            <div className="section-card" style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                24h 거래량 비교 (총 {fmt(totalVol)})
              </p>
              <div style={{ height: `${Math.min(chartExchanges.length * 38 + 16, 340)}px` }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="section-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ background: 'var(--bg-surface)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>#</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>티어</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>거래소</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>페어</th>
                  <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>가격</th>
                  <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>24h 거래량</th>
                  <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>비중</th>
                </tr>
              </thead>
              <tbody>
                {exchanges.map((ex, i) => {
                  const tier = ex.tierInfo?.tier || 'TIER5';
                  const badge = TIER_BADGE[tier] || TIER_BADGE.TIER5;
                  const vol = ex.volume24hUsd || 0;
                  const pct = totalVol > 0 ? (vol / totalVol * 100).toFixed(1) : '—';
                  
                  let barColor = 'var(--text-muted)';
                  if (tier === 'TIER1' || tier === 'TIER2') barColor = 'var(--success)';
                  else if (tier === 'TIER3') barColor = 'var(--dolphin-blue)';

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px', color: 'var(--text-tertiary)' }}>{i + 1}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, color: badge.color,
                          background: badge.bg, padding: '2px 8px',
                          borderRadius: '12px', whiteSpace: 'nowrap',
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 500 }}>
                        {ex.tradeUrl ? (
                          <a href={ex.tradeUrl} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                            {ex.exchangeName}
                          </a>
                        ) : ex.exchangeName}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{ex.pair}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtPrice(ex.priceUsd)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(vol)}</td>
                      <td style={{ padding: '12px' }}>
                        {pct !== '—' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                            <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '2px' }} />
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', width: '36px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{pct}%</span>
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
