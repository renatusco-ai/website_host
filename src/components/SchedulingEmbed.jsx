export default function SchedulingEmbed({ title = 'Schedule a call' }) {
  return (
    <div className="scheduling-embed">
      <p className="label-upper mb-4">{title}</p>
      <div className="scheduling-embed__placeholder">
        <p className="text-ink text-sm mb-2">Scheduling embed placeholder</p>
        <p className="text-sage text-xs leading-relaxed">
          Connect your Calendly or Cal.com link here. Until then, use the form
          or email{' '}
          <a href="mailto:hello@renatus.ai" className="text-gold hover:text-forest transition-colors">
            hello@renatus.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}
