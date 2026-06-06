function CheckRow({ item, met, note }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{met ? '✅' : '❌'}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: met ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
          {item}
        </p>
        {note && (
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{note}</p>
        )}
      </div>
    </div>
  );
}

function GaugeBar({ pct, color }) {
  return (
    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
      <div style={{
        height: '100%', width: `${pct}%`, background: color,
        borderRadius: '4px', transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

function readinessColor(score) {
  return score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
}

export default function Compliance({ data }) {
  const c = data.compliance;
  if (!c) return null;

  const daxaColor = readinessColor(c.daxaComplianceRate);
  const upbitColor = readinessColor(c.upbitScore);
  const bithumbColor = readinessColor(c.bithumbScore);

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">규제 컴플라이언스</h2>
        <span className="badge badge-ethereum">Compliance</span>
      </div>

      {/* 한국 거래소 상장 준비도 */}
      <div className="section-card" style={{ marginBottom: '16px' }}>
        <h4 className="heading-4" style={{ marginBottom: '16px' }}>한국 거래소 상장 준비도</h4>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[
            { label: '업비트 준비도', score: c.upbitScore, color: upbitColor },
            { label: '빗썸 준비도',   score: c.bithumbScore, color: bithumbColor },
            { label: 'DAXA 충족률',   score: c.daxaComplianceRate, color: daxaColor },
          ].map(({ label, score, color }) => (
            <div key={label} style={{ flex: '1 1 160px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: 'var(--border-glass) 1px solid' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>{label}</p>
              <p style={{ fontSize: '22px', fontWeight: 800, color }}>{score}%</p>
              <GaugeBar pct={score} color={color} />
            </div>
          ))}
        </div>

        {/* 업비트 요건 */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>업비트 요건</p>
        {c.upbitRequirements.map((r, i) => (
          <CheckRow key={i} item={r.item} met={r.met} />
        ))}

        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '16px', marginBottom: '4px' }}>빗썸 요건</p>
        {c.bithumbRequirements.map((r, i) => (
          <CheckRow key={i} item={r.item} met={r.met} />
        ))}
      </div>

      {/* DAXA 컴플라이언스 */}
      <div className="section-card" style={{ marginBottom: '16px' }}>
        <h4 className="heading-4" style={{ marginBottom: '8px' }}>DAXA 컴플라이언스</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
          한국 디지털자산거래소연합(DAXA) 자율 규제 기준
        </p>
        {c.daxaRequirements.map((r, i) => (
          <CheckRow key={i} item={r.item} met={r.met} note={r.note} />
        ))}
      </div>

      {/* 글로벌 규제 리스크 */}
      <div className="section-card">
        <h4 className="heading-4" style={{ marginBottom: '12px' }}>글로벌 규제 리스크</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            {
              flag: '🇰🇷', region: '한국',
              status: c.daxaReady ? 'DAXA 준수' : `DAXA 미충족 (${c.daxaComplianceRate}%)`,
              color: c.daxaReady ? '#10b981' : '#ef4444',
            },
            {
              flag: '🇺🇸', region: '미국 SEC',
              status: c.usSecRisk === 'HIGH' ? '⚠️ 증권성 리스크 HIGH' : '증권성 리스크 낮음',
              color: c.usSecRisk === 'HIGH' ? '#ef4444' : '#10b981',
            },
            {
              flag: '🇪🇺', region: 'EU MiCA',
              status: c.euMicaApplicable ? 'MiCA 적용 가능성 있음 (시총 $5M+)' : 'MiCA 기준 미달 (소형 토큰)',
              color: c.euMicaApplicable ? '#f59e0b' : '#8899aa',
            },
          ].map(({ flag, region, status, color }) => (
            <div key={region} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
              border: 'var(--border-glass) 1px solid',
            }}>
              <span style={{ fontSize: '20px' }}>{flag}</span>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{region}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color }}>{status}</p>
              </div>
            </div>
          ))}
        </div>

        {c.securityIndicators?.length > 0 && (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>⚠️ 증권성 지표 감지</p>
            {c.securityIndicators.map((s, i) => (
              <p key={i} style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>• {s}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
