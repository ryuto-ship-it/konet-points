export default function ExecutiveSummary({ data }) {
  const text = data.analysis?.executive_summary || "데이터 없음";
  const hasWarning = text.includes('⚠️');
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">Executive Summary</h2>
      </div>
      <div className={`glass-card ${hasWarning ? 'border-warning' : ''}`} style={hasWarning ? { borderColor: 'var(--accent-crimson)', background: 'rgba(255,51,102,0.05)' } : {}}>
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
