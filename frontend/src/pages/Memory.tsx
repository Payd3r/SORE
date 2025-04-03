import { getMemories } from '../api/memory';
import type { Memory } from '../api/memory';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import MemoryUploadModal from '../components/Memories/MemoryUploadModal';
import MemoryCard from '../components/Memories/MemoryCard';
import { useAuth } from '../contexts/AuthContext';
import { useInView } from 'react-intersection-observer';
import UploadStatus from '../components/Images/UploadStatus';
import { useUpload } from '../contexts/UploadContext';
import { useQueryClient } from '@tanstack/react-query';

type ImageTypeFilter = 'all' | 'VIAGGIO' | 'EVENTO' | 'SEMPLICE';

interface MemoryImage {
  id: number;
  thumb_big_path: string;
  created_at: string;
  width: number;
  height: number;
}

interface MemoryWithImages extends Memory {
  images: MemoryImage[];
}

export default function Memory() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { uploadingFiles, setUploadingFiles, showUploadStatus, setShowUploadStatus, hasActiveUploads } = useUpload();
  const [selectedTypes, setSelectedTypes] = useState<Set<ImageTypeFilter>>(new Set());
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [visibleMemories, setVisibleMemories] = useState<number>(12);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Ripristina lo stato dell'upload dal localStorage
  useEffect(() => {
    const savedUploadingFiles = localStorage.getItem('uploadingFiles');
    const isUploading = localStorage.getItem('isUploading');
    
    if (savedUploadingFiles && isUploading) {
      setUploadingFiles(JSON.parse(savedUploadingFiles));
      setShowUploadStatus(true);
    }
  }, []);

  // React Query per il fetching dei ricordi
  const { data: memories = [], isLoading } = useQuery<MemoryWithImages[]>({
    queryKey: ['memories'],
    queryFn: async () => {
      const data = await getMemories();
      return data.map(memory => ({
        ...memory,
        images: memory.images.map(img => ({
          ...img,
          created_at: memory.created_at,
          width: 1920,
          height: 1080
        }))
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  // Funzione per ottimizzare il layout della griglia
  const optimizeGridLayout = useMemo(() => {
    return (memories: MemoryWithImages[]) => {
      // Calcola quanti elementi per riga in base alla viewport
      const getColumnsPerRow = () => {
        if (windowWidth >= 1536) return 6; // 2xl
        if (windowWidth >= 1280) return 5; // xl
        if (windowWidth >= 1024) return 4; // lg
        if (windowWidth >= 640) return 2; // sm
        return 1; // mobile
      };

      const columnsPerRow = getColumnsPerRow();
      let currentRow: MemoryWithImages[] = [];
      let optimizedLayout: MemoryWithImages[] = [];
      let currentRowWidth = 0;

      // Funzione per ottenere la larghezza di un elemento
      const getItemWidth = (memory: MemoryWithImages) => {
        return memory.type.toLowerCase() === 'viaggio' || memory.type.toLowerCase() === 'evento' ? 2 : 1;
      };

      // Funzione per calcolare il punteggio di priorità di un ricordo
      const getMemoryScore = (memory: MemoryWithImages) => {
        const now = new Date().getTime();
        const memoryDate = new Date(memory.start_date || memory.created_at).getTime();
        const daysDifference = Math.abs(now - memoryDate) / (1000 * 60 * 60 * 24);

        // Punteggio base per tipo
        let score = memory.type.toLowerCase() === 'viaggio' ? 100 :
          memory.type.toLowerCase() === 'evento' ? 50 : 25;

        // Bonus per ricordi recenti (ultimi 7 giorni)
        if (daysDifference <= 7) {
          score += 50;
        }
        // Bonus per ricordi dell'ultimo mese
        else if (daysDifference <= 30) {
          score += 25;
        }
        // Bonus per ricordi degli ultimi 3 mesi
        else if (daysDifference <= 90) {
          score += 10;
        }

        // Bonus per ricordi con più foto
        if (memory.tot_img > 1) {
          score += Math.min(memory.tot_img * 2, 20); // Max 20 punti di bonus per le foto
        }

        // Bonus per ricordi con location
        if (memory.location) {
          score += 5;
        }

        // Bonus per viaggi con canzone
        if (memory.type.toLowerCase() === 'viaggio' && memory.song) {
          score += 10;
        }

        return score;
      };

      // Funzione per aggiungere un elemento alla riga corrente o iniziare una nuova riga
      const addToRow = (memory: MemoryWithImages) => {
        const width = getItemWidth(memory);

        // Se la riga corrente è vuota o c'è spazio sufficiente
        if (currentRowWidth === 0 || currentRowWidth + width <= columnsPerRow) {
          currentRow.push(memory);
          currentRowWidth += width;
        } else {
          // Completa la riga corrente
          optimizedLayout.push(...currentRow);
          currentRow = [memory];
          currentRowWidth = width;
        }
      };

      // Ordina tutti i ricordi per punteggio
      const sortedMemories = [...memories].sort((a, b) => {
        const scoreA = getMemoryScore(a);
        const scoreB = getMemoryScore(b);
        return scoreB - scoreA;
      });

      // Distribuisci i ricordi ordinati
      sortedMemories.forEach(memory => addToRow(memory));

      // Aggiungi l'ultima riga
      if (currentRow.length > 0) {
        optimizedLayout.push(...currentRow);
      }

      return optimizedLayout;
    };
  }, [windowWidth]);

  // Configurazione dell'observer per il lazy loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '100px',
  });

  // Filtra e ordina i ricordi
  const filteredAndSortedMemories = useMemo(() => {
    let filtered = memories;

    // Filtra per ricerca
    if (searchQuery) {
      filtered = filtered.filter((memory: MemoryWithImages) =>
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.song?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtra per tipo solo se ci sono tipi selezionati
    if (selectedTypes.size > 0) {
      filtered = filtered.filter((memory: MemoryWithImages) => {
        const upperCaseType = memory.type.toUpperCase() as ImageTypeFilter;
        return selectedTypes.has(upperCaseType);
      });
    }

    // Applica l'ottimizzazione del layout con ordinamento intelligente
    const memoriesWithImages = filtered.map((memory: MemoryWithImages) => ({
      ...memory,
      images: memory.images.map((img: MemoryImage) => ({
        ...img,
        width: 1920,
        height: 1080
      }))
    }));
    return optimizeGridLayout(memoriesWithImages);
  }, [memories, searchQuery, selectedTypes, optimizeGridLayout]);

  // Funzione per caricare più ricordi
  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleMemories(prev => {
      const next = prev + 12;
      if (next >= filteredAndSortedMemories.length) {
        setHasMore(false);
      }
      return next;
    });
  }, [filteredAndSortedMemories.length]);

  // Effetto per il lazy loading
  useEffect(() => {
    if (inView && hasMore) {
      loadMore();
    }
  }, [inView, hasMore, loadMore]);

  // Reset del lazy loading quando cambiano i filtri
  useEffect(() => {
    setVisibleMemories(12);
    setHasMore(true);
  }, [searchQuery, selectedTypes]);


  // Chiudi i dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.type-menu')) {
        setIsTypeMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Gestisci il click sul tipo
  const handleTypeClick = (type: ImageTypeFilter) => {
    setSelectedTypes(prev => {
      const newTypes = new Set(prev);
      if (newTypes.has(type)) {
        newTypes.delete(type);
      } else {
        newTypes.add(type);
      }
      return newTypes;
    });
    setIsTypeMenuOpen(false);
  };

  // Ottieni il testo del pulsante del filtro
  const getFilterButtonText = () => {
    if (selectedTypes.size === 0) return 'Filtra';
    return `${selectedTypes.size} ${selectedTypes.size === 1 ? 'filtro' : 'filtri'}`;
  };

  // Effetto per il ridimensionamento della finestra
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 mb-4">
          <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Caricamento in corso...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Stiamo preparando i tuoi ricordi</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-900 dark:text-white">Effettua l'accesso per visualizzare i ricordi</div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-transparent pb-[50px] sm:pb-[200px]">
        {/* Safe area per la notch */}
        <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>

        {/* Contenuto principale */}
        <div className="relative max-w-7xl mx-auto">
          <div className="mx-2 sm:mx-0 px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
            <div className="max-w-[2000px] mx-auto space-y-4 sm:space-y-6">
              {/* Title and Add Button */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-1">I tuoi Ricordi</h1>
                  <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                    Gestisci e organizza i tuoi ricordi speciali
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveUploads && (
                    <button
                      onClick={() => {
                        setShowUploadStatus(true);
                      }}
                      className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none touch-manipulation"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="hidden sm:inline">Upload</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none touch-manipulation"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Carica</span>
                  </button>
                </div>
              </div>

              {/* Search Box and Filter Button */}
              <div className="flex items-center gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Cerca ricordi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-search"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Type Filter Dropdown */}
                <div className="relative type-menu">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTypeMenuOpen(!isTypeMenuOpen);
                    }}
                    className="flex items-center gap-2 h-[46px] px-4 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none whitespace-nowrap"
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
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[9999]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTypeClick('VIAGGIO');
                        }}
                        className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${selectedTypes.has('VIAGGIO') ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-white'
                          }`}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedTypes.has('VIAGGIO')
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          {selectedTypes.has('VIAGGIO') && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        Viaggio
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTypeClick('EVENTO');
                        }}
                        className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${selectedTypes.has('EVENTO') ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-white'
                          }`}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedTypes.has('EVENTO')
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          {selectedTypes.has('EVENTO') && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        Evento
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTypeClick('SEMPLICE');
                        }}
                        className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${selectedTypes.has('SEMPLICE') ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-white'
                          }`}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedTypes.has('SEMPLICE')
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          {selectedTypes.has('SEMPLICE') && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        Ricordo Semplice
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Memories Grid */}
            <div className="w-full pb-8 lg:pt-6 pt-4">
              <div className="max-w-[2000px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                  {filteredAndSortedMemories.slice(0, visibleMemories).map((memory) => (
                    <div
                      key={memory.id}
                      className={`${memory.type.toLowerCase() === 'viaggio'
                        ? 'sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2'
                        : memory.type.toLowerCase() === 'evento'
                          ? 'sm:col-span-2 lg:col-span-2'
                          : ''
                        }`}
                    >
                      <MemoryCard memory={memory} />
                    </div>
                  ))}
                </div>

                {/* Loading indicator */}
                {hasMore && filteredAndSortedMemories.length > visibleMemories && (
                  <div ref={loadMoreRef} className="flex justify-center items-center py-8">
                    <div className="w-10 h-10">
                      <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                )}

                {/* No results message */}
                {filteredAndSortedMemories.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Nessun ricordo trovato</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Status Modal */}
      <UploadStatus
        show={showUploadStatus}
        uploadingFiles={uploadingFiles}
        onClose={() => setShowUploadStatus(false)}
      />

      {/* Memory Upload Modal */}
      <MemoryUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['memories'] });
        }}
        setUploadingFiles={setUploadingFiles}
        setShowUploadStatus={setShowUploadStatus}
      />
    </>
  );
} 