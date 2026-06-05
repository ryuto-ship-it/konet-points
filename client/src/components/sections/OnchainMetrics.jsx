
import MetricsGrid from '../MetricsGrid';

export default function OnchainMetrics({ data }) {
  const text = data.analysis?.onchain_metrics || "데이터 없음";
  const onchain = data.onchainData || {};
  const defi = data.defiData || {};

  const formatNumber = (num, isCurrency = false) => {
    if (!num) return '-';
    if (num >= 1e9) return `${isCurrency ? '$' : ''}${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${isCurrency ? '$' : ''}${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${isCurrency ? '$' : ''}${(num / 1e3).toFixed(2)}K`;
    return `${isCurrency ? '$' : ''}${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const metrics = [
    { label: 'Total Holders', value: formatNumber(onchain.holders), source: 'Etherscan / BscScan' },
    { label: 'Total Value Locked', value: formatNumber(defi.tvl, true), source: 'DefiLlama' },
    { label: 'FDMC / TVL Ratio', value: defi.mcapTvlRatio ? defi.mcapTvlRatio.toFixed(2) : '-', source: 'DefiLlama' }
  ];
  
  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">On-chain Metrics</h2>
      </div>
      <div className="section-card">
        <MetricsGrid metrics={metrics} />
        <p className="body-lg">{text}</p>
      </div>
    </section>
  );
}
