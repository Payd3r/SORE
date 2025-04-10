import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { getImageUrl, uploadImages, pollImageStatus } from '../../api/images';
import { Memory } from '../../api/memory';
import { PlusIcon, XMarkIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { IoImagesOutline } from 'react-icons/io5';
import ImageUploadModal from '../Images/ImageUploadModal';
import ImageDetailModal from '../Images/ImageDetailModal';
import { useUpload } from '../../contexts/UploadContext';
import { useQueryClient } from '@tanstack/react-query';

// Tipo per il filtro delle immagini per tipologia
type ImageTypeFilter = 'all' | 'COPPIA' | 'PAESAGGIO' | 'SINGOLO' | 'CIBO';

interface GalleriaRicordoProps {
  memory: Memory;
  onImagesUploaded?: () => void;
}

export default function GalleriaRicordo({ memory, onImagesUploaded }: GalleriaRicordoProps) {
  const [isCompactGrid, setIsCompactGrid] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ImageTypeFilter>>(new Set());
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const { uploadingFiles, setUploadingFiles, setShowUploadStatus } = useUpload();
  const queryClient = useQueryClient();
  const galleryRef = useRef<HTMLDivElement>(null);
  const [galleryHeight, setGalleryHeight] = useState<number | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  
  // Stati per la gestione del pinch-to-zoom
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [pinchScale, setPinchScale] = useState<number>(1);
  const [isPinching, setIsPinching] = useState(false);
  const lastPinchTimeRef = useRef<number>(0);
  
  // Verifica se l'app è in modalità PWA
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      setIsPWA(isStandalone || isFullscreen);
    };
    
    checkPWA();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkPWA);
    
    return () => window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkPWA);
  }, []);
  
  // Gestione delle gesture di pinch per lo zoom in/out
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPWA || e.touches.length !== 2) return;
    
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
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPWA || e.touches.length !== 2 || initialTouchDistance === null) return;
    
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
  };

  const handleTouchEnd = () => {
    setInitialTouchDistance(null);
    setIsPinching(false);
    setPinchScale(1); // Reset dello scale
  };

  const loadImageTypes = async () => {
    try {
      if (!memory.images) return;

      // Controlla se ci sono già delle immagini per popolare i tipi disponibili
      if (memory.images && memory.images.length > 0) {
        const uniqueTypes = new Set<ImageTypeFilter>();
        memory.images.forEach((image: any) => {
          if (image.type) {
            uniqueTypes.add(image.type.toUpperCase() as ImageTypeFilter);
          }
        });
      }
    } catch (error) {
      console.error('Error loading image types:', error);
    }
  };

  useEffect(() => {
    loadImageTypes();
  }, [memory.images]);

  const getFilteredImages = (images: Memory['images']) => {
    if (!images) return [];
    if (selectedTypes.size === 0) return images;

    return images.filter((image: any) => {
      if (!image.type) return false;
      const upperCaseType = image.type.toUpperCase() as ImageTypeFilter;
      const isIncluded = selectedTypes.has(upperCaseType);
      return isIncluded;
    });
  };

  const filteredImages = getFilteredImages(memory.images || []);

  const getFilterButtonText = () => {
    return selectedTypes.size > 0 ? `Filtro (${selectedTypes.size})` : 'Filtro';
  };

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
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
        setIsTypeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageClick = async (image: any) => {
    setSelectedImage(image);
    setIsDetailModalOpen(true);
  };
  
  const handleCloseImageModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setSelectedImage(null);
    }, 100);
  };

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
      const response = await uploadImages(files, memory.id);

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
        pollImageStatus(jobId, (status) => {
          setUploadingFiles(prev => {
            const newState = { ...prev };
            if (newState[file]) {
              newState[file].status = status.state;
              newState[file].progress = status.progress || 0;
              newState[file].message = status.status || '';

              // Invalida la cache anche durante il processing per aggiornare la UI più frequentemente
              if (status.state === 'processing' && status.progress > 0) {
                // Aggiorna la cache ogni volta che c'è un progresso significativo
                if (status.progress % 20 === 0 || status.progress === 100) {
                  queryClient.invalidateQueries({ queryKey: ['memory', memory.id.toString()] });
                  queryClient.invalidateQueries({ queryKey: ['memoryCarousel', memory.id.toString()] });
                  queryClient.invalidateQueries({ queryKey: ['memories'] });
                }
              }

              if (status.state === 'completed') {
                // Invalida la cache per aggiornare immediatamente le immagini
                queryClient.invalidateQueries({ queryKey: ['memory', memory.id.toString()] });
                queryClient.invalidateQueries({ queryKey: ['memoryCarousel', memory.id.toString()] });
                queryClient.invalidateQueries({ queryKey: ['memories'] });
                
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

                if (onImagesUploaded) {
                  onImagesUploaded();
                }
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

  // Salva l'altezza della galleria quando viene caricata inizialmente
  useLayoutEffect(() => {
    if (galleryRef.current && memory.images && memory.images.length > 0 && !galleryHeight) {
      // Attendi che il layout venga completamente renderizzato
      setTimeout(() => {
        if (galleryRef.current) {
          setGalleryHeight(galleryRef.current.offsetHeight);
        }
      }, 300);
    }
  }, [memory.images, galleryHeight]);
  
  // Resetta l'altezza salvata quando cambia il tipo di griglia
  useEffect(() => {
    setGalleryHeight(null);
  }, [isCompactGrid]);

  return (
    <div 
      className="space-y-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {/* Titolo visibile solo su desktop */}
          <h2 className="hidden sm:block text-xl font-semibold text-gray-800 dark:text-white">Galleria</h2>
          
          {/* Tipo di griglia - nascosto in modalità PWA */}
          {!isPWA && (
            <button
              onClick={() => setIsCompactGrid(!isCompactGrid)}
              className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={isCompactGrid ? "Vista espansa" : "Vista compatta"}
            >
              {isCompactGrid ? (
                <ListBulletIcon className="w-5 h-5" />
              ) : (
                <Squares2X2Icon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Menu per filtro per tipo */}
          <div ref={typeMenuRef} className="relative">
            <button
              onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
              className={`flex items-center gap-2 py-2 px-3 sm:px-4 text-sm font-medium bg-white dark:bg-gray-800 rounded-md border transition-colors ${
                selectedTypes.size > 0
                  ? 'text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-600'
                  : 'text-gray-700 border-gray-200 dark:text-gray-300 dark:border-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">{getFilterButtonText()}</span>
              {selectedTypes.size > 0 && (
                <span className="inline sm:hidden flex items-center justify-center w-5 h-5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
                  {selectedTypes.size}
                </span>
              )}
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
              <div className="absolute z-10 mt-1 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 min-w-[160px]">
                <div className="p-2">
                  {['COPPIA', 'SINGOLO', 'PAESAGGIO', 'CIBO'].map((type) => (
                    <button
                      key={type}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md bg-transparent ${
                        selectedTypes.has(type as ImageTypeFilter)
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleTypeClick(type as ImageTypeFilter)}
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                        selectedTypes.has(type as ImageTypeFilter)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedTypes.has(type as ImageTypeFilter) && (
                          <XMarkIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {type === 'COPPIA' ? 'Coppia' :
                        type === 'SINGOLO' ? 'Semplice' :
                        type === 'PAESAGGIO' ? 'Paesaggio' :
                        type === 'CIBO' ? 'Cibo' : type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottone Carica */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn btn-primary flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Carica</span>
        </button>
      </div>

      {/* Gallery Grid con supporto per pinch-to-zoom */}
      {!memory.images || memory.images.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
          <IoImagesOutline className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
          Nessuna immagine disponibile
        </div>
      ) : (
        <div
          ref={galleryRef}
          className={`grid ${
            isCompactGrid
              ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
          }`}
          style={{ 
            minHeight: galleryHeight ? `${galleryHeight}px` : 'auto',
            touchAction: 'pan-y',
            transform: isPinching ? `scale(${pinchScale > 1 ? 1 + (pinchScale - 1) * 0.1 : 1 - (1 - pinchScale) * 0.1})` : 'scale(1)',
            transition: isPinching ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {filteredImages.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              Nessuna immagine corrisponde ai filtri selezionati
            </div>
          )}
          {filteredImages.map((image: any) => (
            <div
              key={image.id}
              onClick={() => handleImageClick(image)}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group touch-manipulation active:scale-95 active:opacity-90 transition-all duration-200"
            >
              <img
                src={getImageUrl(image.thumb_big_path)}
                alt={`Immagine ${image.id}`}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </div>
          ))}
        </div>
      )}

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <ImageDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseImageModal}
        image={selectedImage}
        onImageDeleted={onImagesUploaded}
      />
    </div>
  );
} 