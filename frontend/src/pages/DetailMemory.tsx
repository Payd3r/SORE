import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMemory, getMemoryCarousel, updateMemory, deleteMemory } from '../api/memory';
import type { Memory } from '../api/memory';
import { getImageUrl } from '../api/images';
import { IoArrowBack, IoTrashOutline } from 'react-icons/io5';
import { IoCalendarOutline, IoLocationOutline, IoMusicalNotesOutline } from 'react-icons/io5';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import InfoRicordo from '../components/Memory/InfoRicordo';
import CronologiaRicordo from '../components/Memory/CronologiaRicordo';
import GalleriaRicordo from '../components/Memory/GalleriaRicordo';
import MemoryEditModal from '../components/Memory/MemoryEditModal';

export interface CarouselImage {
  image: string;
  created_at: string;
}

interface ExtendedMemory extends Memory {
  created_by_name: string;
  created_by_user_id: number;
  description: string;
}

interface ProcessedCarouselImage extends CarouselImage {
  processedUrl: string;
}

export default function DetailMemory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;

  // React Query per il fetching del ricordo
  const { data: memory, isLoading: isLoadingMemory } = useQuery<ExtendedMemory>({
    queryKey: ['memory', id],
    queryFn: async () => {
      const response = await getMemory(id!);
      return response.data as ExtendedMemory;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  // React Query per il fetching delle immagini del carousel
  const { data: carouselImages = [], isLoading: isLoadingCarousel } = useQuery<ProcessedCarouselImage[]>({
    queryKey: ['memoryCarousel', id],
    queryFn: async () => {
      const response = await getMemoryCarousel(id!);
      return response.data.map(img => ({
        ...img,
        processedUrl: getImageUrl(img.image)
      }));
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  const isLoading = isLoadingMemory || isLoadingCarousel;

  // Pre-load delle immagini quando cambiano
  useEffect(() => {
    if (carouselImages.length > 0) {
      const preloadImages = carouselImages.map(img => {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.src = img.processedUrl;
          image.onload = resolve;
          image.onerror = reject;
        });
      });
      
      Promise.all(preloadImages)
        .then(() => setImagesLoaded(true))
        .catch(error => console.error('Error preloading images:', error));
    }
  }, [carouselImages]);

  const handleUpdateMemory = async (updatedData: Partial<Memory>) => {
    try {
      await updateMemory(id!, updatedData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del ricordo:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await deleteMemory(id);
      navigate('/ricordi');
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const preloadImage = (url: string) => {
    if (loadedImages.has(url)) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, url]));
        resolve(undefined);
      };
      img.onerror = reject;
    });
  };

  const preloadAdjacentImages = async (currentIndex: number) => {
    const prevIndex = currentIndex === 0 ? carouselImages.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1;
    
    await Promise.all([
      preloadImage(carouselImages[prevIndex].processedUrl),
      preloadImage(carouselImages[currentIndex].processedUrl),
      preloadImage(carouselImages[nextIndex].processedUrl)
    ]);
  };

  useEffect(() => {
    if (carouselImages.length > 0) {
      preloadAdjacentImages(currentImageIndex);
    }
  }, [currentImageIndex, carouselImages]);

  const handlePrevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => {
      const newIndex = prev === 0 ? carouselImages.length - 1 : prev - 1;
      return newIndex;
    });
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => {
      const newIndex = prev === carouselImages.length - 1 ? 0 : prev + 1;
      return newIndex;
    });
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: it });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy 'alle' HH:mm", { locale: it });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchEndX.current - touchStartX.current;
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        handlePrevImage();
      } else {
        handleNextImage();
      }
    }
  };

  if (!memory) return <div>Caricamento...</div>;

  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="relative max-w-7xl mx-auto">
        {/* Safe area per la notch */}
        <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>
        <div className="mx-2 sm:mx-0 px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          {/* Navigation bar */}
          <div className="py-3">
            <Link
              to="/ricordi"
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-fit py-2 px-3 -ml-3 cursor-pointer touch-manipulation"
            >
              <IoArrowBack className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="select-none">Torna ai ricordi</span>
            </Link>
          </div>

          {/* Title section */}
          <div className="pb-4 pt-2">
            <div className="flex items-center space-x-3 mb-0 sm:mb-2">
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                {memory.type === 'VIAGGIO' ? 'Viaggio' :
                  memory.type === 'EVENTO' ? 'Evento' :
                    memory.type === 'SEMPLICE' ? 'Ricordo' : memory.type}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {memory.title}
              </h1>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 sm:px-4 sm:py-2 text-sm rounded-lg font-medium bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors focus:outline-none"
                  title="Modifica"
                >
                  <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Modifica</span>
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-2 sm:px-4 sm:py-2 text-sm rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none"
                  title="Elimina"
                >
                  <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Elimina</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
              {memory.start_date && (
                <div className="flex items-center gap-2">
                  <IoCalendarOutline className="w-4 h-4" />
                  <span>{formatDate(memory.start_date)}</span>
                  {memory.end_date && memory.end_date !== memory.start_date && (
                    <span> - {formatDate(memory.end_date)}</span>
                  )}
                </div>
              )}
              {memory.location && (
                <div className="flex items-center gap-3">
                  <IoLocationOutline className="w-4 h-4" />
                  <span>{memory.location}</span>
                </div>
              )}
              {memory.song && (
                <div className="flex items-center gap-3">
                  <IoMusicalNotesOutline className="w-4 h-4" />
                  <span>
                    {memory.song.split(' - ').slice(0, 2).join(' - ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="pb-0 pt-2">
            {/* Carousel */}
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px] bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-8">
              {carouselImages.length > 0 && (
                <>
                  <div 
                    className="absolute inset-0 w-full h-full"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {carouselImages.map((image, index) => (
                      <img
                        key={image.processedUrl}
                        src={image.processedUrl}
                        alt={`Slide ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                          index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ zIndex: 0 }}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-md backdrop-blur-sm text-xs sm:text-sm z-20">
                    {formatDateTime(carouselImages[currentImageIndex].created_at)}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-md backdrop-blur-sm text-xs sm:text-sm z-20">
                    {currentImageIndex + 1} / {carouselImages.length}
                  </div>
                  
                  {/* Navigation buttons */}
                  <div className="absolute inset-y-0 left-0 flex items-center z-10">
                    <button
                      onClick={handlePrevImage}
                      className="group h-full px-2 sm:px-4 focus:outline-none focus:ring-0 bg-transparent border-none"
                      disabled={isTransitioning}
                    >
                      <div className="p-1 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-black/50">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                  
                  <div className="absolute inset-y-0 right-0 flex items-center z-10">
                    <button
                      onClick={handleNextImage}
                      className="group h-full px-2 sm:px-4 focus:outline-none focus:ring-0 bg-transparent  border-none"
                      disabled={isTransitioning}
                    >
                      <div className="p-1 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-black/50">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="mb-0 bg-transparent rounded-xl pb-4 sm:pb-8">
              {memory.type.toLowerCase() !== 'semplice' ? (
                <>
                  <div className="tab-menu">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`tab-menu-item ${activeTab === 'info'
                        ? 'tab-menu-item-active'
                        : 'tab-menu-item-inactive'
                        }`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Info</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('cronologia')}
                      className={`tab-menu-item ${activeTab === 'cronologia'
                        ? 'tab-menu-item-active'
                        : 'tab-menu-item-inactive'
                        }`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Cronologia</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('galleria')}
                      className={`tab-menu-item ${activeTab === 'galleria'
                        ? 'tab-menu-item-active'
                        : 'tab-menu-item-inactive'
                        }`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Galleria</span>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-6">
                    {activeTab === 'info' && <InfoRicordo memory={memory} onVisitGallery={() => setActiveTab('galleria')} />}
                    {activeTab === 'cronologia' && <CronologiaRicordo memory={memory} />}
                    {activeTab === 'galleria' && <GalleriaRicordo memory={memory} />}
                  </div>
                </>
              ) : (
                <>
                  <InfoRicordo memory={memory} onVisitGallery={() => { }} />
                  <div className="mt-6">
                    <GalleriaRicordo memory={memory} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <MemoryEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        memory={memory}
        onSave={handleUpdateMemory}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <IoTrashOutline className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Elimina Ricordo
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sei sicuro di voler eliminare questo ricordo? Questa azione non può essere annullata.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 