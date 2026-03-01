import { useMemo } from 'react';
import { getImageUrl } from '../../../api/images';
import MaterialIcon from '../ui/MaterialIcon';
import type { Memory } from '../../../api/memory';

interface FeaturedTripCardProps {
  memory: Memory;
  onClick?: (memoryId: number) => void;
}

const MONTH_LABELS: Record<number, string> = {
  0: 'JAN', 1: 'FEB', 2: 'MAR', 3: 'APR', 4: 'MAY', 5: 'JUN',
  6: 'JUL', 7: 'AUG', 8: 'SEP', 9: 'OCT', 10: 'NOV', 11: 'DEC',
};

function formatDateLabel(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const month = MONTH_LABELS[d.getMonth()] ?? '';
  const year = d.getFullYear();
  return `${month} ${year}`;
}

export default function FeaturedTripCard({ memory, onClick }: FeaturedTripCardProps) {
  const imageUrl = useMemo(() => {
    const first = memory.images?.[0];
    if (!first?.thumb_big_path) return '';
    return getImageUrl(first.thumb_big_path);
  }, [memory.images]);

  const dateLabel = formatDateLabel(memory.start_date ?? memory.created_at);
  const location = memory.location || '';

  return (
    <button
      type="button"
      onClick={() => onClick?.(memory.id)}
      className="group relative flex w-[min(100%,320px)] shrink-0 snap-center flex-col overflow-hidden rounded-[2.5rem] text-left transition-opacity active:opacity-95"
    >
      <div className="aspect-[3/4] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform group-active:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)]" />
        )}
        <div className="absolute inset-0 pwa-card-gradient-overlay" />
        <div className="absolute top-6 right-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md text-white">
            <MaterialIcon name="favorite" size={20} />
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="mb-6">
            {location && (
              <p className="mb-1 text-sm font-medium uppercase tracking-widest text-white/80">
                {location}
              </p>
            )}
            <h3 className="mb-3 text-2xl font-bold text-white md:text-4xl">{memory.title}</h3>
            <div className="flex items-center gap-2 text-sm font-medium text-white/90">
              {dateLabel && <span>{dateLabel}</span>}
            </div>
          </div>
          <div className="flex w-full items-center justify-between rounded-full border border-white/10 bg-black/40 p-1 pl-6 backdrop-blur-lg transition-transform active:scale-[0.98]">
            <span className="text-base font-medium text-white">See more</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
              <MaterialIcon name="chevron_right" size={20} className="text-black" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
