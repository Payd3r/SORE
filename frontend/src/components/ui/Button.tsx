import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#0A84FF] text-white hover:bg-[#0070db] dark:bg-[#0A84FF] dark:hover:bg-[#3b98ff]',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  ghost: 'bg-transparent text-[#0A84FF] hover:bg-[#0A84FF]/10 dark:hover:bg-[#0A84FF]/20',
  danger: 'bg-[#FF453A] text-white hover:bg-[#e23b31] dark:bg-[#FF453A] dark:hover:bg-[#ff6a61]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-3 text-sm rounded-ios-md',
  md: 'h-11 px-4 text-sm rounded-ios-md',
  lg: 'h-12 px-5 text-base rounded-ios-lg',
  icon: 'h-11 w-11 rounded-full',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

export default Button;
