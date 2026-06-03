export default function ListingAssessment({ data }) {
  const assessment = data.analysis?.listing_assessment || {};
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">상장 심사 종합</h2>
        <span className="badge badge-ethereum">Listing Assessment</span>
      </div>
      <div className="glass-card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: assessment.grade === 'A' ? 'var(--accent-emerald)' : assessment.grade === 'B' ? 'var(--accent-cyan)' : assessment.grade === 'C' ? 'var(--accent-amber)' : 'var(--accent-crimson)',
          background: 'rgba(255,255,255,0.05)',
          padding: '20px 40px',
          borderRadius: '16px',
          border: '1px solid var(--border-glass)'
        }}>
          {assessment.grade || "?"}
        </div>
        <p className="body-lg" style={{ flex: 1 }}>{assessment.summary || "데이터 없음"}</p>
      </div>
    </section>
  );
}
