import { useState, useCallback } from 'react';
import { exportReportAsPDF } from '../utils/pdf';
import './ReportHeader.css';

export default function ReportHeader({ data, onBack }) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const token = data?.token || {};
  const market = data?.marketData || {};

  const networkBadge = getNetworkBadge(token.network);

  const copyAddress = useCallback(async () => {
    if (!token.contractAddress) return;
    try {
      await navigator.clipboard.writeText(token.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = token.contractAddress;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [token.contractAddress]);

  const handlePDFExport = useCallback(async () => {
    setExporting(true);
    try {
      await exportReportAsPDF('report-content-pdf', token.name || 'Token');
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [token.name]);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <header className="report-header">
      <div className="header-left">
        <button className="back-button btn-icon" onClick={onBack} title="Back to search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="header-token">
          {token.image ? (
            <img src={token.image} alt={token.name} className="header-token-img" />
          ) : (
            <div className="header-token-img-fallback">
              {token.symbol?.charAt(0) || '?'}
            </div>
          )}

          <div className="header-token-info">
            <div className="header-token-name-row">
              <h1 className="header-token-name">
                {token.name || 'Unknown Token'}
                <span className="header-token-ticker">
                  {token.symbol ? ` (${token.symbol.toUpperCase()})` : ''}
                </span>
              </h1>
              {networkBadge && (
                <span className={`badge ${networkBadge.className}`}>
                  {networkBadge.label}
                </span>
              )}
            </div>

            {token.contractAddress && (
              <div className="header-address-row">
                <code className="header-address mono">
                  {truncateAddress(token.contractAddress)}
                </code>
                <button
                  className="copy-btn btn-icon"
                  onClick={copyAddress}
                  title={copied ? 'Copied!' : 'Copy address'}
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="header-right">
        <button
          className="btn-ghost pdf-btn"
          onClick={handlePDFExport}
          disabled={exporting}
        >
          {exporting ? (
            <div className="step-spinner" style={{ width: 16, height: 16 }} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          <span>{exporting ? 'Exporting...' : 'PDF'}</span>
        </button>
      </div>
    </header>
  );
}

function getNetworkBadge(network) {
  if (!network) return null;
  const n = network.toLowerCase();
  if (n.includes('ethereum') || n === 'eth') {
    return { className: 'badge-ethereum', label: 'Ethereum' };
  }
  if (n.includes('bnb') || n.includes('binance') || n === 'bsc') {
    return { className: 'badge-bnb', label: 'BNB Chain' };
  }
  if (n.includes('solana') || n === 'sol') {
    return { className: 'badge-solana', label: 'Solana' };
  }
  if (n.includes('polygon') || n === 'matic') {
    return { className: 'badge-polygon', label: 'Polygon' };
  }
  return { className: 'badge-ethereum', label: network };
}
