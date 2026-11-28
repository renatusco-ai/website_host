import { CONTACT_EMAIL, GOOGLE_BOOKING_URL } from '../data/content';
import TodoMark from './TodoMark';

export default function BookingLink() {
  if (GOOGLE_BOOKING_URL) {
    return (
      <a className="btn-primary" href={GOOGLE_BOOKING_URL} target="_blank" rel="noreferrer">
        Book a time
      </a>
    );
  }

  return (
    <p className="booking-pending">
      Booking link coming soon - email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      {/* TODO(shaun): paste the Google Calendar appointment-schedule URL into GOOGLE_BOOKING_URL. */}
      <TodoMark>paste Shaun&apos;s Google Calendar appointment-schedule link into GOOGLE_BOOKING_URL</TodoMark>
    </p>
  );
}
