import { Cpu, Network, FileCheck } from 'lucide-react';

export default function ProcessSection() {
  return (
    <section className="landing-section" style={{
      background: 'var(--ocean-bg-secondary)',
      padding: '120px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderTop: '1px solid rgba(0, 240, 255, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '800px', zIndex: 10 }}>
        <h2 className="heading-outfit" style={{ fontSize: '48px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>
          The Deep Dive Process
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          How Dorphin Research synthesizes millions of data points into a single actionable report.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', maxWidth: '800px', width: '100%', zIndex: 10 }}>
        
        {/* Step 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', width: '100%' }}>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <h3 className="heading-outfit" style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>1. Aggregate</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Connecting to 8+ specialized APIs simultaneously to pull contract data, liquidity, and social sentiment.</p>
          </div>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', border: '2px solid var(--sonar-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)', flexShrink: 0 }}>
            <Network size={32} color="var(--sonar-cyan)" />
          </div>
          <div style={{ flex: 1 }}></div>
        </div>

        {/* Connector Line */}
        <div style={{ width: '2px', height: '60px', background: 'linear-gradient(to bottom, var(--sonar-cyan), rgba(0,240,255,0.2))' }} />

        {/* Step 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', width: '100%' }}>
          <div style={{ flex: 1 }}></div>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', border: '2px solid var(--sonar-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)', flexShrink: 0 }}>
            <Cpu size={32} color="var(--sonar-cyan)" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h3 className="heading-outfit" style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>2. Synthesize</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Our proprietary AI cross-references data to eliminate false positives and calculate risk probabilities.</p>
          </div>
        </div>

        {/* Connector Line */}
        <div style={{ width: '2px', height: '60px', background: 'linear-gradient(to bottom, rgba(0,240,255,0.2), var(--sonar-cyan))' }} />

        {/* Step 3 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', width: '100%' }}>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <h3 className="heading-outfit" style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>3. Report</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>A comprehensive, institutional-grade intelligence report generated in under 10 seconds.</p>
          </div>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--sonar-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(0, 240, 255, 0.4)', flexShrink: 0 }}>
            <FileCheck size={32} color="#000" />
          </div>
          <div style={{ flex: 1 }}></div>
        </div>

      </div>
    </section>
  );
}
