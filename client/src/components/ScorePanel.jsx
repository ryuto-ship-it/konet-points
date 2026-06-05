
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import './ScorePanel.css';

export default function ScorePanel({ data }) {
  const ls = data?.listingScore || {};
  const score = ls.composite ?? 0;
  const grade = ls.compositeGrade || 'N/A';

  let scoreColor = 'var(--danger)';
  if (score >= 80) scoreColor = 'var(--success)';
  else if (score >= 60) scoreColor = 'var(--warning)';
  else if (score >= 40) scoreColor = '#ff8c00';

  const radarData = [
    { subject: 'Security', A: data?.goplusSecurity ? (data.goplusSecurity.isHoneypot ? 0 : 70) : 60, fullMark: 100 },
    { subject: 'Market', A: ls.priceStability?.score ?? 50, fullMark: 100 },
    { subject: 'Community', A: data?.twitterData?.followersCount ? Math.min(100, Math.floor(data.twitterData.followersCount / 1000)) : 40, fullMark: 100 },
    { subject: 'On-chain', A: ls.onchain?.score ?? 50, fullMark: 100 },
    { subject: 'Listing', A: ls.exchange?.score ?? 30, fullMark: 100 },
    { subject: 'Fundamentals', A: data?.onchainData?.contractVerified ? 75 : 50, fullMark: 100 },
  ];

  const onchain = data?.onchainData || {};
  const sec = data?.goplusSecurity || {};
  const isContractVerified = onchain.contractVerified || sec.isOpenSource;

  const badges = [
    { label: 'Audit', completed: false }, // Placeholder logic
    { label: 'KYC', completed: false },
    { label: 'Bug Bounty', completed: false },
    { label: 'Verified', completed: !!isContractVerified }
  ];

  return (
    <aside className="score-panel">
      <div className="glass-card score-card">
        <h3 className="score-label">Overall Score</h3>
        <div className="score-main">
          <span className="score-number" style={{ color: scoreColor }}>{score}</span>
          <span className="score-grade" style={{ backgroundColor: scoreColor }}>{grade}</span>
        </div>
      </div>

      <div className="glass-card radar-card">
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="A"
              stroke="var(--accent)"
              fill="rgba(0, 229, 255, 0.1)"
              fillOpacity={1}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card badges-card">
        <div className="badges-grid">
          {badges.map((b, idx) => (
            <div key={idx} className={`badge-item ${b.completed ? 'completed' : 'pending'}`}>
              <span className="badge-icon">{b.completed ? '✓' : '−'}</span>
              <span className="badge-text">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
