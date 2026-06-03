import { useState, useEffect, useRef, useCallback } from 'react';
import ReportHeader from './ReportHeader';
import SectionNav from './SectionNav';
import ExecutiveSummary from './sections/ExecutiveSummary';
import ProjectOverview from './sections/ProjectOverview';
import Tokenomics from './sections/Tokenomics';
import TeamInvestors from './sections/TeamInvestors';
import OnchainMetrics from './sections/OnchainMetrics';
import RiskMatrix from './sections/RiskMatrix';
import ExchangeListings from './sections/ExchangeListings';
import HolderAnalysis from './sections/HolderAnalysis';
import PricePattern from './sections/PricePattern';
import ListingAssessment from './sections/ListingAssessment';
import DataSources from './sections/DataSources';
import './ReportView.css';

const SECTIONS = [
  { id: 'executive-summary', label: '요약', labelEn: 'Executive Summary' },
  { id: 'project-overview', label: '개요', labelEn: 'Project Overview' },
  { id: 'tokenomics', label: '토크노믹스', labelEn: 'Tokenomics' },
  { id: 'team-investors', label: '팀 & 투자자', labelEn: 'Team & Investors' },
  { id: 'onchain-metrics', label: '온체인 지표', labelEn: 'On-chain Metrics' },
  { id: 'exchange-listings', label: '거래소 현황', labelEn: 'Exchange Listings' },
  { id: 'holder-analysis', label: '홀더 분석', labelEn: 'Holder Analysis' },
  { id: 'price-pattern', label: '가격 패턴', labelEn: 'Price Pattern' },
  { id: 'risk-matrix', label: '리스크 매트릭스', labelEn: 'Risk Matrix' },
  { id: 'listing-assessment', label: '상장 심사', labelEn: 'Listing Assessment' },
  { id: 'data-sources', label: '출처', labelEn: 'Data Sources' },
];

export default function ReportView({ data, onBack }) {
  const [activeSection, setActiveSection] = useState('executive-summary');
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
            <div ref={setSectionRef('executive-summary')}>
              <ExecutiveSummary data={data} />
            </div>
            <div ref={setSectionRef('project-overview')}>
              <ProjectOverview data={data} />
            </div>
            <div ref={setSectionRef('tokenomics')}>
              <Tokenomics data={data} />
            </div>
            <div ref={setSectionRef('team-investors')}>
              <TeamInvestors data={data} />
            </div>
            <div ref={setSectionRef('onchain-metrics')}>
              <OnchainMetrics data={data} />
            </div>
            <div ref={setSectionRef('exchange-listings')}>
              <ExchangeListings data={data} />
            </div>
            <div ref={setSectionRef('holder-analysis')}>
              <HolderAnalysis data={data} />
            </div>
            <div ref={setSectionRef('price-pattern')}>
              <PricePattern data={data} />
            </div>
            <div ref={setSectionRef('risk-matrix')}>
              <RiskMatrix data={data} />
            </div>
            <div ref={setSectionRef('listing-assessment')}>
              <ListingAssessment data={data} />
            </div>
            <div ref={setSectionRef('data-sources')}>
              <DataSources data={data} />
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
