import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMemory, getMemoryCarousel, updateMemory, deleteMemory } from '../api/memory';
import type { Memory } from '../api/memory';
import { getImageUrl } from '../api/images';
import { IoArrowBack } from 'react-icons/io5';
import { IoCalendarOutline, IoLocationOutline, IoMusicalNotesOutline } from 'react-icons/io5';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import InfoRicordo from '../components/Memory/InfoRicordo';
import CronologiaRicordo from '../components/Memory/CronologiaRicordo';
import GalleriaRicordo from '../components/Memory/GalleriaRicordo';
import MemoryEditModal from '../components/Memory/MemoryEditModal';
import DeleteModal from '../components/Memory/DeleteModal';
import { useUpload } from '../contexts/UploadContext';
import Loader from '../components/Loader';

export interface CarouselImage {
  image: string;
  created_at: string;
}

interface ExtendedMemory extends Memory {
  created_by_name: string;
  created_by_user_id: number;
}

interface ProcessedCarouselImage extends CarouselImage {
  processedUrl: string;
}

// Aggiungiamo uno stile globale per le ottimizzazioni
const CarouselStyle = () => (
  <style>
    {`
      .force-reflow {
        animation: none !important;
        transform: translateZ(0);
        will-change: transform;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .carousel-container img {
          transition: opacity 50ms linear !important;
        }
      }

      /* Supporto globale per i modal */
      .modal-open {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
      }
      .touchable {
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent !important;
        cursor: pointer !important;
      }
      .modal-content {
        touch-action: auto !important;
        -webkit-overflow-scrolling: touch !important;
        overflow-y: auto !important;
      }
      .modal-backdrop {
        pointer-events: all !important;
      }
    `}
  </style>
);

// Aggiungiamo un monitoraggio globale dello stato dei modal
// const setupModalState = (isOpen: boolean) => {
//   // Usiamo data-attributes per comunicare lo stato dei modal all'intero sistema
//   if (isOpen) {
//     document.body.setAttribute('data-modal-open', 'true');
//   } else {
//     document.body.removeAttribute('data-modal-open');
//   }
// };

