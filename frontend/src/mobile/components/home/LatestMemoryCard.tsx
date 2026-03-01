import { useMemo } from 'react';
import { getImageUrl } from '../../../api/images';
import { formatRelativeTime } from '../../../utils/relativeTime';
import MaterialIcon from '../ui/MaterialIcon';
import type { Memory } from '../../../api/memory';

interface LatestMemoryCardProps {
  memory: Memory;
  variant: 'list' | 'grid' | 'carousel';
  onClick?: (memoryId: number) => void;
}

const TYPE_LABELS: Record<string, string> = {
  VIAGGIO: 'Viaggio',
  EVENTO: 'Evento',
  SEMPLICE: 'Semplice',
  FUTURO: 'Futuro',
};

export default function LatestMemoryCard({ memory, variant, onClick }: LatestMemoryCardProps) {
  const imageUrl = useMemo(() => {
    const first = memory.images?.[0];
    if (!first?.thumb_big_path) return '';
    return getImageUrl(first.thumb_big_path);
  }, [memory.images]);

  const typeLabel = TYPE_LABELS[memory.type?.toUpperCase() ?? ''] ?? memory.type ?? 'Ricordo';
  const hasSong = Boolean(memory.song?.trim());
  const relativeTime = formatRelativeTime(memory.created_at);

  const baseClass =
    'flex flex-col text-left transition-opacity active:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-xl';

  if (variant === 'carousel') {
    return (
      <button
        type="button"
        onClick={() => onClick?.(memory.id)}
        className={`${baseClass} min-w-[112px] w-28 shrink-0`}
      >
        <div className="mb-2 h-28 w-28 overflow-hidden rounded-2xl shadow-sm">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-input)]" />
          )}
        </div>
        <p className="line-clamp-1 text-center text-xs font-bold text-[var(--text-secondary)]">
          {memory.title}
        </p>
      </button>
    );
  }

  if (variant === 'list') {
    return (
      <button type="button" onClick={() => onClick?.(memory.id)} className={`${baseClass} min-w-[160px] shrink-0`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--bg-secondary)]">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-input)]" />
          )}
          <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-[var(--text-primary)] backdrop-blur-sm">
              {typeLabel}
            </span>
            {hasSong && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E] text-white">
                <MaterialIcon name="graphic_eq" size={14} className="text-white" />
              </span>
            )}
          </div>
        </div>
        <h3 className="mt-2 line-clamp-1 text-sm font-bold text-[var(--text-primary)]">
          {memory.title}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
          <MaterialIcon name="calendar_today" size={14} />
          <span>{relativeTime}</span>
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={() => onClick?.(memory.id)} className={baseClass}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--bg-secondary)]">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--bg-input)]" />
        )}
        <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-[var(--text-primary)] backdrop-blur-sm">
            {typeLabel}
          </span>
          {hasSong && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E] text-white">
              <MaterialIcon name="graphic_eq" size={14} className="text-white" />
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-2 line-clamp-1 text-sm font-bold text-[var(--text-primary)]">
        {memory.title}
      </h3>
      <div className="mt-1 flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
        <MaterialIcon name="calendar_today" size={14} />
        <span>{relativeTime}</span>
      </div>
    </button>
  );
}
