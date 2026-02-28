import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5';
import { cn } from '../../../components/ui/cn';

interface SearchBarProps {
  /** Placeholder */
  placeholder?: string;
  /** Valore controllato */
  value?: string;
  /** Handler cambio valore */
  onChange?: (value: string) => void;
  /** Handler click icona filtro */
  onFilterClick?: () => void;
  /** Disabilitato */
  disabled?: boolean;
  /** Classe aggiuntiva */
  className?: string;
}

/**
 * SearchBar mobile con icona lente e icona filtro.
 * Sfondo var(--bg-card), bordo var(--border-default), placeholder var(--text-tertiary).
 */
export default function SearchBar({
  placeholder = 'Cerca...',
  value = '',
  onChange,
  onFilterClick,
  disabled = false,
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        'flex h-11 min-h-[44px] w-full items-center gap-2',
        'rounded-input',
        'bg-[var(--bg-card)] border border-[var(--border-default)]',
        'transition-colors duration-150',
        'focus-within:border-[var(--border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <span className="ml-3 shrink-0 text-[var(--text-tertiary)]" aria-hidden>
        <IoSearchOutline className="h-5 w-5" />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex-1 min-w-0 border-0 bg-transparent text-[15px] text-[var(--text-primary)]',
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
          className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] active:opacity-80 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          aria-label="Filtri"
        >
          <IoFilterOutline className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
