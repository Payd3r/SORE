import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { IoChevronBackOutline, IoShareSocialOutline, IoHeartOutline, IoEllipsisHorizontalOutline } from 'react-icons/io5';
import { cn } from '../../../components/ui/cn';

interface MobileHeaderProps {
  /** Titolo centrato */
  title?: string;
  /** Mostra pulsante indietro */
  showBack?: boolean;
  /** Callback per back (default: navigate(-1)) */
  onBack?: () => void;
  /** Azioni a destra (icone) */
  rightActions?: ReactNode;
  /** Slot sinistra (logo, ecc.) invece di back */
  leftSlot?: ReactNode;
  /** Classe aggiuntiva */
  className?: string;
  /** Variante visuale */
  variant?: 'default' | 'overlay';
}

/**
 * Header mobile con back button, titolo centrato e azioni destra.
 * Usa token design system: --bg-input per pulsanti, --text-primary per testo.
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
          : 'bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-default)]',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 basis-0 items-center justify-start gap-2">
        {leftSlot ?? (
          showBack && (
            <button
              type="button"
              onClick={handleBack}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors active:opacity-80 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
                variant === 'overlay'
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              )}
              aria-label="Indietro"
            >
              <IoChevronBackOutline className="h-5 w-5" />
            </button>
          )
        )}
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

/** Icone di azione comuni per MobileHeader */
export const HeaderActions = {
  Share: (props: { onClick?: () => void }) => (
    <button
      type="button"
      onClick={props.onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:opacity-80"
      aria-label="Condividi"
    >
      <IoShareSocialOutline className="h-5 w-5" />
    </button>
  ),
  Heart: (props: { onClick?: () => void; filled?: boolean }) => (
    <button
      type="button"
      onClick={props.onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:opacity-80"
      aria-label="Preferiti"
    >
      <IoHeartOutline className="h-5 w-5" />
    </button>
  ),
  Menu: (props: { onClick?: () => void }) => (
    <button
      type="button"
      onClick={props.onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:opacity-80"
      aria-label="Menu"
    >
      <IoEllipsisHorizontalOutline className="h-5 w-5" />
    </button>
  ),
};
