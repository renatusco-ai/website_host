import Navbar from './Navbar';
import Footer from './Footer';
import { EnquiryProvider } from '../context/EnquiryContext';

export default function Layout({ children }) {
  return (
    <EnquiryProvider>
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1 z-10 relative bg-cream">
          {children}
        </main>
        <Footer />
      </div>
    </EnquiryProvider>
  );
}
