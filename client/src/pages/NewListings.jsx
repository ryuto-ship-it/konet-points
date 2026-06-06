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
  if (!n) return '—';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Number(n).toFixed(2)}`;
}

function fmtAge(hours) {
  if (hours == null) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}분`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${Math.floor(hours / 24)}d`;
}

// ── Token Card ────────────────────────────────────────────────────────────────
function TokenCard({ token, onAnalyze }) {
  const cfg = RISK_CONFIG[token.riskLevel] || RISK_CONFIG.CAUTION;
  const pricePos = token.priceChange24h >= 0;

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-card, #12141a)',
      border: `1px solid ${cfg.border}`,
      borderRadius: '12px', padding: '18px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      overflow: 'hidden',
    }}>
      {token.isRugPattern && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.12)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '8px', zIndex: 1, pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, color: '#ef4444',
            background: 'rgba(0,0,0,0.8)', padding: '3px 10px', borderRadius: '4px',
          }}>⚠️ 러그풀 패턴 감지</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: cfg.badge,
            background: `${cfg.badge}18`, border: `1px solid ${cfg.badge}44`,
            borderRadius: '4px', padding: '2px 7px', marginBottom: '6px',
            display: 'inline-block',
          }}>{cfg.label}</span>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {token.name}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {token.symbol} · BSC · {fmtAge(token.ageHours)} 전
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: pricePos ? '#10b981' : '#ef4444' }}>
            {pricePos ? '+' : ''}{token.priceChange24h?.toFixed(2) ?? '—'}%
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>24h</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { label: '유동성',     value: fmtUsd(token.liquidity) },
          { label: '24h 거래량', value: fmtUsd(token.volume24h) },
          { label: '매수',       value: token.buys?.toLocaleString() ?? '—' },
          { label: '매도',       value: token.sells?.toLocaleString() ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{
            padding: '8px 10px', background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontSize: '13px', fontWeight: 700 }}>{value}</p>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>리스크 점수</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.badge }}>{token.riskScore}/100</span>
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
          background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.3)',
          borderRadius: '8px', cursor: 'pointer',
          fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan, #00e5ff)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,229,255,0.08)'}
      >
        📊 리포트 보기
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NewListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (f) => {
    setLoading(true);
    setError(null);
    try {
      // getListings now only takes filter, no date parameter since it's stateless
      const data = await getListings(f);
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setLastUpdated(data.lastUpdated);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(filter); }, [filter, fetchData]);

  // 5분 단위 자동 갱신
  useEffect(() => {
    const id = setInterval(() => fetchData(filter), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [filter, fetchData]);

  const handleAnalyze = useCallback((token) => {
    const tokenObj = { id: token.address, name: token.name, symbol: token.symbol, address: token.address, chain: 'bsc' };
    navigate(`/report/${token.address}`, { state: { token: tokenObj } });
  }, [navigate]);

  const fmtTime = iso => iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ocean-bg, #040914)', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* 상단 바 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '20px', padding: '4px 8px' }}
        >←</button>

        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔴 Live Sonar Feed
            <span style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em',
              color: '#00F0FF', background: 'rgba(0,240,255,0.1)',
              border: '1px solid rgba(0,240,255,0.4)', borderRadius: '4px', padding: '2px 6px',
            }}>LIVE</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            BSC · 최근 스캔 {fmtTime(lastUpdated)}
          </p>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => fetchData(filter)}
          style={{
            padding: '7px 13px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.3)',
            color: '#00F0FF', fontSize: '12px', fontWeight: 600,
          }}
        >↻ 새로고침</button>
      </div>

      <div style={{ padding: '18px 24px' }}>
        {/* 필터 탭 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 15px', borderRadius: '8px', cursor: 'pointer',
                background: filter === f.id ? 'rgba(0,240,255,0.14)' : 'rgba(255,255,255,0.04)',
                border: filter === f.id ? '1px solid rgba(0,240,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                color: filter === f.id ? '#00F0FF' : 'rgba(255,255,255,0.6)',
                fontSize: '13px', fontWeight: filter === f.id ? 700 : 400,
              }}
            >{f.label}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            {loading ? '스캐닝 중...' : `${total}개 토큰 감지됨`}
          </span>
        </div>

        {/* 콘텐츠 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.5)' }}>
            <p style={{ fontSize: '14px' }}>
              BSC 네트워크 실시간 스캐닝 중...
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            <p>오류: {error}</p>
            <button
              onClick={() => fetchData(filter)}
              style={{ marginTop: '12px', padding: '8px 16px', cursor: 'pointer', background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}
            >재시도</button>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.5)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🌊</p>
            <p style={{ fontSize: '14px' }}>
              최근 감지된 신규 페어가 없습니다.
            </p>
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
