import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

export default function NewListingsPreview() {
  const navigate = useNavigate();

  const mockListings = [
    {
      symbol: 'AIX',
      name: 'AI Protocol X',
      score: 82,
      risk: 'SAFE',
      color: '#00e87a',
      liq: '$42,500',
      vol: '$12,300',
      age: '5 mins ago',
      icon: <ShieldCheck size={20} color="#00e87a" />
    },
    {
      symbol: 'DOGE2',
      name: 'Doge V2',
      score: 45,
      risk: 'CAUTION',
      color: '#ffb800',
      liq: '$8,200',
      vol: '$45,000',
      age: '12 mins ago',
      icon: <Shield size={20} color="#ffb800" />
    },
    {
      symbol: 'SCAM',
      name: 'SafeMoon Inu',
      score: 12,
      risk: 'DANGER',
      color: '#ff3d5a',
      liq: '$1,200',
      vol: '$800',
      age: '18 mins ago',
      icon: <ShieldAlert size={20} color="#ff3d5a" />
    }
  ];

  return (
    <section className="landing-section" style={{
      background: '#0a0b0f',
      padding: '100px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Live Token Screening</h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>
          New tokens hitting BSC — risk-scored before you even know they exist
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '24px',
        maxWidth: '1200px',
        width: '100%',
        marginBottom: '48px'
      }}>
        {mockListings.map((token, idx) => (
          <div key={idx} style={{
            background: '#111318',
            borderLeft: `4px solid ${token.color}`,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '20px',
            flex: '1 1 300px',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ padding: '8px', background: `rgba(${token.color === '#00e87a' ? '0,232,122' : token.color === '#ffb800' ? '255,184,0' : '255,61,90'}, 0.1)`, borderRadius: '8px' }}>
                  {token.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{token.symbol}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{token.name}</span>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{token.age}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Score</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: token.color }}>{token.score}<span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/100</span></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Liq / Vol</div>
                <div className="heading-mono" style={{ fontSize: '13px', color: '#fff' }}>{token.liq} <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span> {token.vol}</div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/listings')}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: '4px'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              View Analysis →
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={() => navigate('/listings')}
        style={{
          background: 'transparent',
          border: '1px solid rgba(0,229,255,0.3)',
          color: '#00e5ff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        View New Listings →
      </button>
    </section>
  );
}
