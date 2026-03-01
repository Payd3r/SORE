import { useEffect, useState } from 'react';
import BottomSheet from '../../../components/ui/BottomSheet';
import MaterialIcon from '../ui/MaterialIcon';
import Button from '../ui/Button';
import { cn } from '../../../components/ui/cn';
import type { GalleryCategory } from './CategoryFilters';
import type { GallerySortBy, GalleryTimePeriod } from './FilterDropdown';

export type { GallerySortBy, GalleryTimePeriod };

interface GalleryFiltersBottomSheetProps {
  open: boolean;
  onClose: () => void;
  selectedType: GalleryCategory;
  sortBy: GallerySortBy;
  timePeriod: GalleryTimePeriod;
  onTypeChange: (value: GalleryCategory) => void;
  onSortChange: (value: GallerySortBy) => void;
  onTimePeriodChange: (value: GalleryTimePeriod) => void;
  onApply: () => void;
}

const typeOptions: { key: GalleryCategory; label: string }[] = [
  { key: 'ALL', label: 'Archive' },
  { key: 'VIAGGIO', label: 'Trips' },
  { key: 'EVENTO', label: 'Events' },
  { key: 'SEMPLICE', label: 'Simple' },
  { key: 'FUTURO', label: 'Future' },
];

const sortOptions: { key: GallerySortBy; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'mostPhotos', label: 'A-Z' },
];

const timeOptions: { key: GalleryTimePeriod; label: string }[] = [
  { key: 'allTime', label: 'All' },
  { key: 'year2025', label: '2025' },
  { key: 'year2024', label: '2024' },
  { key: 'thisYear', label: 'This year' },
  { key: 'thisMonth', label: 'This month' },
];

export default function GalleryFiltersBottomSheet({
  open,
  onClose,
  selectedType,
  sortBy,
  timePeriod,
  onTypeChange,
  onSortChange,
  onTimePeriodChange,
  onApply,
}: GalleryFiltersBottomSheetProps) {
  const [draftType, setDraftType] = useState<GalleryCategory>(selectedType);
  const [draftSort, setDraftSort] = useState<GallerySortBy>(sortBy);
  const [draftTime, setDraftTime] = useState<GalleryTimePeriod>(timePeriod);

  useEffect(() => {
    if (!open) return;
    setDraftType(selectedType);
    setDraftSort(sortBy);
    setDraftTime(timePeriod);
  }, [open, selectedType, sortBy, timePeriod]);

  const handleApply = () => {
    onTypeChange(draftType);
    onSortChange(draftSort);
    onTimePeriodChange(draftTime);
    onApply();
    onClose();
  };

  const handleReset = () => {
    setDraftType('ALL');
    setDraftSort('newest');
    setDraftTime('allTime');
    onTypeChange('ALL');
    onSortChange('newest');
    onTimePeriodChange('allTime');
    onApply();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} contentClassName="flex flex-col bg-[var(--bg-card)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-default)] px-6 pb-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Filtra Ricordi</h2>
        <Button variant="icon" onClick={onClose} aria-label="Chiudi" className="text-[var(--text-tertiary)]">
          <MaterialIcon name="close" size={24} />
        </Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Tipo</h3>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setDraftType(opt.key)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  draftType === opt.key
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Date</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <select
                value={draftTime}
                onChange={(e) => setDraftTime(e.target.value as GalleryTimePeriod)}
                className="w-full appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                {timeOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <MaterialIcon
                name="expand_more"
                size={20}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Ordinamento</h3>
          <div className="grid grid-cols-3 gap-2">
            {sortOptions.map((opt) => (
              <label key={opt.key} className="cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  checked={draftSort === opt.key}
                  onChange={() => setDraftSort(opt.key)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    'block w-full rounded-xl border py-2.5 text-center text-sm font-medium transition-colors',
                    draftSort === opt.key
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[var(--border-default)] text-[var(--text-secondary)] peer-checked:border-[#111111] peer-checked:bg-[#111111] peer-checked:text-white'
                  )}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-3 border-t border-[var(--border-default)] bg-[var(--bg-card)] px-6 pb-8 pt-4">
        <Button variant="secondary" fullWidth onClick={handleReset}>
          Reset
        </Button>
        <Button fullWidth onClick={handleApply}>
          Applica
        </Button>
      </div>
    </BottomSheet>
  );
}
