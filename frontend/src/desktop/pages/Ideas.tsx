import { getIdeas } from '../../api/ideas';
import type { Idea } from '../../api/ideas';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import IdeaUploadModal from '../components/Idee/IdeaUploadModal';
import IdeaCard from '../components/Idee/IdeaCard';
import DetailIdeaModal from '../components/Idee/DetailIdeaModal';
import { useLocation } from 'react-router-dom';
import Loader from '../components/Layout/Loader';

type IdeaTypeFilter = 'RISTORANTI' | 'VIAGGI' | 'SFIDE' | 'SEMPLICI';

export default function Ideas() {
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<IdeaTypeFilter>>(new Set());
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState<'completed' | 'pending' | 'all'>('all');

  // React Query per il fetching delle idee
  const { data: ideas = [], isLoading } = useQuery<Idea[]>({
    queryKey: ['ideas'],
    queryFn: getIdeas,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  const getFilterButtonText = () => {
    if (selectedTypes.size === 0) {
      if (statusFilter === 'completed') return 'Realizzate';
      if (statusFilter === 'pending') return 'Da Fare';
      if (statusFilter === 'all') return 'Tutte';
      return 'Filtra';
    }
    return `${selectedTypes.size} ${selectedTypes.size === 1 ? 'filtro' : 'filtri'}`;
  };

  useEffect(() => {
    if (location.state?.openUploadModal) {
      setIsUploadModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const filteredIdeas = ideas.filter(idea =>
    (selectedTypes.size === 0 || selectedTypes.has(idea.type as IdeaTypeFilter)) &&
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    ((statusFilter === 'all') ||
      (statusFilter === 'completed' && idea.checked === 1) ||
      (statusFilter === 'pending' && idea.checked === 0))
  );

  const handleCheckChange = () => {
    // Implementazione vuota poiché non viene utilizzata
  };

  return (
    <div className="w-full min-h-screen bg-transparent pb-[30px] sm:pb-[170px]">
      <div className="relative max-w-7xl mx-auto">
        {/* Safe area per la notch */}
        <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>
        <div className="mx-2 sm:mx-0 px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          <div className="max-w-[2000px] mx-auto space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center mb-4 sm:mb-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 dark:text-white">Idee</h1>
                <p className="hidden sm:block text-gray-600 dark:text-gray-400">Organizza e gestisci le idee per il futuro</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="btn btn-primary flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                transition-all duration-200 touch-manipulation"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Carica</span>
              </button>
            </div>

            <div className="flex gap-4 mb-8">
              {/* Search Box */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cerca idee..."
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
                  <>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[9999]">
                      {/* Filtri per tipo */}
                      {(['RISTORANTI', 'VIAGGI', 'SFIDE', 'SEMPLICI'] as IdeaTypeFilter[]).map((type) => (
                        <button
                          key={type}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTypes = new Set(selectedTypes);
                            if (newTypes.has(type)) {
                              newTypes.delete(type);
                            } else {
                              newTypes.add(type);
                            }
                            setSelectedTypes(newTypes);
                          }}
                          className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${selectedTypes.has(type) ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-white'
                            }`}
                        >
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedTypes.has(type)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                            }`}>
                            {selectedTypes.has(type) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {type}
                        </button>
                      ))}

                      {/* Separatore */}
                      <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>

                      {/* Filtri per stato */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusFilter('all');
                        }}
                        className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${statusFilter === 'all' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-white'}`}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${statusFilter === 'all'
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          {statusFilter === 'all' && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        Tutte
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusFilter('completed');
                        }}
                        className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${statusFilter === 'completed' ? 'text-green-500 dark:text-green-400' : 'text-gray-700 dark:text-white'}`}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${statusFilter === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          {statusFilter === 'completed' && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        Realizzate
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusFilter('pending');
                        }}
                        className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${statusFilter === 'pending'
                          ? 'text-yellow-500 dark:text-yellow-400'
                          : 'text-gray-700 dark:text-white'}`}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${statusFilter === 'pending'
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          {statusFilter === 'pending' && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        Da Fare
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Grid delle card */}
            {isLoading ? (
              <Loader type="spinner" size="lg" fullScreen text="Caricamento in corso..." subText="Stiamo preparando l'app per te" />
            ) : filteredIdeas.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">Nessuna idea trovata</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {filteredIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onCheckChange={handleCheckChange}
                    onClick={() => {
                      setSelectedIdea(idea);
                      setIsDetailModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <IdeaUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => { }}
      />

      <DetailIdeaModal
        idea={selectedIdea}
        isOpen={isDetailModalOpen && selectedIdea !== null}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedIdea(null);
        }}
        onIdeaDeleted={() => { }}
        onIdeaUpdated={() => {
          // Implementa la logica per aggiornare la lista delle idee
        }}
      />
    </div>
  );
} 