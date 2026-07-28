import { createContext, useCallback, useContext, useState } from 'react';
import BookingModal from '../components/BookingModal';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [bookingType, setBookingType] = useState('discovery');

  const openBooking = useCallback((type = 'discovery') => {
    setBookingType(type);
    setIsOpen(true);
  }, []);

  const closeBooking = useCallback(() => setIsOpen(false), []);

  return (
    <BookingContext.Provider value={{ isOpen, bookingType, openBooking, closeBooking }}>
      {children}
      <BookingModal isOpen={isOpen} bookingType={bookingType} onClose={closeBooking} />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}
