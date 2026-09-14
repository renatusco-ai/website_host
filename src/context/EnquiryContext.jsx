import { createContext, useCallback, useContext, useState } from 'react';
import EnquiryModal from '../components/EnquiryModal';

const EnquiryContext = createContext(null);

export function EnquiryProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState('general');

  const openEnquiry = useCallback((nextIntent = 'general') => {
    setIntent(nextIntent);
    setIsOpen(true);
  }, []);

  const closeEnquiry = useCallback(() => setIsOpen(false), []);

  return (
    <EnquiryContext.Provider value={{ isOpen, intent, openEnquiry, closeEnquiry }}>
      {children}
      <EnquiryModal isOpen={isOpen} intent={intent} onClose={closeEnquiry} />
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error('useEnquiry must be used within EnquiryProvider');
  }
  return context;
}
