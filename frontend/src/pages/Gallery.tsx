import { useEffect, useState, useCallback } from 'react';
import { getGalleryImages, ImageType, uploadImages, getImageUrl, deleteImage, pollImageStatus, ImageStatusResponse } from '../api/images';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import ImageUploadModal from '../components/Images/ImageUploadModal';
import ImageDetailModal from '../components/Images/ImageDetailModal';
import UploadStatus from '../components/Images/UploadStatus';
import { useLocation } from 'react-router-dom';
import LazyImage from '../components/Images/LazyImage';
import { useVirtualizer } from '@tanstack/react-virtual';

type SortOption = 'newest' | 'oldest' | 'random';
type ImageTypeFilter = 'all' | 'COPPIA' | 'SINGOLO' | 'PAESAGGIO' | 'CIBO';

interface GroupedImages {
  [key: string]: {
    date: Date;
    images: ImageType[];
  }
}

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'month'
  const [isCompactGrid, setIsCompactGrid] = useState(true); // false = 5 colonne, true = 8 colonne
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ImageTypeFilter>>(new Set());
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const { isLoading: authLoading } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();
  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: string]: {
      fileName: string;
      status: 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';
      progress: number;
      message: string;
    }
  }>({});
  const [showUploadStatus, setShowUploadStatus] = useState(false);

  // React Query per il fetching delle immagini
  const { data: images = [], isLoading: loading, refetch } = useQuery<ImageType[]>({
    queryKey: ['galleryImages'],
    queryFn: getGalleryImages,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  useEffect(() => {
    if (location.state?.openUploadModal) {
      setIsUploadModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleUpload = async (files: File[]) => {
    setShowUploadStatus(true);

    const initialUploadState = files.reduce((acc, file) => {
      acc[file.name] = {
        fileName: file.name,
        status: 'queued' as const,
        progress: 0,
        message: 'In coda...'
      };
      return acc;
    }, {} as typeof uploadingFiles);

    setUploadingFiles(initialUploadState);

    try {
      const response = await uploadImages(files);

      setUploadingFiles(prev => {
        const newState = { ...prev };
        response.data.forEach(({ file }) => {
          if (newState[file]) {
            newState[file].status = 'processing';
            newState[file].progress = 0;
            newState[file].message = 'Inizio processamento';
          }
        });
        return newState;
      });

      response.data.forEach(({ jobId, file }) => {
        pollImageStatus(jobId, (status: ImageStatusResponse) => {
          setUploadingFiles(prev => {
            const newState = { ...prev };
            if (newState[file]) {
              newState[file].status = status.state;
              newState[file].progress = status.progress;
              newState[file].message = status.status;
              if (status.state === 'completed') {
                setTimeout(() => {
                  setUploadingFiles(prev => {
                    const newState = { ...prev };
                    delete newState[file];
                    if (Object.keys(newState).length === 0) {
                      setShowUploadStatus(false);
                    }
                    return newState;
                  });
                }, 2000);
                // Ricarica le immagini usando React Query
                refetch();
              } else if (status.state === 'failed') {
                newState[file].message = 'Errore durante il caricamento';
              } else if (status.state === 'notfound') {
                newState[file].message = 'File non trovato';
              }
            }
            return newState;
          });
        });
      });

    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadingFiles(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(fileName => {
          newState[fileName].status = 'failed';
          newState[fileName].progress = 0;
          newState[fileName].message = 'Errore durante il caricamento';
        });
        return newState;
      });
    }
  };

  // Funzione per raggruppare le immagini per mese/anno
  const groupImagesByMonth = (images: ImageType[]): GroupedImages => {
    return images.reduce((groups: GroupedImages, image) => {
      const date = new Date(image.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!groups[key]) {
        groups[key] = {
          date: date,
          images: []
        };
      }

      groups[key].images.push(image);
      return groups;
    }, {});
  };

  // Funzione per formattare il titolo del mese
  const formatMonthTitle = (date: Date): string => {
    return date.toLocaleString('it-IT', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Funzione per ordinare le immagini
  const getSortedImages = (images: ImageType[]): ImageType[] => {
    switch (sortBy) {
      case 'newest':
        return [...images].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return [...images].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'random':
        return [...images].sort(() => Math.random() - 0.5);
      default:
        return images;
    }
  };

  // Funzione per filtrare le immagini per tipo
  const getFilteredImages = (images: ImageType[]): ImageType[] => {
    // Se non ci sono tipi selezionati, mostra tutte le immagini
    if (selectedTypes.size === 0) {
      return images;
    }

    // Filtra le immagini se c'è almeno un tipo selezionato
    const filteredImages = images.filter(image => {
      const upperCaseType = image.type.toUpperCase() as ImageTypeFilter;
      const isIncluded = selectedTypes.has(upperCaseType);
      return isIncluded;
    });

    return filteredImages;
  };

  // Ottieni il testo del pulsante di ordinamento
  const getSortButtonText = () => {
    switch (sortBy) {
      case 'newest':
        return 'Organizza';
      case 'oldest':
        return 'Organizza';
      case 'random':
        return 'Organizza';
      default:
        return 'Organizza';
    }
  };

  // Ottieni il testo del pulsante del filtro
  const getFilterButtonText = () => {
    if (selectedTypes.size === 3) return 'Filtra';
    if (selectedTypes.size === 0) return 'Filtra';
    return 'Filtra';
  };

  // Chiudi tutti i dropdown quando si clicca fuori o si apre un modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sort-menu')) {
        setIsSortMenuOpen(false);
      }
      if (!target.closest('.type-menu')) {
        setIsTypeMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Chiudi i dropdown quando si cambia tab o si attiva la modalità selezione
  useEffect(() => {
    setIsTypeMenuOpen(false);
    setIsSortMenuOpen(false);
  }, [activeTab, isSelectionMode]);

  const handleTypeClick = (type: ImageTypeFilter) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);
  };

  const handleImageClick = (image: ImageType) => {
    if (isSelectionMode) {
      const newSet = new Set(selectedImages);
      if (newSet.has(image.id)) {
        newSet.delete(image.id);
      } else {
        newSet.add(image.id);
      }
      setSelectedImages(newSet);
    } else {
      setSelectedImage(image);
      setIsDetailModalOpen(true);
    }
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(Array.from(selectedImages).map(id => deleteImage(id)));
      setSelectedImages(new Set());
      setIsSelectionMode(false);
      await refetch();
    } catch (error) {
      // Gestione silenziosa dell'errore
    } finally {
      setIsDeleting(false);
    }
  };

  const parentRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const resizeObserver = new ResizeObserver(() => {
        // Ricalcola il layout quando la dimensione del container cambia
        virtualizer.measure();
      });
      resizeObserver.observe(node);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Calcola il numero di colonne in base alla larghezza del container e alla modalità griglia
  const getColumnCount = () => {
    if (window.innerWidth < 640) return isCompactGrid ? 3 : 2; // Mobile
    if (window.innerWidth < 1024) return isCompactGrid ? 5 : 3; // Tablet
    return isCompactGrid ? 8 : 5; // Desktop
  };

  const columnCount = getColumnCount();
  const sortedAndFilteredImages = getFilteredImages(getSortedImages(images));

  const getEstimatedSize = () => {
    // Ottieni la larghezza della viewport
    const viewportWidth = window.innerWidth;

    // Mobile (< 640px)
    if (viewportWidth < 640) {
      return isCompactGrid ? 120 : 180; // 3 colonne in compatto, 2 in espanso
    }

    // Tablet (640px - 1024px)
    if (viewportWidth < 1024) {
      return isCompactGrid ? 150 : 200; // 5 colonne in compatto, 3 in espanso
    }

    // Desktop (>= 1024px)
    return isCompactGrid ? 150 : 245; // 8 colonne in compatto, 5 in espanso
  };

  const virtualizer = useVirtualizer({
    count: Math.ceil(sortedAndFilteredImages.length / columnCount),
    getScrollElement: () => document.getElementById('gallery-container'),
    estimateSize: getEstimatedSize,
    overscan: 5,
  });

  // Aggiungiamo un effetto per ricalcolare il virtualizer quando cambia la modalità
  useEffect(() => {
    virtualizer.measure();
  }, [isCompactGrid]);

  // Aggiungiamo un listener per il resize della finestra
  useEffect(() => {
    const handleResize = () => {
      virtualizer.measure();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Funzione per ottenere le immagini per una specifica riga
  const getRowImages = (rowIndex: number) => {
    const startIdx = rowIndex * columnCount;
    return sortedAndFilteredImages.slice(startIdx, startIdx + columnCount);
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 mb-4">
          <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Caricamento in corso...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Stiamo preparando la tua galleria</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex-1 overflow-y-auto gallery-container"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="w-full min-h-screen bg-transparent sm:mb-[150px]">
          <div className="relative max-w-7xl mx-auto">
            {/* Safe area per la notch */}
            <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>
            <div className="mx-2 sm:mx-0 px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
              <div className="max-w-[2000px] mx-auto space-y-4 sm:space-y-6">
                {/* Title and Actions */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-start flex-col gap-2">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-1">Galleria</h1>
                    <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                      Gestisci e organizza le tue foto
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {Object.keys(uploadingFiles).length > 0 && (
                      <button
                        onClick={() => {
                          setShowUploadStatus(true);
                        }}
                        className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="hidden sm:inline">Upload</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsSelectionMode(prev => !prev);
                        setSelectedImages(new Set());
                      }}
                      className={`btn flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${isSelectionMode
                        ? 'btn-primary'
                        : 'text-gray-700 dark:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        {isSelectionMode ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <span className="hidden sm:inline">{isSelectionMode ? 'Fine' : 'Seleziona'}</span>
                    </button>

                    {isSelectionMode && (
                      <button
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                        className={`btn flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none ${isDeleting
                          ? 'bg-red-400 cursor-not-allowed'
                          : 'btn-danger'
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">{isDeleting ? 'Eliminazione...' : 'Elimina'}</span>
                      </button>
                    )}

                    {!isSelectionMode && (
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Carica</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters and View Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* View Toggle */}
                  <div className="tab-menu w-full sm:w-[400px]">
                    <button
                      className={`tab-menu-item ${activeTab === 'grid'
                        ? 'tab-menu-item-active'
                        : 'tab-menu-item-inactive'
                        }`}
                      onClick={() => setActiveTab('grid')}
                    >
                      <svg className="w-5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span className="hidden sm:inline">Griglia</span>
                    </button>
                    <button
                      className={`tab-menu-item ${activeTab === 'month'
                        ? 'tab-menu-item-active'
                        : 'tab-menu-item-inactive'
                        }`}
                      onClick={() => setActiveTab('month')}
                    >
                      <svg className="w-5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Per mese</span>
                    </button>
                  </div>

                  {/* Sort and Filter Controls */}
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Type Filter Dropdown */}
                    <div className="relative type-menu flex-1 sm:flex-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsTypeMenuOpen(!isTypeMenuOpen);
                          setIsSortMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none w-full justify-center sm:w-auto"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="hidden sm:inline">{getFilterButtonText()}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${isTypeMenuOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isTypeMenuOpen && (
                        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTypeClick('COPPIA');
                            }}
                            className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${selectedTypes.has('COPPIA') ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-white'
                              }`}
                          >
                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedTypes.has('COPPIA')
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}>
                              {selectedTypes.has('COPPIA') && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            Coppia
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTypeClick('SINGOLO');
                            }}
                            className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${selectedTypes.has('SINGOLO') ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-white'
                              }`}
                          >
                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedTypes.has('SINGOLO')
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}>
                              {selectedTypes.has('SINGOLO') && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            Semplice
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTypeClick('PAESAGGIO');
                            }}
                            className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${selectedTypes.has('PAESAGGIO') ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-white'
                              }`}
                          >
                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedTypes.has('PAESAGGIO')
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}>
                              {selectedTypes.has('PAESAGGIO') && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            Paesaggio
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTypeClick('CIBO');
                            }}
                            className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${selectedTypes.has('CIBO') ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-white'
                              }`}
                          >
                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedTypes.has('CIBO')
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}>
                              {selectedTypes.has('CIBO') && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            Cibo
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative sort-menu flex-1 sm:flex-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSortMenuOpen(!isSortMenuOpen);
                          setIsTypeMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none w-full justify-center sm:w-auto"
                      >
                        <span className="hidden sm:inline">{getSortButtonText()}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${isSortMenuOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isSortMenuOpen && (
                        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-10">
                          <button
                            onClick={() => {
                              setSortBy('newest');
                              setIsSortMenuOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors bg-white dark:bg-gray-800 flex items-center focus:outline-none gap-2 ${sortBy === 'newest'
                              ? 'text-blue-500 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                              }`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Più recenti
                          </button>
                          <button
                            onClick={() => {
                              setSortBy('oldest');
                              setIsSortMenuOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors bg-white dark:bg-gray-800 flex items-center focus:outline-none gap-2 ${sortBy === 'oldest'
                              ? 'text-blue-500 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                              }`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Più vecchie
                          </button>
                          <button
                            onClick={() => {
                              setSortBy('random');
                              setIsSortMenuOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors bg-white dark:bg-gray-800 flex items-center focus:outline-none gap-2 ${sortBy === 'random'
                              ? 'text-blue-500 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                              }`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Casuali
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setIsCompactGrid(prev => !prev)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none flex-1 sm:flex-none justify-center"
                      title={isCompactGrid ? "Mostra meno immagini per riga" : "Mostra più immagini per riga"}
                    >
                      {isCompactGrid ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Gallery Content */}
              {images.length === 0 ? (
                <div className="w-full flex items-center justify-center py-20">
                  <div className="text-gray-500 dark:text-gray-400">Galleria Vuota</div>
                </div>
              ) : (
                <div className="w-full pb-8 lg:pt-6 pt-4">
                  <div className="max-w-[2000px] mx-auto">
                    {activeTab === 'grid' ? (
                      <div
                        id="gallery-container"
                        ref={parentRef}
                        className="w-full"
                      >
                        <div
                          style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                          }}
                        >
                          {virtualizer.getVirtualItems().map((virtualRow) => {
                            const rowImages = getRowImages(virtualRow.index);
                            return (
                              <div
                                key={virtualRow.index}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: `${virtualRow.size}px`,
                                  transform: `translateY(${virtualRow.start}px)`,
                                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                                }}
                                className="grid gap-1 sm:gap-2"
                              >
                                {rowImages.map((image) => (
                                  <div
                                    key={image.id}
                                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer ${selectedImages.has(image.id) ? 'ring-2 ring-blue-500' : ''
                                      }`}
                                    onClick={() => handleImageClick(image)}
                                  >
                                    <LazyImage
                                      src={getImageUrl(image.thumb_big_path)}
                                      alt={`Immagine ${image.id}`}
                                      className="w-full h-full object-cover"
                                      placeholderClassName="w-full h-full"
                                    />
                                    {selectedImages.has(image.id) && (
                                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {Object.entries(groupImagesByMonth(sortedAndFilteredImages))
                          .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
                          .map(([key, group]) => (
                            <div key={key} className="space-y-4">
                              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatMonthTitle(group.date)}
                                <span className="text-sm font-normal text-gray-500">
                                  {group.images.length} immagini
                                </span>
                              </h2>
                              <div className={`grid ${isCompactGrid
                                ? 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-0.5'
                                : 'grid-cols-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 sm:gap-2'
                                }`}>
                                {group.images.map((image) => (
                                  <div
                                    key={image.id}
                                    className={`group relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm cursor-pointer ring-2 ring-transparent ${isSelectionMode && selectedImages.has(image.id) ? 'ring-blue-500' : ''
                                      }`}
                                    onClick={() => handleImageClick(image)}
                                  >
                                    <div className="absolute inset-0 bg-white dark:bg-gray-800">
                                      <img
                                        src={getImageUrl(image.thumb_big_path)}
                                        alt={`Immagine ${image.id}`}
                                        className="w-full h-full object-cover"
                                        loading="eager"
                                        decoding="sync"
                                      />
                                    </div>
                                    <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isSelectionMode ? (selectedImages.has(image.id) ? 'opacity-60' : 'opacity-0 group-hover:opacity-40') : 'opacity-0 group-hover:opacity-100'
                                      }`}>
                                      {isSelectionMode && selectedImages.has(image.id) && (
                                        <div className="absolute top-2 right-2">
                                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                      {!isSelectionMode && (
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                          <p className="text-sm">
                                            {new Date(image.created_at).toLocaleDateString('it-IT', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Status Component */}
      {showUploadStatus && (
        <UploadStatus
          show={showUploadStatus}
          uploadingFiles={uploadingFiles}
          onClose={() => setShowUploadStatus(false)}
        />
      )}

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      {/* Image Detail Modal */}
      <ImageDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setSelectedImage(null);
          setTimeout(() => {
            setIsDetailModalOpen(false);
          }, 0);
        }}
        image={selectedImage}
        onImageDeleted={refetch}
      />
    </div>
  );
} 