import MagneticButton from './MagneticButton';
import { useBooking } from '../context/BookingContext';

export default function BookDiscoveryButton({
  className = 'btn-primary',
  children = 'Book Free Diagnostic',
  bookingType = 'discovery',
  ...props
}) {
  const { openBooking } = useBooking();

  return (
    <MagneticButton>
      <button
        type="button"
        className={className}
        onClick={() => openBooking(bookingType)}
        {...props}
      >
        {children}
      </button>
    </MagneticButton>
  );
}
