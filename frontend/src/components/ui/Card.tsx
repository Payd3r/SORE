import type { HTMLAttributes } from 'react';
import { cn } from './cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export default function Card({ elevated = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-ios-xl border border-white/40 bg-white/85 p-4 backdrop-blur-xl dark:border-gray-800 dark:bg-[#1C1C1E]/85',
        elevated ? 'shadow-ios-card' : '',
        className
      )}
      {...props}
    />
  );
}
