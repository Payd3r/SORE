import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../components/ui/cn';

interface MobilePageWrapperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Usa sfondo accent (azzurro pastello) invece di page */
  accentBg?: boolean;
}

/**
 * Wrapper per pagine mobile con padding, safe-area e sfondo coerente con il design system.
 */
export default function MobilePageWrapper({
  children,
  accentBg = false,
  className,
  ...rest
}: MobilePageWrapperProps) {
  return (
    <div
      className={cn(
        'min-h-full w-full py-4',
        'pl-[max(2rem,env(safe-area-inset-left))]',
        'pr-[max(2rem,env(safe-area-inset-right))]',
        'pt-[max(1rem,env(safe-area-inset-top))]',
        'pb-[max(1rem,env(safe-area-inset-bottom))]',
        accentBg ? 'bg-[var(--bg-page-accent)]' : 'bg-[var(--bg-page)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
