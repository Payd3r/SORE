import { IoHeartOutline, IoLocationOutline } from 'react-icons/io5';
import { useMemo } from 'react';
import { getImageUrl } from '../../api/images';
import type { Memory } from '../../api/memory';
import { Card } from './ui';

interface MemoryCardProps {
  memory: Memory;
  onClick?: (memoryId: number) => void;
}

const typeLabel: Record<string, string> = {
  VIAGGIO: 'Viaggio',
  EVENTO: 'Evento',
  SEMPLICE: 'Semplice',
  FUTURO: 'Futuro',
};

export default function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const imageUrl = useMemo(() => {
    const firstImage = memory.images?.[0];
    if (!firstImage?.thumb_big_path) return '';
    return getImageUrl(firstImage.thumb_big_path);
  }, [memory.images]);

  const normalizedType = memory.type?.toUpperCase() ?? 'SEMPLICE';
  const subtitle = typeLabel[normalizedType] ?? 'Ricordo';

  return (
    <Card
      variant="glassmorphism"
      imageUrl={imageUrl}
      title={memory.title}
      subtitle={subtitle}
      onClick={() => onClick?.(memory.id)}
      className="h-48 min-w-[240px] max-w-[280px]"
    >
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-white/90">
          <IoLocationOutline className="h-4 w-4" />
          <span className="max-w-[170px] truncate">{memory.location || 'Luogo non specificato'}</span>
        </div>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <IoHeartOutline className="h-4 w-4 text-white" />
        </span>
      </div>
    </Card>
  );
}
