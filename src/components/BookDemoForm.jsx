import { useState } from 'react';
import MagneticButton from './MagneticButton';

function RequiredMark() {
  return (
    <span className="enquiry-required" aria-hidden="true">
      Required
    </span>
  );
}

export default function BookDemoForm({
  defaultIntent = 'general',
  idPrefix = '',
  onSubmitted,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    intent: defaultIntent,
    message: '',
    spend: '',
    website: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const fieldId = (name) => `${idPrefix}${name}`;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          website: formData.website ?? '',
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Could not send enquiry.');
      }

      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      setError(err.message || 'Could not send enquiry.');
    } finally {
      setSending(false);
    }
  };

  const submitLabel =
    formData.intent === 'scoping' ? 'Enquire: 15-min Diagnostic' : 'Send enquiry';

  if (submitted) {
    return (
      <div className="enquiry-form enquiry-form--sent">
        <p className="heading-display text-2xl text-ink mb-3">Enquiry sent.</p>
        <p className="text-graphite text-sm leading-relaxed">
          It is in our inbox. We will reply within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="enquiry-form" noValidate={false}>
      <p className="enquiry-form__banner">Enquiry form</p>

      <div className="enquiry-field">
        <label className="enquiry-field__label" htmlFor={fieldId('intent')}>
          What are you looking for?
        </label>
        <select
          id={fieldId('intent')}
          name="intent"
          value={formData.intent}
          onChange={handleChange}
          className="enquiry-field__control"
        >
          <option value="general">Not sure: general enquiry</option>
          <option value="scoping">Free AI & Ops Diagnostic (15 min)</option>
        </select>
      </div>

      <div className="enquiry-field">
        <label className="enquiry-field__label" htmlFor={fieldId('name')}>
          Name
        </label>
        <input
          type="text"
          id={fieldId('name')}
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="enquiry-field__control"
        />
      </div>

      <div className="enquiry-grid">
        <div className="enquiry-field">
          <label className="enquiry-field__label" htmlFor={fieldId('phone')}>
            Mobile <RequiredMark />
          </label>
          <input
            type="tel"
            id={fieldId('phone')}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            autoComplete="tel"
            placeholder="04xx xxx xxx"
            className="enquiry-field__control"
          />
        </div>
        <div className="enquiry-field">
          <label className="enquiry-field__label" htmlFor={fieldId('email')}>
            Email <RequiredMark />
          </label>
          <input
            type="email"
            id={fieldId('email')}
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="enquiry-field__control"
          />
        </div>
      </div>

      <div className="enquiry-field">
        <label className="enquiry-field__label" htmlFor={fieldId('company')}>
          Company <RequiredMark />
        </label>
        <input
          type="text"
          id={fieldId('company')}
          name="company"
          value={formData.company}
          onChange={handleChange}
          required
          autoComplete="organization"
          placeholder="Company name"
          className="enquiry-field__control"
        />
      </div>

      <div className="enquiry-field">
        <label className="enquiry-field__label" htmlFor={fieldId('message')}>
          What are you looking for help with?
        </label>
        <textarea
          id={fieldId('message')}
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us what's broken, slow, or manual right now..."
          className="enquiry-field__control enquiry-field__control--area"
        />
      </div>

      <div className="enquiry-field">
        <label className="enquiry-field__label" htmlFor={fieldId('spend')}>
          Roughly, what is this problem costing you?{' '}
          <span className="enquiry-optional">Optional</span>
        </label>
        <select
          id={fieldId('spend')}
          name="spend"
          value={formData.spend}
          onChange={handleChange}
          className="enquiry-field__control"
        >
          <option value="">Prefer not to say</option>
          <option value="$">$: Minor annoyance</option>
          <option value="$$">$$: Noticeable drag</option>
          <option value="$$$">$$$: Real money lost</option>
          <option value="$$$$">$$$$: Significant impact</option>
        </select>
      </div>

      <input
        type="text"
        name="website"
        value={formData.website ?? ''}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        className="enquiry-honeypot"
        aria-hidden="true"
      />

      {error && <p className="enquiry-error">{error}</p>}

      <MagneticButton>
        <button type="submit" className="btn-primary w-full justify-center" disabled={sending}>
          {sending ? 'Sending…' : submitLabel}
        </button>
      </MagneticButton>
    </form>
  );
}
