import { AlertOctagon, AlertTriangle, ShieldAlert, Users } from 'lucide-react';
import './RiskMatrix.css';

function getRiskLevel(text) {
  if (!text) return 'UNKNOWN';
  const upper = text.toUpperCase();
  if (upper.includes('CRITICAL')) return 'CRITICAL';
  if (upper.includes('HIGH')) return 'HIGH';
  if (upper.includes('MEDIUM') || upper.includes('MODERATE')) return 'MEDIUM';
  if (upper.includes('LOW')) return 'LOW';
  return 'MEDIUM';
}

function Badge({ ok, label, note }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 14px',
      background: ok ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
      borderRadius: '10px',
      flex: '1 1 160px',
    }}>
      <span style={{ fontSize: '16px' }}>{ok ? '✅' : '❌'}</span>
      <div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: ok ? 'var(--accent-emerald)' : 'var(--accent-crimson)', margin: 0 }}>
          {label}
        </p>
        {note && <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>{note}</p>}
      </div>
    </div>
  );
}

export default function RiskMatrix({ data }) {
  const risks = data.analysis?.risk_matrix || {};
  const cd = data.certikData;

  const riskItems = [
    { id: 'contract', title: 'Contract Risk', icon: ShieldAlert, desc: risks.contractRisk || 'No data' },
    { id: 'liquidity', title: 'Market & Liquidity Risk', icon: AlertTriangle, desc: risks.liquidityMarketRisk || 'No data' },
    { id: 'security', title: 'Security Scan (GoPlus)', icon: AlertOctagon, desc: risks.goplusRisk || 'No data' },
    { id: 'holder', title: 'Holder Concentration', icon: Users, desc: risks.holderConcentrationRisk || 'No data' },
  ];

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">Risk Matrix</h2>
      </div>

      {/* CertiK / Audit badges */}
      {cd && (
        <div className="section-card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
              보안 감사 현황
            </p>
            {cd.skynetScore != null && (
              <span style={{
                fontSize: '13px', fontWeight: 700,
                color: cd.skynetScore >= 80 ? 'var(--accent-emerald)' : cd.skynetScore >= 60 ? 'var(--accent-amber)' : 'var(--accent-crimson)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '4px 12px',
              }}>
                CertiK Skynet {cd.skynetScore.toFixed(1)}점
                {cd.isPartialRating && <span style={{ color: 'var(--accent-amber)', marginLeft: '6px' }}>⚠️ Partial</span>}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: cd.auditInfos?.length ? '14px' : 0 }}>
            <Badge
              ok={cd.badges.auditByCertik}
              label={cd.badges.auditByCertik ? 'Audited by CertiK' : 'Not Audited by CertiK'}
              note={cd.primaryAudit?.date ? new Date(cd.primaryAudit.date).toLocaleDateString('ko-KR') : null}
            />
            <Badge
              ok={cd.badges.kycByCertik === true}
              label={cd.badges.kycByCertik === true ? 'Team KYC (CertiK)' : 'Team KYC 미확인'}
              note="CertiK KYC 뱃지"
            />
            <Badge
              ok={cd.badges.bugBounty === true}
              label={cd.badges.bugBounty === true ? 'Bug Bounty 운영 중' : 'Bug Bounty 없음'}
              note="버그 바운티 프로그램"
            />
          </div>

          {/* Audit records table */}
          {cd.auditInfos?.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-tertiary)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 600 }}>감사 기관</th>
                    <th style={{ textAlign: 'center', padding: '6px 10px', fontWeight: 600 }}>상태</th>
                    <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 600 }}>날짜</th>
                    <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 600 }}>리포트</th>
                  </tr>
                </thead>
                <tbody>
                  {cd.auditInfos.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>{a.auditor}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                        <span style={{ color: a.completed ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 700 }}>
                          {a.completed ? '✅ 완료' : '⏳ 진행중'}
                        </span>
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
                        {a.date ? new Date(a.date).toLocaleDateString('ko-KR') : '—'}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        {a.reportUrl
                          ? <a href={a.reportUrl} target="_blank" rel="noopener noreferrer"
                              style={{ color: 'var(--accent-cyan)', fontSize: '11px' }}>리포트 →</a>
                          : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!cd.isAudited && (
            <p style={{ fontSize: '12px', color: 'var(--accent-crimson)', marginTop: '8px' }}>
              ⚠️ 공인 감사 기록 없음 — 투자 전 독립적 코드 감사 필요
            </p>
          )}
        </div>
      )}

      {/* Risk rows */}
      <div className="section-card risk-matrix-container">
        {riskItems.map((item) => {
          const level = getRiskLevel(item.desc);
          const Icon = item.icon;
          return (
            <div key={item.id} className="risk-row">
              <div className="risk-row-left">
                <div className="risk-icon-wrapper">
                  <Icon size={20} className={`icon-${level.toLowerCase()}`} />
                </div>
                <div className="risk-title-wrapper">
                  <span className="risk-title">{item.title}</span>
                  <span className={`risk-badge badge-${level.toLowerCase()}`}>{level}</span>
                </div>
              </div>
              <div className="risk-row-right">
                <p className="risk-desc">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {risks.details && (
        <div className="section-card" style={{ marginTop: '16px' }}>
          <h4 className="heading-4" style={{ marginBottom: '12px' }}>Overall Risk Assessment</h4>
          <p className="body-base">{risks.details}</p>
        </div>
      )}
    </section>
  );
}
