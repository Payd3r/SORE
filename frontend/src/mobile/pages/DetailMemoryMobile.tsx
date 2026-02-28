import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  IoCalendarOutline,
  IoHeartOutline,
  IoLocationOutline,
  IoShareSocialOutline,
} from 'react-icons/io5';
import { getMemory, getMemoryCarousel, updateMemory, deleteMemory, type Memory } from '../../api/memory';
import { getImageUrl } from '../../api/images';
import { getTrackDetails, type SpotifyTrack } from '../../api/spotify';
import MemoryEditModal from '../../desktop/components/Memory/MemoryEditModal';
import DeleteModal from '../../desktop/components/Memory/DeleteModal';
import { MobileHeader } from '../components/layout';
import { SegmentedControl, Button } from '../components/ui';

interface ExtendedMemory extends Memory {
  description?: string | null;
  created_by_name: string;
  created_by_user_id: number;
}

interface CarouselImage {
  image: string;
  processedUrl: string;
}

type DetailTab = 'overview' | 'galleria' | 'info';

export default function DetailMemoryMobile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  const { data: memory, isLoading } = useQuery<ExtendedMemory>({
    queryKey: ['memory', id],
    queryFn: async () => {
      const response = await getMemory(id!);
      return response.data as ExtendedMemory;
    },
    enabled: Boolean(id),
  });

  const { data: carouselImages = [] } = useQuery<CarouselImage[]>({
    queryKey: ['memoryCarousel', id],
    queryFn: async () => {
      const response = await getMemoryCarousel(id!);
      return response.data.map((image: { image: string }) => ({
        image: image.image,
        processedUrl: getImageUrl(image.image),
      }));
    },
    enabled: Boolean(id),
  });

  const { data: spotifyTrack } = useQuery<SpotifyTrack | null>({
    queryKey: ['memoryTrack', memory?.id, memory?.song],
    queryFn: async () => {
      if (!memory?.song) return null;
      const trackName = memory.song.split(' - ')[0];
      return getTrackDetails(trackName);
    },
    enabled: Boolean(memory?.song),
  });

  useEffect(() => {
    document.body.classList.add('detail-memory-active');
    return () => document.body.classList.remove('detail-memory-active');
  }, []);

  const imageToShow = useMemo(() => {
    if (carouselImages.length > 0) return carouselImages[currentImageIndex]?.processedUrl;
    const fallback = memory?.images?.[0]?.thumb_big_path;
    return fallback ? getImageUrl(fallback) : '';
  }, [carouselImages, currentImageIndex, memory?.images]);

  const locationAndDate = useMemo(() => {
    if (!memory) return '';
    const startDate = memory.start_date ? format(parseISO(memory.start_date), 'd MMM yyyy', { locale: it }) : '';
    const endDate = memory.end_date ? format(parseISO(memory.end_date), 'd MMM yyyy', { locale: it }) : '';
    const dateLabel = endDate && endDate !== startDate ? `${startDate} - ${endDate}` : startDate;
    if (memory.location && dateLabel) return `${memory.location} • ${dateLabel}`;
    return memory.location || dateLabel;
  }, [memory]);

  const handlePrevImage = () => {
    if (carouselImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (carouselImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => setTouchStartX(e.touches[0].clientX);

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const distance = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 40) return;
    if (distance > 0) handlePrevImage();
    else handleNextImage();
  };

  const handleSaveMemory = async (updatedData: Partial<Memory>) => {
    if (!id) return;
    await updateMemory(id, updatedData);
    await queryClient.invalidateQueries({ queryKey: ['memory', id] });
    setIsEditOpen(false);
  };

  const handleDeleteMemory = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteMemory(id);
      await queryClient.invalidateQueries({ queryKey: ['memories'] });
      navigate('/');
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = memory?.title || 'Ricordo';
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  if (isLoading || !memory) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] text-[var(--text-secondary)]">
        Caricamento ricordo...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-20">
          <MobileHeader
            variant="overlay"
            title={memory.title}
            onBack={() => navigate(-1)}
            rightActions={
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                  aria-label="Condividi"
                >
                  <IoShareSocialOutline className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFavorite((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                  aria-label="Preferiti"
                >
                  <IoHeartOutline className={`h-5 w-5 ${isFavorite ? 'text-[var(--color-accent-pink)]' : ''}`} />
                </button>
              </div>
            }
          />
        </div>

        <div className="relative h-[44vh] w-full overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {imageToShow ? (
            <img src={imageToShow} alt={memory.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              Nessuna immagine disponibile
            </div>
          )}

          <span className="absolute left-4 top-20 rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md">
            {memory.type}
          </span>

          {carouselImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1">
              {carouselImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="-mt-5 rounded-t-[20px] bg-[var(--bg-card)] px-4 pb-28 pt-5 shadow-[var(--shadow-md)]">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{memory.title}</h1>
        {locationAndDate && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{locationAndDate}</p>
        )}

        <div className="mt-4">
          <SegmentedControl<DetailTab>
            options={[
              { key: 'overview', label: 'Overview' },
              { key: 'galleria', label: 'Galleria' },
              { key: 'info', label: 'Info' },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {activeTab === 'overview' && (
          <div className="mt-4 space-y-4">
            {memory.description && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">Descrizione</h3>
                <p className={`text-sm text-[var(--text-secondary)] ${expandedDescription ? '' : 'line-clamp-4'}`}>
                  {memory.description}
                </p>
                {memory.description.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setExpandedDescription((prev) => !prev)}
                    className="mt-1 text-sm font-medium text-[var(--color-primary)]"
                  >
                    {expandedDescription ? 'Mostra meno' : 'Leggi tutto'}
                  </button>
                )}
              </div>
            )}

            {(memory.start_date || memory.location) && (
              <div className="grid gap-2 text-sm text-[var(--text-secondary)]">
                {memory.start_date && (
                  <div className="flex items-center gap-2">
                    <IoCalendarOutline className="h-4 w-4" />
                    <span>{locationAndDate.split('•').pop()?.trim() || locationAndDate}</span>
                  </div>
                )}
                {memory.location && (
                  <div className="flex items-center gap-2">
                    <IoLocationOutline className="h-4 w-4" />
                    <span>{memory.location}</span>
                  </div>
                )}
              </div>
            )}

            {spotifyTrack && (
              <div className="rounded-card border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
                <p className="text-xs uppercase text-[var(--text-tertiary)]">Brano associato</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{spotifyTrack.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {spotifyTrack.artists.map((artist) => artist.name).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'galleria' && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(memory.images || []).map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => {
                  const selected = carouselImages.findIndex((carousel) => carousel.image === image.webp_path || carousel.image === image.thumb_big_path);
                  setCurrentImageIndex(selected >= 0 ? selected : index % Math.max(carouselImages.length, 1));
                }}
                className="aspect-square overflow-hidden rounded-lg bg-[var(--bg-secondary)]"
              >
                <img
                  src={image.thumb_big_path ? getImageUrl(image.thumb_big_path) : ''}
                  alt={`Immagine ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
            <p>
              <span className="font-medium text-[var(--text-primary)]">Tipo:</span> {memory.type}
            </p>
            <p>
              <span className="font-medium text-[var(--text-primary)]">Creato il:</span>{' '}
              {format(parseISO(memory.created_at), 'd MMMM yyyy', { locale: it })}
            </p>
            <p>
              <span className="font-medium text-[var(--text-primary)]">Ultimo aggiornamento:</span>{' '}
              {format(parseISO(memory.updated_at), 'd MMMM yyyy', { locale: it })}
            </p>
            {memory.created_by_name && (
              <p>
                <span className="font-medium text-[var(--text-primary)]">Creato da:</span> {memory.created_by_name}
              </p>
            )}
          </div>
        )}
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border-default)] bg-[var(--bg-card)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
            Modifica
          </Button>
          <Button variant="secondary" onClick={() => setIsDeleteOpen(true)}>
            Elimina
          </Button>
          <Button onClick={handleShare}>Condividi</Button>
        </div>
      </div>

      {isEditOpen && (
        <MemoryEditModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          memory={{
            ...memory,
            created_by_name: memory.created_by_name ?? '',
            created_by_user_id: memory.created_by_user_id ?? 0,
          }}
          onSave={handleSaveMemory}
        />
      )}

      {isDeleteOpen && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onDelete={handleDeleteMemory}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
