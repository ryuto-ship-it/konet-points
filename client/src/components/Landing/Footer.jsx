export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-base)',
      borderTop: '1px solid var(--border)',
      padding: '32px 24px',
    }}>
      <div style={{
        maxWidth: '960px', margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🐬</span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--text-primary)',
          }}>DORPHIN RESEARCH</span>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {[
            { label: 'Token Analysis', href: '/' },
            { label: 'New Listings',   href: '/listings' },
            { label: '@jungdorphin',   href: 'https://twitter.com/jungdorphin', external: true },
            { label: 'GitHub',         href: 'https://github.com/ryuto-ship-it/konet-points', external: true },
          ].map(l => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noreferrer' : undefined}
              style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {l.label}
            </a>
          ))}
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2026 Dorphin Research · Not financial advice.
        </p>
      </div>
    </footer>
  );
}
