import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="landing-section" style={{
      position: 'relative',
      padding: '160px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, var(--ocean-bg-secondary), #010308)',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%', width: '100%', height: '100%', transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,240,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <h2 className="heading-outfit" style={{ 
        fontSize: 'clamp(40px, 6vw, 64px)', 
        fontWeight: 700, 
        color: '#fff', 
        marginBottom: '24px', 
        textAlign: 'center',
        zIndex: 10
      }}>
        Ready to dive deep?
      </h2>
      <p style={{ 
        fontSize: '20px', 
        color: 'rgba(255,255,255,0.5)', 
        marginBottom: '48px', 
        textAlign: 'center',
        zIndex: 10,
        maxWidth: '600px'
      }}>
        Access institutional-grade token intelligence. No signup required.
      </p>

      <div style={{ display: 'flex', gap: '24px', zIndex: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'var(--sonar-cyan)',
            color: '#000',
            border: 'none',
            borderRadius: '32px',
            padding: '18px 40px',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.4)'; }}
        >
          Launch Terminal
        </button>

        <button 
          onClick={() => navigate('/listings')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: '32px',
            padding: '18px 40px',
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
        >
          View Live Feed
        </button>
      </div>
    </section>
  );
}
