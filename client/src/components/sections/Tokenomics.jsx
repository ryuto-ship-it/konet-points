export default function Tokenomics({ data }) {
  const text = data.analysis?.tokenomics || "데이터 없음";
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">토크노믹스</h2>
        <span className="badge badge-ethereum">Tokenomics</span>
      </div>
      <div className="glass-card">
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
