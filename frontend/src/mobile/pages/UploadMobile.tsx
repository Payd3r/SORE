import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMemory } from '../../api/memory';
import { uploadImages, pollImageStatus, ImageStatusResponse } from '../../api/images';
import { createIdea } from '../../api/ideas';
import { useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { searchTracks } from '../../api/spotify';
import { useUpload } from '../../contexts/UploadContext';

// Tipi
type MemoryType = 'VIAGGIO' | 'EVENTO' | 'SEMPLICE' | 'FUTURO';
type IdeaType = 'RISTORANTI' | 'VIAGGI' | 'SFIDE' | 'SEMPLICI';
type UploadType = 'MEMORY' | 'IMAGE' | 'IDEA';

interface UploadingFile {
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';
  progress: number;
  message: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

// COMPONENTE SPOSTATO FUORI
import React from 'react';

interface SpotifySearchComponentProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  songSuggestions: SpotifyTrack[];
  setSongSuggestions: React.Dispatch<React.SetStateAction<SpotifyTrack[]>>;
  showSuggestions: boolean;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingSongs: boolean;
  handleSongInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  suggestionsRef: React.RefObject<HTMLDivElement | null>;
  isSearchMode: boolean;
  setIsSearchMode: React.Dispatch<React.SetStateAction<boolean>>;
}

function SpotifySearchComponent({
  searchQuery,
  setSearchQuery,
  songSuggestions,
  setSongSuggestions,
  showSuggestions,
  setShowSuggestions,
  isLoadingSongs,
  handleSongInputChange,
  searchInputRef,
  suggestionsRef,
  setIsSearchMode
}: SpotifySearchComponentProps) {
  // Solo input e suggerimenti
  return (
    <div className="relative" style={{ zIndex: 9999 }}>
      <input
        ref={searchInputRef}
        type="search"
        id="spotify-search"
        value={searchQuery}
        onChange={handleSongInputChange}
        onBlur={() => {
          setTimeout(() => {
            setShowSuggestions(false);
          }, 300);
        }}
        onFocus={() => {
          if (searchQuery.trim().length >= 2) {
            setShowSuggestions(true);
          }
        }}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
        placeholder="Cerca una canzone su Spotify"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />
      {isLoadingSongs && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      {showSuggestions && searchQuery.trim().length >= 2 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-[100%] left-0 right-0 mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700"
          style={{ zIndex: 9999 }}
        >
          {isLoadingSongs ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Ricerca in corso...
            </div>
          ) : songSuggestions && songSuggestions.length > 0 ? (
            <ul className="py-1">
              {songSuggestions.map((track) => (
                track && (
                  <li
                    key={track.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => {
                      const testo = `${track.name} - ${track.artists.map(a => a.name).join(', ')} - ${track.album.name}`;
                      setSearchQuery(testo);
                      setShowSuggestions(false);
                      setSongSuggestions([]);
                      setIsSearchMode(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 group transition-colors"
                  >
                    <div className="h-8 w-8 flex-shrink-0">
                      {track.album && track.album.images && track.album.images[0] && (
                        <img 
                          src={track.album.images[0].url} 
                          alt={track.name}
                          className="h-full w-full object-cover rounded" 
                        />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 truncate">
                        {track.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {track.artists && track.artists.map(a => a.name).join(', ')}
                        {track.album && ` • ${track.album.name}`}
                      </div>
                    </div>
                  </li>
                )
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Nessun risultato trovato
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UploadMobile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const MAX_IMAGES = 300; // Massimo numero di immagini per upload
  
  // Utilizziamo l'UploadContext per gestire gli stati di caricamento
  const { setUploadingFiles: setGlobalUploadingFiles, setShowUploadStatus: setGlobalShowUploadStatus } = useUpload();
  
  // Stato per il tipo di upload attivo
  const [activeUploadType, setActiveUploadType] = useState<UploadType>('MEMORY');
  
  // Stati per il caricamento dei ricordi
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState<string>('');
  const [memoryType, setMemoryType] = useState<MemoryType>('SEMPLICE');
  const [futureDate, setFutureDate] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [songSuggestions, setSongSuggestions] = useState<SpotifyTrack[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  
  // Stati per il caricamento delle idee
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaType, setIdeaType] = useState<IdeaType>('SEMPLICI');
  
  // Stati generali
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Ricerca di canzoni su Spotify con debounce
  const searchSongs = useRef(
    debounce(async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSongSuggestions([]);
        setIsLoadingSongs(false);
        return;
      }

      try {
        setIsLoadingSongs(true);
        const tracks = await searchTracks(query);
        // Verifica che il componente sia ancora montato prima di aggiornare lo stato
        setSongSuggestions(tracks || []);
      } catch (err) {
        console.error('Errore nella ricerca:', err);
        setSongSuggestions([]);
      } finally {
        setIsLoadingSongs(false);
      }
    }, 300)
  ).current;

  // Gestione della ricerca di canzoni su Spotify
  const handleSongInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length >= 2) {
      setIsLoadingSongs(true);
      searchSongs(value);
      setShowSuggestions(true);
    } else {
      setSongSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSongs(false);
    }
  }, []);

  // Chiudi i suggerimenti quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setTitle('');
    setLocation('');
    setMemoryType('SEMPLICE');
    setFutureDate('');
    setSelectedFiles([]);
    setSearchQuery('');
    setSongSuggestions([]);
    setShowSuggestions(false);
    setIdeaTitle('');
    setIdeaDescription('');
    setIdeaType('SEMPLICI');
  }, []);

  // Gestisce il caricamento delle immagini e monitoraggio dei job
  const handleUploadProcess = async (files: File[], memoryId?: number) => {
    try {
      const uploadResponse = await uploadImages(files, memoryId);
      
      // Aggiorna lo stato di caricamento e mostra l'indicatore
      const newUploadingFiles: Record<string, UploadingFile> = {};
      
      uploadResponse.data.forEach(({ file, jobId }) => {
        newUploadingFiles[file] = {
          fileName: file,
          status: 'queued',
          progress: 0,
          message: 'In attesa di elaborazione...'
        };
        
        // Avvia il polling per ogni jobId
        pollImageStatus(jobId, (status: ImageStatusResponse) => {
          setGlobalUploadingFiles(prev => {
            const newState = { ...prev };
            if (newState[file]) {
              newState[file].status = status.state;
              newState[file].progress = status.progress;
              newState[file].message = status.status;
              
              // Invalida la cache quando lo stato cambia
              if (status.state === 'completed') {
                queryClient.invalidateQueries({ queryKey: ['memories'] });
                queryClient.invalidateQueries({ queryKey: ['gallery'] });
              }
            }
            return newState;
          });
        });
      });
      
      // Aggiunge i nuovi file allo stato
      setGlobalUploadingFiles(prev => ({
        ...prev,
        ...newUploadingFiles
      }));
      
      // Mostra l'indicatore di caricamento
      setGlobalShowUploadStatus(true);
      
      return uploadResponse;
    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      throw error;
    }
  };

  // Funzione per gestire il click sul bottone salva
  const handleSave = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      switch (activeUploadType) {
        case 'MEMORY':
          if (!title.trim()) {
            setError('Il titolo è obbligatorio');
            return;
          }
          
          const songData = searchQuery.trim() ? searchQuery.trim() : undefined;
          
          // Preparo i dati del ricordo
          const memoryData: any = {
            title: title.trim(),
            type: memoryType,
            song: songData,
            location: location.trim() || undefined
          };
          if (memoryType === 'FUTURO' && futureDate) {
            memoryData.date = futureDate;
          }
          
          // Creiamo il ricordo
          const memoryResponse = await createMemory(memoryData);
          
          // Invalida la cache dei ricordi per aggiornare subito la HomeMobile
          queryClient.invalidateQueries({ queryKey: ['memories'] });
          
          // Se ci sono file da caricare, avvia l'upload in background (non bloccante)
          if (selectedFiles.length > 0) {
            handleUploadProcess(selectedFiles, memoryResponse.data.id).catch(() => {
              // lo stato di errore viene già gestito internamente da handleUploadProcess
            });
          }
          
          // Se è Futuro, non obbligare immagini
          if (memoryType !== 'FUTURO' && selectedFiles.length === 0) {
            setError('Seleziona almeno un\'immagine da caricare');
            return;
          }
          
          // Reset form e navigazione verso la home (subito, upload continua in background)
          resetForm();
          navigate('/');
          break;
          
        case 'IMAGE':
          if (selectedFiles.length === 0) {
            setError('Seleziona almeno un\'immagine da caricare');
            return;
          }
          
          // Carica le immagini direttamente in galleria
          await handleUploadProcess(selectedFiles);
          
          // Reset form e navigazione verso la home
          resetForm();
          navigate('/');
          break;
          
        case 'IDEA':
          if (!ideaTitle.trim()) {
            setError('Il titolo è obbligatorio');
            return;
          }
          
          // Creiamo l'idea
          await createIdea({
            title: ideaTitle.trim(),
            description: ideaDescription.trim(),
            type: ideaType,
          });
          
          // Invalida la cache delle idee per aggiornare subito la HomeMobile
          queryClient.invalidateQueries({ queryKey: ['ideas'] });
          
          // Reset form e navigazione verso la home
          resetForm();
          navigate('/');
          break;
      }
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
      setError('Si è verificato un errore durante il salvataggio. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Blocca le gesture di scorrimento laterale del PwaLayout e qualsiasi swipe nativo
  useEffect(() => {
    // 1. Disabilita PwaLayout swipe
    const disablePwaLayoutSwiping = () => {
      const pwaLayoutElement = document.querySelector('[data-swipeable="true"]');
      
      if (pwaLayoutElement) {
        const originalSwipeable = pwaLayoutElement.getAttribute('data-swipeable');
        pwaLayoutElement.setAttribute('data-swipeable', 'false');
        
        return () => {
          if (originalSwipeable) {
            pwaLayoutElement.setAttribute('data-swipeable', originalSwipeable);
          }
        };
      }
      
      return undefined;
    };
    
    // 2. Blocca gli swipe significativi ma lascia funzionare i touch per bottoni e interazioni
    const preventHorizontalSwipes = () => {
      let startX = 0;
      let startY = 0;
      let startTime = 0;
      let isSwiping = false;
      
      // Track iniziale del touch
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
        isSwiping = false;
      };
      
      // Verifica se si tratta di uno swipe orizzontale significativo
      const handleTouchMove = (e: TouchEvent) => {
        if (!e.touches || e.touches.length !== 1) return;
        
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const deltaX = x - startX;
        const deltaY = Math.abs(y - startY);
        const elapsedTime = Date.now() - startTime;
        
        // Se è uno swipe orizzontale significativo (veloce e lungo abbastanza)
        // e non è principalmente verticale
        if (Math.abs(deltaX) > 30 && 
            Math.abs(deltaX) > deltaY * 1.5 && 
            elapsedTime < 300) {
          
          // L'utente sta effettuando uno swipe orizzontale, blocchiamolo
          isSwiping = true;
          e.preventDefault();
        }
        
        // Se è un movimento orizzontale abbastanza ampio lo preveniamo
        // ma solo se non si tratta di elementi interattivi
        if (isSwiping || (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY * 2)) {
          // Controlla se stiamo interagendo con elementi interattivi
          const target = e.target as Element;
          const isInteractive = target.closest('button, a, input, textarea, select, [role="button"]');
          
          if (!isInteractive) {
            e.preventDefault();
          }
        }
      };
      
      // Pulizia dello stato al termine del touch
      const handleTouchEnd = () => {
        isSwiping = false;
      };
      
      // Aggiungi i listener con capture per intercettare prima di altri handler
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove, { capture: true });
        document.removeEventListener('touchend', handleTouchEnd);
      };
    };
    
    // Applica entrambe le strategie
    const cleanup1 = disablePwaLayoutSwiping();
    const cleanup2 = preventHorizontalSwipes();
    
    return () => {
      if (cleanup1) cleanup1();
      if (cleanup2) cleanup2();
    };
  }, []);

  // Previeni la navigazione indietro, ma in modo meno invasivo
  useEffect(() => {
    const preventBackNavigation = () => {
      // Aggiungi un'entry nello stack di history per prevenire la navigazione indietro
      window.history.pushState(null, document.title, window.location.href);
    };
    
    window.addEventListener('popstate', preventBackNavigation);
    
    // Assicurati ci sia qualcosa nello stack di history
    window.history.pushState(null, document.title, window.location.href);
    
    return () => {
      window.removeEventListener('popstate', preventBackNavigation);
    };
  }, []);

  // Componente di rendering
  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black">
      {/* Header con toggle */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-14 pb-2">
        <div className="flex justify-center items-center">
          <div className="inline-flex items-center rounded-full bg-gray-200/70 dark:bg-gray-800/70 p-1.5 backdrop-blur-xl shadow-sm w-[100%]">
            <button
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeUploadType === 'MEMORY'
                  ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
              }`}
              onClick={() => setActiveUploadType('MEMORY')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Ricordo</span>
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeUploadType === 'IMAGE'
                  ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
              }`}
              onClick={() => setActiveUploadType('IMAGE')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Immagini</span>
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeUploadType === 'IDEA'
                  ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
              }`}
              onClick={() => setActiveUploadType('IDEA')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Idea</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Effetto blur sulla parte superiore */}
      <div 
        className="absolute top-0 left-0 right-0 z-30 pointer-events-none h-[60px]"
        style={{
          background: 'transparent',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          backdropFilter: 'blur(16px)'
        }}
      ></div>
      
      {/* Contenuto principale - area di scrolling */}
      <div className="flex-1 overflow-auto p-4 pt-[36%] pb-28">
        {activeUploadType === 'MEMORY' && (
          <div className="space-y-4 pb-10">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg ">
                {error}
              </div>
            )}
            
            {/* Titolo */}
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titolo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Titolo del ricordo"
                required
              />
            </div>
            
            {/* Tipo di ricordo */}
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo di ricordo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['SEMPLICE', 'EVENTO', 'VIAGGIO', 'FUTURO'] as MemoryType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMemoryType(type)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                      memoryType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type === 'VIAGGIO' ? 'Viaggio' : type === 'EVENTO' ? 'Evento' : type === 'FUTURO' ? 'Futuro' : 'Semplice'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Campo data opzionale per Futuro */}
            {memoryType === 'FUTURO' && (
              <div className="mt-3">
                <label htmlFor="future-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data (opzionale)
                </label>
                <input
                  type="date"
                  id="future-date"
                  value={futureDate}
                  onChange={e => setFutureDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            )}
            
            {/* Posizione */}
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Posizione
              </label>
              <input
                type="text"
                id="location"
                placeholder="Inserisci la posizione"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>           
            
            
            {/* Spotify */}
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
              <label htmlFor="spotify" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Canzone (opzionale)
              </label>
              
              <SpotifySearchComponent
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                songSuggestions={songSuggestions}
                setSongSuggestions={setSongSuggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                isLoadingSongs={isLoadingSongs}
                handleSongInputChange={handleSongInputChange}
                searchInputRef={searchInputRef}
                suggestionsRef={suggestionsRef}
                isSearchMode={isSearchMode}
                setIsSearchMode={setIsSearchMode}
              />
            </div>
            
            {/* Upload immagini */}
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Immagini {selectedFiles.length > 0 && `(${selectedFiles.length}/${MAX_IMAGES})`}
              </label>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-3 text-center bg-gray-50 dark:bg-gray-800">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (!e.target.files) return;
                    
                    const newFiles = Array.from(e.target.files);
                    const remainingSlots = MAX_IMAGES - selectedFiles.length;
                    
                    if (newFiles.length > remainingSlots) {
                      setError(`Puoi selezionare al massimo ${remainingSlots} immagini`);
                      return;
                    }
                    
                    setSelectedFiles(prev => [...prev, ...newFiles]);
                    setError(null);
                  }}
                />
                
                <div className="flex flex-col items-center justify-center gap-1 sm:gap-2">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <button
                      type="button"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Carica immagini
                    </button>
                    <span className="mx-1">o trascina qui</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, HEIC, JPEG fino a 50MB
                  </p>
                </div>
              </div>
              
              {/* Preview immagini selezionate */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selezionate ({selectedFiles.length}/{MAX_IMAGES})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2"
                    >
                      Rimuovi tutte
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeUploadType === 'IMAGE' && (
          <div className="space-y-4">
            {/* Interfaccia per l'upload delle sole immagini */}
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                Carica immagini nella galleria
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scegli le immagini che desideri aggiungere alla tua galleria. Puoi selezionare fino a {MAX_IMAGES} immagini contemporaneamente.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-800">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (!e.target.files) return;
                    
                    const newFiles = Array.from(e.target.files);
                    const remainingSlots = MAX_IMAGES - selectedFiles.length;
                    
                    if (newFiles.length > remainingSlots) {
                      setError(`Puoi selezionare al massimo ${remainingSlots} immagini`);
                      return;
                    }
                    
                    setSelectedFiles(prev => [...prev, ...newFiles]);
                    setError(null);
                  }}
                />
                
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <button
                      type="button"
                      className="font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Carica immagini
                    </button>
                    <span className="mx-1">o trascina qui</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, HEIC, JPEG fino a 50MB
                  </p>
                </div>
              </div>
            </div>
            
            {/* Preview immagini selezionate */}
            {selectedFiles.length > 0 ? (
              <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selezionate ({selectedFiles.length}/{MAX_IMAGES})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2"
                  >
                    Rimuovi tutte
                  </button>
                </div>                
              </div>
            ) : error ? (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            ) : null}
          </div>
        )}
        
        {activeUploadType === 'IDEA' && (
          <div className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Titolo */}
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
              <label htmlFor="ideaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titolo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ideaTitle"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Titolo dell'idea"
                required
              />
            </div>
            
            {/* Tipo di idea */}
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo di idea
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['RISTORANTI', 'VIAGGI', 'SFIDE', 'SEMPLICI'] as IdeaType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIdeaType(type)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                      ideaType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type === 'RISTORANTI' && 'Ristorante'}
                    {type === 'VIAGGI' && 'Viaggio'}
                    {type === 'SFIDE' && 'Sfida'}
                    {type === 'SEMPLICI' && 'Semplice'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Descrizione */}
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
              <label htmlFor="ideaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrizione
              </label>
              <textarea
                id="ideaDescription"
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Descrizione (opzionale)"
                rows={4}
              ></textarea>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottone salva in basso */}
      <div className="fixed bottom-20 left-0 right-0 py-4 px-4 bg-transparent">
        <button
          className="w-full py-3 px-4 rounded-full text-white text-sm font-medium bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-70 "
          onClick={handleSave}
          disabled={
            isLoading || 
            (activeUploadType === 'MEMORY' && !title.trim()) ||
            (activeUploadType === 'IMAGE' && selectedFiles.length === 0) ||
            (activeUploadType === 'IDEA' && !ideaTitle.trim())
          }
        >
          {isLoading ? "Caricamento..." : "Salva"}
        </button>
      </div>
    </div>
  );
}