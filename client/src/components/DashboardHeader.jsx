import { useState, useCallback } from 'react';

const NET_COLORS = {
  bsc: '#F0B90B', ethereum: '#627EEA', polygon: '#8247E5',
  arbitrum: '#28A0F0', optimism: '#FF0420', base: '#0052FF', solana: '#9945FF',
};

function fmtPrice(p) {
  if (!p && p !== 0) return '—';
  if (p < 0.000001) return `$${p.toExponential(2)}`;
  if (p < 0.01) return `$${p.toFixed(8)}`;
  if (p < 1) return `$${p.toFixed(6)}`;
  return `$${p.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function fmtNum(n) {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function DashboardHeader({ data, onBack }) {
  const [copied, setCopied] = useState(false);
  const token = data?.token || {};
  const md = data?.marketData || {};
  const cmci = md.cmciDetail;

  const price = md.currentPrice;
  const change24h = md.priceChangePercent24h;
  const isUp = change24h >= 0;
  const netColor = NET_COLORS[(token.network || '').toLowerCase()] || '#8899aa';

  const copyAddr = useCallback(async () => {
    if (!token.contractAddress) return;
    await navigator.clipboard.writeText(token.contractAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [token.contractAddress]);

  const shortAddr = a => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';

  return (
    <header style={{
      background: '#0d0e14',
      borderBottom: '1px solid #1e2430',
      padding: '0 20px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{ background: 'none', border: '1px solid #1e2430', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#8899aa', display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Token identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {token.image ? (
          <img src={token.image} alt={token.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e2430', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: '#00e5ff', flexShrink: 0 }}>
            {token.symbol?.charAt(0) || '?'}
          </div>
        )}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#e8ecf4' }}>{token.name}</span>
            <span style={{ fontSize: '12px', color: '#8899aa' }}>{token.symbol?.toUpperCase()}</span>
            {cmci?.cmcRank && (
              <span style={{ fontSize: '11px', color: '#556677', background: '#1a1d24', padding: '1px 6px', borderRadius: '8px' }}>
                #{cmci.cmcRank}
              </span>
            )}
            <span style={{ fontSize: '11px', fontWeight: 600, color: netColor, background: `${netColor}18`, padding: '1px 6px', borderRadius: '8px', border: `1px solid ${netColor}33` }}>
              {(token.network || '').toUpperCase()}
            </span>
          </div>
          {token.contractAddress && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#556677' }}>{shortAddr(token.contractAddress)}</span>
              <button onClick={copyAddr} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#00ff88' : '#556677', padding: '0 2px' }}>
                {copied ? '✓' : '⧉'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Price */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#e8ecf4', fontFamily: 'monospace' }}>
          {fmtPrice(price)}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: isUp ? '#00ff88' : '#ff4444' }}>
          {isUp ? '▲' : '▼'} {Math.abs(change24h || 0).toFixed(2)}%
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '32px', background: '#1e2430', flexShrink: 0 }} />

      {/* Market metrics */}
      <div style={{ display: 'flex', gap: '20px', flex: 1, overflowX: 'auto' }}>
        {[
          { label: '시가총액', value: fmtNum(md.marketCap) },
          { label: '24h 거래량', value: fmtNum(md.volume24h) },
          { label: 'FDV', value: fmtNum(md.fdv) },
          { label: '유통 공급', value: md.circulatingSupply ? `${(md.circulatingSupply / 1e6).toFixed(1)}M` : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '10px', color: '#556677', marginBottom: '2px', whiteSpace: 'nowrap' }}>{label}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#c8d4e0', fontFamily: 'monospace' }}>{value}</div>
          </div>
        ))}
        {(data.pairCreatedAt || data.tokenCreationDate) && (() => {
          const ts = data.pairCreatedAt
            ? new Date(data.pairCreatedAt)
            : new Date(data.tokenCreationDate);
          const label = ts.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
          return (
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: '10px', color: '#556677', marginBottom: '2px' }}>토큰 출시일</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#c8d4e0' }}>{label}</div>
            </div>
          );
        })()}
        {data.tokenAgeInDays != null && (
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '10px', color: '#556677', marginBottom: '2px' }}>토큰 나이</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#c8d4e0' }}>{data.tokenAgeInDays}일</div>
          </div>
        )}
      </div>

      {/* Generated time */}
      <div style={{ flexShrink: 0, fontSize: '11px', color: '#445566', textAlign: 'right' }}>
        <div>리포트 생성</div>
        <div>{data.generatedAt ? new Date(data.generatedAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</div>
      </div>
    </header>
  );
}
