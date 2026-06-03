function RiskBadge({ risk }) {
  const styles = {
    HIGH:   { color: 'var(--accent-crimson)', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
    MEDIUM: { color: 'var(--accent-amber)',   bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    LOW:    { color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  };
  const s = styles[risk] || styles.LOW;
  return (
    <span style={{ padding: '3px 10px', borderRadius: '20px', background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontWeight: 700, fontSize: '12px' }}>
      {risk}
    </span>
  );
}

export default function OnchainVerification({ data }) {
  const ov = data.onchainVerification;
  const la = data.liquidityAnalysis;

  if (!ov && !la) return null;

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">온체인 진위 분석</h2>
        <span className="badge badge-ethereum">Onchain Verification</span>
      </div>

      {ov && (
        <div className="glass-card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 className="heading-4">세탁거래 위험도</h4>
            <RiskBadge risk={ov.washTradingRisk} />
          </div>

          {ov.washTradingRisk === 'HIGH' && (
            <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ fontSize: '13px', color: 'var(--accent-crimson)', fontWeight: 600 }}>
                ⚠️ 세탁거래 의심 강함 (점수: {ov.washTradingScore}/100)
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              { label: '분석 TX 수', value: `${ov.totalTxAnalyzed}건` },
              { label: '고유 주소 비율', value: `${ov.uniqueAddressRatio}%`, warn: ov.uniqueAddressRatio < 50 },
              { label: '핑퐁 거래 쌍', value: `${ov.pingPongPairs}쌍`, warn: ov.pingPongPairs > 3 },
              { label: '반복 금액 패턴', value: `${ov.suspiciousValues || 0}건`, warn: ov.suspiciousValues > 3 },
              { label: '봇 패턴', value: ov.isBotPattern ? '⚠️ 감지됨' : '✅ 없음', warn: ov.isBotPattern },
            ].map(({ label, value, warn }) => (
              <div key={label} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${warn ? 'rgba(239,68,68,0.2)' : 'var(--border-glass)'}` }}>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{label}</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: warn ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {la && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 className="heading-4">유동성 건전성</h4>
            <span style={{
              padding: '3px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '12px',
              color: la.liquidityHealth === 'STRONG' ? 'var(--accent-emerald)' : la.liquidityHealth === 'MODERATE' ? 'var(--accent-cyan)' : la.liquidityHealth === 'WEAK' ? 'var(--accent-amber)' : 'var(--accent-crimson)',
              background: la.liquidityHealth === 'STRONG' ? 'rgba(16,185,129,0.12)' : la.liquidityHealth === 'CRITICAL' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
              border: '1px solid currentColor',
            }}>
              {la.liquidityHealth}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              { label: '유동성 (USD)', value: la.liquidity >= 1e6 ? `$${(la.liquidity/1e6).toFixed(2)}M` : `$${(la.liquidity/1e3).toFixed(0)}K` },
              { label: '매도 비율 (24h)', value: `${la.sellRatio}%`, warn: la.sellRatio >= 70 },
              { label: '거래량/유동성', value: `${la.volLiqRatio}x`, warn: la.isWashTradingSuspect },
              { label: '페어 생성', value: la.pairAgeInDays !== null ? `${la.pairAgeInDays}일 전` : '—', warn: la.isNewPair },
            ].map(({ label, value, warn }) => (
              <div key={label} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${warn ? 'rgba(239,68,68,0.2)' : 'var(--border-glass)'}` }}>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{label}</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: warn ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
