import type { ReactNode } from 'react';
import { cn } from '../../../components/ui/cn';
import MaterialIcon from '../ui/MaterialIcon';

interface SettingsMenuRowProps {
  /** Icona in cerchio colorato */
  icon: ReactNode;
  /** Classe per lo sfondo del cerchio (es. bg-blue-500/15) */
  iconBgClass?: string;
  /** Etichetta */
  label: string;
  /** Azione a destra: chevron, toggle, ecc. */
  action?: ReactNode;
  /** Click sulla riga (se non c'è action come toggle) */
  onClick?: () => void;
  /** Mostra bordo inferiore */
  withDivider?: boolean;
}

export default function SettingsMenuRow({
  icon,
  iconBgClass = 'bg-[var(--color-primary)]/15',
  label,
  action,
  onClick,
  withDivider = false,
}: SettingsMenuRowProps) {
  const content = (
    <>
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', iconBgClass)}>
        {icon}
      </div>
      <span className="flex-1 truncate text-left text-sm font-semibold text-inherit">
        {label}
      </span>
      <div className="flex shrink-0 items-center">
        {action ?? <MaterialIcon name="chevron_right" size={20} className="text-[var(--text-tertiary)]" />}
      </div>
    </>
  );

  const baseClass = cn(
    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
    'bg-[var(--bg-card)] text-[var(--text-primary)]',
    'active:opacity-90',
    withDivider && 'border-b border-[var(--border-default)]'
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(baseClass, 'hover:bg-[var(--bg-input)] active:bg-[var(--bg-secondary)]')}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={baseClass}>
      {content}
    </div>
  );
}
