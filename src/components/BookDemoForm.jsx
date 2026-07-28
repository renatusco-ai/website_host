import { useState } from 'react';
import MagneticButton from './MagneticButton';
import { useBooking } from '../context/BookingContext';

const INTENT_LABELS = {
  scoping: 'Free AI & Ops Diagnostic',
  strategy: 'Operations & AI Optimization Audit',
  general: 'General enquiry',
};

export default function BookDemoForm({ defaultIntent = 'general' }) {
  const { openBooking } = useBooking();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    intent: defaultIntent,
    message: '',
    spend: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.intent === 'scoping') {
      openBooking('discovery');
      return;
    }

    if (formData.intent === 'strategy') {
      openBooking('audit');
      return;
    }

    const intentLabel = INTENT_LABELS[formData.intent] || INTENT_LABELS.general;
    const subject = encodeURIComponent(`${intentLabel} — ${formData.name}`);
    const body = encodeURIComponent(
      `Enquiry: ${intentLabel}\n` +
        `Name: ${formData.name}\n` +
        `Phone: ${formData.phone}\n` +
        `Email: ${formData.email}\n` +
        `Business website: ${formData.website}\n` +
        `Rough cost of this problem: ${formData.spend || 'Not shared'}\n\n` +
        `What they need help with:\n${formData.message}`
    );
    window.location.href = `mailto:hello@renatus.ai?subject=${subject}&body=${body}`;
  };

  const inputWrapperClasses = "relative group";
  const inputClasses =
    'w-full bg-transparent border-b border-mist px-0 py-4 text-ink text-sm font-[var(--font-body)] placeholder:text-sage/60 focus:outline-none transition-colors duration-300 relative z-10';

  const submitLabel =
    formData.intent === 'scoping'
      ? 'Book Free AI & Ops Diagnostic'
      : formData.intent === 'strategy'
      ? 'Book Operations & AI Optimization Audit'
      : 'Send Request';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className={inputWrapperClasses}>
        <label className="label-upper block mb-1" htmlFor="intent">
          What are you looking for?
        </label>
        <select
          id="intent"
          name="intent"
          value={formData.intent}
          onChange={handleChange}
          className={`${inputClasses} appearance-none cursor-pointer`}
        >
          <option value="general">Not sure — general enquiry</option>
          <option value="scoping">Free AI & Ops Diagnostic (intro session)</option>
          <option value="strategy">Operations & AI Optimization Audit (60 min, paid)</option>
        </select>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-focus-within:w-full z-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={inputWrapperClasses}>
          <label className="label-upper block mb-1" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your full name"
            className={inputClasses}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-focus-within:w-full z-20" />
        </div>
        <div className={inputWrapperClasses}>
          <label className="label-upper block mb-1" htmlFor="phone">
            Phone number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="For the call itself"
            className={inputClasses}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-focus-within:w-full z-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={inputWrapperClasses}>
          <label className="label-upper block mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@company.com"
            className={inputClasses}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-focus-within:w-full z-20" />
        </div>
        <div className={inputWrapperClasses}>
          <label className="label-upper block mb-1" htmlFor="website">
            Business website
          </label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            required
            placeholder="yourbusiness.com"
            className={inputClasses}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-focus-within:w-full z-20" />
        </div>
      </div>

      <div className={inputWrapperClasses}>
        <label className="label-upper block mb-1" htmlFor="message">
          What are you looking for help with?
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          required
          placeholder="Tell us what's broken, slow, or manual right now..."
          className={`${inputClasses} resize-none`}
        />
        <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-focus-within:w-full z-20" />
      </div>

      <div className={inputWrapperClasses}>
        <label className="label-upper block mb-1" htmlFor="spend">
          Roughly, what&rsquo;s this problem costing you? <span className="text-sage/60 normal-case">(optional)</span>
        </label>
        <select
          id="spend"
          name="spend"
          value={formData.spend}
          onChange={handleChange}
          className={`${inputClasses} appearance-none cursor-pointer`}
        >
          <option value="">Prefer not to say</option>
          <option value="$">$ — Minor annoyance</option>
          <option value="$$">$$ — Noticeable drag</option>
          <option value="$$$">$$$ — Real money lost</option>
          <option value="$$$$">$$$$ — Significant impact</option>
        </select>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-focus-within:w-full z-20" />
      </div>

      <MagneticButton>
        <button type="submit" className="btn-gold w-full md:w-auto justify-center">
          {submitLabel}
        </button>
      </MagneticButton>
    </form>
  );
}
