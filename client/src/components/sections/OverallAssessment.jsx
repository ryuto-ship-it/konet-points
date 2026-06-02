import './sections.css';

export default function OverallAssessment({ data }) {
  const assessment = data?.analysis?.overallAssessment || {};
  const summary = assessment.summary || '';
  const strengths = assessment.strengths || [];
  const weaknesses = assessment.weaknesses || [];
  const risks = assessment.risks || [];
  const investmentPerspective = assessment.investmentPerspective || '';

  const getGradeStyle = (grade) => {
    const g = (grade || '').toUpperCase();
    if (g === 'A') return { color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)', background: 'rgba(0, 220, 130, 0.12)' };
    if (g === 'B') return { color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)', background: 'rgba(0, 229, 255, 0.12)' };
    if (g === 'C') return { color: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', background: 'rgba(255, 184, 0, 0.12)' };
    if (g === 'D') return { color: 'var(--accent-crimson)', borderColor: 'var(--accent-crimson)', background: 'rgba(255, 51, 102, 0.12)' };
    return { color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)', background: 'rgba(0, 229, 255, 0.12)' };
  };

  const gradeStyle = getGradeStyle(assessment.listingGrade);

  return (
    <section className="report-section" id="overall-assessment">
      <div className="section-header">
        <span className="section-number">5</span>
        <h2 className="section-title">
          종합 평가
          <span className="section-title-en">Overall Assessment</span>
        </h2>
      </div>

      {/* Listing Eligibility Grade Card */}
      {assessment.listingGrade && (
        <div className="analysis-card" style={{ 
          borderColor: gradeStyle.borderColor, 
          background: `linear-gradient(135deg, ${gradeStyle.background.replace('0.12', '0.03')}, var(--bg-card))`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div className="analysis-card-label" style={{ color: gradeStyle.color, marginBottom: 'var(--space-1)' }}>
              Listing Feasibility Grade (상장 심사 예측 등급)
            </div>
            <div className="analysis-text" style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              본 평가는 프로젝트의 유통 공급량 비율, 락업 투명성, 실사용 온체인 지표를 거래소 상장 위원회 관점에서 종합 계산하여 도출한 인텔리전스 등급입니다.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 90 }}>
            <span style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              fontFamily: 'var(--font-mono)', 
              padding: 'var(--space-2) var(--space-6)', 
              borderRadius: 'var(--radius-md)', 
              color: gradeStyle.color, 
              border: `2px solid ${gradeStyle.borderColor}`,
              background: gradeStyle.background,
              boxShadow: `0 0 20px ${gradeStyle.background.replace('0.12', '0.05')}`
            }}>
              {assessment.listingGrade}
            </span>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="analysis-card" style={{ borderColor: 'rgba(0, 229, 255, 0.15)' }}>
          <div className="analysis-card-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Summary
          </div>
          <div className="analysis-text" style={{ fontSize: 'var(--text-md)', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            {summary}
          </div>
        </div>
      )}

      {/* Strengths / Weaknesses / Risks */}
      {(strengths.length > 0 || weaknesses.length > 0 || risks.length > 0) && (
        <div className="three-col">
          {/* Strengths */}
          <div className="col-card">
            <div className="col-header strengths">💪 Strengths</div>
            <div className="col-list">
              {strengths.length > 0 ? (
                strengths.map((item, i) => (
                  <div className="col-list-item" key={i}>
                    <div className="col-list-bullet green" />
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <div className="col-list-item" style={{ opacity: 0.5 }}>
                  <span>No data available</span>
                </div>
              )}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="col-card">
            <div className="col-header weaknesses">⚠️ Weaknesses</div>
            <div className="col-list">
              {weaknesses.length > 0 ? (
                weaknesses.map((item, i) => (
                  <div className="col-list-item" key={i}>
                    <div className="col-list-bullet red" />
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <div className="col-list-item" style={{ opacity: 0.5 }}>
                  <span>No data available</span>
                </div>
              )}
            </div>
          </div>

          {/* Risks */}
          <div className="col-card">
            <div className="col-header risks">🔍 Key Risks</div>
            <div className="col-list">
              {risks.length > 0 ? (
                risks.map((item, i) => (
                  <div className="col-list-item" key={i}>
                    <div className="col-list-bullet amber" />
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <div className="col-list-item" style={{ opacity: 0.5 }}>
                  <span>No data available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Investment Perspective */}
      {investmentPerspective && (
        <div className="analysis-card">
          <div className="analysis-card-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Investment Perspective
          </div>
          <div className="analysis-text">{investmentPerspective}</div>
        </div>
      )}
    </section>
  );
}
