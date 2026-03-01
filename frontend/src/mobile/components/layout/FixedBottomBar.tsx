import type { ReactNode } from 'react';
import { cn } from '../../../components/ui/cn';

export interface FixedBottomBarItemData {
  key: string;
  label: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  badge?: number;
}

interface FixedBottomBarProps {
  /** Contenuto della barra (bottoni "Salva", "Vedi tutto", ecc.) */
  children: ReactNode;
  className?: string;
}

/**
 * Barra azioni fissa in basso (es. Salva, Vedi tutto).
 * Posizionata sopra la tab bar (DownBar); usa token del design system.
 * Safe area e padding coerenti con REGOLE-DESIGN-PWA.
 */
export default function FixedBottomBar({ children, className }: FixedBottomBarProps) {
  return (
    <div
      className={cn(
        'fixed-bottom-bar fixed-bottom-bar--actions fixed left-0 right-0 z-40',
        'bg-[var(--bg-card)] border-t border-[var(--border-default)]',
        'px-6 py-3 shadow-[var(--shadow-md)]',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        className
      )}
      role="group"
      aria-label="Azioni"
    >
      <div className="mx-auto flex max-w-md items-center justify-end gap-3">
        {children}
      </div>
    </div>
  );
}
