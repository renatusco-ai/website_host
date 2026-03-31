import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <main className="flex-1 z-10 relative bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
