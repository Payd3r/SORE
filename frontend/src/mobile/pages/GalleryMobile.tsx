import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getMemories, type Memory } from '../../api/memory';
import { MobileHeader, MobilePageWrapper } from '../components/layout';
import { PullToRefreshIndicator, SearchBar } from '../components/ui';
import { usePullToRefresh } from '../gestures';
import {
  CategoryFilters,
  GalleryFiltersBottomSheet,
  GalleryMemoryCard,
  type GalleryCategory,
  type GallerySortBy,
  type GalleryTimePeriod,
} from '../components/gallery';

function getMemoryDate(memory: Memory): Date {
  return new Date(memory.start_date || memory.created_at);
}

function isInTimePeriod(memoryDate: Date, timePeriod: GalleryTimePeriod): boolean {
  const now = new Date();
  if (Number.isNaN(memoryDate.getTime())) return false;
  switch (timePeriod) {
    case 'allTime':
      return true;
    case 'thisMonth':
      return (
        memoryDate.getFullYear() === now.getFullYear() &&
        memoryDate.getMonth() === now.getMonth()
      );
    case 'thisYear':
      return memoryDate.getFullYear() === now.getFullYear();
    case 'year2025':
      return memoryDate.getFullYear() === 2025;
    case 'year2024':
      return memoryDate.getFullYear() === 2024;
    default:
      return true;
  }
}

function groupMemoriesByYear(memories: Memory[]): Map<number, Memory[]> {
  const map = new Map<number, Memory[]>();
  for (const m of memories) {
    const year = getMemoryDate(m).getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(m);
  }
  const sorted = new Map([...map.entries()].sort((a, b) => b[0] - a[0]));
  return sorted;
}

export default function GalleryMobile() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<GalleryCategory>('ALL');
  const [sortBy, setSortBy] = useState<GallerySortBy>('newest');
  const [timePeriod, setTimePeriod] = useState<GalleryTimePeriod>('allTime');
  const [showFilters, setShowFilters] = useState(false);

  const { data: memories = [], isLoading, refetch } = useQuery<Memory[]>({
    queryKey: ['memories', 'gallery-mobile-redesign'],
    queryFn: getMemories,
  });

  const pullToRefresh = usePullToRefresh({
    onRefresh: async (): Promise<void> => {
      await refetch();
    },
  });

  const filteredMemories = useMemo(() => {
    let list = memories.filter((memory) => memory.images?.length > 0);

    if (selectedType !== 'ALL') {
      list = list.filter((memory) => (memory.type || '').toUpperCase() === selectedType);
    }

    const normalizedSearch = search.trim().toLowerCase();
    if (normalizedSearch) {
      list = list.filter((memory) => {
        const title = memory.title?.toLowerCase() || '';
        const location = memory.location?.toLowerCase() || '';
        const type = memory.type?.toLowerCase() || '';
        return (
          title.includes(normalizedSearch) ||
          location.includes(normalizedSearch) ||
          type.includes(normalizedSearch)
        );
      });
    }

    list = list.filter((memory) => isInTimePeriod(getMemoryDate(memory), timePeriod));

    list.sort((a, b) => {
      if (sortBy === 'mostPhotos') {
        return (b.tot_img || 0) - (a.tot_img || 0);
      }
      const aDate = getMemoryDate(a).getTime();
      const bDate = getMemoryDate(b).getTime();
      return sortBy === 'newest' ? bDate - aDate : aDate - bDate;
    });

    return list;
  }, [memories, search, selectedType, sortBy, timePeriod]);

  const memoriesByYear = useMemo(() => groupMemoriesByYear(filteredMemories), [filteredMemories]);

  return (
    <>
      <MobilePageWrapper
        accentBg
        ref={scrollRef}
        className="h-full overflow-auto overflow-x-hidden pb-24"
        onTouchStart={(e) => {
          pullToRefresh.onTouchStart(e, scrollRef.current?.scrollTop ?? 0);
        }}
        onTouchMove={(e) => {
          pullToRefresh.onTouchMove(e, scrollRef.current?.scrollTop ?? 0);
        }}
        onTouchEnd={() => void pullToRefresh.onTouchEnd()}
      >
        <PullToRefreshIndicator pullDistance={pullToRefresh.pullDistance} />

        <MobileHeader title="Galleria" showBack={false} />

        <section className="px-6 py-4">
          <div className="flex items-center gap-2">
            <SearchBar
              className="flex-1"
              placeholder="Search memories, places..."
              value={search}
              onChange={setSearch}
              onFilterClick={() => setShowFilters(true)}
            />
          </div>
        </section>

        <section className="mt-4">
          <div className="px-6 mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Select your collection</h2>
          </div>
          <CategoryFilters
            value={selectedType}
            onChange={setSelectedType}
            options={[
              { key: 'VIAGGIO', label: 'Trips' },
              { key: 'EVENTO', label: 'Events' },
              { key: 'SEMPLICE', label: 'Simple' },
              { key: 'FUTURO', label: 'Future' },
              { key: 'ALL', label: 'Archive' },
            ]}
          />
        </section>

        <section className="mt-6 px-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`gallery-skeleton-${index}`}
                  className="aspect-square animate-pulse rounded-3xl bg-[var(--bg-input)]"
                />
              ))}
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-8 text-center">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                No memories found with these filters.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Array.from(memoriesByYear.entries()).map(([year, yearMemories]) => (
                <div key={year} className="mb-8">
                  <div className="mb-4 flex items-center gap-4">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{year}</h3>
                    <div className="h-px flex-1 bg-[var(--border-default)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {yearMemories.map((memory) => (
                      <GalleryMemoryCard
                        key={memory.id}
                        memory={memory}
                        onClick={(id) => navigate(`/ricordo/${id}`)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </MobilePageWrapper>

      <GalleryFiltersBottomSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        selectedType={selectedType}
        sortBy={sortBy}
        timePeriod={timePeriod}
        onTypeChange={setSelectedType}
        onSortChange={setSortBy}
        onTimePeriodChange={setTimePeriod}
        onApply={() => {}}
      />
    </>
  );
}
