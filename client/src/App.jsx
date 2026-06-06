import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import AppPage from './pages/AppPage';
import DolphinLoader from './components/DolphinLoader';
import ReportView from './components/ReportView';
import NewListings from './pages/NewListings';
import { getReport } from './api/client';
import WalletButton from './components/WalletButton';
import WalletModal from './components/WalletModal';
import './App.css';

/* ── App Navigation (shown on /app, /listings, /report pages) ── */
function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isApp = location.pathname === '/app' || location.pathname.startsWith('/report');
  const isListings = location.pathname === '/listings';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', height: '48px',
      background: 'rgba(11,13,17,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span
          style={{
            fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.12em', color: 'var(--text-primary)',
            cursor: 'pointer', textTransform: 'uppercase',
          }}
          onClick={() => navigate('/')}
        >
          🐬 DORPHIN
        </span>

        {[
          { path: '/app',      label: 'Token Analysis' },
          { path: '/listings', label: 'New Listings' },
        ].map(tab => {
          const active = (tab.path === '/app' && isApp) || (tab.path === '/listings' && isListings);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                padding: '5px 12px', borderRadius: '6px',
                background: active ? 'var(--accent-dim)' : 'transparent',
                border: active ? '1px solid rgba(59,158,191,0.2)' : '1px solid transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: active ? 500 : 400,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <WalletButton />
      <WalletModal />
    </div>
  );
}

/* ── Report Page Wrapper ── */
function ReportPageWrapper() {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  useEffect(() => {
    let isMounted = true;
    if (!token) { navigate('/app'); return; }

    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await getReport(token.id, token.address, token.chain);
        if (isMounted) setReportData(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to generate report.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!reportData) fetchReport();
    return () => { isMounted = false; };
  }, [token, navigate, reportData]);

  if (!token) return null;

  if (loading || !reportData) {
    if (error) {
      return (
        <div style={{ paddingTop: '80px', textAlign: 'center', color: 'var(--danger)' }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} style={{
            marginTop: '20px', padding: '10px 20px',
            background: 'var(--bg-surface)', color: '#fff', borderRadius: '8px',
            border: '1px solid var(--border)',
          }}>Go Back</button>
        </div>
      );
    }
    return <DolphinLoader tokenName={token.name || 'Token'} onComplete={() => {}} />;
  }

  return <ReportView data={reportData} onBack={() => navigate(-1)} />;
}

/* ── Layout wrapper for app pages (with nav) ── */
function AppLayout({ children }) {
  return (
    <>
      <AppNav />
      <div style={{ height: '48px' }} />
      {children}
    </>
  );
}

/* ── Main App ── */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — no nav */}
        <Route path="/" element={<Landing />} />

        {/* App pages — with nav */}
        <Route path="/app" element={<AppLayout><AppPage /></AppLayout>} />
        <Route path="/listings" element={<AppLayout><NewListings /></AppLayout>} />
        <Route path="/report/:id" element={<AppLayout><ReportPageWrapper /></AppLayout>} />

        {/* Legacy routes redirect */}
        <Route path="/analyze" element={<AppLayout><AppPage /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
