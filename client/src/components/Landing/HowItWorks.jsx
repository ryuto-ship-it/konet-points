import { Search, Brain, FileText, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      icon: <Search size={48} color="#00e5ff" style={{ margin: '24px 0' }} />,
      title: 'Enter Contract Address',
      desc: 'Paste any token contract address or search by name across 6+ chains'
    },
    {
      num: 2,
      icon: <Brain size={48} color="#00e5ff" style={{ margin: '24px 0' }} />,
      title: 'AI Analyzes Everything',
      desc: 'Our AI aggregates data from 8+ sources including CertiK, DexScreener, and on-chain metrics'
    },
    {
      num: 3,
      icon: <FileText size={48} color="#00e5ff" style={{ margin: '24px 0' }} />,
      title: 'Get Your Report',
      desc: 'Receive a comprehensive risk assessment with exchange listing probability score'
    }
  ];

  return (
    <section className="landing-section" style={{
      background: '#0d1117',
      padding: '100px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>How Dorphin Works</h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>
          From contract address to full intelligence report in seconds
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        maxWidth: '1200px',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        {steps.map((step, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: '1 1 300px' }}>
            <div style={{
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative'
            }}>
              {/* Number Badge */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(0,229,255,0.1)',
                border: '1px solid rgba(0,229,255,0.3)',
                color: '#00e5ff', fontSize: '18px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {step.num}
              </div>
              
              {step.icon}
              
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>{step.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
            
            {idx < steps.length - 1 && (
              <div className="step-arrow" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <ArrowRight size={24} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Basic responsive style for hiding arrows on small screens */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1000px) {
          .step-arrow { display: none; }
        }
      `}} />
    </section>
  );
}
