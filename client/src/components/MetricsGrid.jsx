
import './MetricsGrid.css';

export default function MetricsGrid({ metrics }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="metric-grid">
      {metrics.map((m, i) => (
        <div key={i} className="metric-item">
          <div className="metric-label">{m.label}</div>
          <div className="metric-value">{m.value}</div>
          <div className="metric-source">{m.source}</div>
        </div>
      ))}
    </div>
  );
}
