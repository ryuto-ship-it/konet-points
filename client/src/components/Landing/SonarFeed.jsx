import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SonarFeed() {
  const navigate = useNavigate();

  const mockFeed = [
    { name: 'Dorphin Protocol', symbol: 'DORPHIN', time: '12s ago', status: 'SAFE', color: '#00E87A', icon: <ShieldCheck size={16} color="#00E87A" />, score: 92, liq: '$1.2M' },
    { name: 'Alpha Finance', symbol: 'ALPHA', time: '45s ago', status: 'CAUTION', color: '#FFB800', icon: <Activity size={16} color="#FFB800" />, score: 65, liq: '$45K' },
    { name: 'Deep Sea Token', symbol: 'DEEP', time: '2m ago', status: 'DANGER', color: '#FF3D5A', icon: <AlertTriangle size={16} color="#FF3D5A" />, score: 18, liq: '$2K' },
    { name: 'Sonar Sweep', symbol: 'SONAR', time: '5m ago', status: 'SAFE', color: '#00E87A', icon: <ShieldCheck size={16} color="#00E87A" />, score: 88, liq: '$850K' },
  ];

  return (
    <section className="landing-section" style={{
      background: 'var(--ocean-bg)',
      padding: '120px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 className="heading-outfit" style={{ fontSize: '48px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
          Live Sonar Feed
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>
          Real-time BSC token screening. Risk-scored before the market reacts.
        </p>
      </div>

      <div style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ 
          background: 'rgba(10, 17, 40, 0.4)', 
          border: '1px solid rgba(0, 240, 255, 0.2)', 
          borderRadius: '16px', 
          overflow: 'hidden' 
        }}>
          {/* Table Header */}
          <div style={{ display: 'flex', padding: '16px 24px', background: 'rgba(0, 240, 255, 0.05)', borderBottom: '1px solid rgba(0, 240, 255, 0.1)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div style={{ flex: 2 }}>Asset</div>
            <div style={{ flex: 1, textAlign: 'center' }}>Time</div>
            <div style={{ flex: 1, textAlign: 'center' }}>Liquidity</div>
            <div style={{ flex: 1, textAlign: 'right' }}>Score</div>
          </div>

          {/* Rows */}
          {mockFeed.map((item, idx) => (
            <div key={idx} style={{ 
              display: 'flex', alignItems: 'center', padding: '20px 24px', 
              borderBottom: idx === mockFeed.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.2s', cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => navigate('/listings')}
            >
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `rgba(${item.color === '#00E87A' ? '0,232,122' : item.color === '#FFB800' ? '255,184,0' : '255,61,90'}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{item.symbol}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{item.name}</div>
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{item.time}</div>
              <div className="heading-mono" style={{ flex: 1, textAlign: 'center', fontSize: '14px', color: '#fff' }}>{item.liq}</div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <span style={{ color: item.color, fontWeight: 700, fontSize: '16px' }}>{item.score}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginLeft: '2px' }}>/100</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button 
            onClick={() => navigate('/listings')}
            style={{
              background: 'transparent',
              border: '1px solid var(--sonar-cyan)',
              color: 'var(--sonar-cyan)',
              padding: '12px 32px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Access Full Sonar Feed
          </button>
        </div>
      </div>
    </section>
  );
}
