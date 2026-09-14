import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Workshops from './pages/Workshops';
import Portfolio from './pages/Portfolio';
import LockeroomCaseStudy from './pages/LockeroomCaseStudy';

export default function App() {
  const location = useLocation();

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothTouch: false }}>
      <ScrollToTop />
      <div className="grain-overlay" aria-hidden="true" />
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/lockeroom" element={<LockeroomCaseStudy />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/work" element={<Navigate to="/portfolio" replace />} />
            <Route path="/about" element={<Navigate to="/workshops" replace />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} />
        </AnimatePresence>
      </Layout>
    </ReactLenis>
  );
}
