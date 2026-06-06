import { ShieldAlert, Activity, Database, Zap, ArrowUpRight } from 'lucide-react';

export default function TerminalShowcase() {
  return (
    <section className="landing-section" style={{
      background: 'var(--ocean-bg-secondary)',
      padding: '120px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderTop: '1px solid rgba(0, 240, 255, 0.1)',
      borderBottom: '1px solid rgba(0, 240, 255, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '800px' }}>
        <h2 className="heading-outfit" style={{ fontSize: '48px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>
          Terminal-Grade Analytics
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          We aggregate data from 8+ specialized APIs, synthesize it with our proprietary AI, and deliver actionable intelligence in seconds.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        width: '100%'
      }}>
        {/* Bento Box 1: Security */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <ShieldAlert size={32} color="var(--sonar-cyan)" style={{ marginBottom: '16px' }} />
              <h3 className="heading-outfit" style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Deep Contract Scanning</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Honeypot detection, tax analysis, and owner privileges.</p>
            </div>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--sonar-cyan)', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600 }}>GoPlus & CertiK</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['No Mint', 'Renounced', '0% Tax'].map(tag => (
              <span key={tag} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>
                <span style={{ color: '#00E87A', marginRight: '6px' }}>✓</span>{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bento Box 2: Liquidity */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <Activity size={32} color="var(--sonar-cyan)" style={{ marginBottom: '16px' }} />
          <h3 className="heading-outfit" style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Liquidity Health</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Real-time DEX pool tracking.</p>
          <div className="heading-mono" style={{ fontSize: '32px', color: '#fff' }}>$1.2M <span style={{ fontSize: '14px', color: '#00E87A' }}>▲ 12%</span></div>
        </div>

        {/* Bento Box 3: Market AI */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <Zap size={32} color="var(--sonar-cyan)" style={{ marginBottom: '16px' }} />
          <h3 className="heading-outfit" style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Listing Predictor</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>T1 Exchange probability scoring.</p>
          <div style={{ marginTop: '24px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '85%', height: '100%', background: 'var(--sonar-cyan)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            <span>T5</span>
            <span style={{ color: 'var(--sonar-cyan)' }}>T1 (85%)</span>
          </div>
        </div>

        {/* Bento Box 4: Architecture */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Database size={32} color="var(--sonar-cyan)" style={{ marginBottom: '16px' }} />
            <h3 className="heading-outfit" style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Multi-Source Synthesis</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px' }}>Our AI doesn't just display data; it cross-references it across 6+ chains to eliminate hallucinations and fake metrics.</p>
          </div>
          <ArrowUpRight size={64} color="rgba(255,255,255,0.1)" />
        </div>
      </div>
    </section>
  );
}
