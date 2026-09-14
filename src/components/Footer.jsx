import { Link } from 'react-router-dom';
import { CONTACT_EMAIL } from '../data/content';

export default function Footer() {
  return (
    <footer className="relative z-0 bg-forest text-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div>
            <span className="heading-display text-3xl text-cream">
              Renatus<span className="text-gold-soft">.</span>
            </span>
            <p className="mt-4 text-cream/60 text-sm leading-relaxed max-w-xs">
              AI education and business data restructuring. We help you understand
              AI, then put it to work, with solutions, not just tools.
            </p>
          </div>

          <div>
            <span className="label-upper block mb-6 text-cream/50">Navigate</span>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-cream/70 text-sm hover:text-gold-soft transition-colors">Home</Link>
              <Link to="/services" className="text-cream/70 text-sm hover:text-gold-soft transition-colors">Services</Link>
              <Link to="/portfolio" className="text-cream/70 text-sm hover:text-gold-soft transition-colors">Portfolio</Link>
              <Link to="/workshops" className="text-cream/70 text-sm hover:text-gold-soft transition-colors">Workshops</Link>
              <Link to="/contact" className="text-cream/70 text-sm hover:text-gold-soft transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <span className="label-upper block mb-6 text-cream/50">Get in Touch</span>
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-cream/70 text-sm hover:text-gold-soft transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
              <Link to="/workshops" className="text-gold-soft text-sm hover:text-cream transition-colors">
                Company workshops &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/50 text-xs">
            &copy; {new Date().getFullYear()} Renatus. All rights reserved.
          </p>
          <p className="text-cream/30 text-xs tracking-widest uppercase">
            Understand AI. Then put it to work.
          </p>
        </div>
      </div>
    </footer>
  );
}
