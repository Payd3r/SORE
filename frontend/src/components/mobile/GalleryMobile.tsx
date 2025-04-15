import { useEffect, useState, useCallback, useRef, TouchEvent, useMemo } from 'react';
import { getGalleryImages, ImageType, getImageUrl, deleteImage, updateImageType } from '../../api/images';
import { useAuth } from '../../contexts/AuthContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import ImageDetailMobile from './ImageDetailMobile';
import LazyImage from '../Images/LazyImage';
import { useVirtualizer } from '@tanstack/react-virtual';
import Loader from '../Loader';
import { useQueryClient } from '@tanstack/react-query';

type SortOption = 'newest' | 'oldest' | 'random';
type ImageTypeFilter = 'all' | 'COPPIA' | 'SINGOLO' | 'PAESAGGIO' | 'CIBO';
type MemoryFilter = 'all' | 'withMemory' | 'withoutMemory';

// Numero di immagini da caricare per pagina
const IMAGES_PER_PAGE = 50;

export default function GalleryMobile() {
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'month'
  const [isCompactGrid, setIsCompactGrid] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedTypes, setSelectedTypes] = useState<Set<ImageTypeFilter>>(new Set());
  const [memoryFilter, setMemoryFilter] = useState<MemoryFilter>('all');
  const { isLoading: authLoading } = useAuth();
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [_isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [_pinchScale, setPinchScale] = useState<number>(1);
  const [isPinching, setIsPinching] = useState(false);
  const lastPinchTimeRef = useRef<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Riferimento per tenere traccia del mese visibile al centro dello schermo
  const [visibleMonthKey, setVisibleMonthKey] = useState<string | null>(null);
  const monthsRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Riferimenti per il virtualizer
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Riferimento per lo scroll alla parte inferiore
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // React Query per il fetching delle immagini con paginazione
  const { 
    data, 
    isLoading: loading, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery<{
    images: ImageType[];
    nextPage: number | undefined;
  }>({
    queryKey: ['galleryImages'],
    queryFn: async ({ pageParam = 1 }) => {
      const images = await getGalleryImages();
      // Simuliamo la paginazione sul client per ora
      const startIndex = (pageParam as number - 1) * IMAGES_PER_PAGE;
      const endIndex = startIndex + IMAGES_PER_PAGE;
      return {
        images: images.slice(startIndex, endIndex),
        nextPage: endIndex < images.length ? (pageParam as number) + 1 : undefined
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minuti
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Combina tutte le immagini dalle pagine caricate
  const allImages = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.images);
  }, [data]);

  // Funzione per filtrare le immagini
  const filterImages = useCallback((images: ImageType[]): ImageType[] => {
    // Applica prima il filtro di associazione ai ricordi
    let filteredByMemory = images;
    if (memoryFilter === 'withMemory') {
      filteredByMemory = images.filter(image => image.memory_id !== null);
    } else if (memoryFilter === 'withoutMemory') {
      filteredByMemory = images.filter(image => image.memory_id === null);
    }

    // Poi applica il filtro per tipo di immagine
    // Se non ci sono tipi selezionati, mostra tutte le immagini
    if (selectedTypes.size === 0) {
      return filteredByMemory;
    }

    // Filtra le immagini se c'è almeno un tipo selezionato
    return filteredByMemory.filter(image => {
      // Standardizza il tipo di immagine in maiuscolo per confronto uniforme
      const imageType = (image.type || '').toUpperCase() as ImageTypeFilter;
      // Controlla se il tipo dell'immagine è presente nei tipi selezionati
      return selectedTypes.has(imageType);
    });
  }, [selectedTypes, memoryFilter]);

  // Funzione per ordinare le immagini
  const sortImages = useCallback((images: ImageType[]): ImageType[] => {
    switch (sortBy) {
      case 'newest':
        return [...images].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return [...images].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'random':
        return [...images].sort(() => Math.random() - 0.5);
      default:
        return [...images].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [sortBy]);

  // Applica filtri e ordinamento
  const filteredImages = useMemo(() => {
    return sortImages(filterImages(allImages));
  }, [allImages, sortImages, filterImages]);

  // Gestione dello scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !hasNextPage || isFetchingNextPage) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Se siamo vicini alla fine, carica più immagini
      if (scrollHeight - scrollTop - clientHeight < 500) {
        fetchNextPage();
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Virtualizzazione delle righe, direzione inversa per mostrare le immagini più recenti in basso
  const rowsCount = useCallback(() => {
    return Math.ceil(filteredImages.length / (isCompactGrid ? 5 : 3));
  }, [filteredImages, isCompactGrid]);


  // Calcolo dinamico delle dimensioni della cella in base alla larghezza della viewport
  const getCellSize = useCallback(() => {
    // Larghezza disponibile totale
    const screenWidth = window.innerWidth;
    // Numero di celle per riga
    const cellsPerRow = isCompactGrid ? 5 : 3;
    // Gap tra le celle
    const gapSize = 2;
    // Calcola la dimensione delle celle (larghezza = altezza perché aspect-square)
    // Sottrae il padding laterale e i gap tra le celle
    const cellSize = (screenWidth - (cellsPerRow - 1) * gapSize) / cellsPerRow;
    // Ritorna cellSize + gap per l'altezza della riga
    return cellSize + gapSize;
  }, [isCompactGrid]);

  // Modificare per avere scroll invertito con dimensioni precise
  const virtualizer = useVirtualizer({
    count: rowsCount(),
    getScrollElement: () => parentRef.current,
    estimateSize: getCellSize, // Usa la funzione dinamica
    overscan: 10,
  });

  // Raggruppa immagini per mese
  const groupImagesByMonth = useCallback((images: ImageType[]) => {
    const groups: Record<string, { date: Date, images: ImageType[] }> = {};
    
    images.forEach(image => {
      const date = new Date(image.created_at);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!groups[key]) {
        groups[key] = {
          date,
          images: []
        };
      }
      
      groups[key].images.push(image);
    });
    
    return groups;
  }, []);

  // Formatta il titolo del mese
  const formatMonthTitle = useCallback((date: Date) => {
    const monthNames = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }, []);

  // Gestione della selezione e cancellazione
  const toggleSelectImage = useCallback((imageId: string) => {
    setSelectedImages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(imageId)) {
        newSelection.delete(imageId);
      } else {
        newSelection.add(imageId);
      }
      return newSelection;
    });
  }, []);

  const handleImageClick = useCallback((image: ImageType) => {
    if (!isSelectionMode) {
      setSelectedImage(image);
      setIsDetailModalOpen(true);
    }
  }, [isSelectionMode]);

  const deleteSelectedImages = useCallback(async () => {
    if (selectedImages.size === 0) return;
    
    setIsDeleting(true);
    
    const deletePromises = Array.from(selectedImages).map(imageId => deleteImage(imageId));
    
    try {
      await Promise.all(deletePromises);
      await refetch();
      setSelectedImages(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Errore durante l\'eliminazione delle immagini:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedImages, refetch]);

  // Gestione delle gesture di pinch per lo zoom in/out
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return;

    // Calcola la distanza iniziale tra le dita
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    setInitialTouchDistance(distance);
    setIsPinching(true);
    setPinchScale(1); // Reset dello scale al valore iniziale
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2 || initialTouchDistance === null) return;

    // Calcola la distanza attuale tra le dita
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    // Calcola il fattore di scala tra la distanza iniziale e quella attuale
    const newScale = currentDistance / initialTouchDistance;
    setPinchScale(newScale);

    // Throttle il cambio di modalità per evitare cambi troppo rapidi
    const now = Date.now();
    if (now - lastPinchTimeRef.current > 300) { // Controllo ogni 300ms
      // Determina se è pinch in o pinch out
      if (newScale < 0.8 && isCompactGrid === false) {
        setIsCompactGrid(true);
        lastPinchTimeRef.current = now;
      } else if (newScale > 1.2 && isCompactGrid === true) {
        setIsCompactGrid(false);
        lastPinchTimeRef.current = now;
      }
    }
  }, [initialTouchDistance, isCompactGrid]);

  const handleTouchEnd = () => {
    setIsPinching(false);
    setInitialTouchDistance(null);
    lastPinchTimeRef.current = 0;
  };

  // Ricalcola il layout quando lo schermo cambia dimensione
  useEffect(() => {
    const handleResize = () => {
      // Forza il ricalcolo del virtualizer
      if (virtualizer) {
        virtualizer.measure();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [virtualizer]);

  // Funzione per determinare quale mese è visibile al centro dello schermo
  const updateVisibleMonth = useCallback(() => {
    if (!scrollContainerRef.current || activeTab !== 'grid') return;
    
    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;
    
    // Determiniamo la data dell'immagine più vicina al centro
    const elements = document.querySelectorAll('#gallery-container .grid > div');
    if (elements.length === 0) return;
    
    let closestEl: Element | null = null;
    let minDistance = Infinity;
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elCenter - containerCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestEl = el;
      }
    });
    
    if (closestEl && filteredImages.length > 0) {
      const index = Array.from(elements).indexOf(closestEl);
      if (index >= 0 && index < filteredImages.length) {
        const date = new Date(filteredImages[index].created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        setVisibleMonthKey(monthKey);
      }
    }
  }, [activeTab, filteredImages]);
  
  // Esegui lo scroll al mese corrispondente quando si passa da grid a month
  useEffect(() => {
    if (activeTab === 'month' && visibleMonthKey && monthsRefs.current[visibleMonthKey]) {
      // Breve timeout per assicurarsi che il DOM sia aggiornato
      setTimeout(() => {
        const monthEl = monthsRefs.current[visibleMonthKey];
        if (monthEl && scrollContainerRef.current) {
          monthEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [activeTab, visibleMonthKey]);
  
  // Monitora lo scroll per aggiornare il mese visibile
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      if (activeTab === 'grid') {
        updateVisibleMonth();
      }
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab, updateVisibleMonth]);

  const queryClient = useQueryClient();

  // Stati per il long press e il menu di tipo
  const [longPressedImage, setLongPressedImage] = useState<ImageType | null>(null);
  const [showTypeToggle, setShowTypeToggle] = useState(false);
  const [longPressPosition, setLongPressPosition] = useState({ x: 0, y: 0 });
  const [isUpdatingType, setIsUpdatingType] = useState(false);
  const longPressTimeoutRef = useRef<number | null>(null);
  
  // Lista dei tipi di immagine disponibili
  const imageTypes = [
    { id: 'COPPIA', label: 'Coppia' },
    { id: 'SINGOLO', label: 'Singolo' },
    { id: 'PAESAGGIO', label: 'Luogo' },
    { id: 'CIBO', label: 'Cibo' },
  ];

  // Funzione per gestire il long press sulle immagini
  const handleImageLongPress = useCallback((image: ImageType, event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isSelectionMode) return; // Non attivare long press in modalità selezione
    
    // Determina la posizione del touch per il menu
    let clientX = 0, clientY = 0;
    
    if ('touches' in event) {
      // È un evento touch
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // È un evento mouse (context menu)
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }
    
    // Calcola l'altezza del menu (circa 180px per 4 elementi)
    const menuHeight = 180;
    const menuWidth = 180;
    
    // Determina se il menu deve apparire sopra o sotto il punto di tocco
    // Se il punto è nella metà inferiore dello schermo, posiziona il menu sopra
    const isInBottomHalf = clientY > window.innerHeight / 2;
    
    // Calcola la distanza dal fondo dello schermo, considerando la barra di navigazione
    const distanceFromBottom = window.innerHeight - clientY;
    const bottomSafeArea = 100; // Tiene conto della barra di navigazione e altri elementi in basso
    const isNearBottom = distanceFromBottom < (menuHeight + bottomSafeArea);
    
    // Posiziona il menu in modo che non esca dai bordi dello schermo
    setLongPressPosition({ 
      x: Math.max(10, Math.min(clientX - menuWidth/2, window.innerWidth - menuWidth - 10)),
      y: isInBottomHalf || isNearBottom
         ? Math.max(10, clientY - menuHeight - 20) // Sopra il dito se in basso o vicino al fondo
         : Math.min(window.innerHeight - menuHeight - bottomSafeArea, clientY + 20) // Sotto il dito se in alto
    });
    
    setLongPressedImage(image);
    setShowTypeToggle(true);
  }, [isSelectionMode]);
  
  // Gestione del touch start per le immagini
  const handleImageTouchStart = useCallback((event: TouchEvent, image: ImageType) => {
    if (event.touches.length !== 1 || isSelectionMode) return;
    
    // Avvia il timer per il long press
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
    }
    
    longPressTimeoutRef.current = window.setTimeout(() => {
      handleImageLongPress(image, event);
    }, 500); // 500ms per rilevare il long press
  }, [handleImageLongPress, isSelectionMode]);
  
  // Gestione del touch move per annullare il long press se il dito si muove
  const handleImageTouchMove = useCallback(() => {
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);
  
  // Gestione del touch end per cancellare il timer
  const handleImageTouchEnd = useCallback(() => {
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  // Funzione per aggiornare il tipo di immagine
  const updateImageTypeHandler = useCallback(async (newType: string) => {
    if (!longPressedImage) return;
    
    // Chiudo subito il menu per dare un feedback immediato all'utente
    setShowTypeToggle(false);
    setLongPressedImage(null);
    
    setIsUpdatingType(true);
    try {
      // Utilizziamo la nuova funzione che aggiorna solo il tipo
      await updateImageType(longPressedImage.id, newType);
      
      // Aggiorna la cache di React Query
      queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del tipo:', error);
    } finally {
      setIsUpdatingType(false);
    }
  }, [longPressedImage, queryClient]);

  // Calcola il numero totale di filtri attivi
  const getActiveFiltersCount = () => {
    // Conta i filtri di tipo selezionati (escludendo 'all' che non è un filtro ma un reset)
    const typeFiltersCount = selectedTypes.size;
    
    // Aggiunge 1 se è selezionato un filtro per ricordi diverso da 'all'
    const memoryFilterCount = memoryFilter !== 'all' ? 1 : 0;
    
    return typeFiltersCount + memoryFilterCount;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  if (authLoading) {
    return <Loader type="spinner" size="lg" fullScreen text="Autenticazione in corso..." />;
  }

  return (
    <div className="flex flex-col h-full relative pb-[21%]">
      {/* Effetto blur in alto */}
      <div 
        className="absolute top-0 left-0 right-0 z-30 pointer-events-none h-[130px]"
        style={{
          background: 'transparent',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          backdropFilter: 'blur(16px)'
        }}
      ></div>
      
      {/* Contenuto principale - scrolling */}
      <div className="flex-1 overflow-auto" ref={scrollContainerRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="min-h-full">
          {loading && filteredImages.length === 0 ? (
            <div className="w-full flex items-center justify-center py-20">
              <Loader type="spinner" size="md" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="w-full flex items-center justify-center py-20">
              <div className="text-gray-500 dark:text-gray-400">Galleria Vuota</div>
            </div>
          ) : (
            <div className="w-full pt-32">
              {activeTab === 'grid' ? (
                <div
                  id="gallery-container"
                  className="w-full h-full px-0"
                  style={{
                    transform: isPinching ? `none` : 'scale(1)',
                    transition: isPinching ? 'none' : 'transform 0.3s ease-out',
                  }}
                >
                  <div className="space-y-0">
                    <div className={`grid ${
                      isCompactGrid
                        ? 'grid-cols-5 gap-[2px]'
                        : 'grid-cols-3 gap-[2px]'
                    }`}>
                      {filteredImages.map((image) => (
                        <div
                          key={image.id}
                          className={`relative aspect-square overflow-hidden ${
                            isSelectionMode 
                              ? 'border-[1px] border-transparent' 
                              : ''
                          } ${
                            isSelectionMode && selectedImages.has(image.id)
                              ? '!border-[#007AFF] dark:!border-[#0A84FF]'
                              : ''
                          }`}
                          onClick={() => {
                            if (isSelectionMode) {
                              toggleSelectImage(image.id);
                            } else {
                              handleImageClick(image);
                            }
                          }}
                          onTouchStart={(e) => handleImageTouchStart(e, image)}
                          onTouchMove={handleImageTouchMove}
                          onTouchEnd={handleImageTouchEnd}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleImageLongPress(image, e);
                          }}
                        >
                          <LazyImage
                            src={getImageUrl(image.thumb_big_path)}
                            alt={`Immagine ${image.id}`}
                            className="w-full h-full object-cover bg-gray-100 dark:bg-gray-800"
                          />
                          
                          {/* Overlay di selezione in stile Apple */}
                          {isSelectionMode && (
                            <div
                              className={`absolute inset-0 flex items-center justify-center ${
                                selectedImages.has(image.id) ? 'bg-black/10 dark:bg-black/30' : ''
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                selectedImages.has(image.id)
                                  ? 'bg-[#007AFF] dark:bg-[#0A84FF] border-white'
                                  : 'border-white/80 bg-black/20'
                              }`}>
                                {selectedImages.has(image.id) && (
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Indicatore di caricamento per infinite scroll */}
                    {isFetchingNextPage && (
                      <div className="py-6 flex justify-center">
                        <Loader type="spinner" size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 px-0">
                  {Object.entries(groupImagesByMonth(filteredImages))
                    .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
                    .map(([key, group]) => (
                      <div 
                        key={key} 
                        className="space-y-1"
                        ref={el => {
                          monthsRefs.current[key] = el;
                        }}
                      >
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white px-3 py-2 sticky top-0 bg-transparent backdrop-blur-xl z-20 mb-1 flex items-center justify-between">
                          <span>{formatMonthTitle(group.date)}</span>
                          <span className="inline-flex items-center justify-center rounded-full bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                            {group.images.length} foto
                          </span>
                        </h2>
                        <div className={`grid ${
                          isCompactGrid
                            ? 'grid-cols-5 gap-[2px]'
                            : 'grid-cols-3 gap-[2px]'
                        }`}>
                          {[...group.images].map((image) => (
                            <div
                              key={image.id}
                              className={`relative aspect-square overflow-hidden ${
                                isSelectionMode 
                                  ? 'border-[1.5px] border-transparent' 
                                  : ''
                              } ${
                                isSelectionMode && selectedImages.has(image.id)
                                  ? '!border-[#007AFF] dark:!border-[#0A84FF]'
                                  : ''
                              }`}
                              onClick={() => {
                                if (isSelectionMode) {
                                  toggleSelectImage(image.id);
                                } else {
                                  handleImageClick(image);
                                }
                              }}
                              onTouchStart={(e) => handleImageTouchStart(e, image)}
                              onTouchMove={handleImageTouchMove}
                              onTouchEnd={handleImageTouchEnd}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                handleImageLongPress(image, e);
                              }}
                            >
                              <LazyImage
                                src={getImageUrl(image.thumb_big_path)}
                                alt={`Immagine ${image.id}`}
                                className="w-full h-full object-cover bg-gray-100 dark:bg-gray-800"
                              />
                              
                              {/* Overlay di selezione in stile Apple */}
                              {isSelectionMode && (
                                <div
                                  className="absolute inset-0 flex items-center justify-center"
                                  style={{
                                    backgroundColor: selectedImages.has(image.id) ? 'rgba(0,0,0,0.1)' : 'transparent',
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectImage(image.id);
                                  }}
                                >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                    selectedImages.has(image.id)
                                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] border-white'
                                      : 'border-white/80 bg-black/20'
                                  }`}>
                                    {selectedImages.has(image.id) && (
                                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                  {/* Indicatore di caricamento per infinite scroll */}
                  {isFetchingNextPage && (
                    <div className="py-6 flex justify-center">
                      <Loader type="spinner" size="sm" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Controlli sovrapposti alle immagini */}
      <div className="absolute top-0 left-0 right-0 z-40 px-4 pt-14 pb-2">
        <div className="grid grid-cols-3 items-center">
          {/* Pulsante filtri a sinistra */}
          <div className="flex justify-start">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full ${showFilters ? 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 backdrop-blur-xl' : 'bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-xl'} text-[#007AFF] dark:text-[#0A84FF] relative`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
          
          {/* Toggle visualizzazione al centro */}
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full bg-gray-200/70 dark:bg-gray-800/70 p-1.5 min-w-[250px] backdrop-blur-xl shadow-sm">
              <button
                className={`flex-1 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold scale-105'
                    : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                }`}
                onClick={() => {
                  setActiveTab('grid');
                  // Aggiorna subito il mese visibile
                  if (activeTab === 'month') {
                    setTimeout(updateVisibleMonth, 300);
                  }
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span>Griglia</span>
              </button>
              <button
                className={`flex-1 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'month'
                    ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold scale-105'
                    : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                }`}
                onClick={() => {
                  // Aggiorna il mese visibile prima di cambiare tab
                  if (activeTab === 'grid') {
                    updateVisibleMonth();
                  }
                  setActiveTab('month');
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Mesi</span>
              </button>
            </div>
          </div>
          
          {/* Pulsante selezione a destra con icona */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) setSelectedImages(new Set());
              }}
              className={`p-2 rounded-full backdrop-blur-xl ${
                isSelectionMode 
                  ? 'text-red-500 dark:text-red-400 bg-gray-100/50 dark:bg-gray-800/50' 
                  : 'text-[#007AFF] dark:text-[#0A84FF] bg-gray-100/50 dark:bg-gray-800/50'
              }`}
            >
              {isSelectionMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Filtri collassati - Stile iOS 18 */}
        {showFilters && (
          <div className="mt-3 pb-3 bg-gray-200/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden">
            {/* Ordinamento */}
            <div className="pt-4 pb-3 px-4">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3">Ordina per</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${
                    sortBy === 'newest'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm' 
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                  }`}
                >
                  Più recenti
                </button>
                <button
                  onClick={() => setSortBy('oldest')}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${
                    sortBy === 'oldest'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm' 
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                  }`}
                >
                  Più vecchi
                </button>
                <button
                  onClick={() => setSortBy('random')}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${
                    sortBy === 'random'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm' 
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                  }`}
                >
                  Casuali
                </button>
              </div>
            </div>
            
            {/* Separatore sottile in stile iOS 18 */}
            <div className="mx-4 h-[0.5px] bg-gray-300/50 dark:bg-gray-600/50"></div>
            
            {/* Filtri per tipo */}
            <div className="pt-3 pb-3 px-4">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3">Tipo</h3>
              <div className="flex flex-wrap gap-2">
                {(['all', 'COPPIA', 'SINGOLO', 'PAESAGGIO', 'CIBO'] as ImageTypeFilter[]).map(type => {
                  const displayText = {
                    all: 'Tutti',
                    COPPIA: 'Coppia',
                    SINGOLO: 'Singolo',
                    PAESAGGIO: 'Paesaggio',
                    CIBO: 'Cibo'
                  }[type];
                  
                  // Corretto per il filtro 'all'
                  const isSelected = type === 'all' 
                    ? selectedTypes.size === 0
                    : selectedTypes.has(type);
                  
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        if (type === 'all') {
                          setSelectedTypes(new Set());
                        } else {
                          setSelectedTypes(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(type)) {
                              newSet.delete(type);
                            } else {
                              newSet.add(type);
                            }
                            return newSet;
                          });
                        }
                      }}
                      className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm' 
                          : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                    >
                      {displayText}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Separatore sottile in stile iOS 18 */}
            <div className="mx-4 h-[0.5px] bg-gray-300/50 dark:bg-gray-600/50"></div>
            
            {/* Filtri per ricordi */}
            <div className="pt-3 pb-3 px-4">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3">Ricordi</h3>
              <div className="flex flex-wrap gap-2">
                {(['all', 'withMemory', 'withoutMemory'] as MemoryFilter[]).map(filter => {
                  const displayText = {
                    all: 'Tutti',
                    withMemory: 'Con ricordi',
                    withoutMemory: 'Senza ricordi'
                  }[filter];
                  
                  return (
                    <button
                      key={filter}
                      onClick={() => setMemoryFilter(filter)}
                      className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${
                        memoryFilter === filter
                          ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm' 
                          : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                    >
                      {displayText}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Barra di selezione (appare solo in modalità selezione) */}
      {isSelectionMode && (
        <div className="fixed bottom-[9%] left-0 right-0 z-40 bg-[#F2F2F7]/95 dark:bg-black/95 backdrop-blur-lg px-4 py-1 shadow-lg transform transition-transform border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedImages.size} selezionati
            </span>
            <button
              onClick={deleteSelectedImages}
              disabled={selectedImages.size === 0 || isDeleting}
              className={`px-4 py-1 mb-1 rounded-full text-white text-sm font-medium ${
                selectedImages.size === 0 || isDeleting
                  ? 'bg-red-400 dark:bg-red-500/50 opacity-50'
                  : 'bg-red-500 dark:bg-red-600'
              }`}
            >
              {isDeleting ? 'Eliminazione...' : 'Elimina'}
            </button>
          </div>
        </div>
      )}

      {/* Modale dettaglio immagine */}
      <ImageDetailMobile
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage}
        onImageDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
        }}
      />

      {/* Aggiungi il toggle per cambiare il tipo di immagine */}
      {showTypeToggle && longPressedImage && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
          style={{
            left: longPressPosition.x,
            top: longPressPosition.y,
            minWidth: "180px",
            maxWidth: "220px"
          }}
        >
          <div className="p-1">            
            <div className="space-y-1">
              {imageTypes.map((type) => (
                <button
                  key={type.id}
                  disabled={isUpdatingType}
                  onClick={() => updateImageTypeHandler(type.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center space-x-2 ${
                    longPressedImage.type?.toUpperCase() === type.id 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span className="flex-1">{type.label}</span>
                  {longPressedImage.type?.toUpperCase() === type.id && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay per chiudere il toggle */}
      {showTypeToggle && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => {
            setShowTypeToggle(false);
            setLongPressedImage(null);
          }}
        ></div>
      )}
    </div>
  );
} 