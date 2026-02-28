import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IoFunnelOutline } from 'react-icons/io5';
import { getGalleryImages, getImageUrl, type ImageType } from '../../api/images';
import ImageDetailMobile from './ImageDetailMobile';
import { MobileHeader, MobilePageWrapper } from '../components/layout';
import { SearchBar, SegmentedControl, Button } from '../components/ui';
import { usePinchGrid, usePullToRefresh } from '../gestures';

type GalleryType = 'ALL' | 'PAESAGGIO' | 'COPPIA' | 'SINGOLO' | 'CIBO';
type SortBy = 'newest' | 'oldest';

const PAGE_SIZE = 60;

export default function GalleryMobile() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<GalleryType>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [compactGrid, setCompactGrid] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  const { data: images = [], isLoading, isFetching, refetch } = useQuery<ImageType[]>({
    queryKey: ['galleryImages', 'redesign'],
    queryFn: getGalleryImages,
  });

  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      setVisibleCount(PAGE_SIZE);
      await refetch();
    },
  });

  const pinchGrid = usePinchGrid({
    compact: compactGrid,
    onCompactChange: setCompactGrid,
  });

  const filteredImages = useMemo(() => {
    let list = [...images];

    if (selectedType !== 'ALL') {
      list = list.filter((image) => (image.type || '').toUpperCase() === selectedType);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((image) => {
        const createdBy = image.created_by_name?.toLowerCase() || '';
        return createdBy.includes(query) || String(image.memory_id).includes(query);
      });
    }

    list.sort((a, b) => {
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return sortBy === 'newest' ? bDate - aDate : aDate - bDate;
    });

    return list;
  }, [images, search, selectedType, sortBy]);

  const visibleImages = filteredImages.slice(0, visibleCount);
  const hasMore = visibleCount < filteredImages.length;

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || !hasMore) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 280;
    if (nearBottom) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  };

  return (
    <>
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto"
        onScroll={handleScroll}
        onTouchStart={(e) => {
          pinchGrid.onTouchStart(e);
          pullToRefresh.onTouchStart(e, scrollRef.current?.scrollTop ?? 0);
        }}
        onTouchMove={(e) => {
          pinchGrid.onTouchMove(e);
          pullToRefresh.onTouchMove(e, scrollRef.current?.scrollTop ?? 0);
        }}
        onTouchEnd={() => {
          pinchGrid.onTouchEnd();
          void pullToRefresh.onTouchEnd();
        }}
      >
        <MobilePageWrapper className="pb-24">
          <div
            className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-[var(--color-primary)]/30 transition-all"
            style={{ transform: `scaleX(${Math.min(1, pullToRefresh.pullDistance / 56)})` }}
          />

          <MobileHeader
            title="Galleria"
            showBack={false}
            rightActions={
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-input)] text-[var(--text-primary)]"
                aria-label="Filtri"
              >
                <IoFunnelOutline className="h-5 w-5" />
              </button>
            }
          />

          <div className="mt-4 space-y-3">
            <SearchBar placeholder="Cerca foto..." value={search} onChange={setSearch} />
            <SegmentedControl<GalleryType>
              options={[
                { key: 'ALL', label: 'Tutte' },
                { key: 'PAESAGGIO', label: 'Paesaggio' },
                { key: 'COPPIA', label: 'Coppia' },
                { key: 'SINGOLO', label: 'Singolo' },
                { key: 'CIBO', label: 'Cibo' },
              ]}
              value={selectedType}
              onChange={setSelectedType}
            />
          </div>

          {showFilters && (
            <div className="mt-3 rounded-card border border-[var(--border-default)] bg-[var(--bg-card)] p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-[var(--text-tertiary)]">Ordina</p>
              <div className="flex gap-2">
                <Button size="sm" variant={sortBy === 'newest' ? 'primary' : 'secondary'} onClick={() => setSortBy('newest')}>
                  Più recenti
                </Button>
                <Button size="sm" variant={sortBy === 'oldest' ? 'primary' : 'secondary'} onClick={() => setSortBy('oldest')}>
                  Più vecchie
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4">
            {isLoading ? (
              <p className="text-sm text-[var(--text-tertiary)]">Caricamento immagini...</p>
            ) : visibleImages.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">Nessuna immagine trovata.</p>
            ) : (
              <div className={`grid gap-2 ${compactGrid ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {visibleImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className="aspect-square overflow-hidden rounded-lg bg-[var(--bg-secondary)]"
                  >
                    <img
                      src={getImageUrl(image.thumb_big_path)}
                      alt={`Immagine ${image.id}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {isFetching && <p className="mt-3 text-center text-xs text-[var(--text-tertiary)]">Aggiornamento galleria...</p>}
            {hasMore && !isLoading && (
              <p className="mt-3 text-center text-xs text-[var(--text-tertiary)]">Scorri per caricare altre immagini</p>
            )}
          </div>
        </MobilePageWrapper>
      </div>

      <ImageDetailMobile
        isOpen={Boolean(selectedImage)}
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}
