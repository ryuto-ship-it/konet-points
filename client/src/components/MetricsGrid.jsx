
import './MetricsGrid.css';

export default function MetricsGrid({ metrics }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="metrics-grid">
      {metrics.map((m, i) => (
        <div key={i} className="metric-card">
          <span className="metric-card-label">{m.label}</span>
          <span className="metric-card-value">{m.value}</span>
          <span className="metric-card-source">{m.source}</span>
        </div>
      ))}
    </div>
  );
}
