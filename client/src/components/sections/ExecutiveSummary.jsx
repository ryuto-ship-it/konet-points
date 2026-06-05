export default function ExecutiveSummary({ data }) {
  const text = data.analysis?.executive_summary || "데이터 없음";
  const hasWarning = text.includes('⚠️');
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">Executive Summary</h2>
      </div>
      <div 
        className="section-card" 
        style={{ 
          borderLeft: `3px solid ${hasWarning ? 'var(--danger)' : 'var(--accent-cyan)'}`, 
          paddingLeft: '24px' 
        }}
      >
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
