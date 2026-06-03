export default function TeamInvestors({ data }) {
  const text = data.analysis?.team_investors || "데이터 없음";
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">팀 & 투자자</h2>
        <span className="badge badge-ethereum">Team & Investors</span>
      </div>
      <div className="glass-card">
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
