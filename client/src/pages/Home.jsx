import { useEffect } from 'react';
import HeroSection from '../components/Landing/HeroSection';
import TerminalShowcase from '../components/Landing/TerminalShowcase';
import SonarFeed from '../components/Landing/SonarFeed';
import ProcessSection from '../components/Landing/ProcessSection';
import CTASection from '../components/Landing/CTASection';
import Footer from '../components/Landing/Footer';

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.landing-section');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  return (
    <div style={{ background: 'var(--ocean-bg)', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <HeroSection />
      <TerminalShowcase />
      <ProcessSection />
      <SonarFeed />
      <CTASection />
      <Footer />
    </div>
  );
}
