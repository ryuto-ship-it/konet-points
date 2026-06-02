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
      {/* Token Profile Header */}
      <div className="token-profile-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-4)', 
        marginBottom: 'var(--space-6)', 
        padding: 'var(--space-5)', 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), var(--bg-card))', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border-glass)' 
      }}>
        {token.image ? (
          <img src={token.image} alt={token.name} style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
        ) : (
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 'var(--radius-full)', 
            background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--bg-tertiary))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700, 
            color: 'var(--accent-cyan)' 
          }}>
            {token.symbol?.charAt(0) || '?'}
          </div>
        )}
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {token.name || 'Unknown Token'} ({token.symbol?.toUpperCase() || 'TOKEN'})
          </h3>
          {token.contractAddress ? (
            <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', wordBreak: 'break-all' }}>
              Contract Address: {token.contractAddress}
            </span>
          ) : (
            <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
              Native Chain Coin ({token.network || 'Mainnet'})
            </span>
          )}
        </div>
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

        {/* All-Time High (ATH) & Comparison */}
        <div className="metric-card">
          <div className="metric-label">All-Time High (ATH)</div>
          <div className="metric-value">{formatCurrency(market.ath)}</div>
          {market.ath && market.currentPrice && (
            <div className="metric-sub" style={{ color: 'var(--accent-cyan)' }}>
              현재가 ATH 대비 {((market.currentPrice / market.ath) * 100).toFixed(1)}% 수준
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

      {/* Tokenomics & Allocation Section */}
      {(data.analysis?.tokenomicsAllocation?.supplyDistribution || data.analysis?.tokenomicsAllocation?.circulationRatio) && (
        <div style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
          <div className="metric-label" style={{ marginBottom: 'var(--space-3)', color: 'var(--accent-cyan)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
            Tokenomics & Allocation (토크노믹스 배분 분석)
          </div>
          <div className="metric-grid-2" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="metric-card">
              <div className="metric-label">Circulating / Total Supply Ratio (유통 공급량 비율)</div>
              <div className="metric-value" style={{ color: 'var(--accent-cyan)', fontSize: 'var(--text-xl)' }}>
                {data.analysis.tokenomicsAllocation.circulationRatio || 'N/A'}
              </div>
              <div className="metric-sub">유통 발행량 대비 총공급 건전성 비율</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Market Cap / FDV Ratio (시가총액 대 희석가치 비율)</div>
              <div className="metric-value" style={{ color: 'var(--accent-emerald)', fontSize: 'var(--text-xl)' }}>
                {data.analysis.tokenomicsAllocation.mcapFdvRatio || 'N/A'}
              </div>
              <div className="metric-sub">희석 가치 대비 유통 물량 비중</div>
            </div>
          </div>
          {data.analysis.tokenomicsAllocation.supplyDistribution && (
            <div className="analysis-card" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', padding: 'var(--space-5)' }}>
              <div className="analysis-card-label" style={{ color: 'var(--accent-cyan)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                </svg>
                Allocation & Lockup Assessment (토큰 배분 및 락업 설계 평가)
              </div>
              <div className="analysis-text" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>
                {data.analysis.tokenomicsAllocation.supplyDistribution}
              </div>
            </div>
          )}
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
            AI Fundamental Analysis (기본적 펀더멘탈 분석)
          </div>
          <div className="analysis-text">{analysis}</div>
        </div>
      )}
    </section>
  );
}
