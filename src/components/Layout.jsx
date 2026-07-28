import Navbar from './Navbar';
import Footer from './Footer';
import { BookingProvider } from '../context/BookingContext';

export default function Layout({ children }) {
  return (
    <BookingProvider>
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1 z-10 relative bg-cream">
          {children}
        </main>
        <Footer />
      </div>
    </BookingProvider>
  );
}
