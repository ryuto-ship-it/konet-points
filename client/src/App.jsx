import { useState, useCallback, useRef } from 'react';
import SearchHero from './components/SearchHero';
import DolphinLoader from './components/DolphinLoader';
import ReportView from './components/ReportView';
import NewListings from './pages/NewListings';
import { getReport } from './api/client';
import './App.css';

// Top navigation bar
function TopNav({ currentPage, onNavigate }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '10px 20px',
      background: 'rgba(10,11,15,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ fontSize: '15px', fontWeight: 700, marginRight: '16px', color: 'var(--accent-cyan, #00e5ff)' }}>
        🐬
      </span>
      {[
        { id: 'search',   label: '🔍 Token Analysis' },
        { id: 'listings', label: '🔴 New Listings' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => onNavigate(tab.id)}
          style={{
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
            background: currentPage === tab.id ? 'rgba(0,229,255,0.12)' : 'transparent',
            border: currentPage === tab.id ? '1px solid rgba(0,229,255,0.35)' : '1px solid transparent',
            color: currentPage === tab.id ? 'var(--accent-cyan, #00e5ff)' : 'var(--text-secondary, #8899aa)',
            fontSize: '13px', fontWeight: currentPage === tab.id ? 600 : 400,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (currentPage !== tab.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={e => { if (currentPage !== tab.id) e.currentTarget.style.background = 'transparent'; }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function App() {
  // page: 'search' | 'listings' | 'loading' | 'report'
  const [page, setPage] = useState('search');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [prevPage, setPrevPage] = useState('search'); // to know where to go back

  const reportDataRef = useRef(null);
  const loadingCompleteRef = useRef(false);

  const startAnalysis = useCallback(async (token, returnPage = 'search') => {
    reportDataRef.current = null;
    loadingCompleteRef.current = false;
    setSelectedToken(token);
    setError(null);
    setPrevPage(returnPage);
    setPage('loading');

    try {
      const data = await getReport(token.id, token.address, token.chain);
      reportDataRef.current = data;
      setReportData(data);
      if (loadingCompleteRef.current) setPage('report');
    } catch (err) {
      setError(err.message || 'Failed to generate report. Please try again.');
      setPage(returnPage);
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    loadingCompleteRef.current = true;
    if (reportDataRef.current) setPage('report');
  }, []);

  const handleBackToSearch = useCallback(() => {
    reportDataRef.current = null;
    loadingCompleteRef.current = false;
    setPage(prevPage);
    setReportData(null);
    setSelectedToken(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [prevPage]);

  const handleNavClick = useCallback((tabId) => {
    if (page === 'loading' || page === 'report') return; // don't interrupt active report
    setPage(tabId);
    setError(null);
  }, [page]);

  const showNav = page !== 'loading';

  return (
    <div className="app">
      {showNav && (
        <TopNav
          currentPage={page === 'report' ? prevPage : page}
          onNavigate={handleNavClick}
        />
      )}

      {/* Spacer under fixed nav (only when nav is shown and not in report full-screen) */}
      {showNav && page !== 'report' && (
        <div style={{ height: '52px' }} />
      )}

      {(page === 'search') && (
        <SearchHero
          onTokenSelect={(t) => startAnalysis(t, 'search')}
          onGoToListings={() => setPage('listings')}
          error={error}
        />
      )}

      {page === 'listings' && (
        <div style={{ paddingTop: '52px' }}>
          <NewListings
            onAnalyzeToken={(t) => startAnalysis(t, 'listings')}
            onBack={() => setPage('search')}
          />
        </div>
      )}

      {page === 'loading' && (
        <DolphinLoader
          tokenName={selectedToken?.name || 'Token'}
          onComplete={handleLoadingComplete}
        />
      )}

      {page === 'report' && reportData && (
        <ReportView
          data={reportData}
          onBack={handleBackToSearch}
        />
      )}
    </div>
  );
}

export default App;
