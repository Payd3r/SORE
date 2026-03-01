import type { ReactNode } from 'react';
import { cn } from '../../../components/ui/cn';

type CardVariant = 'base' | 'glassmorphism' | 'content';

interface CardBaseProps {
  children: ReactNode;
  variant?: CardVariant;
  onClick?: () => void;
  className?: string;
}

interface CardGlassmorphismProps extends CardBaseProps {
  variant: 'glassmorphism';
  /** Immagine di sfondo (URL) */
  imageUrl?: string;
  /** Titolo (testo bianco su overlay) */
  title?: string;
  /** Sottotitolo */
  subtitle?: string;
}

interface CardContentProps extends CardBaseProps {
  variant: 'content';
  /** Avatar (elemento circolare) */
  avatar?: ReactNode;
  /** Titolo */
  title?: string;
  /** Descrizione */
  description?: string;
  /** Timestamp o info secondaria */
  meta?: ReactNode;
}

export type CardProps = CardBaseProps | CardGlassmorphismProps | CardContentProps;

/**
 * Card mobile con varianti: base, glassmorphism, content.
 */
export default function Card(props: CardProps) {
  const { variant = 'base', onClick, className } = props;

  if (variant === 'glassmorphism') {
    const { imageUrl, title, subtitle, children } = props as CardGlassmorphismProps;
    return (
      <article
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        className={cn(
          'relative min-h-[160px] w-full overflow-hidden rounded-card',
          'bg-[var(--bg-secondary)]',
          'transition-all duration-[var(--duration-fast)]',
          onClick && 'cursor-pointer active:opacity-95 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
          className
        )}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex flex-col justify-end p-4',
            'pwa-card-gradient-overlay',
            'text-white'
          )}
        >
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
          {children}
        </div>
      </article>
    );
  }

  if (variant === 'content') {
    const { avatar, title, description, meta, children } = props as CardContentProps;
    return (
      <article
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        className={cn(
          'flex items-center gap-3 rounded-card bg-[var(--bg-card)] p-4',
          'shadow-[var(--shadow-md)]',
          'transition-all duration-[var(--duration-fast)]',
          onClick && 'cursor-pointer active:opacity-95 hover:shadow-[var(--shadow-lg)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
          className
        )}
      >
        {avatar && <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--bg-input)]">{avatar}</div>}
        <div className="min-w-0 flex-1">
          {title && <h3 className="truncate text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>}
          {description && <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">{description}</p>}
          {meta && <p className="mt-1 text-xs text-[var(--text-tertiary)]">{meta}</p>}
          {children}
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={cn(
        'overflow-hidden rounded-card bg-[var(--bg-card)]',
        'border border-[var(--border-default)] shadow-[var(--shadow-md)]',
        'transition-all duration-[var(--duration-fast)]',
        '[&>:first-child]:rounded-t-card [&>:first-child:not(:last-child)]:rounded-b-none',
        '[&>:last-child]:rounded-b-card [&>:last-child:not(:first-child)]:rounded-t-none',
        '[&>:not(:first-child):not(:last-child)]:rounded-none',
        onClick && 'cursor-pointer active:opacity-95 hover:shadow-[var(--shadow-lg)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        className
      )}
    >
      {props.children}
    </article>
  );
}
