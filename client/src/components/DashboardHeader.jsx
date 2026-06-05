
import './DashboardHeader.css';

export default function DashboardHeader({ data, onBack }) {
  const token = data?.token || {};
  const market = data?.marketData || {};

  const formatNumber = (num, isCurrency = false) => {
    if (!num) return '-';
    if (num >= 1e9) return `${isCurrency ? '$' : ''}${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${isCurrency ? '$' : ''}${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${isCurrency ? '$' : ''}${(num / 1e3).toFixed(2)}K`;
    if (isCurrency && num < 0.01) return `$${num.toPrecision(3)}`;
    return `${isCurrency ? '$' : ''}${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const priceChange = market.priceChange24h || 0;
  const isPositive = priceChange >= 0;

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="back-button" onClick={onBack} title="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="token-identity">
          {token.image ? (
            <img src={token.image} alt={token.name} className="token-logo" />
          ) : (
            <div className="token-logo-fallback">{token.symbol?.charAt(0)}</div>
          )}
          <div className="token-title-group">
            <div className="token-name-row">
              <span className="token-name">{token.name}</span>
              <span className="token-symbol">{token.symbol?.toUpperCase()}</span>
            </div>
            {token.network && <span className="chain-badge">{token.network}</span>}
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="price-display">
          <span className="current-price">${market.currentPrice?.toLocaleString(undefined, { maximumFractionDigits: 6 }) || '-'}</span>
          <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="header-right">
        <div className="metric-group">
          <span className="metric-label">Market Cap</span>
          <span className="metric-value">{formatNumber(market.marketCap, true)}</span>
        </div>
        <div className="metric-divider" />
        <div className="metric-group">
          <span className="metric-label">Volume (24h)</span>
          <span className="metric-value">{formatNumber(market.volume24h, true)}</span>
        </div>
        <div className="metric-divider" />
        <div className="metric-group">
          <span className="metric-label">FDV</span>
          <span className="metric-value">{formatNumber(market.fullyDilutedValuation, true)}</span>
        </div>
        <div className="metric-divider" />
        <div className="metric-group">
          <span className="metric-label">Circulating Supply</span>
          <span className="metric-value">{formatNumber(market.circulatingSupply)}</span>
        </div>
      </div>
    </header>
  );
}
