import type { ReactNode } from 'react';
import { cn } from './cn';

export interface TabBarItemData {
  key: string;
  label: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  badge?: number;
}

interface TabBarProps {
  items: TabBarItemData[];
  activeKey: string;
  onChange: (key: string) => void;
  onPrefetch?: (key: string) => void;
  className?: string;
}

export default function TabBar({ items, activeKey, onChange, onPrefetch, className }: TabBarProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-[#F2F2F7]/95 pb-[max(env(safe-area-inset-bottom),8px)] pt-1 backdrop-blur-xl dark:border-gray-800 dark:bg-black/95',
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
                className="flex min-h-[44px] w-full flex-col items-center justify-center gap-1 py-1.5"
                aria-current={active ? 'page' : undefined}
              >
                <span className={cn(active ? 'text-[#0A84FF]' : 'text-[#8E8E93]')}>{active && item.activeIcon ? item.activeIcon : item.icon}</span>
                <span className={cn('text-[10px]', active ? 'font-semibold text-[#0A84FF]' : 'text-[#8E8E93]')}>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute right-3 top-1 rounded-full bg-[#FF453A] px-1.5 text-[10px] font-semibold text-white">
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
