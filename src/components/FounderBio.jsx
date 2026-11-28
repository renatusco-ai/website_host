import { Link } from 'react-router-dom';
import { FOUNDER_BIO } from '../data/content';

export default function FounderBio() {
  return FOUNDER_BIO.map((part, index) =>
    typeof part === 'string' ? (
      <span key={index}>{part}</span>
    ) : (
      <Link key={`${part.href}-${index}`} to={part.href} className="about-bio-link">
        {part.text}
      </Link>
    ),
  );
}
