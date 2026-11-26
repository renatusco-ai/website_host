import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import Layout from './components/Layout';
import StandaloneLayout from './components/StandaloneLayout';
import PageMeta from './components/PageMeta';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Workshops from './pages/Workshops';
import Portfolio from './pages/Portfolio';
import LockeroomCaseStudy from './pages/LockeroomCaseStudy';
import WhyCustom from './pages/WhyCustom';
import About from './pages/About';
import AppStoreIntake from './pages/AppStoreIntake';

function MarketingLayout() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <div key={location.pathname}>
          <Outlet />
        </div>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname} />
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const isStandalone = normalizedPath === '/app-store-intake';

  const routes = (
    <Routes location={location}>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/lockeroom" element={<LockeroomCaseStudy />} />
        <Route path="/learn-more" element={<WhyCustom />} />
        <Route path="/workshops" element={<Workshops />} />
        <Route path="/work" element={<Navigate to="/portfolio" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route
        path="/app-store-intake"
        element={
          <StandaloneLayout>
            <AppStoreIntake />
          </StandaloneLayout>
        }
      />
    </Routes>
  );

  if (isStandalone) {
    return (
      <>
        <ScrollToTop />
        <PageMeta />
        {routes}
      </>
    );
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothTouch: false }}>
      <ScrollToTop />
      <PageMeta />
      <div className="grain-overlay" aria-hidden="true" />
      {routes}
    </ReactLenis>
  );
}
