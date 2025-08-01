import { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMemories, Memory, MemoryType } from '../../api/memory';
import { getIdeas, Idea } from '../../api/ideas';
import Loader from '../../desktop/components/Layout/Loader';
import {
  IoFilter,
  IoSearch,
  IoListOutline
} from 'react-icons/io5';
import IdeaCardMobile from '../components/IdeaCardMobile';
import CardRicordoMobile from '../components/CardRicordoMobile';
import DetailIdeaModal from '../../desktop/components/Idee/DetailIdeaModal';

// Definizione tipi mancanti
type RicordoTypeFilter = 'VIAGGIO' | 'EVENTO' | 'SEMPLICE' | 'FUTURO';
type IdeaTypeFilter = 'RISTORANTI' | 'VIAGGI' | 'SFIDE' | 'SEMPLICI';
type SortOption = 'newest' | 'oldest' | 'random' | 'created_newest' | 'created_oldest';
type CheckedFilter = 'ALL' | 'CHECKED' | 'UNCHECKED';

/**
 * HomeMobile - Versione ottimizzata per PWA con design ispirato a iOS 18
 */
const HomeMobile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ricordi' | 'idee'>('ricordi');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtri per i ricordi
  const [ricordiSelectedTypes, setRicordiSelectedTypes] = useState<Set<RicordoTypeFilter>>(new Set());
  const [ricordiSortBy, setRicordiSortBy] = useState<SortOption>('newest');

  // Filtri per le idee
  const [ideeSelectedTypes, setIdeeSelectedTypes] = useState<Set<IdeaTypeFilter>>(new Set());
  const [ideeSortBy, setIdeeSortBy] = useState<SortOption>('newest');
  const [ideeCheckedFilter, setIdeeCheckedFilter] = useState<CheckedFilter>('ALL');

  // Stato per il modal delle idee
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);

  // Query per i ricordi
  const { data: memoriesData = [], isLoading: isLoadingMemories, refetch: refetchMemories } = useQuery<Memory[]>({
    queryKey: ['memories'],
    queryFn: getMemories,
    staleTime: 5 * 60 * 1000
  });

  // Query per le idee
  const { data: ideasData = [], isLoading: isLoadingIdeas } = useQuery<Idea[]>({
    queryKey: ['ideas'],
    queryFn: getIdeas,
    staleTime: 5 * 60 * 1000
  });

  // Stati per pull-to-refresh
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Filtra i ricordi
  const filteredRicordi = useMemo(() => {
    // Applica i filtri
    let ricordi = memoriesData
      .filter((memory: Memory) => {
        // Normalizza il tipo del ricordo come in CardRicordoMobile
        const normalizedType = memory.type.toUpperCase() as MemoryType;

        const matchesType = ricordiSelectedTypes.size === 0 ||
          ricordiSelectedTypes.has(normalizedType);
        const matchesSearch = !searchQuery ||
          memory.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesType && matchesSearch;
      });

    // --- Ordinamento speciale per FUTURO ---
    if (ricordiSortBy === 'newest') {
      // Futuri in cima, ordinati per data (senza data prima, poi per data crescente, poi created_at)
      const futuri = ricordi.filter(m => m.type.toUpperCase() === 'FUTURO')
        .sort((a, b) => {
          if (!a.start_date && b.start_date) return -1;
          if (a.start_date && !b.start_date) return 1;
          if (!a.start_date && !b.start_date) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime();
        });
      const altri = ricordi.filter(m => m.type.toUpperCase() !== 'FUTURO')
        .sort((a: Memory, b: Memory) => {
          const aDate = a.end_date ? new Date(a.end_date).getTime() : (a.start_date ? new Date(a.start_date).getTime() : 0);
          const bDate = b.end_date ? new Date(b.end_date).getTime() : (b.start_date ? new Date(b.start_date).getTime() : 0);
          return bDate - aDate;
        });
      return [...futuri, ...altri];
    } else if (ricordiSortBy === 'oldest') {
      // Futuri in fondo, ordinati per data (senza data prima, poi per data crescente, poi created_at)
      const altri = ricordi.filter(m => m.type.toUpperCase() !== 'FUTURO')
        .sort((a: Memory, b: Memory) => {
          const aDate = a.end_date ? new Date(a.end_date).getTime() : (a.start_date ? new Date(a.start_date).getTime() : 0);
          const bDate = b.end_date ? new Date(b.end_date).getTime() : (b.start_date ? new Date(b.start_date).getTime() : 0);
          return aDate - bDate;
        });
      const futuri = ricordi.filter(m => m.type.toUpperCase() === 'FUTURO')
        .sort((a, b) => {
          if (!a.start_date && b.start_date) return -1;
          if (a.start_date && !b.start_date) return 1;
          if (!a.start_date && !b.start_date) {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          }
          return new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime();
        });
      return [...altri, ...futuri];
    } else if (ricordiSortBy === 'random') {
      // Mischia tutto, inclusi i futuri
      return ricordi
        .map(r => ({ r, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ r }) => r);
    } else if (ricordiSortBy === 'created_newest') {
      // Tutti per created_at discendente
      return ricordi.sort((a, b) => {
        const aCreatedDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bCreatedDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bCreatedDate - aCreatedDate;
      });
    } else if (ricordiSortBy === 'created_oldest') {
      // Tutti per created_at ascendente
      return ricordi.sort((a, b) => {
        const aCreatedDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bCreatedDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aCreatedDate - bCreatedDate;
      });
    } else {
      // Default: per data crescente
      return ricordi.sort((a: Memory, b: Memory) => {
        const aDate = a.end_date ? new Date(a.end_date).getTime() : (a.start_date ? new Date(a.start_date).getTime() : 0);
        const bDate = b.end_date ? new Date(b.end_date).getTime() : (b.start_date ? new Date(b.start_date).getTime() : 0);
        return aDate - bDate;
      });
    }
  }, [memoriesData, ricordiSelectedTypes, searchQuery, ricordiSortBy]);

  // Filtra le idee
  const filteredIdeas = useMemo(() => {
    // Applica i filtri
    return ideasData
      .filter((idea: Idea) => {
        const matchesType = ideeSelectedTypes.size === 0 ||
          (idea.type && ideeSelectedTypes.has(idea.type as IdeaTypeFilter));
        const matchesSearch = !searchQuery ||
          idea.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesChecked = ideeCheckedFilter === 'ALL' ||
          (ideeCheckedFilter === 'CHECKED' && idea.checked === 1) ||
          (ideeCheckedFilter === 'UNCHECKED' && idea.checked !== 1);

        return matchesType && matchesSearch && matchesChecked;
      })
      .sort((a: Idea, b: Idea) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;

        if (ideeSortBy === 'random') {
          // Genera un numero casuale fisso per ogni idea
          const randomA = ((a.id || 0) % 100) / 100;
          const randomB = ((b.id || 0) % 100) / 100;
          return randomA - randomB;
        } else if (ideeSortBy === 'newest') {
          return bDate - aDate;
        } else {
          return aDate - bDate;
        }
      });
  }, [ideasData, ideeSelectedTypes, searchQuery, ideeSortBy, ideeCheckedFilter]);

  // Reimposta i filtri dei ricordi e ricarica in ordine casuale
  const handleRefreshRicordi = useCallback(() => {
    setRicordiSelectedTypes(new Set());
    setRicordiSortBy('newest');
    setSearchQuery('');
    return refetchMemories();
  }, [refetchMemories]);

  // Gestione navigazione al ricordo
  const handleRicordoClick = (ricordoId: number) => {
    // Salva l'ID del ricordo cliccato nel localStorage
    localStorage.setItem('last_clicked_memory_id', ricordoId.toString());

    // Aggiungi la classe per nascondere la DownBar, come in DetailMemoryMobile
    document.body.classList.add('detail-memory-active');

    // Aggiungi stile inline per nascondere la downbar
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Nasconde la barra di navigazione inferiore */
      body.detail-memory-active .fixed.bottom-0.left-0.right-0.z-50.backdrop-blur-xl {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      body.detail-memory-active {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Naviga con un breve ritardo per permettere di vedere il feedback
    requestAnimationFrame(() => {
      setTimeout(() => {
        navigate(`/ricordo/${ricordoId}`);
      }, 50); // delay minimo per il feedback visivo
    });
  };

  // Gestione apertura modal idea
  const handleIdeaClick = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsIdeaModalOpen(true);
  };

  // Gestione chiusura modal idea
  const handleIdeaModalClose = () => {
    setIsIdeaModalOpen(false);
    setSelectedIdea(null);
  };

  // Calcola il numero totale di filtri attivi
  const getActiveFiltersCount = () => {
    if (activeTab === 'ricordi') {
      return ricordiSelectedTypes.size;
    } else {
      return ideeSelectedTypes.size + (ideeCheckedFilter !== 'ALL' ? 1 : 0);
    }
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  // Preprocessa l'array di ricordi per ottimizzare il layout
  const optimizedRicordiLayout = useMemo(() => {
    const ricordi = [...filteredRicordi];
    // Raggruppa tutti i ricordi futuri ovunque si trovino
    const futureMemories = ricordi.filter(r => r.type.toUpperCase() === 'FUTURO');
    // Resto dei ricordi (non futuri)
    let rest = ricordi.filter(r => r.type.toUpperCase() !== 'FUTURO');

    const rows: { items: Memory[]; colSpans: number[] }[] = [];
    let i = 0;
    // Se esiste la card Futuro, la metto nella prima colonna della prima riga
    if (futureMemories.length > 0) {
      if (rest.length > 0 && rest[0].type.toUpperCase() !== 'VIAGGIO') {
        // Prima riga: card Futuro + prima card Evento/Semplice
        rows.push({ items: [futureMemories[0], rest[0]], colSpans: [1, 1] });
        rest = rest.slice(1);
      } else {
        // Prima riga: solo card Futuro
        rows.push({ items: [futureMemories[0]], colSpans: [1] });
      }
    }
    i = 0;
    while (i < rest.length) {
      const curr = rest[i];
      const currType = curr.type.toUpperCase();
      if (currType === 'VIAGGIO') {
        rows.push({ items: [curr], colSpans: [2] });
        i += 1;
      } else {
        // Prova a trovare una seconda card EVENTO/SEMPLICE per la riga
        let foundPair = false;
        for (let j = i + 1; j < rest.length; j++) {
          const next = rest[j];
          const nextType = next.type.toUpperCase();
          if (nextType !== 'VIAGGIO') {
            // Sposta la card trovata subito dopo la corrente
            if (j !== i + 1) {
              const [spliced] = rest.splice(j, 1);
              rest.splice(i + 1, 0, spliced);
            }
            rows.push({ items: [curr, rest[i + 1]], colSpans: [1, 1] });
            i += 2;
            foundPair = true;
            break;
          }
        }
        if (!foundPair) {
          // Nessuna card accoppiabile: espandi la card corrente
          rows.push({ items: [curr], colSpans: [2] });
          i += 1;
        }
      }
    }
    return { futureMemories, rows };
  }, [filteredRicordi]);

  // Handler touch per pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeTab !== 'ricordi') return;
    if (scrollAreaRef.current && scrollAreaRef.current.scrollTop === 0) {
      setTouchStartY(e.touches[0].clientY);
      setIsPulling(true);
      setPullDistance(0);
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || touchStartY === null) return;
    const delta = e.touches[0].clientY - touchStartY;
    if (delta > 0) {
      setPullDistance(delta > 120 ? 120 : delta);
    }
  };
  const handleTouchEnd = async () => {
    if (!isPulling) return;
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await handleRefreshRicordi();
      setIsRefreshing(false);
    }
    setIsPulling(false);
    setPullDistance(0);
    setTouchStartY(null);
  };

  if (isLoadingMemories || isLoadingIdeas) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[100000]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative pb-[19%]">
      {/* Sfondo sfumato in alto */}
      <div
        className="absolute top-0 left-0 right-0 z-30 pointer-events-none h-[120px]"
        style={{
          background: 'transparent',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          backdropFilter: 'blur(16px)'
        }}
      ></div>

      {/* Header con tabs e filtri */}
      <div className="absolute top-0 left-0 right-0 z-40 px-4 pt-14 pb-4 space-y-4">
        {/* Tab switcher in stile iOS 18 */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setIsFilterMenuOpen(!isFilterMenuOpen);
              if (!isFilterMenuOpen && isSearchOpen) {
                setIsSearchOpen(false);
              }
            }}
            className={`p-2 rounded-full ${isFilterMenuOpen ? 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 backdrop-blur-xl' : 'bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-xl'} text-[#007AFF] dark:text-[#0A84FF] relative`}
          >
            <IoFilter className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>

          <div className="inline-flex items-center rounded-full bg-gray-200/70 dark:bg-gray-800/70 p-1.5 backdrop-blur-xl shadow-sm flex-1 mx-5">
            <button
              onClick={() => setActiveTab('ricordi')}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'ricordi'
                ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                }`}
              aria-selected={activeTab === 'ricordi'}
            >
              Ricordi
            </button>
            <button
              onClick={() => setActiveTab('idee')}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'idee'
                ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                }`}
              aria-selected={activeTab === 'idee'}
            >
              Idee
            </button>
          </div>

          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (!isSearchOpen && isFilterMenuOpen) {
                setIsFilterMenuOpen(false);
              }
            }}
            className={`p-2 rounded-full ${isSearchOpen ? 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 backdrop-blur-xl' : 'bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-xl'} text-[#007AFF] dark:text-[#0A84FF]`}
          >
            <IoSearch className="w-5 h-5" />
          </button>
        </div>

        {/* Barra di ricerca */}
        {isSearchOpen && (
          <div className="mt-3">
            <input
              type="text"
              placeholder={activeTab === 'ricordi' ? "Cerca ricordi..." : "Cerca idee..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-8 pr-2 text-xs bg-gray-200/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-full border-0 shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              autoFocus
            />

            {searchQuery && (
              <button
                className="absolute right-6 top-[5.5rem] transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 bg-transparent outline-none active:outline-none"
                onClick={() => setSearchQuery('')}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Menu filtri in stile iOS 18 */}
      {isFilterMenuOpen && (
        <div className="absolute top-32 left-4 right-4 z-50 bg-gray-200/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden">
          {/* Ordinamento */}
          <div className="pt-4 pb-3 px-4">
            <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3">Ordinamento</h3>
            <div className="flex flex-wrap gap-2">
              {activeTab === 'ricordi' ? (
                <>
                  <button
                    onClick={() => {
                      setRicordiSortBy('newest');
                      setIsFilterMenuOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ricordiSortBy === 'newest'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                  >
                    Data più recente
                  </button>
                  <button
                    onClick={() => {
                      setRicordiSortBy('oldest');
                      setIsFilterMenuOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ricordiSortBy === 'oldest'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                  >
                    Data meno recente
                  </button>
                  <button
                    onClick={() => {
                      setRicordiSortBy('created_newest');
                      setIsFilterMenuOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ricordiSortBy === 'created_newest'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                  >
                    Creazione recente
                  </button>
                  <button
                    onClick={() => {
                      setRicordiSortBy('created_oldest');
                      setIsFilterMenuOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ricordiSortBy === 'created_oldest'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                  >
                    Creazione meno recente
                  </button>
                  <button
                    onClick={() => {
                      setRicordiSortBy('random');
                      setIsFilterMenuOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ricordiSortBy === 'random'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                  >
                    Casuale
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIdeeSortBy('newest');
                      setIsFilterMenuOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeSortBy === 'newest'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                  >
                    Più recenti
                  </button>
                  <button
                    onClick={() => {
                      setIdeeSortBy('oldest');
                      setIsFilterMenuOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeSortBy === 'oldest'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                  >
                    Meno recenti
                  </button>
                  <button
                    onClick={() => {
                      setIdeeSortBy('random');
                      setIsFilterMenuOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeSortBy === 'random'
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                  >
                    Casuale
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Separatore */}
          <div className="mx-4 h-[0.5px] bg-gray-300/50 dark:bg-gray-600/50"></div>

          {/* Filtri per tipo - Ricordi */}
          {activeTab === 'ricordi' && (
            <div className="pt-3 pb-3 px-4">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3">Tipo di ricordo</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const newSet = new Set(ricordiSelectedTypes);
                    if (newSet.has('VIAGGIO')) {
                      newSet.delete('VIAGGIO');
                    } else {
                      newSet.add('VIAGGIO');
                    }
                    setRicordiSelectedTypes(newSet);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ricordiSelectedTypes.has('VIAGGIO')
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Viaggio
                </button>
                <button
                  onClick={() => {
                    const newSet = new Set(ricordiSelectedTypes);
                    if (newSet.has('EVENTO')) {
                      newSet.delete('EVENTO');
                    } else {
                      newSet.add('EVENTO');
                    }
                    setRicordiSelectedTypes(newSet);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ricordiSelectedTypes.has('EVENTO')
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Evento
                </button>
                <button
                  onClick={() => {
                    const newSet = new Set(ricordiSelectedTypes);
                    if (newSet.has('SEMPLICE')) {
                      newSet.delete('SEMPLICE');
                    } else {
                      newSet.add('SEMPLICE');
                    }
                    setRicordiSelectedTypes(newSet);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ricordiSelectedTypes.has('SEMPLICE')
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Semplice
                </button>
                <button
                  onClick={() => {
                    const newSet = new Set(ricordiSelectedTypes);
                    if (newSet.has('FUTURO')) {
                      newSet.delete('FUTURO');
                    } else {
                      newSet.add('FUTURO');
                    }
                    setRicordiSelectedTypes(newSet);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ricordiSelectedTypes.has('FUTURO')
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Futuro
                </button>
              </div>
            </div>
          )}

          {/* Filtri per tipo - Idee */}
          {activeTab === 'idee' && (
            <div className="pt-3 pb-3 px-4">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3">Tipo di idea</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const newSet = new Set(ideeSelectedTypes);
                    if (newSet.has('SEMPLICI')) {
                      newSet.delete('SEMPLICI');
                    } else {
                      newSet.add('SEMPLICI');
                    }
                    setIdeeSelectedTypes(newSet);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeSelectedTypes.has('SEMPLICI')
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Semplice
                </button>
                <button
                  onClick={() => {
                    const newSet = new Set(ideeSelectedTypes);
                    if (newSet.has('RISTORANTI')) {
                      newSet.delete('RISTORANTI');
                    } else {
                      newSet.add('RISTORANTI');
                    }
                    setIdeeSelectedTypes(newSet);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeSelectedTypes.has('RISTORANTI')
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Ristorante
                </button>
                <button
                  onClick={() => {
                    const newSet = new Set(ideeSelectedTypes);
                    if (newSet.has('SFIDE')) {
                      newSet.delete('SFIDE');
                    } else {
                      newSet.add('SFIDE');
                    }
                    setIdeeSelectedTypes(newSet);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeSelectedTypes.has('SFIDE')
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Sfida
                </button>
                <button
                  onClick={() => {
                    const newSet = new Set(ideeSelectedTypes);
                    if (newSet.has('VIAGGI')) {
                      newSet.delete('VIAGGI');
                    } else {
                      newSet.add('VIAGGI');
                    }
                    setIdeeSelectedTypes(newSet);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeSelectedTypes.has('VIAGGI')
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Viaggio
                </button>
              </div>

              {/* Separatore */}
              <div className="my-3 h-[0.5px] bg-gray-300/50 dark:bg-gray-600/50"></div>

              {/* Filtri per stato (completato/non completato) */}
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3">Stato</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setIdeeCheckedFilter('ALL');
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeCheckedFilter === 'ALL'
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Tutte
                </button>
                <button
                  onClick={() => {
                    setIdeeCheckedFilter('CHECKED');
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeCheckedFilter === 'CHECKED'
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Completate
                </button>
                <button
                  onClick={() => {
                    setIdeeCheckedFilter('UNCHECKED');
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-full transition-all duration-200 ${ideeCheckedFilter === 'UNCHECKED'
                    ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                >
                  Da completare
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Area contenuto principale con scorrimento */}
      <div
        className="flex-1 overflow-auto pt-[34%] pb-4 px-4"
        ref={scrollAreaRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={activeTab === 'ricordi' && (isPulling || isRefreshing) ? { touchAction: 'none' } : {}}
      >
        {/* Indicatore di pull-to-refresh */}
        {activeTab === 'ricordi' && (isPulling || isRefreshing) && (
          <div
            style={{
              height: pullDistance,
              transition: isPulling ? 'none' : 'height 0.3s',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              pointerEvents: 'none',
              marginTop: -24,
            }}
          >
            <div
              className="flex flex-col items-center justify-end w-full"
              style={{
                paddingBottom: 8,
                marginTop: pullDistance > 28 ? pullDistance - 28 : 0,
                transition: isPulling ? 'none' : 'margin-top 0.3s',
              }}
            >
              <svg className={`w-7 h-7 ${isRefreshing ? 'animate-spin' : ''} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5 19A9 9 0 1119 5" />
              </svg>
              {isPulling && !isRefreshing && (
                <span className="text-xs text-blue-500">Trascina per aggiornare</span>
              )}
              {isRefreshing && (
                <span className="text-xs text-blue-500">Aggiornamento...</span>
              )}
            </div>
          </div>
        )}
        {activeTab === 'ricordi' ? (
          <div className="space-y-4">
            {filteredRicordi.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-10 pb-20">
                <IoListOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Nessun ricordo trovato con i filtri attuali
                </p>
                <button
                  onClick={handleRefreshRicordi}
                  className="mt-4 px-4 py-2 bg-[#007AFF] text-white rounded-full text-xs font-medium"
                >
                  Reimposta filtri
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 auto-rows-auto gap-2">
                {/* Raggruppa i ricordi futuri consecutivi all'inizio */}
                {(() => {
                  const { futureMemories, rows } = optimizedRicordiLayout;
                  const result: any[] = [];
                  if (futureMemories.length > 0) {
                    // La card Futuro viene già gestita nella prima riga della griglia
                  }
                  rows.forEach((row) => {
                    row.items.forEach((memory, idx) => {
                      if (memory.type.toUpperCase() === 'FUTURO') {
                        // Card Futuro: col-span-1
                        result.push(
                          <div key={memory.id || 'future-group'} className="col-span-1">
                            <CardRicordoMobile
                              futureMemories={futureMemories}
                              onClick={() => {
                                /* opzionale: mostrare modal/lista completa */
                              }}
                            />
                          </div>
                        );
                      } else {
                        const colSpan = row.colSpans[idx];
                        result.push(
                          <div key={memory.id} className={`col-span-${colSpan}`}>
                            <CardRicordoMobile
                              memory={memory}
                              onClick={() => handleRicordoClick(memory.id)}
                            />
                          </div>
                        );
                      }
                    });
                  });
                  return result;
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-10 pb-20">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Nessuna idea trovata con i filtri attuali
                </p>
              </div>
            ) : (
              filteredIdeas.map((idea) => (
                <IdeaCardMobile
                  key={idea.id}
                  idea={idea}
                  onClick={() => handleIdeaClick(idea)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal per visualizzare i dettagli dell'idea */}
      <DetailIdeaModal
        idea={selectedIdea}
        isOpen={isIdeaModalOpen}
        onClose={handleIdeaModalClose}
        onIdeaDeleted={() => {
          // Richiedi un refresh delle idee dopo l'eliminazione
          setIsIdeaModalOpen(false);
          setSelectedIdea(null);
        }}
        onIdeaUpdated={(updatedIdea) => {
          // Aggiorna l'idea selezionata con i nuovi dati
          setSelectedIdea(updatedIdea);
        }}
      />
    </div>
  );
};

export default HomeMobile; 