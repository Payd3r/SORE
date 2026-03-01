import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import type { Memory } from '../../../api/memory';
import LatestMemoryCard from './LatestMemoryCard';
import SeeAllButton from './SeeAllButton';

const MAX_CAROUSEL_MEMORIES = 8;

interface LatestMemoriesProps {
  memories: Memory[];
  isLoading?: boolean;
}

export default function LatestMemories({ memories, isLoading }: LatestMemoriesProps) {
  const navigate = useNavigate();

  const sortedMemories = useMemo(() => {
    return [...memories]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, MAX_CAROUSEL_MEMORIES);
  }, [memories]);

  if (isLoading) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Momenti Recenti
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 w-28 shrink-0 animate-pulse rounded-2xl bg-[var(--bg-input)]" />
          ))}
        </div>
      </section>
    );
  }

  if (sortedMemories.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between px-6">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Momenti Recenti
        </h2>
        <SeeAllButton onClick={() => navigate('/galleria')}>Vedi tutto</SeeAllButton>
      </div>
      <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar">
        {sortedMemories.map((memory) => (
          <LatestMemoryCard
            key={memory.id}
            memory={memory}
            variant="carousel"
            onClick={(id) => navigate(`/ricordo/${id}`)}
          />
        ))}
      </div>
    </section>
  );
}
