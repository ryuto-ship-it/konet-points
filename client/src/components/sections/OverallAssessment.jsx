import './sections.css';

export default function OverallAssessment({ data }) {
  const assessment = data?.analysis?.overallAssessment || {};
  const summary = assessment.summary || '';
  const strengths = assessment.strengths || [];
  const weaknesses = assessment.weaknesses || [];
  const risks = assessment.risks || [];
  const investmentPerspective = assessment.investmentPerspective || '';

  return (
    <section className="report-section" id="overall-assessment">
      <div className="section-header">
        <span className="section-number">5</span>
        <h2 className="section-title">
          종합 평가
          <span className="section-title-en">Overall Assessment</span>
        </h2>
      </div>

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
