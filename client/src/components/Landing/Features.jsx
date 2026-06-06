import { Lock, BarChart2, Globe, Zap, Shield, Database } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Lock size={32} color="#00e5ff" />,
      title: 'Contract Security Analysis',
      desc: 'Source code scanning for honeypots, tax functions, and malicious patterns'
    },
    {
      icon: <BarChart2 size={32} color="#00e5ff" />,
      title: 'Exchange Tier System',
      desc: '50+ exchanges ranked T1-T5. Know exactly which tier a token is listed on'
    },
    {
      icon: <Globe size={32} color="#00e5ff" />,
      title: 'Korean Exchange Score',
      desc: 'Upbit & Bithumb listing readiness — the only platform with Korean-specific criteria'
    },
    {
      icon: <Zap size={32} color="#00e5ff" />,
      title: 'Real-time New Listings',
      desc: 'BSC new tokens scanned every 5 minutes with instant risk scoring'
    },
    {
      icon: <Shield size={32} color="#00e5ff" />,
      title: 'CertiK Integration',
      desc: 'Skynet scores and sub-ratings pulled directly for verified security data'
    },
    {
      icon: <Database size={32} color="#00e5ff" />,
      title: 'Multi-source Data',
      desc: 'CoinGecko, CMC, DexScreener, Etherscan, GoPlus — all in one report'
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
      <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '60px', textAlign: 'center' }}>
        Everything You Need to Know
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        width: '100%'
      }}>
        {features.map((feature, idx) => (
          <div key={idx} className="feature-card" style={{
            background: '#111318',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '28px',
            transition: 'all 0.2s',
            cursor: 'default'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>{feature.title}</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
