import type { ReactNode } from 'react';
import MaterialIcon from '../ui/MaterialIcon';

interface SeeAllButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export default function SeeAllButton({ children, onClick }: SeeAllButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-semibold text-[var(--color-link)] transition-colors hover:text-[var(--color-link-hover)] focus:outline-none focus-visible:underline"
    >
      {children}
      <MaterialIcon name="chevron_right" size={18} />
    </button>
  );
}
