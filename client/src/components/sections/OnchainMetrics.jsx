export default function OnchainMetrics({ data }) {
  const text = data.analysis?.onchain_metrics || "데이터 없음";
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">온체인 지표</h2>
        <span className="badge badge-ethereum">On-chain Metrics</span>
      </div>
      <div className="glass-card">
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
