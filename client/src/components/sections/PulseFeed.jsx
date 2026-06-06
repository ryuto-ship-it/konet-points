const TYPE_CONFIG = {
  news:             { label: 'NEWS',     color: 'var(--accent-cyan)' },
  exchange_listing: { label: 'LISTING',  color: 'var(--success, #10b981)' },
  volume_spike:     { label: 'VOLUME',   color: '#f59e0b' },
  security:         { label: 'SECURITY', color: 'var(--danger, #ef4444)' },
  general:          { label: 'UPDATE',   color: '#8899aa' },
  software_release: { label: 'RELEASE',  color: 'var(--accent-cyan)' },
  partnership:      { label: 'PARTNER',  color: '#a78bfa' },
};

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr.slice(0, 10);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PulseFeed({ data }) {
  const events = data.pulseFeed;

  return (
    <section className="report-section">
      <div className="section-header">
        <h2 className="heading-3">Pulse Feed</h2>
        <span className="badge badge-ethereum">뉴스 · 이벤트</span>
      </div>

      <div className="section-card">
        {!events || events.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
            최근 이벤트 없음 — CoinGecko / CoinMarketCap 업데이트 없음
          </p>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Vertical timeline line */}
            <div style={{
              position: 'absolute', left: '75px', top: 0, bottom: 0,
              width: '1px', background: 'rgba(255,255,255,0.06)',
            }} />

            {events.map((ev, i) => {
              const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.general;
              return (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '76px 1fr',
                  gap: '0 16px',
                  marginBottom: i < events.length - 1 ? '16px' : 0,
                  alignItems: 'flex-start',
                }}>
                  {/* Left: date */}
                  <div style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                      {fmtDate(ev.date)}
                    </p>
                  </div>

                  {/* Right: badge + title */}
                  <div style={{ paddingLeft: '16px', position: 'relative' }}>
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: '-20px', top: '4px',
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: cfg.color, border: `2px solid ${cfg.color}44`,
                    }} />

                    <span style={{
                      display: 'inline-block',
                      fontSize: '10px', fontWeight: 700,
                      color: cfg.color,
                      background: `${cfg.color}18`,
                      border: `1px solid ${cfg.color}44`,
                      borderRadius: '4px',
                      padding: '1px 6px',
                      marginBottom: '4px',
                      letterSpacing: '0.05em',
                    }}>
                      {cfg.label}
                    </span>

                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                      {ev.url ? (
                        <a href={ev.url} target="_blank" rel="noopener noreferrer"
                          style={{ color: 'inherit', textDecoration: 'none' }}
                          onMouseEnter={e => e.target.style.color = 'var(--accent-cyan)'}
                          onMouseLeave={e => e.target.style.color = 'inherit'}
                        >
                          {ev.title}
                        </a>
                      ) : ev.title}
                    </p>

                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {ev.source}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
