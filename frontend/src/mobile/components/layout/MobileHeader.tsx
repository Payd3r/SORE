import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '../../../components/ui/cn';

interface MobileHeaderProps {
  /** Titolo centrato */
  title?: string;
  /** Mostra pulsante indietro */
  showBack?: boolean;
  /** Callback per back (default: navigate(-1)) */
  onBack?: () => void;
  /** Azioni a destra (icone: notifiche, chiudi, filtro, ecc.) */
  rightActions?: ReactNode;
  /** Slot sinistra (logo, ecc.) invece di back */
  leftSlot?: ReactNode;
  /** Classe aggiuntiva */
  className?: string;
  /** Variante visuale */
  variant?: 'default' | 'overlay';
}

const ICON_STYLE: React.CSSProperties = {
  fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
};

/**
 * Header mobile con back, titolo centrato e azioni (Material Symbols).
 * Sticky, backdrop blur; slot per chiudi e altre azioni.
 */
export default function MobileHeader({
  title = '',
  showBack = true,
  onBack,
  rightActions,
  leftSlot,
  className,
  variant = 'default',
}: MobileHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between',
        'px-4 pt-[env(safe-area-inset-top)] pb-2',
        variant === 'overlay'
          ? 'bg-transparent backdrop-blur-md border-b border-white/10'
          : 'bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-default)]',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 basis-0 items-center justify-start gap-2">
        {leftSlot ??
          (showBack && (
            <button
              type="button"
              onClick={handleBack}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
                variant === 'overlay'
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              )}
              aria-label="Indietro"
            >
              <span className="material-symbols-outlined text-xl" style={ICON_STYLE} aria-hidden>
                arrow_back
              </span>
            </button>
          ))}
      </div>

      {title && (
        <h1
          className={cn(
            'flex-1 truncate px-2 text-center text-base font-semibold',
            variant === 'overlay' ? 'text-white' : 'text-[var(--text-primary)]'
          )}
        >
          {title}
        </h1>
      )}

      <div className="flex min-w-0 flex-1 basis-0 items-center justify-end gap-1">
        {rightActions}
      </div>
    </header>
  );
}

/** Icone di azione comuni per MobileHeader (Material Symbols Outlined) */
export const HeaderActions = {
  Share: (props: { onClick?: () => void }) => (
    <button
      type="button"
      onClick={props.onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      aria-label="Condividi"
    >
      <span className="material-symbols-outlined text-xl" style={ICON_STYLE} aria-hidden>
        share
      </span>
    </button>
  ),
  Heart: (props: { onClick?: () => void; filled?: boolean }) => (
    <button
      type="button"
      onClick={props.onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      aria-label="Preferiti"
    >
      <span
        className="material-symbols-outlined text-xl"
        style={{
          fontVariationSettings: props.filled
            ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
            : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        }}
        aria-hidden
      >
        favorite
      </span>
    </button>
  ),
  Menu: (props: { onClick?: () => void }) => (
    <button
      type="button"
      onClick={props.onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      aria-label="Menu"
    >
      <span className="material-symbols-outlined text-xl" style={ICON_STYLE} aria-hidden>
        more_horiz
      </span>
    </button>
  ),
  Close: (props: { onClick?: () => void }) => (
    <button
      type="button"
      onClick={props.onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      aria-label="Chiudi"
    >
      <span className="material-symbols-outlined text-xl" style={ICON_STYLE} aria-hidden>
        close
      </span>
    </button>
  ),
};
