import Navbar from './Navbar';
import Footer from './Footer';
import MobileEnquireBar from './MobileEnquireBar';
import { EnquiryProvider } from '../context/EnquiryContext';

export default function Layout({ children }) {
  return (
    <EnquiryProvider>
      <div className="min-h-screen flex flex-col bg-canvas">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 z-10 relative bg-canvas">
          {children}
        </main>
        <Footer />
        <MobileEnquireBar />
      </div>
    </EnquiryProvider>
  );
}
