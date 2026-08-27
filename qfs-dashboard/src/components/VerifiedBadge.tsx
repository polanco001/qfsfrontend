import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function VerifiedBadge({ size = 16, className = '', showText = true }: VerifiedBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-blue-500 ${className}`}>
      <BadgeCheck size={size} />
      {showText && <span className="text-xs font-semibold">Verified</span>}
    </span>
  );
}