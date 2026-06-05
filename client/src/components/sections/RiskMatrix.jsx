
import './RiskMatrix.css';

function getRiskLevel(text) {
  if (!text) return 'UNKNOWN';
  const upper = text.toUpperCase();
  if (upper.includes('CRITICAL')) return 'CRITICAL';
  if (upper.includes('HIGH')) return 'HIGH';
  if (upper.includes('MEDIUM') || upper.includes('MODERATE')) return 'MEDIUM';
  if (upper.includes('LOW')) return 'LOW';
  return 'MEDIUM'; // Default fallback
}

export default function RiskMatrix({ data }) {
  const risks = data.analysis?.risk_matrix || {};

  const riskItems = [
    { title: 'Contract Risk', desc: risks.contractRisk || 'No data' },
    { title: 'Market & Liquidity Risk', desc: risks.liquidityMarketRisk || 'No data' },
    { title: 'Security Scan (GoPlus)', desc: risks.goplusRisk || 'No data' },
    { title: 'Holder Concentration', desc: risks.holderConcentrationRisk || 'No data' },
  ];

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">Risk Matrix</h2>
      </div>
      <div className="risk-cards-grid">
        {riskItems.map((item, i) => {
          const level = getRiskLevel(item.desc);
          return (
            <div key={i} className="glass-card risk-card">
              <div className="risk-card-header">
                <h4 className="heading-4">{item.title}</h4>
                <span className={`badge badge-risk-${level.toLowerCase()}`}>{level}</span>
              </div>
              <p className="body-base risk-card-desc">{item.desc}</p>
            </div>
          );
        })}
      </div>
      
      <div className="glass-card" style={{ marginTop: '16px' }}>
        <h4 className="heading-4" style={{ marginBottom: '12px' }}>Overall Risk Assessment</h4>
        <p className="body-base">{risks.details || "No data"}</p>
      </div>
    </section>
  );
}
