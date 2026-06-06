import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="landing-section" style={{
      position: 'relative',
      padding: '120px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0b0f',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,229,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <h2 className="heading-space" style={{ 
        fontSize: 'clamp(32px, 5vw, 48px)', 
        fontWeight: 700, 
        color: '#fff', 
        marginBottom: '16px', 
        textAlign: 'center',
        zIndex: 10
      }}>
        Start Analyzing for Free
      </h2>
      <p style={{ 
        fontSize: '18px', 
        color: 'rgba(255,255,255,0.5)', 
        marginBottom: '48px', 
        textAlign: 'center',
        zIndex: 10
      }}>
        No signup required. Just paste a contract address.
      </p>

      <div style={{ display: 'flex', gap: '16px', zIndex: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: '#00e5ff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
        >
          Analyze a Token →
        </button>

        <button 
          onClick={() => navigate('/listings')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
        >
          View New Listings →
        </button>
      </div>
    </section>
  );
}
