export default function PricePattern({ data }) {
  const pp = data.pricePattern;
  const interpretation = data.analysis?.price_pattern_interpretation;
  const creationDate = data.tokenCreationDate;

  const tokenAgeDays = creationDate
    ? Math.floor((Date.now() - new Date(creationDate).getTime()) / 86400000)
    : null;

  const StatCard = ({ label, value, sub, warn }) => (
    <div style={{
      flex: '1 1 140px',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${warn ? 'rgba(239,68,68,0.3)' : 'var(--border-glass)'}`,
      borderRadius: '12px',
      padding: '16px',
    }}>
      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: 700, color: warn ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>
        {value ?? '—'}
      </p>
      {sub && <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{sub}</p>}
    </div>
  );

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
