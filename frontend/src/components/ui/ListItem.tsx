import type { ReactNode } from 'react';
import { cn } from './cn';

interface ListItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ListItem({ title, subtitle, right, onClick, className }: ListItemProps) {
  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      onClick={onClick}
      className={cn(
        'flex w-full items-start justify-between gap-3 rounded-ios-lg bg-gray-50 p-4 text-left dark:bg-gray-800/60',
        onClick ? 'transition hover:bg-gray-100 active:scale-[0.995] dark:hover:bg-gray-800' : '',
        className
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </Comp>
  );
}
