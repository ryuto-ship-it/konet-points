import { useEffect } from 'react';
import HeroSection from '../components/Landing/HeroSection';
import HowItWorks from '../components/Landing/HowItWorks';
import Features from '../components/Landing/Features';
import ReportPreview from '../components/Landing/ReportPreview';
import NewListingsPreview from '../components/Landing/NewListingsPreview';
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
    <div style={{ background: '#0a0b0f', minHeight: '100vh', color: '#fff' }}>
      <HeroSection />
      <HowItWorks />
      <Features />
      <ReportPreview />
      <NewListingsPreview />
      <CTASection />
      <Footer />
    </div>
  );
}
