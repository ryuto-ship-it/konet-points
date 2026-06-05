import { AlertOctagon, AlertTriangle, ShieldAlert, Users } from 'lucide-react';
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
    { id: 'contract', title: 'Contract Risk', icon: ShieldAlert, desc: risks.contractRisk || 'No data' },
    { id: 'liquidity', title: 'Market & Liquidity Risk', icon: AlertTriangle, desc: risks.liquidityMarketRisk || 'No data' },
    { id: 'security', title: 'Security Scan (GoPlus)', icon: AlertOctagon, desc: risks.goplusRisk || 'No data' },
    { id: 'holder', title: 'Holder Concentration', icon: Users, desc: risks.holderConcentrationRisk || 'No data' },
  ];

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">Risk Matrix</h2>
      </div>

      <div className="section-card risk-matrix-container">
        {riskItems.map((item) => {
          const level = getRiskLevel(item.desc);
          const Icon = item.icon;
          return (
            <div key={item.id} className="risk-row">
              <div className="risk-row-left">
                <div className="risk-icon-wrapper">
                  <Icon size={20} className={`icon-${level.toLowerCase()}`} />
                </div>
                <div className="risk-title-wrapper">
                  <span className="risk-title">{item.title}</span>
                  <span className={`risk-badge badge-${level.toLowerCase()}`}>{level}</span>
                </div>
              </div>
              <div className="risk-row-right">
                <p className="risk-desc">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {risks.details && (
        <div className="section-card" style={{ marginTop: '16px' }}>
          <h4 className="heading-4" style={{ marginBottom: '12px' }}>Overall Risk Assessment</h4>
          <p className="body-base">{risks.details}</p>
        </div>
      )}
    </section>
  );
}