export default function DetailMemory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { uploadingFiles } = useUpload();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;
  const galleriaRef = useRef<HTMLDivElement>(null);
  const loadedImagesRef = useRef<Set<string>>(new Set());

  // React Query per il fetching del ricordo
  const { data: memory, isLoading } = useQuery<ExtendedMemory>({
    queryKey: ['memory', id],
    queryFn: async () => {
      const response = await getMemory(id!);
      return response.data as ExtendedMemory;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  // React Query per il fetching delle immagini del carousel
  const { data: carouselImages = [] } = useQuery<ProcessedCarouselImage[]>({
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

  // Effetto per verificare se ci sono upload in corso e aggiornare i dati quando necessario
  useEffect(() => {
    // Se ci sono upload attivi per questo ricordo, impostiamo un intervallo di polling
    const hasActiveUploads = Object.keys(uploadingFiles).length > 0;
    if (hasActiveUploads && id) {
      // Riduciamo la frequenza di polling a 5 secondi invece di 3
      const pollingInterval = setInterval(() => {
        // Invalidiamo la cache delle immagini per forzare un nuovo fetch
        queryClient.invalidateQueries({ queryKey: ['memory', id] });
        queryClient.invalidateQueries({ queryKey: ['memoryCarousel', id] });
      }, 5000);
      
      // Puliamo l'intervallo quando il componente viene smontato
      return () => clearInterval(pollingInterval);
    }
  }, [id, uploadingFiles, queryClient]);

  // Pre-load delle immagini quando cambiano - usiamo un meccanismo più efficiente
  useEffect(() => {
    if (carouselImages.length > 0) {
      // Carichiamo solo l'immagine corrente e quelle adiacenti, non tutte in una volta
      const indicesToLoad = [currentImageIndex];
      if (carouselImages.length > 1) {
        const prevIndex = currentImageIndex === 0 ? carouselImages.length - 1 : currentImageIndex - 1;
        const nextIndex = currentImageIndex === carouselImages.length - 1 ? 0 : currentImageIndex + 1;
        indicesToLoad.push(prevIndex, nextIndex);
      }
      
      indicesToLoad.forEach(index => {
        const img = new Image();
        img.src = carouselImages[index].processedUrl;
      });
    }
  }, [carouselImages, currentImageIndex]);

  // Modifichiamo i gestori dei modal per rimuovere la gestione touch speciale
  const openEditModal = () => {
    // Reset dello scroll per garantire che il modal sia sempre accessibile
    window.scrollTo(0, 0);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const openDeleteModal = () => {
    // Reset dello scroll per garantire che il modal sia sempre accessibile
    window.scrollTo(0, 0);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleUpdateMemory = async (updatedData: Partial<Memory>) => {
    try {
      await updateMemory(id!, updatedData);
      closeEditModal();
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
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      navigate('/ricordi');
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
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

  const preloadImage = useCallback((url: string) => {
    if (loadedImagesRef.current.has(url)) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedImagesRef.current.add(url);
        resolve(undefined);
      };
      img.onerror = reject;
    });
  }, []);

  const preloadAdjacentImages = useCallback(async (currentIndex: number) => {
    if (carouselImages.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? carouselImages.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1;
    
    // Carica solo l'immagine corrente e quelle adiacenti
    await Promise.all([
      preloadImage(carouselImages[currentIndex].processedUrl),
      preloadImage(carouselImages[prevIndex].processedUrl),
      preloadImage(carouselImages[nextIndex].processedUrl)
    ]);
  }, [carouselImages, preloadImage]);

  useEffect(() => {
    if (carouselImages.length > 0) {
      preloadAdjacentImages(currentImageIndex);
    }
  }, [currentImageIndex, carouselImages.length, preloadAdjacentImages]);

  const handlePrevImage = useCallback(() => {
    if (isTransitioning || carouselImages.length <= 1) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => {
      const newIndex = prev === 0 ? carouselImages.length - 1 : prev - 1;
      return newIndex;
    });
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, carouselImages.length]);

  const handleNextImage = useCallback(() => {
    if (isTransitioning || carouselImages.length <= 1) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => {
      const newIndex = prev === carouselImages.length - 1 ? 0 : prev + 1;
      return newIndex;
    });
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, carouselImages.length]);

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Memorizza la posizione iniziale del tocco
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // Inizializza anche touchEndX
    
    // Ferma la propagazione per evitare che Layout.tsx catturi l'evento e blocchi lo scroll
    e.stopPropagation();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Aggiorna la posizione finale del tocco
    touchEndX.current = e.touches[0].clientX;
    
    // Calcola la distanza di swipe
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    // Applica un effetto visivo di trascinamento all'immagine solo se ci sono più immagini
    if (carouselImages.length > 1 && Math.abs(swipeDistance) > minSwipeDistance / 3) {
      const element = e.currentTarget as HTMLElement;
      const direction = swipeDistance > 0 ? 1 : -1;
      const offset = Math.min(Math.abs(swipeDistance) / 5, 20) * direction;
      element.style.transform = `translateX(${offset}px)`;
    }
    
    // Previene lo scroll verticale durante lo swipe orizzontale significativo
    if (Math.abs(swipeDistance) > minSwipeDistance / 2) {
      if (!e.cancelable) return;
      e.preventDefault();
      // Ferma la propagazione per evitare che Layout.tsx catturi l'evento
      e.stopPropagation();
    }
  }, [carouselImages.length]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Calcola la distanza di swipe
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    // Resetta la trasformazione
    const element = e.currentTarget as HTMLElement;
    element.style.transform = '';
    
    // Cambia immagine se lo swipe è abbastanza ampio e ci sono più immagini
    if (carouselImages.length > 1 && Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        handlePrevImage();
      } else {
        handleNextImage();
      }
    }
  }, [carouselImages.length, handleNextImage, handlePrevImage]);

  const handleVisitGallery = () => {
    setActiveTab('galleria');
    // Scroll alla sezione della galleria con animazione smooth
    galleriaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleImagesUploaded = () => {
    // Quando un'immagine viene caricata con successo, invalidare le query per aggiornare l'UI
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['memory', id] });
      queryClient.invalidateQueries({ queryKey: ['memoryCarousel', id] });
    }
  };

  // Aggiungiamo un handler per gestire il touch sui button del modal
  const handleButtonTouch = (callback: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
  };

  useEffect(() => {
    // Assicuriamoci che il main container possa essere scorrevole
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.classList.add('scroll-touch');
      mainContainer.setAttribute('style', 'overflow-y: auto !important; touch-action: pan-y !important;');
    }

    return () => {
      if (mainContainer) {
        mainContainer.classList.remove('scroll-touch');
      }
    };
  }, []);

  // Aggiungiamo un handler di resize debounced
  useEffect(() => {
    let resizeTimer: number;
    
    const handleResize = () => {
      // Clear la precedente chiamata
      clearTimeout(resizeTimer);
      
      // Imposta un timer debounced per le reazioni al resize
      resizeTimer = window.setTimeout(() => {
        // Forza un re-render delle immagini solo se necessario
        if (carouselImages.length > 0) {
          // Forza un re-layout
          const container = document.querySelector('.carousel-container');
          if (container) {
            container.classList.add('force-reflow');
            setTimeout(() => {
              container.classList.remove('force-reflow');
            }, 10);
          }
        }
      }, 250); // 250ms di debounce per il resize
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [carouselImages.length]);

  // Ottimizziamo anche l'effetto per il keydown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevImage, handleNextImage]);

  if (isLoading) {
    return <Loader type="spinner" size="lg" fullScreen text="Caricamento in corso..." subText="Stiamo preparando l'app per te" />;
  }

  if (!memory) {
    return <Loader type="spinner" size="lg" fullScreen text="Caricamento in corso..." subText="Stiamo preparando l'app per te" />;
  }

  return (
    <div className="w-full min-h-screen bg-transparent pb-[50px] sm:pb-[150px] memory-detail">
      <CarouselStyle />
      <div className="relative max-w-7xl mx-auto">
        {/* Safe area per la notch */}
        <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>
        <div className="mx-2 sm:mx-0 px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          {/* Navigation bar */}
          <div className="py-3">
            <Link
              to="/ricordi"
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 w-fit py-3 px-4 -ml-4 cursor-pointer touch-manipulation active:scale-95 active:opacity-80 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <IoArrowBack className="w-6 h-6 mr-2 flex-shrink-0" />
              <span className="select-none text-base font-medium">Torna ai ricordi</span>
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
                  onClick={handleButtonTouch(openEditModal)}
                  className="p-2 sm:px-4 sm:py-2 text-sm rounded-lg font-medium bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors focus:outline-none flex items-center justify-center"
                  title="Modifica"
                >
                  <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Modifica</span>
                </button>
                <button
                  onClick={handleButtonTouch(openDeleteModal)}
                  className="p-2 sm:px-4 sm:py-2 text-sm rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none flex items-center justify-center"
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
            {/* Carousel - aggiungiamo una classe per targeting */}
            <div className="relative carousel-container w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px] bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-8">
              {carouselImages.length > 0 && (
                <>
                  <div 
                    className="absolute inset-0 w-full h-full touch-pan-y"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Riduciamo il numero di immagini renderizzate per migliorare le performance */}
                    {carouselImages.map((image, index) => (
                      // Renderizziamo solo l'immagine corrente e quelle adiacenti
                      (index === currentImageIndex || 
                       index === (currentImageIndex === 0 ? carouselImages.length - 1 : currentImageIndex - 1) ||
                       index === (currentImageIndex === carouselImages.length - 1 ? 0 : currentImageIndex + 1)) && (
                        <img
                          key={image.processedUrl}
                          src={image.processedUrl}
                          alt={`Slide ${index + 1}`}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                            index === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          }`}
                          style={{ 
                            zIndex: index === currentImageIndex ? 1 : 0,
                            transform: 'translate3d(0,0,0)', // Forziamo l'accelerazione hardware
                          }}
                          loading={index === currentImageIndex ? "eager" : "lazy"}
                        />
                      )
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
                      onClick={handleButtonTouch(handlePrevImage)}
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
                      onClick={handleButtonTouch(handleNextImage)}
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
                  <div className="mt-4 sm:mt-6" ref={galleriaRef}>
                    {activeTab === 'info' && <InfoRicordo memory={memory} onVisitGallery={handleVisitGallery} />}
                    {activeTab === 'cronologia' && <CronologiaRicordo memory={memory} />}
                    {activeTab === 'galleria' && <GalleriaRicordo memory={memory} onImagesUploaded={handleImagesUploaded} />}
                  </div>
                </>
              ) : (
                <>
                  <InfoRicordo memory={memory} onVisitGallery={handleVisitGallery} />
                  <div className="mt-6" ref={galleriaRef}>
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
        onClose={closeEditModal}
        memory={memory}
        onSave={handleUpdateMemory}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
} 