export default function HolderAnalysis({ data }) {
  const ha = data.holderAnalysis;
  const interpretation = data.analysis?.holder_analysis_interpretation;

  const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';

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
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>#</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>지갑 주소</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>보유 비율</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>비율 바</th>
                </tr>
              </thead>
              <tbody>
                {ha.holders.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--text-tertiary)' }}>{i + 1}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {shortAddr(h.address)}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                      {h.percentage}%
                    </td>
                    <td style={{ padding: '8px 12px', minWidth: '120px' }}>
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
