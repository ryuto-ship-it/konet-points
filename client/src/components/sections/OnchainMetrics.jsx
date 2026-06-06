
import MetricsGrid from '../MetricsGrid';

export default function OnchainMetrics({ data }) {
  const text = data.analysis?.onchain_metrics || "데이터 없음";
  const onchain = data.onchainData || {};
  const defi = data.defiData || {};

  const isApiErrorStr = v => typeof v === 'string' &&
    (v.toLowerCase().includes('free api') || v.toLowerCase().includes('upgrade') || v.toLowerCase().includes('not supported'));

  const formatNumber = (num, isCurrency = false) => {
    if (isApiErrorStr(num)) return '데이터 없음 — API 제한';
    if (!num) return '-';
    if (num >= 1e9) return `${isCurrency ? '$' : ''}${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${isCurrency ? '$' : ''}${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${isCurrency ? '$' : ''}${(num / 1e3).toFixed(2)}K`;
    return `${isCurrency ? '$' : ''}${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const metrics = [
    { label: 'Total Holders', value: onchain.holderCount ? formatNumber(onchain.holderCount) : '—', source: onchain.holderCount ? 'Etherscan / BscScan' : 'BSC 홀더 조회는 Etherscan Pro 플랜 필요' },
    { label: 'Total Value Locked', value: defi.tvl != null ? formatNumber(defi.tvl, true) : '해당 없음', source: 'DefiLlama' },
    { label: 'FDMC / TVL Ratio', value: defi.mcapTvlRatio ? defi.mcapTvlRatio.toFixed(2) : '해당 없음', source: 'DefiLlama' }
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
