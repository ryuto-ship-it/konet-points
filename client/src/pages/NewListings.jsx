import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getListings } from '../api/client';

const RISK_CONFIG = {
  SAFE:    { label: '🟢 안전',  border: 'rgba(16,185,129,0.4)',  badge: '#10b981' },
  CAUTION: { label: '🟡 주의',  border: 'rgba(245,158,11,0.4)',  badge: '#f59e0b' },
  DANGER:  { label: '🔴 위험',  border: 'rgba(239,68,68,0.4)',   badge: '#ef4444' },
};

const FILTERS = [
  { id: 'all',     label: '전체' },
  { id: 'safe',    label: '🟢 안전' },
  { id: 'caution', label: '🟡 주의' },
  { id: 'danger',  label: '🔴 위험' },
];

function fmtUsd(n) {
  if (n == null || n === 0) return '—';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Number(n).toFixed(2)}`;
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ── Token Avatar ──────────────────────────────────────────────────────────────
function TokenAvatar({ logoUrl, symbol }) {
  const [imgError, setImgError] = useState(false);
  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={symbol}
        onError={() => setImgError(true)}
        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
      background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '14px', fontWeight: 700, color: 'var(--accent)',
      fontFamily: 'var(--font-mono)',
    }}>
      {(symbol || '?')[0].toUpperCase()}
    </div>
  );
}

// ── Token Card ────────────────────────────────────────────────────────────────
function TokenCard({ token, onAnalyze }) {
  const cfg = RISK_CONFIG[token.riskLevel] || RISK_CONFIG.CAUTION;
  const pricePos = (token.priceChange24h || 0) >= 0;

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-card)',
      border: `1px solid ${cfg.border}`,
      borderRadius: '12px', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <TokenAvatar logoUrl={token.logoUrl} symbol={token.symbol} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{
              fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{token.name}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: pricePos ? '#10b981' : '#ef4444', flexShrink: 0 }}>
              {pricePos ? '+' : ''}{token.priceChange24h?.toFixed(2) ?? '—'}%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, color: cfg.badge,
              background: `${cfg.badge}18`, border: `1px solid ${cfg.badge}44`,
              borderRadius: '3px', padding: '1px 6px',
            }}>{cfg.label}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {token.symbol} · {(token.chain || 'bsc').toUpperCase()} · {token.ageDisplay || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {[
          { label: '유동성',     value: fmtUsd(token.liquidity) },
          { label: '24h 거래량', value: fmtUsd(token.volume24h) },
          { label: '매수',       value: token.buys?.toLocaleString() ?? '—' },
          { label: '매도',       value: token.sells?.toLocaleString() ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{
            padding: '7px 10px', background: 'rgba(255,255,255,0.03)',
            borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Risk bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>리스크 점수</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.badge, fontFamily: 'var(--font-mono)' }}>
            {token.riskScore}/100
          </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${token.riskScore}%`,
            background: cfg.badge, borderRadius: '2px', transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      <button
        onClick={() => onAnalyze(token)}
        style={{
          width: '100%', padding: '9px',
          background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
          borderRadius: '8px', cursor: 'pointer',
          fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
          fontFamily: 'var(--font-sans)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.08)'}
      >
        📊 리포트 보기
      </button>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid rgba(0,212,255,0.15)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 16px',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>BSC 네트워크 실시간 스캐닝 중...</p>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>DexScreener에서 최신 페어 로딩 중</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NewListings() {
  const navigate = useNavigate();

  const [listings, setListings]           = useState([]);
  const [total, setTotal]                 = useState(0);
  const [lastUpdated, setLastUpdated]     = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate]   = useState(null);
  const [filter, setFilter]               = useState('all');
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const fetchData = useCallback(async (f, date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getListings(f, date);
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setLastUpdated(data.lastUpdated);
      if (data.availableDates?.length) setAvailableDates(data.availableDates);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(filter, selectedDate); }, [filter, selectedDate, fetchData]);

  // 5-min auto-refresh
  useEffect(() => {
    const id = setInterval(() => fetchData(filter, selectedDate), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [filter, selectedDate, fetchData]);

  const handleAnalyze = useCallback((token) => {
    const tokenObj = { id: token.address, name: token.name, symbol: token.symbol, address: token.address, chain: token.chain || 'bsc' };
    navigate(`/report/${token.address}`, { state: { token: tokenObj } });
  }, [navigate]);

  const fmtTime = iso => iso
    ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        padding: '14px 24px', borderBottom: '1px solid var(--border)',
        background: 'rgba(10,12,16,0.95)',
      }}>
        <button
          onClick={() => navigate('/app')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', padding: '4px 8px' }}
        >←</button>

        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔴 Live Sonar Feed
            <span style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em',
              color: 'var(--accent)', background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.35)', borderRadius: '4px', padding: '2px 6px',
            }}>LIVE</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
            멀티체인 · 최근 스캔 {fmtTime(lastUpdated)}
          </p>
        </div>

        <div style={{ flex: 1 }} />

        {/* Date navigation */}
        {availableDates.length > 0 && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setSelectedDate(null)}
              style={{
                padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                background: !selectedDate ? 'rgba(0,212,255,0.12)' : 'transparent',
                border: !selectedDate ? '1px solid rgba(0,212,255,0.3)' : '1px solid var(--border)',
                color: !selectedDate ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: !selectedDate ? 600 : 400,
              }}
            >최신</button>
            {availableDates.filter(d => d !== today).map(d => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                style={{
                  padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                  background: selectedDate === d ? 'rgba(0,212,255,0.12)' : 'transparent',
                  border: selectedDate === d ? '1px solid rgba(0,212,255,0.3)' : '1px solid var(--border)',
                  color: selectedDate === d ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: selectedDate === d ? 600 : 400,
                }}
              >{fmtDate(d + 'T00:00:00')}</button>
            ))}
          </div>
        )}

        <button
          onClick={() => fetchData(filter, selectedDate)}
          style={{
            padding: '7px 13px', borderRadius: '6px', cursor: 'pointer',
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
            color: 'var(--accent)', fontSize: '12px', fontWeight: 600,
          }}
        >↻ 새로고침</button>
      </div>

      <div style={{ padding: '18px 24px' }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                background: filter === f.id ? 'rgba(0,212,255,0.1)' : 'transparent',
                border: filter === f.id ? '1px solid rgba(0,212,255,0.35)' : '1px solid var(--border)',
                color: filter === f.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: filter === f.id ? 600 : 400,
              }}
            >{f.label}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
            {loading ? '스캐닝 중...' : `${total}개 토큰 감지됨`}
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            <p>오류: {error}</p>
            <button
              onClick={() => fetchData(filter, selectedDate)}
              style={{ marginTop: '12px', padding: '8px 16px', cursor: 'pointer', background: 'transparent', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', fontSize: '13px' }}
            >재시도</button>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🌊</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              현재 데이터를 불러오는 중입니다.
            </p>
            <p style={{ fontSize: '12px' }}>
              잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={() => fetchData(filter, selectedDate)}
              style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '6px', color: 'var(--accent)', fontSize: '13px' }}
            >↻ 다시 시도</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {listings.map(token => (
              <TokenCard key={token.address} token={token} onAnalyze={handleAnalyze} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
