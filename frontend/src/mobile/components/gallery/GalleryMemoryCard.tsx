import type { Memory } from '../../../api/memory';
import { getImageUrl } from '../../../api/images';
import MaterialIcon from '../ui/MaterialIcon';

interface GalleryMemoryCardProps {
  memory: Memory;
  onClick: (id: number) => void;
}

function formatCardDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}-${String(month).padStart(2, '0')} ${year}`;
}

export default function GalleryMemoryCard({ memory, onClick }: GalleryMemoryCardProps) {
  const firstImage = memory.images?.[0];
  const imageUrl = firstImage?.thumb_big_path ? getImageUrl(firstImage.thumb_big_path) : '';
  const dateLabel = formatCardDate(memory.start_date || memory.created_at);

  return (
    <button
      type="button"
      onClick={() => onClick(memory.id)}
      className="flex flex-col gap-2 overflow-hidden text-left transition-transform active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl shadow-sm">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={memory.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-[var(--bg-secondary)]" />
        )}
        <div className="absolute top-3 right-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md">
            <MaterialIcon name="favorite" size={18} />
          </span>
        </div>
      </div>
      <div>
        <h4 className="line-clamp-1 text-sm font-bold text-[var(--text-primary)]">
          {memory.title}
        </h4>
        <p className="text-xs text-[var(--text-secondary)]">{dateLabel}</p>
      </div>
    </button>
  );
}
