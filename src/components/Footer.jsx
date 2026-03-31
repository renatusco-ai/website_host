import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-marble/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <span className="heading-display text-3xl text-marble">RENATUS</span>
            <p className="mt-4 text-stone text-sm leading-relaxed max-w-xs">
              Your brand reborn through AI automation. Transforming operations
              into intelligent, self-optimising systems.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <span className="label-upper block mb-6">Navigate</span>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-stone text-sm hover:text-gold transition-colors">Home</Link>
              <Link to="/about" className="text-stone text-sm hover:text-gold transition-colors">About</Link>
              <Link to="/services" className="text-stone text-sm hover:text-gold transition-colors">Services</Link>
              <Link to="/contact" className="text-stone text-sm hover:text-gold transition-colors">Contact</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <span className="label-upper block mb-6">Get in Touch</span>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:hello@renatus.ai"
                className="text-stone text-sm hover:text-gold transition-colors"
              >
                hello@renatus.ai
              </a>
              <Link to="/contact" className="text-gold text-sm hover:text-marble transition-colors">
                Book a Demo &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-marble/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone/50 text-xs">
            &copy; {new Date().getFullYear()} Renatus. All rights reserved.
          </p>
          <p className="text-stone/30 text-xs tracking-widest uppercase">
            Reborn through AI
          </p>
        </div>
      </div>
    </footer>
  );
}
