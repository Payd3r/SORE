import type { ReactNode } from 'react';
import { cn } from '../../../components/ui/cn';

type ButtonVariant = 'primary' | 'secondary' | 'icon';

interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  /** Solo per variant icon: icona da mostrare */
  icon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Dimensione piccola */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Pulsante mobile con varianti: primario, secondario, icona.
 * Design system: --color-primary per primario, --bg-card per secondario, --bg-input per icona.
 */
export default function Button({
  children,
  variant = 'primary',
  icon,
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  size = 'md',
  className,
}: ButtonProps) {
  const sizeClasses = {
    sm: 'h-8 min-h-[32px] px-3 text-sm',
    md: 'h-11 min-h-[44px] px-4 text-[15px]',
    lg: 'h-12 min-h-[48px] px-5 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-11 w-11',
  };

  if (variant === 'icon') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full',
          iconSizeClasses[size],
          'bg-[var(--bg-input)] text-[var(--text-primary)]',
          'transition-all duration-[var(--duration-fast)]',
          'hover:bg-[var(--bg-secondary)] active:opacity-80',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
          className
        )}
        aria-label={typeof children === 'string' ? children : 'Azione'}
      >
        {icon ?? children}
      </button>
    );
  }

  if (variant === 'primary') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center gap-2 rounded-input font-medium',
          sizeClasses[size],
          fullWidth && 'w-full',
          'bg-[var(--color-primary)] text-[var(--text-inverse)]',
          'transition-all duration-[var(--duration-fast)]',
          'hover:bg-[var(--color-primary-hover)] hover:scale-[1.02]',
          'active:bg-[var(--color-primary-active)] active:scale-[0.98]',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
          className
        )}
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-2 rounded-input font-medium',
        sizeClasses[size],
        fullWidth && 'w-full',
        'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-default)]',
        'transition-all duration-[var(--duration-fast)]',
        'hover:bg-[var(--bg-input)] active:bg-[var(--bg-secondary)]',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}
