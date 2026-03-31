import { useState } from 'react';
import MagneticButton from './MagneticButton';

export default function BookDemoForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Demo Request from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:hello@renatus.ai?subject=${subject}&body=${body}`;
  };

  const inputWrapperClasses = "relative group";
  const inputClasses =
    'w-full bg-transparent border-b border-marble/10 px-0 py-4 text-marble text-sm font-[var(--font-body)] placeholder:text-stone/40 focus:outline-none transition-colors duration-300 relative z-10';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
      </div>

      <div className={inputWrapperClasses}>
        <label className="label-upper block mb-1" htmlFor="company">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Your organisation"
          className={inputClasses}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-focus-within:w-full z-20" />
      </div>

      <div className={inputWrapperClasses}>
        <label className="label-upper block mb-1" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about your operations and what you'd like to automate..."
          className={`${inputClasses} resize-none`}
        />
        <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-focus-within:w-full z-20" />
      </div>

      <MagneticButton>
        <button type="submit" className="btn-gold w-full md:w-auto justify-center">
          Send Request
        </button>
      </MagneticButton>
    </form>
  );
}
