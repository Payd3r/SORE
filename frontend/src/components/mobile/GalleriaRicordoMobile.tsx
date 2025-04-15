import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FunnelIcon, 
  ListBulletIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { IoImagesOutline } from 'react-icons/io5';
import { Memory } from '../../api/memory';
import ImageDetailModal from './ImageDetailMobile';
import { getImageUrl } from '../../api/images';

// Definizione del tipo ImageTypeFilter
type ImageTypeFilter = 'all' | 'COPPIA' | 'SINGOLO' | 'CIBO' | 'PAESAGGIO';

interface GalleriaRicordoMobileProps {
  memory: Memory;
  onImagesUploaded?: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export default function GalleriaRicordoMobile({ memory, onImagesUploaded, containerRef }: GalleriaRicordoMobileProps) {
  const [isCompactGrid, setIsCompactGrid] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ImageTypeFilter>>(new Set());
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const localContainerRef = useRef<HTMLDivElement>(null);
  
  // Stati per la gestione del pinch-to-zoom
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [pinchScale, setPinchScale] = useState<number>(1);
  const [isPinching, setIsPinching] = useState(false);
  const lastPinchTimeRef = useRef<number>(0);
  
  // Flag per tracciare se il tocco iniziale è su un elemento interattivo
  const touchStartedOnInteractiveRef = useRef<boolean>(false);
  const currentTouchRef = useRef<React.Touch | null>(null);

  // Filtro le immagini in base ai tipi selezionati
  const filteredImages = (memory.images || []).filter((image: any) => {
    if (selectedTypes.size === 0 || selectedTypes.has('all')) return true;
    // Standardizziamo il tipo dell'immagine in maiuscolo per un confronto uniforme
    const imageType = (image.type || '').toUpperCase() as ImageTypeFilter;
    return selectedTypes.has(imageType);
  });
  
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

  // Funzione helper per verificare se un elemento è interattivo
  const isInteractiveElement = useCallback((element: Element): boolean => {
    // Controlla se l'elemento o qualsiasi suo genitore è un pulsante o un'immagine
    const isButton = element.closest('button') !== null;
    const isImage = element.tagName === 'IMG';
    const isInteractive = isButton || isImage || element.classList.contains('interactive');
    return isInteractive;
  }, []);
  
  // Gestione del tocco iniziale globale
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Se stiamo toccando un elemento interattivo, segnalo
    if (e.target instanceof Element) {
      touchStartedOnInteractiveRef.current = isInteractiveElement(e.target);
      
      // Se è un tocco singolo, lo salviamo per tracciare i movimenti
      if (e.touches.length === 1) {
        currentTouchRef.current = e.touches[0];
      }
      
      // Se è un tocco su elemento interattivo, non facciamo altro
      if (touchStartedOnInteractiveRef.current) {
        e.stopPropagation();
        return;
      }
    }
    
    // Gestione del pinch-to-zoom (solo se non è su elemento interattivo)
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      setInitialTouchDistance(distance);
      setIsPinching(true);
      setPinchScale(1);
    }
  }, [isInteractiveElement]);

  // Gestione del movimento del tocco
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Se il tocco è iniziato su un elemento interattivo, non gestiamo il movimento
    if (touchStartedOnInteractiveRef.current) {
      e.stopPropagation();
      return;
    }
    
    // Gestione del pinch
    if (e.touches.length === 2 && initialTouchDistance !== null) {
      // Calcola la distanza attuale tra le dita
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Calcola il fattore di scala
      const newScale = currentDistance / initialTouchDistance;
      setPinchScale(newScale);
      
      // Throttle il cambio di modalità per evitare cambi troppo rapidi
      const now = Date.now();
      if (now - lastPinchTimeRef.current > 300) {
        if (newScale < 0.8 && isCompactGrid === false) {
          setIsCompactGrid(true);
          lastPinchTimeRef.current = now;
        } else if (newScale > 1.2 && isCompactGrid === true) {
          setIsCompactGrid(false);
          lastPinchTimeRef.current = now;
        }
      }
    }
  }, [initialTouchDistance, isCompactGrid]);

  // Gestione del rilascio del tocco
  const handleTouchEnd = useCallback(() => {
    // Resetta i flag e gli stati
    touchStartedOnInteractiveRef.current = false;
    currentTouchRef.current = null;
    setInitialTouchDistance(null);
    setIsPinching(false);
    setPinchScale(1);
  }, []);
  
  // Gestione nativa dei tocchi sui pulsanti
  const handleNativeTouchStart = useCallback((e: Event) => {
    // Assicuriamoci che sia un evento touch
    if (e instanceof TouchEvent && e.target instanceof Element && isInteractiveElement(e.target)) {
      e.stopPropagation();
    }
  }, [isInteractiveElement]);
  
  // Effetto per aggiungere listener nativi per i tocchi
  useEffect(() => {
    // Cattura gli elementi interattivi nel componente
    const container = containerRef?.current || localContainerRef.current;
    if (!container) return;
    
    // Tutti i pulsanti e immagini nel componente
    const interactiveElements = container.querySelectorAll('button, img, .interactive');
    
    // Aggiunge listener a ciascun elemento interattivo
    interactiveElements.forEach(element => {
      element.addEventListener('touchstart', handleNativeTouchStart, { passive: false });
    });
    
    return () => {
      interactiveElements.forEach(element => {
        element.removeEventListener('touchstart', handleNativeTouchStart);
      });
    };
  }, [handleNativeTouchStart, containerRef]);
  
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


  return (
    <div 
      ref={localContainerRef}
      className="w-full h-full flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
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
              className="absolute left-0 top-12 mt-1 bg-gray-200/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden z-10 w-64 interactive"
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
        
        {/* Pulsante vista compatta/espansa a destra */}
        <div className="flex justify-end">
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
        </div>
      </div>

      {/* Gallery Grid con supporto per pinch-to-zoom */}
      <div className="flex-1 overflow-y-auto pb-28">
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
            style={{ 
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
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group touch-manipulation transition-all duration-200"
                onClick={(e) => handleImageClick(image, e)}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <img
                  src={getImageUrl(image.thumb_big_path)}
                  alt={`Immagine ${image.id}`}
                  className="object-cover w-full h-full duration-300"
                />
                <div className="absolute inset-0 bg-black/0 duration-200" />
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
    </div>
  );
}
