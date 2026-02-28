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
  items: FixedBottomBarItemData[];
  activeKey: string;
  onChange: (key: string) => void;
  onPrefetch?: (key: string) => void;
  className?: string;
}

/**
 * Bottom navigation bar mobile con design system: primario arancione, badge accent-pink.
 * 5 icone con etichette, icona attiva con colore primario e linea sottile.
 */
export default function FixedBottomBar({
  items,
  activeKey,
  onChange,
  onPrefetch,
  className,
}: FixedBottomBarProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'rounded-t-card border-t border-[var(--border-default)]',
        'bg-[var(--bg-card)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]',
        'dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]',
        'pb-[max(env(safe-area-inset-bottom),8px)] pt-2',
        className
      )}
      aria-label="Navigazione mobile"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = activeKey === item.key;
          return (
            <li key={item.key} className="relative">
              <button
                type="button"
                onClick={() => onChange(item.key)}
                onMouseEnter={() => onPrefetch?.(item.key)}
                onTouchStart={() => onPrefetch?.(item.key)}
                className={cn(
                  'flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 py-1.5',
                  'transition-colors duration-[var(--duration-fast)]',
                  'active:opacity-90 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'transition-colors duration-[var(--duration-fast)]',
                    active ? 'text-[var(--color-primary)]' : 'text-[var(--text-tertiary)]'
                  )}
                >
                  {active && item.activeIcon ? item.activeIcon : item.icon}
                </span>
                <span
                  className={cn(
                    'text-[10px] transition-colors duration-[var(--duration-fast)]',
                    active ? 'font-semibold text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-0.5' : 'text-[var(--text-tertiary)]'
                  )}
                >
                  {item.label}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span
                    className="absolute right-2 top-1 min-w-[18px] rounded-full bg-[var(--color-accent-pink)] px-1.5 py-0.5 text-center text-[10px] font-semibold text-white"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
