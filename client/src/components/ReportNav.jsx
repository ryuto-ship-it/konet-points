
import './ReportNav.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'market', label: 'Market', icon: '📈' },
  { id: 'community', label: 'Community', icon: '👥' },
  { id: 'onchain', label: 'On-chain', icon: '⛓' },
  { id: 'listing', label: 'Listing', icon: '🏛' },
  { id: 'risk', label: 'Risk', icon: '⚠' }
];

export default function ReportNav({ activeTab, onTabClick }) {
  return (
    <nav className="report-nav">
      <ul className="nav-list">
        {TABS.map(tab => (
          <li key={tab.id}>
            <button
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabClick(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
