export default function Footer() {
  return (
    <footer style={{
      background: '#080b12',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '60px 20px 40px',
      color: 'rgba(255,255,255,0.6)'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Left Col */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px' }}>🐬</span>
            <span style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '0.1em', color: '#fff' }}>DORPHIN RESEARCH</span>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
            Dive deeper. Surface smarter.
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            © 2026 Dorphin Research. Not financial advice.
          </p>
        </div>

        {/* Center Col */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>Product</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>Token Analysis</a></li>
            <li><a href="/listings" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>New Listings</a></li>
            <li><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>API (Coming Soon)</span></li>
          </ul>
        </div>

        {/* Right Col */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>Community</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="https://twitter.com/jungdorphin" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>Twitter @jungdorphin</a></li>
            <li><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Telegram (Coming Soon)</span></li>
            <li><a href="https://github.com/ryuto-ship-it/konet-points" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>GitHub</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
