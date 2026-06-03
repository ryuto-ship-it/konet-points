export default function RiskMatrix({ data }) {
  const risks = data.analysis?.risk_matrix || {};

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">리스크 매트릭스</h2>
        <span className="badge badge-ethereum">Risk Matrix</span>
      </div>
      <div className="glass-card">
        <div style={{ marginBottom: '16px' }}>
          <h4 className="heading-4">컨트랙트 리스크</h4>
          <p className="body-base">{risks.contractRisk || "데이터 없음"}</p>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <h4 className="heading-4">시장/유동성 리스크</h4>
          <p className="body-base">{risks.liquidityMarketRisk || "데이터 없음"}</p>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <h4 className="heading-4">보안 스캔 (GoPlus)</h4>
          <p className="body-base">{risks.goplusRisk || "GoPlus 보안 스캔 데이터 없음"}</p>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <h4 className="heading-4">홀더 집중도 리스크</h4>
          <p className="body-base">{risks.holderConcentrationRisk || "데이터 없음"}</p>
        </div>
        <div>
          <h4 className="heading-4">종합 리스크 평가</h4>
          <p className="body-base">{risks.details || "데이터 없음"}</p>
        </div>
      </div>
    </section>
  );
}
