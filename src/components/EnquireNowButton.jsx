import MagneticButton from './MagneticButton';
import { useEnquiry } from '../context/EnquiryContext';

const INTENT_FROM_PRESET = {
  default: 'general',
  diagnostic: 'scoping',
};

export default function EnquireNowButton({
  className = 'btn-primary',
  children = 'Enquire Now',
  inquire = 'default',
  ...props
}) {
  const { openEnquiry } = useEnquiry();
  const intent = INTENT_FROM_PRESET[inquire] ?? 'general';

  const { onClick, ...rest } = props;

  return (
    <MagneticButton>
      <button
        type="button"
        className={className}
        onClick={(event) => {
          onClick?.(event);
          openEnquiry(intent);
        }}
        {...rest}
      >
        {children}
      </button>
    </MagneticButton>
  );
}
