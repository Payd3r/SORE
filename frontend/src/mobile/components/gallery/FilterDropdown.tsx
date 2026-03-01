import { useEffect, useState } from 'react';
import { cn } from '../../../components/ui/cn';
import MaterialIcon from '../ui/MaterialIcon';

export type GallerySortBy = 'newest' | 'oldest' | 'mostPhotos';
export type GalleryTimePeriod = 'allTime' | 'thisMonth' | 'thisYear' | 'year2025' | 'year2024';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: GallerySortBy;
  timePeriod: GalleryTimePeriod;
  onSortChange: (value: GallerySortBy) => void;
  onTimePeriodChange: (value: GalleryTimePeriod) => void;
  onApply: () => void;
}

const sortOptions: { key: GallerySortBy; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'mostPhotos', label: 'Most Photos' },
];

const timeOptions: { key: GalleryTimePeriod; label: string }[] = [
  { key: 'allTime', label: 'All Time' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'thisYear', label: 'This Year' },
  { key: 'year2025', label: '2025' },
  { key: 'year2024', label: '2024' },
];

function OptionPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-[13px] font-semibold',
        'transition-all duration-[var(--duration-fast)]',
        'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        active
          ? 'bg-[var(--color-primary)] text-[var(--text-inverse)]'
          : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-default)]'
      )}
    >
      {label}
    </button>
  );
}

export default function FilterDropdown({
  isOpen,
  onClose,
  sortBy,
  timePeriod,
  onSortChange,
  onTimePeriodChange,
  onApply,
}: FilterDropdownProps) {
  const [draftSortBy, setDraftSortBy] = useState<GallerySortBy>(sortBy);
  const [draftTimePeriod, setDraftTimePeriod] = useState<GalleryTimePeriod>(timePeriod);

  useEffect(() => {
    if (!isOpen) return;
    setDraftSortBy(sortBy);
    setDraftTimePeriod(timePeriod);
  }, [isOpen, sortBy, timePeriod]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSortChange(draftSortBy);
    onTimePeriodChange(draftTimePeriod);
    onApply();
  };

  const handleReset = () => {
    setDraftSortBy('newest');
    setDraftTimePeriod('allTime');
    onSortChange('newest');
    onTimePeriodChange('allTime');
    onApply();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-24"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative z-[81] w-full max-w-md rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-lg)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="filter-title" className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--text-primary)]">Sort & Filter</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
            aria-label="Chiudi"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <MaterialIcon name="swap_vert" size={16} />
            <span>Order By</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <OptionPill
                key={option.key}
                active={draftSortBy === option.key}
                label={option.label}
                onClick={() => setDraftSortBy(option.key)}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            <MaterialIcon name="calendar_today" size={16} />
            <span>Time Period</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeOptions.map((option) => (
              <OptionPill
                key={option.key}
                active={draftTimePeriod === option.key}
                label={option.label}
                onClick={() => setDraftTimePeriod(option.key)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="shrink-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)] transition-opacity hover:opacity-90 active:opacity-80"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="h-12 flex-1 min-w-0 rounded-full bg-[var(--color-primary)] text-[var(--text-inverse)] text-sm font-bold uppercase tracking-[0.08em] transition-opacity hover:opacity-95 active:opacity-90"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
