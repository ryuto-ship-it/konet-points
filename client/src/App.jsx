import { useState, useCallback } from 'react';
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

  const handleTokenSelect = useCallback(async (token) => {
    setSelectedToken(token);
    setError(null);
    setCurrentView('loading');

    try {
      const data = await getReport(token.id, token.address, token.chain);
      setReportData(data);
      // Don't switch to report view yet — LoadingOverlay will call onComplete
    } catch (err) {
      setError(err.message || 'Failed to generate report. Please try again.');
      setCurrentView('search');
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    if (reportData) {
      setCurrentView('report');
    }
  }, [reportData]);

  const handleBackToSearch = useCallback(() => {
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
          hasData={!!reportData}
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
