import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardHeader from './DashboardHeader';
import ReportNav from './ReportNav';
import ScorePanel from './ScorePanel';
import ExecutiveSummary from './sections/ExecutiveSummary';
import ProjectOverview from './sections/ProjectOverview';
import Tokenomics from './sections/Tokenomics';
import TeamInvestors from './sections/TeamInvestors';
import OnchainMetrics from './sections/OnchainMetrics';
import RiskMatrix from './sections/RiskMatrix';
import ExchangeListings from './sections/ExchangeListings';
import HolderAnalysis from './sections/HolderAnalysis';
import PricePattern from './sections/PricePattern';
import OnchainVerification from './sections/OnchainVerification';
import SocialDev from './sections/SocialDev';
import ListingAssessment from './sections/ListingAssessment';
import DataSources from './sections/DataSources';
import './ReportView.css';

// 7 nav tabs mapping
const NAV_TABS = [
  { id: 'overview',   targetId: 'executive-summary',  sectionIds: ['executive-summary', 'project-overview', 'tokenomics'] },
  { id: 'security',   targetId: 'onchain-verification', sectionIds: ['onchain-verification'] },
  { id: 'market',     targetId: 'price-pattern',       sectionIds: ['price-pattern', 'holder-analysis'] },
  { id: 'community',  targetId: 'team-investors',      sectionIds: ['team-investors', 'social-dev'] },
  { id: 'onchain',    targetId: 'onchain-metrics',     sectionIds: ['onchain-metrics'] },
  { id: 'listing',    targetId: 'exchange-listings',   sectionIds: ['exchange-listings', 'listing-assessment', 'data-sources'] },
  { id: 'risk',       targetId: 'risk-matrix',         sectionIds: ['risk-matrix'] },
];

const SECTION_TO_TAB = {};
NAV_TABS.forEach(tab => {
  tab.sectionIds.forEach(sid => { SECTION_TO_TAB[sid] = tab.id; });
});

const ALL_SECTION_IDS = [
  'executive-summary', 'project-overview', 'tokenomics',
  'team-investors', 'onchain-metrics', 'exchange-listings',
  'holder-analysis', 'price-pattern', 'onchain-verification',
  'social-dev', 'risk-matrix', 'listing-assessment', 'data-sources',
];

export default function ReportView({ data, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const mainRef = useRef(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop + 140;
      for (let i = ALL_SECTION_IDS.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[ALL_SECTION_IDS[i]];
        if (el && el.offsetTop <= scrollTop) {
          const tabId = SECTION_TO_TAB[ALL_SECTION_IDS[i]];
          if (tabId) setActiveTab(tabId);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = useCallback((tabId) => {
    const tab = NAV_TABS.find(t => t.id === tabId);
    if (!tab) return;
    const el = sectionRefs.current[tab.targetId];
    if (el && mainRef.current) {
      mainRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
    setActiveTab(tabId);
  }, []);

  const setSectionRef = useCallback((id) => (el) => {
    sectionRefs.current[id] = el;
  }, []);

  return (
    <div className="report-view animate-fade-in">
      <DashboardHeader data={data} onBack={onBack} />

      <div className="report-layout">
        <ReportNav activeTab={activeTab} onTabClick={handleTabClick} />

        <main className="report-main" ref={mainRef}>
          <div className="report-content" id="report-content-pdf">
            <div ref={setSectionRef('executive-summary')}>
              <ExecutiveSummary data={data} />
            </div>
            <div ref={setSectionRef('project-overview')}>
              <ProjectOverview data={data} />
            </div>
            <div ref={setSectionRef('tokenomics')}>
              <Tokenomics data={data} />
            </div>
            <div ref={setSectionRef('onchain-verification')}>
              <OnchainVerification data={data} />
            </div>
            <div ref={setSectionRef('price-pattern')}>
              <PricePattern data={data} />
            </div>
            <div ref={setSectionRef('holder-analysis')}>
              <HolderAnalysis data={data} />
            </div>
            <div ref={setSectionRef('team-investors')}>
              <TeamInvestors data={data} />
            </div>
            <div ref={setSectionRef('social-dev')}>
              <SocialDev data={data} />
            </div>
            <div ref={setSectionRef('onchain-metrics')}>
              <OnchainMetrics data={data} />
            </div>
            <div ref={setSectionRef('exchange-listings')}>
              <ExchangeListings data={data} />
            </div>
            <div ref={setSectionRef('listing-assessment')}>
              <ListingAssessment data={data} />
            </div>
            <div ref={setSectionRef('risk-matrix')}>
              <RiskMatrix data={data} />
            </div>
            <div ref={setSectionRef('data-sources')}>
              <DataSources data={data} />
            </div>

            <footer className="report-footer">
              <p>Generated {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'N/A'}</p>
              <p>Dorphin Research — AI-Powered Token Intelligence</p>
              <p className="report-disclaimer">
                For informational purposes only. Not financial advice.
                Always conduct your own research before making investment decisions.
              </p>
            </footer>
          </div>
        </main>

        <ScorePanel data={data} />
      </div>
    </div>
  );
}
