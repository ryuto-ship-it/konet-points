import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section style={{
      background: 'var(--bg-surface)',
      padding: '96px 24px',
      borderBottom: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '28px', fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}>Start Analyzing</h2>
        <p style={{
          fontSize: '15px', color: 'var(--text-secondary)',
          marginBottom: '32px', lineHeight: 1.6,
        }}>
          Access institutional-grade token intelligence.<br />No signup required.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              padding: '10px 28px', borderRadius: '8px',
              background: 'var(--accent)', border: 'none',
              fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500,
              color: '#000', cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Analyze a Token
          </button>
          <button
            onClick={() => navigate('/listings')}
            style={{
              padding: '10px 28px', borderRadius: '8px',
              background: 'transparent',
              border: '1px solid var(--border-strong)',
              fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400,
              color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Live Listings Feed
          </button>
        </div>
      </div>
    </section>
  );
}
