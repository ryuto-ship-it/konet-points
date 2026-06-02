import VolumeChart from '../charts/VolumeChart';
import { formatNumber, formatLargeNumber, formatCurrency } from '../../utils/format';
import './sections.css';

export default function OnchainData({ data }) {
  const onchain = data?.onchainData || {};
  const defi = data?.defiData || {};
  const analysis = data?.analysis?.onchainAnalysis || '';
  const volumeHistory = data?.priceHistory?.volumes || [];
  const topHolders = onchain.topHolders || [];

  const totalTopHolderPercent = topHolders.reduce((sum, h) => sum + (h.percentage || 0), 0);

  // Color palette for concentration bar
  const barColors = [
    'rgba(0, 229, 255, 0.7)',
    'rgba(0, 220, 130, 0.6)',
    'rgba(255, 184, 0, 0.6)',
    'rgba(168, 85, 247, 0.6)',
    'rgba(255, 51, 102, 0.5)',
    'rgba(98, 126, 234, 0.5)',
    'rgba(0, 229, 255, 0.4)',
    'rgba(0, 220, 130, 0.4)',
    'rgba(255, 184, 0, 0.4)',
    'rgba(168, 85, 247, 0.4)',
  ];

  return (
    <section className="report-section" id="onchain-data">
      <div className="section-header">
        <span className="section-number">2</span>
        <h2 className="section-title">
          온체인 데이터
          <span className="section-title-en">On-chain Data</span>
        </h2>
      </div>

      {/* Metric Cards */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Transaction Count</div>
          <div className="metric-value">{formatNumber(onchain.transactionCount)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Daily TX Estimate</div>
          <div className="metric-value">{formatNumber(onchain.dailyTxEstimate)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Holder Count</div>
          <div className="metric-value">{formatNumber(onchain.holderCount)}</div>
          {onchain.contractVerified !== undefined && (
            <div className="metric-sub">
              Contract: {onchain.contractVerified ? '✓ Verified' : '✗ Unverified'}
            </div>
          )}
        </div>
      </div>

      {/* TVL & DeFi Info */}
      {defi.tvl && (
        <div className="metric-grid-2">
          <div className="metric-card metric-card-featured">
            <div className="metric-label">Total Value Locked (TVL)</div>
            <div className="metric-value">{formatLargeNumber(defi.tvl)}</div>
            {defi.protocol && (
              <div className="metric-sub">Protocol: {defi.protocol}</div>
            )}
          </div>
          <div className="metric-card">
            <div className="metric-label">Category</div>
            <div className="metric-value" style={{ fontSize: 'var(--text-lg)' }}>
              {defi.category || 'N/A'}
            </div>
            {defi.chains && defi.chains.length > 0 && (
              <div className="metric-sub">
                Chains: {defi.chains.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Holders Table */}
      {topHolders.length > 0 ? (
        <>
          {/* Concentration Bar */}
          <div className="concentration-bar-container">
            <div className="concentration-bar-label">
              <span>Top {topHolders.length} Holder Concentration</span>
              <span className="mono" style={{ color: 'var(--text-primary)' }}>
                {totalTopHolderPercent.toFixed(2)}%
              </span>
            </div>
            <div className="concentration-bar">
              {topHolders.map((holder, i) => (
                <div
                  key={i}
                  className="concentration-segment"
                  style={{
                    width: `${holder.percentage}%`,
                    background: barColors[i % barColors.length],
                  }}
                  title={`${holder.address?.slice(0, 8)}...: ${holder.percentage}%`}
                />
              ))}
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'right' }}>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {topHolders.map((holder, i) => (
                  <tr key={i}>
                    <td className="mono-cell">{i + 1}</td>
                    <td className="address-cell">{holder.address || 'Unknown'}</td>
                    <td className="mono-cell" style={{ textAlign: 'right' }}>
                      {holder.percentage?.toFixed(2) || '—'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="no-data-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Detailed holder data requires PRO access or may not be available for this token</span>
        </div>
      )}

      {/* Volume Chart */}
      {volumeHistory.length > 0 && (
        <div className="chart-container">
          <div className="chart-title">Volume — 7 Day</div>
          <div className="chart-wrapper">
            <VolumeChart data={volumeHistory} />
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {analysis && (
        <div className="analysis-card">
          <div className="analysis-card-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            On-chain Analysis
          </div>
          <div className="analysis-text">{analysis}</div>
        </div>
      )}
    </section>
  );
}
