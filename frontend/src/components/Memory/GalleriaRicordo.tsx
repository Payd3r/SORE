import { useState, useEffect } from 'react';
import { Memory } from '../../api/types';
import { IoImagesOutline } from 'react-icons/io5';
import ImageDetailModal from '../Images/ImageDetailModal';
import { uploadImages, pollImageStatus, ImageStatusResponse, ImageType } from '../../api/images';
import { getImageUrl } from '../../api/images';
import { PlusIcon } from '@heroicons/react/24/outline';
import ImageUploadModal from '../Images/ImageUploadModal';
import UploadStatus from '../Images/UploadStatus';
import { useUpload } from '../../contexts/UploadContext';

type ImageTypeFilter = 'all' | 'COPPIA' | 'PAESAGGIO' | 'SINGOLO' | 'CIBO';

interface GalleriaRicordoProps {
  memory: Memory;
  onImagesUploaded?: () => void;
}

type MemoryImage = {
  id: number;
  thumb_big_path: string;
  created_at?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  created_by_user_id?: number;
  created_by_name?: string;
  webp_path?: string;
};

export default function GalleriaRicordo({ memory, onImagesUploaded }: GalleriaRicordoProps) {
  const [isCompactGrid, setIsCompactGrid] = useState<boolean>(memory.type.toLowerCase() !== 'semplice');
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ImageTypeFilter>>(new Set());
  const [imagesWithType, setImagesWithType] = useState<Map<number, string>>(new Map());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { uploadingFiles, setUploadingFiles, showUploadStatus, setShowUploadStatus, hasActiveUploads } = useUpload();

  // Carica i tipi delle immagini quando necessario
  useEffect(() => {
    const loadImageTypes = async () => {
      if (!memory.images) return;
      
      const newImagesWithType = new Map<number, string>();
      
      for (const image of memory.images) {
        try {
          const imageType = (image.type || 'all').toUpperCase();
          newImagesWithType.set(image.id, imageType);
        } catch (error) {
          console.error('Errore nel caricamento del tipo dell\'immagine:', error);
        }
      }
      
      setImagesWithType(newImagesWithType);
    };

    loadImageTypes();
  }, [memory.images]);

  // Funzione per filtrare le immagini per tipo
  const getFilteredImages = (images: Memory['images']) => {
    if (!images) return [];
    // Se non ci sono tipi selezionati, mostra tutte le immagini
    if (selectedTypes.size === 0) {
      return images;
    }

    // Filtra le immagini se c'è almeno un tipo selezionato
    return images.filter(image => {
      const imageType = (image.type || imagesWithType.get(image.id) || '').toUpperCase();
      if (!imageType) return false;
      
      return selectedTypes.has(imageType as ImageTypeFilter);
    });
  };

  // Ottieni il testo del pulsante del filtro
  const getFilterButtonText = () => {
    if (selectedTypes.size === 0) return 'Filtra';
    return `Filtri (${selectedTypes.size})`;
  };

  const handleTypeClick = (type: ImageTypeFilter) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);    
    setIsTypeMenuOpen(false);
  };

  // Chiudi il dropdown quando si clicca fuori
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

  const handleImageClick = async (image: MemoryImage) => {
    try {
      setSelectedImage({
        id: String(image.id),
        latitude: image.latitude || 0,
        longitude: image.longitude || 0,
        created_by_user_id: image.created_by_user_id || 0,
        created_by_name: image.created_by_name || '',
        type: image.type || 'all',
        image: image.thumb_big_path,
        thumb_big_path: image.thumb_big_path,
        created_at: image.created_at || new Date().toISOString(),
        webp_path: image.webp_path
      });
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Errore nel caricamento dell\'immagine:', error);
    }
  };

  const handleUpload = async (files: File[]) => {
    setIsUploadModalOpen(false);
    setShowUploadStatus(true);
    
    // Inizializza lo stato di caricamento per ogni file
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

      // Aggiorna lo stato per mostrare che i file sono in elaborazione
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

      // Avvia il polling per ogni immagine
      response.data.forEach(({ jobId, file }) => {
        pollImageStatus(jobId, (status: ImageStatusResponse) => {         
          setUploadingFiles(prev => {
            const newState = { ...prev };
            if (newState[file]) {
              newState[file].status = status.state;
              newState[file].progress = status.progress;
              newState[file].message = status.status;

              if (status.state === 'completed') {
                // Rimuovi il file dallo stato dopo 2 secondi
                setTimeout(() => {
                  setUploadingFiles(prev => {
                    const newState = { ...prev };
                    delete newState[file];
                    // Se non ci sono più file in caricamento, nascondi il pannello
                    if (Object.keys(newState).length === 0) {
                      setShowUploadStatus(false);
                    }
                    return newState;
                  });
                }, 2000);
                // Notifica il componente padre che le immagini sono state caricate
                onImagesUploaded?.();
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

  const filteredImages = getFilteredImages(memory.images);

  return (
    <div className="pb-4 pt-0 px-1">
      {/* Header con controlli */}
      <div className="flex items-center justify-between mb-6">
        {/* Filtri e Toggle */}
        <div className="flex items-center gap-2">
          {/* Type Filter Dropdown */}
          <div className="relative type-menu ">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTypeMenuOpen(!isTypeMenuOpen);
              }}
              className="flex h-[46px] items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {getFilterButtonText()}
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
              <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 ">
                {['COPPIA', 'PAESAGGIO', 'SINGOLO', 'CIBO'].map((type) => (
                  <button
                    key={type}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTypeClick(type as ImageTypeFilter);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center focus:outline-none gap-2 ${
                      selectedTypes.has(type as ImageTypeFilter)
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-gray-700 dark:text-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                        selectedTypes.has(type as ImageTypeFilter)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedTypes.has(type as ImageTypeFilter) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setIsCompactGrid(prev => !prev)}
            className="flex items-center h-[46px] gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none"
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

        {/* Bottone Carica */}
        <div className="flex items-center gap-2">
          {/* Upload Status Button */}
          {hasActiveUploads && (
            <button
              onClick={() => setShowUploadStatus(true)}
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
            className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Carica</span>
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {!memory.images || memory.images.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
          <IoImagesOutline className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
          Nessuna immagine disponibile
        </div>
      ) : (
        <div
          className={`grid ${
            isCompactGrid
              ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
          }`}
        >
          {filteredImages.map((image) => (
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

      <ImageDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setSelectedImage(null);
          setTimeout(() => {
            setIsDetailModalOpen(false);
          }, 0);
        }}
        image={selectedImage}
        onImageDeleted={onImagesUploaded}
      />
    </div>
  );
} 