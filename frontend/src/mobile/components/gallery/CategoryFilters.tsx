import { cn } from '../../../components/ui/cn';

export type GalleryCategory = 'ALL' | 'VIAGGIO' | 'EVENTO' | 'SEMPLICE' | 'FUTURO';

interface CategoryOption {
  key: GalleryCategory;
  label: string;
}

interface CategoryFiltersProps {
  value: GalleryCategory;
  onChange: (value: GalleryCategory) => void;
  options: CategoryOption[];
}

export default function CategoryFilters({ value, onChange, options }: CategoryFiltersProps) {
  return (
    <div className="flex gap-3 overflow-x-auto px-6 pb-2 no-scrollbar" role="tablist" aria-label="Filtri categoria">
      {options.map((option) => {
        const isActive = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.key)}
            className={cn(
              'shrink-0 rounded-full px-6 py-3 text-sm font-semibold whitespace-nowrap shadow-sm transition-all duration-[var(--duration-fast)]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]',
              isActive
                ? 'bg-black text-white shadow-md'
                : 'border border-gray-100 bg-white text-gray-500'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
