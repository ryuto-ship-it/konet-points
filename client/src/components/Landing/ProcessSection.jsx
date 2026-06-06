const STEPS = [
  {
    n: '01',
    title: 'Aggregate',
    desc: 'Connects to 8+ specialized APIs simultaneously — contract data, liquidity pools, social sentiment, exchange listings — in parallel.',
  },
  {
    n: '02',
    title: 'Synthesize',
    desc: 'Claude AI cross-references every data point, eliminates false positives, and calculates composite risk probabilities.',
  },
  {
    n: '03',
    title: 'Report',
    desc: 'A structured intelligence report with exchange readiness score, compliance checklist, and on-chain verification.',
  },
];

const FEATURES = [
  { icon: '🔐', title: 'Security Audit', desc: 'GoPlus contract analysis, rug pull pattern detection, and honeypot screening.' },
  { icon: '📊', title: 'Market Data',    desc: 'Real-time price, volume, liquidity from CoinGecko, DexScreener, and CMC.' },
  { icon: '🏦', title: 'Exchange Score', desc: 'Upbit / Bithumb readiness score with DAXA compliance checklist.' },
  { icon: '⛓',  title: 'On-Chain',      desc: 'Holder count, transaction history, contract verification, token age.' },
  { icon: '🌐', title: 'Web Security',  desc: 'SSL certificate check and HTTP security headers analysis.' },
  { icon: '🤖', title: 'AI Analysis',   desc: 'Claude-powered narrative summary with actionable risk assessment.' },
];

export default function ProcessSection() {
  return (
    <>
      {/* How It Works */}
      <section style={{
        background: 'var(--bg-surface)',
        padding: '96px 24px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '28px', fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '48px',
            textAlign: 'center',
          }}>How It Works</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {STEPS.map(s => (
              <div key={s.n} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '28px',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px', color: 'var(--accent)',
                  marginBottom: '12px',
                }}>{s.n}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '10px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{
        background: 'var(--bg-base)',
        padding: '96px 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '28px', fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '48px',
            textAlign: 'center',
          }}>What's in Every Report</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '24px',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: '20px', marginBottom: '10px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
