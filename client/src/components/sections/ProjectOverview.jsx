
import MetricsGrid from '../MetricsGrid';

export default function ProjectOverview({ data }) {
  const text = data.analysis?.project_overview || "데이터 없음";
  const market = data.marketData || {};

  const formatNumber = (num, isCurrency = false) => {
    if (!num) return '-';
    if (num >= 1e9) return `${isCurrency ? '$' : ''}${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${isCurrency ? '$' : ''}${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${isCurrency ? '$' : ''}${(num / 1e3).toFixed(2)}K`;
    if (isCurrency && num < 0.01) return `$${num.toPrecision(3)}`;
    return `${isCurrency ? '$' : ''}${num.toLocaleString()}`;
  };

  const metrics = [
    { label: 'All-Time High', value: formatNumber(market.ath, true), source: 'CoinGecko' },
    { label: 'All-Time Low', value: formatNumber(market.atl, true), source: 'CoinGecko' },
    { label: 'Max Supply', value: formatNumber(market.maxSupply), source: 'CoinGecko' }
  ];
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">Project Overview</h2>
      </div>
      <div className="glass-card">
        <MetricsGrid metrics={metrics} />
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
