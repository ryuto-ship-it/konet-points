export default function ExchangeListings({ data }) {
  const exchanges = data.exchangeListings;
  const interpretation = data.analysis?.exchange_listing_interpretation;

  const trustColor = (score) => {
    if (score === 'green') return 'var(--accent-emerald)';
    if (score === 'yellow') return 'var(--accent-amber)';
    return 'var(--accent-crimson)';
  };

  const fmt = (n) => {
    if (!n) return '—';
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  };

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">상장 거래소 현황</h2>
        <span className="badge badge-ethereum">Exchange Listings</span>
      </div>

      {interpretation && (
        <div className="glass-card" style={{ marginBottom: '16px' }}>
          <p className="body-base">{interpretation}</p>
        </div>
      )}

      {!exchanges || exchanges.length === 0 ? (
        <div className="glass-card">
          <p className="body-base" style={{ color: 'var(--text-tertiary)' }}>
            거래소 데이터 없음
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-tertiary)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>#</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>거래소</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>페어</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>가격 (USD)</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>24h 거래량</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600 }}>신뢰도</th>
              </tr>
            </thead>
            <tbody>
              {exchanges.map((ex, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-tertiary)' }}>{i + 1}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 500 }}>
                    {ex.tradeUrl ? (
                      <a href={ex.tradeUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                        {ex.exchangeName}
                      </a>
                    ) : ex.exchangeName}
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px' }}>{ex.pair}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {ex.priceUsd ? `$${ex.priceUsd.toFixed(6)}` : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(ex.volume24hUsd)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      width: 10, height: 10,
                      borderRadius: '50%',
                      background: trustColor(ex.trustScore),
                      marginRight: 6,
                    }} />
                    <span style={{ fontSize: '12px', color: trustColor(ex.trustScore) }}>
                      {ex.trustScore || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
