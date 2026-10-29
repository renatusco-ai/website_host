import { LOCKEROOM_CASE, LOCKEROOM_SAVING_SPLIT } from '../data/content';

const money = (value) =>
  value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  });

const RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SavingBreakdown() {
  const removed = LOCKEROOM_SAVING_SPLIT.reduce((sum, slice) => sum + slice.amount, 0);
  let travelled = 0;

  const summary = LOCKEROOM_SAVING_SPLIT.map(
    (slice) => `${slice.label} ${money(slice.amount)}`,
  ).join(', ');

  return (
    <figure className="saving-pie">
      <div className="saving-pie__chart">
        <svg viewBox="0 0 200 200" role="img" aria-label={summary}>
          <g transform="rotate(-90 100 100)">
            {LOCKEROOM_SAVING_SPLIT.map((slice) => {
              const length = (slice.amount / removed) * CIRCUMFERENCE;
              const ring = (
                <circle
                  key={slice.id}
                  cx="100"
                  cy="100"
                  r={RADIUS}
                  fill="none"
                  className={`saving-pie__slice saving-pie__slice--${slice.color}`}
                  strokeWidth="26"
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-travelled}
                />
              );
              travelled += length;
              return ring;
            })}
          </g>
        </svg>
        <p className="saving-pie__total">
          <strong className="heading-display">{LOCKEROOM_CASE.headline.value}</strong>
          <span>net every year</span>
        </p>
      </div>

      <ul className="saving-pie__legend">
        {LOCKEROOM_SAVING_SPLIT.map((slice) => (
          <li key={slice.id}>
            <span className={`saving-pie__swatch saving-pie__swatch--${slice.color}`} aria-hidden="true" />
            <span>
              <strong>{money(slice.amount)}</strong>
              {slice.label}
            </span>
          </li>
        ))}
      </ul>

      <figcaption>
        {money(removed)} removed. {money(LOCKEROOM_CASE.newCosts.annual)} a year runs the replacement.
      </figcaption>
    </figure>
  );
}
