import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import type { Memory } from '../../../api/memory';
import FeaturedTripCard from './FeaturedTripCard';
import SeeAllButton from './SeeAllButton';

interface FeaturedTripsProps {
  memories: Memory[];
  isLoading?: boolean;
}

export default function FeaturedTrips({ memories, isLoading }: FeaturedTripsProps) {
  const navigate = useNavigate();

  const tripMemories = useMemo(() => {
    return memories
      .filter((m) => m.type?.toUpperCase() === 'VIAGGIO')
      .sort((a, b) => {
        const dateA = a.start_date ?? a.created_at ?? '';
        const dateB = b.start_date ?? b.created_at ?? '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  }, [memories]);

  if (isLoading) {
    return (
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Featured Trips</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 w-[280px] shrink-0 snap-center animate-pulse rounded-[2.5rem] bg-[var(--bg-input)]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (tripMemories.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Featured Trips
        </h2>
        <SeeAllButton onClick={() => navigate('/galleria')}>Vedi tutto</SeeAllButton>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
        {tripMemories.map((memory) => (
          <FeaturedTripCard
            key={memory.id}
            memory={memory}
            onClick={(id) => navigate(`/ricordo/${id}`)}
          />
        ))}
      </div>
    </section>
  );
}
