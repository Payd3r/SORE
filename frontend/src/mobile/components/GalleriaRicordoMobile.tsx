import React, { useState, useRef, useEffect } from 'react';
import { 
  FunnelIcon, 
  ListBulletIcon,
  Squares2X2Icon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { IoImagesOutline } from 'react-icons/io5';
import { Memory } from '../../api/memory';
import ImageDetailModal from '../pages/ImageDetailMobile';
import { getImageUrl, updateImageMetadata, uploadImages, pollImageStatus } from '../../api/images';
import ImageUploadModal from '../../desktop/components/Images/ImageUploadModal';
import { useUpload } from '../../contexts/UploadContext';

// Definizione del tipo ImageTypeFilter
type ImageTypeFilter = 'all' | 'COPPIA' | 'SINGOLO' | 'CIBO' | 'PAESAGGIO';

interface GalleriaRicordoMobileProps {
  memory: Memory;
  onImagesUploaded?: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export default function GalleriaRicordoMobile({ memory, onImagesUploaded }: GalleriaRicordoMobileProps) {
  const [isCompactGrid, setIsCompactGrid] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ImageTypeFilter>>(new Set());
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const localContainerRef = useRef<HTMLDivElement>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [quickEditImage, setQuickEditImage] = useState<any | null>(null);
  const [quickEditTimeout, setQuickEditTimeout] = useState<any>(null);
  const [showQuickEditSuccess, setShowQuickEditSuccess] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { setUploadingFiles, setShowUploadStatus } = useUpload();
  // Per distinguere tra scroll e long-press
  const touchStartPos = useRef<{x: number, y: number} | null>(null);
  const MOVE_THRESHOLD = 10; // pixel

  // --- LOGICA PER SEPARARE LE IMMAGINI ---
  // Unifica tutte le immagini in un'unica galleria, ordinando prima per display_order (ASC, null/undefined in fondo), poi per created_at DESC
  let allImages = (memory.images || []).slice();
  allImages.sort((a: any, b: any) => {
    // Prima per display_order (null/undefined in fondo)
    if ((a.display_order ?? null) !== (b.display_order ?? null)) {
      if (a.display_order == null) return 1;
      if (b.display_order == null) return -1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    }
    // Poi per created_at DESC (più recenti prima)
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  // Applichiamo i filtri SOLO alle immagini senza display_order, ma mostriamo tutte se nessun filtro è attivo
  let filteredImages: any[];
  if (selectedTypes.size === 0 || selectedTypes.has('all')) {
    filteredImages = allImages;
  } else {
    filteredImages = allImages.filter((image: any) => {
      // Se l'immagine è highlight (display_order valorizzato), la mostriamo sempre
      if (image.display_order !== null && image.display_order !== undefined) return true;
      // Altrimenti applichiamo il filtro
      const imageType = (image.type || '').toUpperCase() as ImageTypeFilter;
      return selectedTypes.has(imageType);
    });
  }
  
  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    // Handler generico per gli eventi che chiudono il dropdown
    const handleOutsideClick = (e: Event) => {
      if (typeMenuRef.current && e.target instanceof Node && !typeMenuRef.current.contains(e.target as Node)) {
        setIsTypeMenuOpen(false);
      }
    };
    
    if (isTypeMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isTypeMenuOpen]);

  const handleTypeClick = (type: ImageTypeFilter, e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      
      // Se il tipo è 'all', rimuovi tutti gli altri tipi
      if (type === 'all') {
        newSet.clear();
        // Se 'all' è già selezionato (cioè nessun filtro attivo), non fare nulla
        // altrimenti aggiungi 'all'
        if (prev.size > 0) {
          newSet.add('all');
        }
      } else {
        // Se c'è 'all' nel set, rimuovilo
        if (newSet.has('all')) {
          newSet.delete('all');
        }
        
        // Gestisci normalmente l'aggiunta o rimozione del tipo
        if (newSet.has(type)) {
          newSet.delete(type);
        } else {
          newSet.add(type);
        }
      }
      
      return newSet;
    });
    
    // Chiudi il dropdown dopo aver selezionato un tipo
    setTimeout(() => setIsTypeMenuOpen(false), 150);
  };
  
  const handleImageClick = (image: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    setSelectedImage(image);
    setIsDetailModalOpen(true);
  };
  
  const handleCloseImageModal = () => {
    setIsDetailModalOpen(false);
    setSelectedImage(null);
  };

  // Evita la propagazione degli eventi sui pulsanti
  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    callback();
  };

  // Tipi di immagini disponibili con testo visualizzato
  const imageTypeLabels: Record<ImageTypeFilter, string> = {
    'all': 'Tutti',
    'COPPIA': 'Coppia',
    'SINGOLO': 'Singolo',
    'CIBO': 'Cibo',
    'PAESAGGIO': 'Paesaggio'
  };

  // Array dei tipi disponibili
  const imageTypes: ImageTypeFilter[] = ['all', 'COPPIA', 'SINGOLO', 'CIBO', 'PAESAGGIO'];

  // Handler per long-press (sia mouse che touch)
  const handleImageLongPress = (image: any, event: any) => {
    event.preventDefault();
    setQuickEditImage(image);
    setShowQuickEdit(true);
  };

  // Touch handlers per distinguere tra scroll e long-press
  const handleTouchStartImage = (image: any, e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    const timeout = setTimeout(() => {
      setQuickEditImage(image);
      setShowQuickEdit(true);
    }, 500);
    setQuickEditTimeout(timeout);
  };

  const handleTouchMoveImage = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
      if (quickEditTimeout) clearTimeout(quickEditTimeout);
      setQuickEditTimeout(null);
    }
  };

  const handleTouchEndImage = () => {
    if (quickEditTimeout) clearTimeout(quickEditTimeout);
    setQuickEditTimeout(null);
    touchStartPos.current = null;
  };

  // Funzione di upload immagini (come desktop)
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
    }, {} as any);
    setUploadingFiles(initialUploadState);
    try {
      const response = await uploadImages(files, memory.id);
      setUploadingFiles((prev: any) => {
        const newState = { ...prev };
        response.data.forEach(({ file }: any) => {
          if (newState[file]) {
            newState[file].status = 'processing';
            newState[file].progress = 0;
            newState[file].message = 'Inizio processamento';
          }
        });
        return newState;
      });
      response.data.forEach(({ jobId, file }: any) => {
        pollImageStatus(jobId, (status: any) => {
          setUploadingFiles((prev: any) => {
            const newState = { ...prev };
            if (newState[file]) {
              newState[file].status = status.state;
              newState[file].progress = status.progress || 0;
              newState[file].message = status.status || '';
              if (status.state === 'completed') {
                setTimeout(() => {
                  setUploadingFiles((prev2: any) => {
                    const ns = { ...prev2 };
                    delete ns[file];
                    if (Object.keys(ns).length === 0) {
                      setShowUploadStatus(false);
                    }
                    return ns;
                  });
                }, 2000);
                if (onImagesUploaded) onImagesUploaded();
              }
            }
            return newState;
          });
        });
      });
    } catch (error) {
      setUploadingFiles((prev: any) => {
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

  return (
    <div
      ref={localContainerRef}
      className="w-full h-full flex flex-col"
      onTouchStart={e => e.stopPropagation()}
    >
      {/* Header con controlli in stile iOS */}
      <div className="grid grid-cols-2 items-center mb-3 mt-1">
        {/* Pulsante filtri a sinistra */}
        <div className="flex justify-start">
          <button
            className={`p-2 rounded-full interactive ${
              isTypeMenuOpen || selectedTypes.size > 0
                ? 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 backdrop-blur-xl text-[#007AFF] dark:text-[#0A84FF]'
                : 'bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-xl text-gray-700 dark:text-gray-300'
            }`}
            onClick={(e) => handleButtonClick(e, () => setIsTypeMenuOpen(!isTypeMenuOpen))}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <FunnelIcon className="w-5 h-5" />
            {selectedTypes.size > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                {selectedTypes.size}
              </span>
            )}
          </button>
          
          {isTypeMenuOpen && (
            <div 
              ref={typeMenuRef}
              className="absolute left-4 top-36 mt-1 bg-gray-200/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden z-10 w-64 interactive"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >              
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  {imageTypes.map(type => (
                    <button
                      key={type}
                      className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 interactive ${
                        (type === 'all' && selectedTypes.size === 0) || selectedTypes.has(type)
                          ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white font-medium shadow-sm' 
                          : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                      onClick={(e) => handleTypeClick(type, e)}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      <span>{imageTypeLabels[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Pulsante vista compatta/espansa e Carica a destra */}
        <div className="flex justify-end gap-2">
          <button
            className="p-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-xl text-[#007AFF] dark:text-[#0A84FF] interactive"
            onClick={(e) => handleButtonClick(e, () => setIsCompactGrid(!isCompactGrid))}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {isCompactGrid ? (
              <Squares2X2Icon className="w-5 h-5" />
            ) : (
              <ListBulletIcon className="w-5 h-5" />
            )}
          </button>
          <button
            className="p-2 rounded-full bg-blue-500 text-white interactive shadow-md"
            onClick={() => setIsUploadModalOpen(true)}
            title="Carica immagini"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Gallery Grid con supporto per pinch-to-zoom */}
      <div className="flex-1 overflow-y-auto pb-28" onTouchStart={e => e.stopPropagation()}>
        {!memory.images || memory.images.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
            <IoImagesOutline className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            Nessuna immagine disponibile
          </div>
        ) : (
          <div
            className={`grid auto-rows-[minmax(80px,_auto)] ${
              isCompactGrid
                ? 'grid-cols-3 gap-1'
                : 'grid-cols-2 gap-3'
            }`}
            onTouchStart={e => e.stopPropagation()}
          >
            {filteredImages.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                Nessuna immagine corrisponde ai filtri selezionati
              </div>
            )}
            {filteredImages.map((image: any) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group touch-manipulation transition-all duration-200"
                onClick={(e) => handleImageClick(image, e)}
                onContextMenu={(e) => handleImageLongPress(image, e)}
                onTouchStart={(e) => handleTouchStartImage(image, e)}
                onTouchMove={handleTouchMoveImage}
                onTouchEnd={handleTouchEndImage}
              >
                <img
                  src={getImageUrl(image.thumb_big_path)}
                  alt={`Immagine ${image.id}`}
                  className="object-cover w-full h-full duration-300"
                />
                <div className="absolute inset-0 bg-black/0 duration-200" />
                {image.display_order !== null && image.display_order !== undefined && (
                  <span className="absolute top-1 left-1 bg-yellow-300 text-xs font-bold text-yellow-900 rounded px-1.5 py-0.5 shadow">{image.display_order}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseImageModal}
        image={selectedImage}
        onImageDeleted={onImagesUploaded}
      />

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      {/* Overlay per quick edit */}
      {showQuickEdit && quickEditImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center"
          onClick={() => setShowQuickEdit(false)}
        >
          <div
            className="bg-white rounded-xl p-3 shadow-xl"
            style={{ minWidth: 280, maxWidth: 300, maxHeight: 340, overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
          >
            <div className="mb-1 font-semibold text-center">Tipo</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {['CIBO', 'COPPIA', 'SINGOLO', 'PAESAGGIO'].map(type => {
                const isActive = (quickEditImage.type || '').toLowerCase() === type.toLowerCase();
                return (
                  <button
                    key={type}
                    className={`block w-full text-center px-2 py-2 rounded text-sm font-medium border transition-colors duration-150 ${isActive ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50'}`}
                    onClick={async () => {
                      await updateImageMetadata(quickEditImage.id, {
                        type: type.toLowerCase(),
                        created_at: quickEditImage.created_at,
                        display_order: quickEditImage.display_order ?? null
                      });
                      setShowQuickEdit(false);
                      setShowQuickEditSuccess(true);
                      setTimeout(() => setShowQuickEditSuccess(false), 1500);
                      if (onImagesUploaded) onImagesUploaded();
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            <div className="mb-1 font-semibold text-center">Ordine</div>
            <button
              className={`block w-full text-center px-2 py-2 mb-2 rounded text-base font-semibold border transition-colors duration-150 ${!quickEditImage.display_order ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50'}`}
              onClick={async () => {
                await updateImageMetadata(quickEditImage.id, {
                  type: quickEditImage.type,
                  created_at: quickEditImage.created_at,
                  display_order: null
                });
                setShowQuickEdit(false);
                setShowQuickEditSuccess(true);
                setTimeout(() => setShowQuickEditSuccess(false), 1500);
                if (onImagesUploaded) onImagesUploaded();
              }}
            >
              Nessun ordine
            </button>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4,5,6,7,8].map(n => (
                <button
                  key={n}
                  className={`block w-full text-center px-2 py-2 rounded text-sm font-medium border transition-colors duration-150 ${quickEditImage.display_order == n ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50'}`}
                  onClick={async () => {
                    await updateImageMetadata(quickEditImage.id, {
                      type: quickEditImage.type,
                      created_at: quickEditImage.created_at,
                      display_order: n
                    });
                    setShowQuickEdit(false);
                    setShowQuickEditSuccess(true);
                    setTimeout(() => setShowQuickEditSuccess(false), 1500);
                    if (onImagesUploaded) onImagesUploaded();
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showQuickEditSuccess && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-full bg-green-500 text-white text-sm shadow-lg animate-fade-in-out">
          Modifica salvata!
        </div>
      )}
    </div>
  );
}
