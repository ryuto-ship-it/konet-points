import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, XCircle } from 'lucide-react';
import './ScorePanel.css';

export default function ScorePanel({ data }) {
  const score = data?.analysis?.overall_score || 0;
  
  const getScoreColor = (s) => {
    if (s >= 80) return 'var(--success)';
    if (s >= 60) return 'var(--warning)';
    if (s >= 40) return '#ff8c00';
    return 'var(--danger)';
  };
  
  const getScoreGrade = (s) => {
    if (s >= 90) return { grade: 'A+', class: 'grade-a' };
    if (s >= 80) return { grade: 'A', class: 'grade-a' };
    if (s >= 70) return { grade: 'B+', class: 'grade-b' };
    if (s >= 60) return { grade: 'B', class: 'grade-b' };
    if (s >= 50) return { grade: 'C+', class: 'grade-c' };
    if (s >= 40) return { grade: 'C', class: 'grade-c' };
    if (s >= 30) return { grade: 'D', class: 'grade-d' };
    return { grade: 'F', class: 'grade-f' };
  };

  const color = getScoreColor(score);
  const gradeInfo = getScoreGrade(score);

  // Radar chart data mapping
  const sd = data?.securityData;
  const md = data?.marketData;
  const radarData = [
    { subject: '보안', value: sd?.is_open_source ? 90 : 50 },
    { subject: '시장', value: md?.marketCap > 10000000 ? 80 : 40 },
    { subject: '커뮤니티', value: data?.twitterData ? 85 : 30 },
    { subject: '온체인', value: 70 }, // Placeholder
    { subject: '거래소', value: md?.tickers?.length > 5 ? 85 : 45 },
    { subject: '펀더멘탈', value: score },
  ];

  const badges = [
    { label: '감사 완료', done: sd?.is_open_source === '1' || false },
    { label: '팀 KYC', done: false },
    { label: '버그 바운티', done: false },
    { label: '컨트랙트 검증', done: sd?.is_open_source === '1' || false }
  ];

  return (
    <aside className="score-panel">
      
      {/* Composite Score Card */}
      <div className="score-card" style={{ '--score-color': color }}>
        <div className="score-header">
          <span className="score-label">COMPOSITE SCORE</span>
        </div>
        <div className="score-value-wrap">
          <span className="score-value">{score}</span>
        </div>
        <div className={`score-badge ${gradeInfo.class}`}>
          {gradeInfo.grade}
        </div>
      </div>

      {/* Radar Chart */}
      <div className="radar-card">
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }} 
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="var(--accent-cyan)"
              strokeWidth={2}
              fill="rgba(0,229,255,0.1)"
              fillOpacity={1}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Verification Badges */}
      <div className="badge-grid">
        {badges.map((b, i) => (
          <div key={i} className={`verify-badge ${b.done ? 'done' : 'pending'}`}>
            {b.done ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{b.label}</span>
          </div>
        ))}
      </div>

      <div className="skynet-attribution">
        <span>CERTIK SKYNET</span>
      </div>
    </aside>
  );
}
