import { cn } from '../../../components/ui/cn';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

/**
 * Toggle switch stile iOS: pill-shaped track, thumb bianco con ombra leggera.
 * Proporzioni: track 51x31px, thumb 27x27px, padding 2px.
 */
export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  className,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 p-0 !min-h-0 !min-w-0 !py-0',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !disabled && 'active:opacity-95',
        className
      )}
    >
      <span
        className={cn(
          'absolute h-[31px] w-[51px] rounded-full',
          checked ? 'bg-[var(--toggle-track-on)]' : 'bg-[var(--toggle-track-off)]'
        )}
      />
      <span
        className={cn(
          'absolute h-[27px] w-[27px] rounded-full transition-transform duration-200 ease-in-out',
          'bg-[var(--toggle-thumb)]',
          checked ? 'translate-x-[10px]' : 'translate-x-[-10px]'
        )}
        style={{
          boxShadow: 'var(--toggle-thumb-shadow)',
        }}
      />
    </button>
  );
}
