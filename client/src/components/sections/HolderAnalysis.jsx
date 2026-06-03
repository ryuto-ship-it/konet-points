export default function HolderAnalysis({ data }) {
  const ha = data.holderAnalysis;
  const wa = data.walletAgeAnalysis;
  const dp = data.distributionPattern;
  const interpretation = data.analysis?.holder_analysis_interpretation;

  const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';

  const fmtBalance = (n) => {
    if (n == null) return '—';
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
    return n.toLocaleString();
  };

  // Build wallet age lookup by address
  const walletAgeMap = {};
  if (wa?.walletDetails) {
    wa.walletDetails.forEach(w => { walletAgeMap[w.address?.toLowerCase()] = w; });
  }

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">홀더 분석</h2>
        <span className="badge badge-ethereum">Holder Analysis</span>
      </div>

      {interpretation && (
        <div className="glass-card" style={{ marginBottom: '16px' }}>
          <p className="body-base">{interpretation}</p>
        </div>
      )}

      {/* Airdrop / distribution pattern warnings */}
      {(wa?.isAirdropPattern || dp?.isAirdropLaunch) && (
        <div className="glass-card" style={{ marginBottom: '16px', borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)' }}>
          <p style={{ fontSize: '13px', color: 'var(--accent-crimson)', fontWeight: 600 }}>
            ⚠️ 에어드랍/봇 패턴 감지
          </p>
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
        <div className="glass-card" style={{ marginBottom: '16px', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
          <p style={{ fontSize: '13px', color: 'var(--accent-emerald)' }}>
            ✅ 실유저 기반 — 상위 홀더 신생 지갑 비율 {wa.newWalletRatio}% (낮음)
          </p>
        </div>
      )}

      {!ha ? (
        <div className="glass-card">
          <p className="body-base" style={{ color: 'var(--text-tertiary)' }}>
            홀더 데이터 없음 — 컨트랙트 주소 필요
          </p>
        </div>
      ) : (
        <>
          {/* Concentration bar */}
          <div className="glass-card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="heading-4">상위 10개 지갑 집중도</span>
              <span style={{
                fontWeight: 700,
                fontSize: '18px',
                color: ha.isHighRisk ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
              }}>
                {ha.top10TotalPercent}%
                {ha.isHighRisk && ' ⚠️ HIGH RISK'}
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
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
              50% 초과 시 HIGH RISK 판정 [Etherscan]
            </p>
          </div>

          {/* Top holders table */}
          <div className="glass-card" style={{ overflowX: 'auto' }}>
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
                {ha.holders.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--text-tertiary)' }}>{h.rank ?? i + 1}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {shortAddr(h.address)}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px' }}>
                      {fmtBalance(h.balance)}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                      {h.percentage}%
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      {(() => {
                        const wa = walletAgeMap[h.address?.toLowerCase()];
                        if (!wa) return <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>—</span>;
                        return (
                          <span style={{
                            fontSize: '11px', fontWeight: 600,
                            color: wa.isNewWallet ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
                          }}>
                            {wa.isNewWallet ? '🔴' : '🟢'} {wa.walletAgeMonths}개월
                          </span>
                        );
                      })()}
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
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
