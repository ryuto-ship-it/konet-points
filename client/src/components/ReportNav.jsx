import { LayoutDashboard, Shield, TrendingUp, Users, Link as LinkIcon, Building2, AlertTriangle, Radio, Scale } from 'lucide-react';
import './ReportNav.css';

const SECTIONS = [
  { id: 'overview',  label: 'Overview',    icon: LayoutDashboard },
  { id: 'security',  label: 'Security',    icon: Shield },
  { id: 'market',    label: 'Market',      icon: TrendingUp },
  { id: 'community', label: 'Community',   icon: Users },
  { id: 'onchain',   label: 'On-chain',    icon: LinkIcon },
  { id: 'listing',   label: 'Listing',     icon: Building2 },
  { id: 'risk',      label: 'Risk',        icon: AlertTriangle },
  { id: 'pulse',     label: 'Pulse Feed',  icon: Radio },
];

export default function ReportNav({ activeSection, onNavigate }) {
  return (
    <nav className="report-nav">
      <div className="nav-header">
        <span className="nav-label">REPORT SECTIONS</span>
      </div>

      <div className="nav-list">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(sec.id)}
            >
              <Icon size={18} className="nav-icon" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      <div className="nav-footer">
        <div className="nav-divider" />
        <span className="nav-brand">🐬 Dorphin Research</span>
        <span className="nav-tagline">Dive deeper. Surface smarter.</span>
      </div>
    </nav>
  );
}
