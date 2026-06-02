import { useState, useEffect, useRef, useCallback } from 'react';
import ReportHeader from './ReportHeader';
import SectionNav from './SectionNav';
import BasicInfo from './sections/BasicInfo';
import OnchainData from './sections/OnchainData';
import UtilityAnalysis from './sections/UtilityAnalysis';
import RiskIndicators from './sections/RiskIndicators';
import OverallAssessment from './sections/OverallAssessment';
import './ReportView.css';

const SECTIONS = [
  { id: 'basic-info', label: '기본 정보', labelEn: 'Basic Info' },
  { id: 'onchain-data', label: '온체인 데이터', labelEn: 'On-chain Data' },
  { id: 'utility-analysis', label: '유틸리티 분석', labelEn: 'Utility Analysis' },
  { id: 'risk-indicators', label: '리스크 지표', labelEn: 'Risk Indicators' },
  { id: 'overall-assessment', label: '종합 평가', labelEn: 'Overall Assessment' },
];

export default function ReportView({ data, onBack }) {
  const [activeSection, setActiveSection] = useState('basic-info');
  const mainRef = useRef(null);
  const sectionRefs = useRef({});

  // Track scroll to update active section
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop + 120;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[SECTIONS[i].id];
        if (el && el.offsetTop <= scrollTop) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback((sectionId) => {
    const el = sectionRefs.current[sectionId];
    if (el && mainRef.current) {
      mainRef.current.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  }, []);

  const setSectionRef = useCallback((id) => (el) => {
    sectionRefs.current[id] = el;
  }, []);

  return (
    <div className="report-view animate-fade-in">
      <ReportHeader data={data} onBack={onBack} />

      <div className="report-layout">
        <SectionNav
          sections={SECTIONS}
          activeSection={activeSection}
          onNavigate={handleNavClick}
        />

        <main className="report-main" ref={mainRef}>
          <div className="report-content">
            <div ref={setSectionRef('basic-info')}>
              <BasicInfo data={data} />
            </div>
            <div ref={setSectionRef('onchain-data')}>
              <OnchainData data={data} />
            </div>
            <div ref={setSectionRef('utility-analysis')}>
              <UtilityAnalysis data={data} />
            </div>
            <div ref={setSectionRef('risk-indicators')}>
              <RiskIndicators data={data} />
            </div>
            <div ref={setSectionRef('overall-assessment')}>
              <OverallAssessment data={data} />
            </div>

            {/* Report Footer */}
            <footer className="report-footer">
              <p>
                Report generated at {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'N/A'}
              </p>
              <p>Dorphin Research — AI-Powered Token Intelligence Platform</p>
              <p className="report-disclaimer">
                This report is for informational purposes only and does not constitute financial advice.
                Always conduct your own research before making investment decisions.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
