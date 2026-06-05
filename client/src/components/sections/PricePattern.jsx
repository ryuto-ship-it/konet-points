/* eslint-disable react-hooks/purity */
const StatCard = ({ label, value, sub, warn }) => (
  <div style={{
    flex: '1 1 140px',
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${warn ? 'rgba(239,68,68,0.3)' : 'var(--border-glass)'}`,
    borderRadius: '12px', padding: '16px',
  }}>
    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>{label}</p>
    <p style={{ fontSize: '18px', fontWeight: 700, color: warn ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>
      {value ?? '—'}
    </p>
    {sub && <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{sub}</p>}
  </div>
);

export default function PricePattern({ data }) {
  const pp = data.pricePattern;
  const interpretation = data.analysis?.price_pattern_interpretation;
  const creationDate = data.tokenCreationDate;
  const md = data.marketData || {};

  const currentPrice = md.currentPrice ?? 0;
  const ath = md.ath ?? 0;
  const atl = md.atl ?? null;
  const athDate = md.athDate ? md.athDate.slice(0, 10) : null;
  const atlDate = md.atl_date ? md.atl_date.slice(0, 10) : null;
  const athChangePct = md.ath_change_percent ?? null;

  const tokenAgeDays = creationDate
    ? Math.floor((Date.now() - new Date(creationDate).getTime()) / 86400000)
    : null;

  // Position of current price between ATL and ATH (0–100%)
  let pricePosition = null;
  if (atl != null && ath > 0 && ath > atl) {
    pricePosition = Math.max(0, Math.min(100,
      ((currentPrice - atl) / (ath - atl)) * 100
    ));
  }

  const fmtPrice = p => {
    if (!p && p !== 0) return '—';
    if (p < 0.000001) return `$${p.toExponential(2)}`;
    if (p < 0.01) return `$${p.toFixed(8)}`;
    if (p < 1) return `$${p.toFixed(6)}`;
    return `$${p.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
  };

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">가격 패턴 분석</h2>
        <span className="badge badge-ethereum">Price Pattern</span>
      </div>

      {interpretation && (
        <div className="glass-card" style={{ marginBottom: '16px' }}>
          <p className="body-base">{interpretation}</p>
        </div>
      )}

      {/* ATH / ATL / Current timeline gauge */}
      {ath > 0 && (
        <div className="glass-card" style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
            ATH → ATL 범위 내 현재가 위치
          </p>

          {/* Price labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: 'var(--accent-crimson)' }}>
              ATL {fmtPrice(atl)}
              {atlDate && <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px' }}>({atlDate})</span>}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', textAlign: 'center' }}>
              현재 {fmtPrice(currentPrice)}
            </span>
            <span style={{ color: 'var(--accent-emerald)', textAlign: 'right' }}>
              ATH {fmtPrice(ath)}
              {athDate && <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px' }}>({athDate})</span>}
            </span>
          </div>

          {/* Gauge track */}
          <div style={{ position: 'relative', height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'visible' }}>
            {/* Filled portion */}
            <div style={{
              height: '100%',
              width: `${pricePosition ?? 0}%`,
              background: 'linear-gradient(90deg, var(--accent-crimson), var(--accent-amber), var(--accent-emerald))',
              borderRadius: '6px',
              transition: 'width 0.6s ease',
            }} />
            {/* Current price marker */}
            {pricePosition !== null && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: `calc(${pricePosition}% - 10px)`,
                width: '20px', height: '20px',
                background: '#0a0b0f',
                border: '2px solid #00e5ff',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '6px', height: '6px', background: '#00e5ff', borderRadius: '50%' }} />
              </div>
            )}
          </div>

          {athChangePct !== null && (
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px', textAlign: 'right' }}>
              ATH 대비
              <span style={{ color: 'var(--accent-crimson)', fontWeight: 700, marginLeft: '6px' }}>
                {athChangePct}%
              </span>
            </p>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="glass-card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <StatCard
            label="토큰 생성일"
            value={creationDate ? creationDate.slice(0, 10) : '—'}
            sub={tokenAgeDays !== null ? `${tokenAgeDays}일 전 [Etherscan]` : null}
          />
          <StatCard
            label="30일 변동성"
            value={pp ? `${pp.volatility30d}%` : '—'}
            sub="일일 수익률 표준편차 [CoinGecko]"
            warn={pp && pp.volatility30d > 15}
          />
          <StatCard
            label="거래량 스파이크"
            value={pp?.volumeSpikeRatio != null ? `${pp.volumeSpikeRatio}x` : '—'}
            sub="최대/평균 거래량 비율 [CoinGecko]"
            warn={pp && pp.volumeSpikeRatio > 5}
          />
          <StatCard
            label="30일 가격 범위"
            value={pp?.rangePercent30d != null ? `${pp.rangePercent30d}%` : '—'}
            sub="(최고-최저)/최저 [CoinGecko]"
            warn={pp && pp.rangePercent30d > 100}
          />
        </div>

        {pp && pp.volumeSpikeRatio > 5 && (
          <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--accent-amber)' }}>
            ⚠️ 거래량 스파이크 비율 {pp.volumeSpikeRatio}x — 단기 급등 이후 지속적 유동성 확인 필요
          </p>
        )}
      </div>
    </section>
  );
}
