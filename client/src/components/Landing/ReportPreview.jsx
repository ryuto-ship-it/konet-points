import { CheckCircle2 } from 'lucide-react';

export default function ReportPreview() {
  const checklist = [
    'Contract source code analysis',
    'Exchange listing probability',
    'Korean exchange readiness score',
    'Wash trading detection',
    'Holder distribution analysis',
    'CertiK security integration'
  ];

  return (
    <section className="landing-section" style={{
      background: '#0d1117',
      padding: '100px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderTop: '1px solid rgba(255,255,255,0.02)',
      borderBottom: '1px solid rgba(255,255,255,0.02)'
    }}>
      <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '60px', textAlign: 'center' }}>
        See What a Report Looks Like
      </h2>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px',
        maxWidth: '1200px',
        width: '100%'
      }}>
        {/* Left: Text */}
        <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Institutional-grade analysis
          </span>
          <h3 className="heading-space" style={{ fontSize: '42px', fontWeight: 700, color: '#fff', marginTop: '12px', marginBottom: '20px', lineHeight: 1.1 }}>
            Not just data. Intelligence.
          </h3>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '32px' }}>
            Dorphin doesn't just show you numbers. Our AI synthesizes 50+ data points into actionable intelligence — so you know exactly what you're dealing with before you invest.
          </p>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {checklist.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '15px' }}>
                <CheckCircle2 size={18} color="#00e87a" />
                {item}
              </li>
            ))}
          </ul>

          <button 
            style={{
              background: '#00e5ff',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Try Free →
          </button>
        </div>

        {/* Right: Mockup */}
        <div style={{
          flex: '1 1 400px',
          maxWidth: '500px',
          background: '#111318',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          {/* Mock Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, color: '#fff' }}>W</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Wallitelli</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>WALLI</span>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(243, 186, 47, 0.1)', color: '#f3ba2f', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>BSC</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="heading-mono" style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>$0.000833</div>
              <div style={{ fontSize: '13px', color: '#00e87a', fontWeight: 500 }}>▲ 4.85%</div>
            </div>
          </div>

          {/* Score Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255, 61, 90, 0.1)', border: '1px solid rgba(255, 61, 90, 0.3)', borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#ff3d5a', lineHeight: 1 }}>37</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>OUT OF 100</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>Overall Rating</span>
                <span style={{ background: '#ff3d5a', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>D Grade</span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>High risk detected across liquidity and contract ownership. Not recommended for long-term hold.</p>
            </div>
          </div>

          {/* Mini Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Market Cap', value: '$832K' },
              { label: '24h Volume', value: '$60K' },
              { label: 'Liquidity', value: '$2K' },
              { label: 'Exchanges', value: '7' }
            ].map((m, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '4px' }}>{m.label}</div>
                <div className="heading-mono" style={{ fontSize: '15px', color: '#fff', fontWeight: 500 }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Risk Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Risk Breakdown</div>
            {[
              { label: 'Contract', level: 'MEDIUM', color: '#ffb800', blocks: 6 },
              { label: 'Liquidity', level: 'CRITICAL', color: '#ff3d5a', blocks: 2 },
              { label: 'Community', level: 'LOW', color: '#00e87a', blocks: 8 }
            ].map((risk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', width: '70px' }}>{risk.label}</span>
                <div style={{ display: 'flex', gap: '2px', flex: 1, margin: '0 12px' }}>
                  {[...Array(10)].map((_, j) => (
                    <div key={j} style={{ flex: 1, height: '6px', background: j < risk.blocks ? risk.color : 'rgba(255,255,255,0.1)', borderRadius: '1px' }} />
                  ))}
                </div>
                <span style={{ color: risk.color, fontWeight: 600, width: '60px', textAlign: 'right' }}>{risk.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
