import { useState, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import SearchHero from './components/SearchHero'; // We'll keep this if needed or redirect
import DolphinLoader from './components/DolphinLoader';
import ReportView from './components/ReportView';
import NewListings from './pages/NewListings';
import { getReport } from './api/client';
import './App.css';

function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.startsWith('/report') ? 'search' : location.pathname === '/listings' ? 'listings' : 'search';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '10px 20px',
      background: 'rgba(10,11,15,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span 
        style={{ fontSize: '15px', fontWeight: 700, marginRight: '16px', color: 'var(--accent-cyan, #00e5ff)', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        🐬 DORPHIN
      </span>
      {[
        { id: '/',   label: '🔍 Token Analysis' },
        { id: '/listings', label: '🔴 New Listings' },
      ].map(tab => {
        const isActive = location.pathname === tab.id || (tab.id === '/' && location.pathname.startsWith('/report'));
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id)}
            style={{
              padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
              background: isActive ? 'rgba(0,229,255,0.12)' : 'transparent',
              border: isActive ? '1px solid rgba(0,229,255,0.35)' : '1px solid transparent',
              color: isActive ? 'var(--accent-cyan, #00e5ff)' : 'var(--text-secondary, #8899aa)',
              fontSize: '13px', fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  );
}

function ReportPageWrapper() {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to parse token state from router state
  const token = location.state?.token;

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      navigate('/');
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await getReport(token.id, token.address, token.chain);
        if (isMounted) setReportData(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to generate report. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    // Only fetch if we don't have reportData yet
    if (!reportData) {
      fetchReport();
    }
    
    return () => { isMounted = false; };
  }, [token, navigate, reportData]);

  if (!token) return null;

  if (loading || !reportData) {
    if (error) {
      return (
        <div style={{ paddingTop: '80px', textAlign: 'center', color: '#ff3d5a' }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--bg-secondary)', color: '#fff', borderRadius: '8px' }}>Go Back</button>
        </div>
      );
    }
    return <DolphinLoader tokenName={token.name || 'Token'} onComplete={() => {}} />;
  }

  return (
    <ReportView data={reportData} onBack={() => navigate(-1)} />
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <TopNav />
        <div style={{ height: '52px' }} /> {/* Spacer */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Home />} />
          <Route path="/listings" element={<NewListings />} />
          <Route path="/report/:id" element={<ReportPageWrapper />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
