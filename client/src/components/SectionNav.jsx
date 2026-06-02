import './SectionNav.css';

const SECTION_ICONS = {
  'basic-info': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  'onchain-data': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  'utility-analysis': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  'risk-indicators': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  'overall-assessment': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

export default function SectionNav({ sections, activeSection, onNavigate }) {
  return (
    <nav className="section-nav">
      <div className="nav-label caption">Report Sections</div>
      <ul className="nav-list">
        {sections.map((section, i) => (
          <li key={section.id}>
            <button
              className={`nav-item ${activeSection === section.id ? 'nav-item--active' : ''}`}
              onClick={() => onNavigate(section.id)}
            >
              <span className="nav-indicator" />
              <span className="nav-icon">
                {SECTION_ICONS[section.id]}
              </span>
              <div className="nav-text">
                <span className="nav-text-ko">{section.label}</span>
                <span className="nav-text-en">{section.labelEn}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="nav-footer">
        <div className="nav-branding">
          <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
            <path d="M22 18h12c8.8 0 16 7.2 16 16s-7.2 16-16 16H22V18zm5 5v22h7c6 0 11-5 11-11s-5-11-11-11h-7z" fill="var(--accent-cyan)" opacity="0.5" />
          </svg>
          <span>Dorphin Research</span>
        </div>
      </div>
    </nav>
  );
}
