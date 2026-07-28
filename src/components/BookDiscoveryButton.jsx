import MagneticButton from './MagneticButton';
import { useBooking } from '../context/BookingContext';

export default function BookDiscoveryButton({
  className = 'btn-gold',
  children = 'Book Free Diagnostic',
  ...props
}) {
  const { openBooking } = useBooking();

  return (
    <MagneticButton>
      <button type="button" className={className} onClick={openBooking} {...props}>
        {children}
      </button>
    </MagneticButton>
  );
}
