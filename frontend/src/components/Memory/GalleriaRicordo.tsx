import { useState, useEffect } from 'react';
import { Memory } from '../../api/types';
import { IoImagesOutline } from 'react-icons/io5';
import ImageDetailModal from '../Images/ImageDetailModal';
import { uploadImages, pollImageStatus, ImageStatusResponse, ImageType } from '../../api/images';
import { getImageUrl } from '../../api/images';
import { PlusIcon } from '@heroicons/react/24/outline';
import ImageUploadModal from '../Images/ImageUploadModal';

type ImageTypeFilter = 'all' | 'COPPIA' | 'PAESAGGIO' | 'SINGOLO' | 'CIBO';

interface GalleriaRicordoProps {
  memory: Memory;
  onImagesUploaded?: () => void;
}

type MemoryImage = NonNullable<Memory['images']>[number];

export default function GalleriaRicordo({ memory, onImagesUploaded }: GalleriaRicordoProps) {
  const [isCompactGrid, setIsCompactGrid] = useState<boolean>(memory.type.toLowerCase() !== 'semplice');
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ImageTypeFilter>>(new Set());
  const [imagesWithType, setImagesWithType] = useState<Map<number, string>>(new Map());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
        latitude: 0,
        longitude: 0,
        created_by_user_id: 0,
        created_by_name: '',
        type: 'all',
        image: image.thumb_big_path,
        thumb_big_path: image.thumb_big_path,
        created_at: image.created_at || new Date().toISOString()
      });
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Errore nel caricamento dell\'immagine:', error);
    }
  };

  const handleUpload = async (files: File[]) => {
    try {
      const response = await uploadImages(files, memory.id);
      
      // Avvia il polling per ogni immagine
      response.data.forEach(({ jobId }) => {
        pollImageStatus(jobId, (status: ImageStatusResponse) => {
          if (status.state === 'completed') {
            // Notifica il componente padre che le immagini sono state caricate
            onImagesUploaded?.();
          }
        });
      });

    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
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
          <div className="relative type-menu">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTypeMenuOpen(!isTypeMenuOpen);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none"
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
              <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none"
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
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center justify-center p-2 sm:px-4 sm:py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-200"
          title="Carica immagini"
        >
          <PlusIcon className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Carica</span>
        </button>
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
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
            >
              <img
                src={getImageUrl(image.thumb_big_path)}
                alt={`Immagine ${image.id}`}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      )}

      {/* Image Detail Modal */}
      <ImageDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedImage(null);
        }}
        image={selectedImage}
      />

      {/* Upload Modal */}
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
} 