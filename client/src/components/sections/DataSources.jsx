export default function DataSources({ data }) {
  const sources = data.analysis?.data_sources || [];
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">데이터 출처</h2>
        <span className="badge badge-ethereum">Data Sources</span>
      </div>
      <div className="section-card">
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
          {sources.length > 0 ? sources.map((s, i) => (
            <li key={i}>{s}</li>
          )) : <li>데이터 없음</li>}
        </ul>
      </div>
    </section>
  );
}
