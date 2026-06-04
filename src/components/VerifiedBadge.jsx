import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

function formatReviewerName(reviewerName) {
  if (!reviewerName) return 'SafeMed Reviewer';
  if (reviewerName.includes('@')) {
    const localPart = reviewerName.split('@')[0];
    return localPart
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return reviewerName;
}

export default function VerifiedBadge({ remedy, size = 'md' }) {
  const { t } = useTranslation();

  if (!remedy || remedy.status !== 'published') {
    return null;
  }

  const reviewer = formatReviewerName(remedy.reviewer_name);
  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2.5 py-1'
      : 'text-sm px-3 py-1.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-800 font-medium border border-green-200 ${sizeClasses}`}
      title={t('remedy.verifiedOn')}
    >
      <Check size={14} aria-hidden />
      <span>{t('remedy.verifiedBy', { name: reviewer })}</span>
    </span>
  );
}
