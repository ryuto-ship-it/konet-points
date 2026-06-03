export default function ProjectOverview({ data }) {
  const text = data.analysis?.project_overview || "데이터 없음";
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">프로젝트 개요</h2>
        <span className="badge badge-ethereum">Project Overview</span>
      </div>
      <div className="glass-card">
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
