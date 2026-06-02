import PriceChart from '../charts/PriceChart';
import { formatCurrency, formatNumber, formatPercent, formatLargeNumber } from '../../utils/format';
import './sections.css';

export default function BasicInfo({ data }) {
  const market = data?.marketData || {};
  const token = data?.token || {};
  const analysis = data?.analysis?.basicInfoAnalysis || '';
  const priceHistory = data?.priceHistory?.prices || [];

  const priceChangePercent = market.priceChangePercent24h || 0;
  const isPositive = priceChangePercent >= 0;

  return (
    <section className="report-section" id="basic-info">
      <div className="section-header">
        <span className="section-number">1</span>
        <h2 className="section-title">
          기본 정보
          <span className="section-title-en">Basic Info</span>
        </h2>
      </div>

      {/* Metric Cards */}
      <div className="metric-grid">
        {/* Current Price — Featured */}
        <div className="metric-card metric-card-featured">
          <div className="metric-label">Current Price</div>
          <div className="metric-value metric-value-lg">
            {formatCurrency(market.currentPrice)}
          </div>
          <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>{formatPercent(Math.abs(priceChangePercent))}%</span>
            <span style={{ fontWeight: 400, opacity: 0.7 }}> 24h</span>
          </div>
          {(market.high24h || market.low24h) && (
            <div className="metric-sub">
              H: {formatCurrency(market.high24h)} / L: {formatCurrency(market.low24h)}
            </div>
          )}
        </div>

        {/* Market Cap */}
        <div className="metric-card">
          <div className="metric-label">Market Cap</div>
          <div className="metric-value">{formatLargeNumber(market.marketCap)}</div>
          {market.marketCap && market.fdv && (
            <div className="metric-sub">
              {((market.marketCap / market.fdv) * 100).toFixed(1)}% of FDV
            </div>
          )}
        </div>

        {/* FDV */}
        <div className="metric-card">
          <div className="metric-label">Fully Diluted Valuation</div>
          <div className="metric-value">{formatLargeNumber(market.fdv)}</div>
        </div>

        {/* 24h Volume */}
        <div className="metric-card">
          <div className="metric-label">24h Volume</div>
          <div className="metric-value">{formatLargeNumber(market.volume24h)}</div>
          {market.marketCap && market.volume24h && (
            <div className="metric-sub">
              Vol/MCap: {((market.volume24h / market.marketCap) * 100).toFixed(2)}%
            </div>
          )}
        </div>

        {/* Circulating Supply */}
        <div className="metric-card">
          <div className="metric-label">Circulating Supply</div>
          <div className="metric-value">{formatNumber(market.circulatingSupply)}</div>
          {market.maxSupply && (
            <div className="metric-sub">
              {((market.circulatingSupply / market.maxSupply) * 100).toFixed(1)}% of max
            </div>
          )}
        </div>

        {/* Total Supply */}
        <div className="metric-card">
          <div className="metric-label">Total Supply</div>
          <div className="metric-value">{formatNumber(market.totalSupply)}</div>
          {market.maxSupply && (
            <div className="metric-sub">
              Max: {formatNumber(market.maxSupply)}
            </div>
          )}
        </div>
      </div>

      {/* Price Chart Sparkline */}
      {priceHistory.length > 0 && (
        <div className="chart-container">
          <div className="chart-title">Price — 7 Day</div>
          <div className="chart-wrapper-sm">
            <PriceChart data={priceHistory} sparkline />
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {analysis && (
        <div className="analysis-card">
          <div className="analysis-card-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
              <path d="M16 14a4 4 0 0 1 4 4v2H4v-2a4 4 0 0 1 4-4"/>
            </svg>
            AI Analysis
          </div>
          <div className="analysis-text">{analysis}</div>
        </div>
      )}
    </section>
  );
}
