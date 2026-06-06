/* eslint-disable react-hooks/purity */
import './DashboardHeader.css';

export default function DashboardHeader({ data, onBack }) {
  const rawName = data?.token?.name;
  const tokenSymbol = data?.token?.symbol?.toUpperCase() || '';
  const tokenName = (!rawName || rawName === 'Unknown')
    ? (tokenSymbol || data?.token?.contractAddress?.slice(0, 6) || 'Unknown')
    : rawName;
  const md = data?.marketData || {};

  const currentPrice = md.currentPrice ?? 0;
  const priceChange24h = md.priceChangePercent24h ?? 0;
  const isPositive = priceChange24h >= 0;
  
  // Try to get token logo from various sources
  const tokenLogo = data?.token?.image ||
                    data?.marketData?.image ||
                    data?.twitterData?.profileImageUrl ||
                    null;

  // Actual chain badge
  const chainName = data?.actualChain === 'bsc' ? 'BSC' : 
                    data?.actualChain === 'ethereum' ? 'ETH' : 
                    data?.actualChain || 'Unknown';

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '—';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const formatPrice = (p) => {
    if (!p && p !== 0) return '—';
    if (p < 0.000001) return `$${p.toExponential(2)}`;
    if (p < 0.01) return `$${p.toFixed(8)}`;
    if (p < 1) return `$${p.toFixed(6)}`;
    return `$${p.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
  };

  const creationDate = data?.tokenCreationDate ? data.tokenCreationDate.slice(0, 10) : '—';
  
  const tokenAgeDays = data?.tokenAgeInDays ??
    (data?.tokenCreationDate
      ? Math.floor((Date.now() - new Date(data.tokenCreationDate).getTime()) / 86400000)
      : null);

  return (
    <header className="dash-header">
      <div className="dash-header-left">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="token-id">
          {tokenLogo ? (
            <img src={tokenLogo} alt={tokenName} className="token-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="token-logo-fallback">{tokenSymbol.charAt(0) || '?'}</div>
          )}
          <div className="token-names">
            <h1 className="token-title">{tokenName}</h1>
            <span className="token-sym">{tokenSymbol}</span>
          </div>
          <span className={`chain-badge chain-${chainName.toLowerCase()}`}>{chainName}</span>
        </div>

        <div className="header-divider" />

        <div className="token-price-main">
          <span className="price-val">{formatPrice(currentPrice)}</span>
          <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(priceChange24h).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="dash-header-right">
        <div className="header-stat">
          <span className="h-label">Market Cap</span>
          <span className="h-val">{formatCurrency(md.marketCap)}</span>
        </div>
        <div className="header-divider" />
        
        <div className="header-stat">
          <span className="h-label">Volume (24h)</span>
          <span className="h-val">{formatCurrency(md.volume24h)}</span>
        </div>
        <div className="header-divider" />
        
        <div className="header-stat">
          <span className="h-label">FDV</span>
          <span className="h-val">{formatCurrency(md.fdv)}</span>
        </div>
        <div className="header-divider" />
        
        <div className="header-stat">
          <span className="h-label">Token Age</span>
          <span className="h-val">
            {tokenAgeDays !== null ? `${tokenAgeDays}d` : creationDate}
          </span>
        </div>
      </div>
    </header>
  );
}
