import HeroSection from '../components/Landing/HeroSection';
import ProcessSection from '../components/Landing/ProcessSection';
import CTASection from '../components/Landing/CTASection';
import Footer from '../components/Landing/Footer';

export default function Home() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      <HeroSection />
      <ProcessSection />
      <CTASection />
      <Footer />
    </div>
  );
}
