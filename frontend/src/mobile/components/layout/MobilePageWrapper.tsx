import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../../components/ui/cn';

interface MobilePageWrapperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Usa sfondo accent (azzurro pastello) invece di page */
  accentBg?: boolean;
}

/**
 * Wrapper per pagine mobile con padding, safe-area e sfondo coerente con il design system.
 */
const MobilePageWrapper = forwardRef<HTMLDivElement, MobilePageWrapperProps>(function MobilePageWrapper(
  { children, accentBg = false, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'min-h-full w-full overflow-y-auto',
        'px-6 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]',
        'pt-[max(1rem,env(safe-area-inset-top))]',
        'pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom)))]',
        accentBg ? 'bg-[var(--bg-page-accent)]' : 'bg-[var(--bg-page)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export default MobilePageWrapper;
