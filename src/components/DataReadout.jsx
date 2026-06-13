export default function DataReadout({ label, value, className = '' }) {
  return (
    <div className={`data-readout ${className}`}>
      <span className="data-readout__label">{label}</span>
      <span className="data-readout__value">{value}</span>
    </div>
  );
}
