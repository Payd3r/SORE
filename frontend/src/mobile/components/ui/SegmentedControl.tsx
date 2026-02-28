import { cn } from '../../../components/ui/cn';

export interface SegmentedOption<T extends string = string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string = string> {
  /** Opzioni (es. Ricordi, Idee) */
  options: SegmentedOption<T>[];
  /** Valore attivo */
  value: T;
  /** Callback cambio valore */
  onChange: (value: T) => void;
  /** Classe aggiuntiva */
  className?: string;
}

/**
 * SegmentedControl mobile con pills: attivo usa primario, inattivo testo secondario.
 * Contenitore: sfondo var(--bg-input).
 */
export default function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex w-full gap-1 rounded-xl rounded-input p-1',
        'bg-[var(--bg-input)]',
        className
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(opt.key)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg py-2 px-3 text-sm font-medium',
              'transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]',
              'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
              isActive
                ? 'bg-[var(--color-primary)] text-[var(--text-inverse)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
