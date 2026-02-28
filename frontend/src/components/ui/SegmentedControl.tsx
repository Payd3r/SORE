import { cn } from './cn';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<SegmentedOption<T>>;
  onChange: (value: T) => void;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('inline-flex w-full items-center rounded-full bg-gray-200/80 p-1.5 dark:bg-gray-800/80', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-[44px] flex-1 rounded-full px-4 py-2 text-xs font-medium transition',
              active
                ? 'bg-white font-semibold text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
