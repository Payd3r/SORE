import { cn } from '../../../components/ui/cn';
import MaterialIcon from './MaterialIcon';

interface SearchBarProps {
  /** Placeholder */
  placeholder?: string;
  /** Valore controllato */
  value?: string;
  /** Handler cambio valore */
  onChange?: (value: string) => void;
  /** Handler click icona filtro (tune) */
  onFilterClick?: () => void;
  /** Disabilitato */
  disabled?: boolean;
  /** Classe aggiuntiva */
  className?: string;
}

/**
 * SearchBar mobile con Material Symbols (search, tune).
 * Stile mockup: sfondo input da design system, rounded-[1.25rem], tune apre bottom sheet filtri.
 */
export default function SearchBar({
  placeholder = 'Search memories, places...',
  value = '',
  onChange,
  onFilterClick,
  disabled = false,
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        'flex min-h-[44px] w-full items-center gap-2 rounded-[1.25rem] border px-4 py-3 shadow-sm',
        'border-[var(--border-default)] bg-[var(--bg-input)]',
        'transition-colors duration-150',
        'focus-within:border-[var(--border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      <MaterialIcon name="search" size={20} className="shrink-0 text-[var(--text-tertiary)]" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'min-w-0 flex-1 border-0 bg-transparent text-[14px] text-[var(--text-primary)]',
          'placeholder:text-[var(--text-tertiary)]',
          'focus:outline-none focus:ring-0'
        )}
        style={{ fontSize: '16px' }}
        aria-label={placeholder}
      />
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          aria-label="Filtri"
        >
          <MaterialIcon name="tune" size={20} />
        </button>
      )}
    </div>
  );
}
