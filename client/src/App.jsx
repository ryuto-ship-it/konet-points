import { useState, useCallback, useRef } from 'react';
import SearchHero from './components/SearchHero';
import LoadingOverlay from './components/LoadingOverlay';
import ReportView from './components/ReportView';
import { getReport } from './api/client';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('search'); // 'search' | 'loading' | 'report'
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);

  // Refs to coordinate between async fetch and animation completion
  const reportDataRef = useRef(null);
  const loadingCompleteRef = useRef(false);

  const handleTokenSelect = useCallback(async (token) => {
    reportDataRef.current = null;
    loadingCompleteRef.current = false;
    setSelectedToken(token);
    setError(null);
    setCurrentView('loading');

    try {
      const data = await getReport(token.id, token.address, token.chain);
      reportDataRef.current = data;
      setReportData(data);
      // If animation already finished, transition immediately
      if (loadingCompleteRef.current) {
        setCurrentView('report');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report. Please try again.');
      setCurrentView('search');
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    loadingCompleteRef.current = true;
    // If data already arrived, transition immediately
    if (reportDataRef.current) {
      setCurrentView('report');
    }
    // else: handleTokenSelect will transition when data arrives
  }, []);

  const handleBackToSearch = useCallback(() => {
    reportDataRef.current = null;
    loadingCompleteRef.current = false;
    setCurrentView('search');
    setReportData(null);
    setSelectedToken(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="app">
      {currentView === 'search' && (
        <SearchHero
          onTokenSelect={handleTokenSelect}
          error={error}
        />
      )}

      {currentView === 'loading' && (
        <LoadingOverlay
          tokenName={selectedToken?.name || 'Token'}
          onComplete={handleLoadingComplete}
        />
      )}

      {currentView === 'report' && reportData && (
        <ReportView
          data={reportData}
          onBack={handleBackToSearch}
        />
      )}
    </div>
  );
}

export default App;
