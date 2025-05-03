import { useState, useRef, useEffect, TouchEvent, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { ImageType, ImageResponse, getOriginalImage, deleteImage, getImageUrl, getGalleryImages } from '../../api/images';

interface ImageDetailMobileProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageType | null;
  onImageDeleted?: () => void;
}



export default function ImageDetailMobile({ isOpen, onClose, image, onImageDeleted }: ImageDetailMobileProps) {
  
  // Stati per i dati dell'immagine
  const [fullImageData, setFullImageData] = useState<ImageResponse | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<ImageType | null>(null);
  const [galleryImages, setGalleryImages] = useState<ImageType[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [_loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [_isLoadingWebp, setIsLoadingWebp] = useState(true);
  const [webpLoaded, setWebpLoaded] = useState(false);
  
  // Stati per le azioni e UI
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Stati per gestire lo zoom e swipe
  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [startTouch, setStartTouch] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragTranslate, setStartDragTranslate] = useState({ x: 0, y: 0 });
  const [touchStartY, setTouchStartY] = useState(0);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMovePosition, setLastMovePosition] = useState({ x: 0, y: 0 });
  
  // Stati per il doppio tap e il pinch
  const [lastTap, setLastTap] = useState(0);
  const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 });
  const DOUBLE_TAP_DELAY = 300; // ms
  const MOMENTUM_FACTOR = 0.95; // Fattore di decelerazione per lo scorrimento con inerzia
  const MIN_VELOCITY = 0.5; // Velocità minima per attivare lo scorrimento con inerzia
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const webpImageRef = useRef<HTMLImageElement | null>(null);
  
  // Funzione per pre-caricare l'immagine webp
  const preloadWebpImage = useCallback(async (imageId: string) => {
    if (!imageId) return;
    
    // Resetta stato anche se l'immagine è già stata caricata precedentemente
    setIsLoadingWebp(true);
    setWebpLoaded(false);
    
    try {
      const numericId = parseInt(imageId, 10);
      if (isNaN(numericId)) {
        setImageError('ID immagine non valido');
        return;
      }
      
      // Recupera sempre l'immagine originale quando richiesto esplicitamente
      const response = await getOriginalImage(numericId);
      setFullImageData(response);
      setLoadedImages(prev => ({...prev, [imageId]: true}));
      setImageError(null);
      
      // Pre-carica l'immagine webp in background
      if (response.data?.webp_path) {
        const preloadImg = new Image();
        preloadImg.onload = () => {
          // Notifica che l'immagine webp è pronta
          setWebpLoaded(true);
        };
        preloadImg.src = getImageUrl(response.data.webp_path);
      }
    } catch (error) {
      console.error('Errore nel caricamento dell\'immagine originale:', error);
    } finally {
      setIsLoadingWebp(false);
    }
  }, []);
  
  // Resetta gli stati quando si apre/chiude il modale
  useEffect(() => {
    if (isOpen && image) {
      document.body.style.overflow = 'hidden';
      setCurrentImage(image);
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      setSwipeDistance(0);
      setIsClosing(false);
      setWebpLoaded(false);
      
      // Carica immediatamente l'immagine webp
      preloadWebpImage(image.id);
      
      // Carica le immagini della galleria
      loadGalleryImages(image.id);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, image, preloadWebpImage]);
  
  // Carica le immagini della galleria e trova l'indice dell'immagine corrente
  const loadGalleryImages = async (currentImageId: string) => {
    try {
      const images = await getGalleryImages();
      setGalleryImages(images);
      
      // Trova l'indice dell'immagine corrente
      const index = images.findIndex(img => img.id === currentImageId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
      
      // Precarica le immagini adiacenti (anteriore e successiva)
      const preloadAdjacentImages = () => {
        if (index > 0) {
          const prevImg = images[index - 1];
          const prevImgElement = new Image();
          prevImgElement.src = getImageUrl(prevImg.thumb_big_path);
        }
        
        if (index < images.length - 1) {
          const nextImg = images[index + 1];
          const nextImgElement = new Image();
          nextImgElement.src = getImageUrl(nextImg.thumb_big_path);
        }
      };
      
      // Esegui il precaricamento dopo che l'immagine principale è caricata
      setTimeout(preloadAdjacentImages, 300);
      
    } catch (error) {
      console.error('Errore nel caricamento della galleria:', error);
    }
  };
  
  // Gestione del caricamento dell'immagine webp
  const handleWebpImageLoad = useCallback(() => {
    setWebpLoaded(true);
  }, []);

  // Naviga all'immagine precedente o successiva (ora solo tramite pulsanti, non swipe)
  const navigateToImage = (direction: 'prev' | 'next') => {
    if (galleryImages.length === 0) return;
    
    let newIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < galleryImages.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return; // Non ci sono immagini in quella direzione
    }
    
    // Reset degli stati
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsClosing(false);
    setSwipeDistance(0);
    setWebpLoaded(false);
    
    // Imposta la nuova immagine
    setCurrentIndex(newIndex);
    const newImage = galleryImages[newIndex];
    setCurrentImage(newImage);
    
    // Precarica immediatamente la nuova immagine webp
    preloadWebpImage(newImage.id);
  };
  
  // Gestione degli eventi touch
  const handleTouchStart = (e: TouchEvent) => {
    // Annulla qualsiasi animazione di inerzia in corso
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Reset delle velocità
    setVelocity({ x: 0, y: 0 });
    setLastMoveTime(Date.now());
    
    // Gestione zoom con pinch a due dita
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsPinching(true);
      
      // Calcola la distanza iniziale tra le dita
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      setLastPinchDistance(distance);
      
      // Calcola il punto centrale tra le due dita
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setPinchCenter({ x: centerX, y: centerY });
      
      setInitialTouchDistance(distance);
      return;
    }
    
    // Gestione doppio tap per zoom
    if (e.touches.length === 1) {
      const now = Date.now();
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      // Registra la posizione per il calcolo della velocità
      setLastMovePosition({ x: touchX, y: touchY });
      
      // Gestisce doppio tap
      if (now - lastTap < DOUBLE_TAP_DELAY) {
        e.preventDefault();
        
        // Toggle tra zoom e visualizzazione normale
        if (scale > 1) {
          // Reset allo stato normale con animazione fluida
          setScale(1);
          setTranslate({ x: 0, y: 0 });
        } else {
          // Zoom x3 centrato sul punto di doppio tap
          const newScale = 3;
          setScale(newScale);
          
          if (containerRef.current && imageRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const imageRect = imageRef.current.getBoundingClientRect();
            
            // Calcola la posizione relativa del tap all'interno dell'immagine
            const relativeX = touchX - imageRect.left;
            const relativeY = touchY - imageRect.top;
            
            // Calcola lo spostamento per centrare il punto tappato
            const containerCenterX = containerRect.width / 2;
            const containerCenterY = containerRect.height / 2;
            const targetX = containerCenterX - relativeX * newScale;
            const targetY = containerCenterY - relativeY * newScale;
            
            // Limita la traslazione per non mostrare spazi vuoti
            const maxTranslateX = (newScale - 1) * containerRect.width / 2;
            const maxTranslateY = (newScale - 1) * containerRect.height / 2;
            
            setTranslate({
              x: Math.max(-maxTranslateX, Math.min(maxTranslateX, targetX)),
              y: Math.max(-maxTranslateY, Math.min(maxTranslateY, targetY))
            });
          }
        }
        
        setLastTap(0); // Reset per evitare tripli tap
        return;
      } else {
        setLastTap(now);
      }
      
      // Gestione swipe verticale per chiudere quando non si è in zoom
      if (scale === 1) {
        setTouchStartY(touchY);
        return;
      }
      
      // Gestione dello spostamento dell'immagine quando è ingrandita
      if (scale > 1) {
        e.preventDefault();
        setIsDragging(true);
        setStartTouch({
          x: touchX,
          y: touchY
        });
        setStartDragTranslate({ ...translate });
      }
    }
  };
  
  // Calcola la velocità di movimento per l'inerzia
  const calculateVelocity = (currentPosition: { x: number, y: number }) => {
    const now = Date.now();
    const timeDelta = now - lastMoveTime;
    
    if (timeDelta > 0) {
      const dx = currentPosition.x - lastMovePosition.x;
      const dy = currentPosition.y - lastMovePosition.y;
      
      // Calcola la velocità in pixel per millisecondo
      const vx = dx / timeDelta;
      const vy = dy / timeDelta;
      
      setVelocity({ x: vx, y: vy });
      setLastMoveTime(now);
      setLastMovePosition(currentPosition);
    }
  };
  
  // Applica l'inerzia allo scorrimento
  const applyMomentum = () => {
    if (Math.abs(velocity.x) < MIN_VELOCITY && Math.abs(velocity.y) < MIN_VELOCITY) {
      animationFrameRef.current = null;
      return;
    }
    
    // Calcola il nuovo spostamento basato sulla velocità attuale
    setTranslate(prev => {
      if (!containerRef.current) return prev;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxTranslateX = (scale - 1) * containerRect.width / 2;
      const maxTranslateY = (scale - 1) * containerRect.height / 2;
      
      // Calcola la nuova posizione con inerzia
      let newX = prev.x + velocity.x * 16; // 16ms è circa un frame a 60fps
      let newY = prev.y + velocity.y * 16;
      
      // Limita la posizione per non mostrare spazi vuoti
      newX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newX));
      newY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newY));
      
      // Se l'immagine ha raggiunto i bordi, azzera la velocità in quella direzione
      if (newX === -maxTranslateX || newX === maxTranslateX) {
        setVelocity(prev => ({ ...prev, x: 0 }));
      }
      
      if (newY === -maxTranslateY || newY === maxTranslateY) {
        setVelocity(prev => ({ ...prev, y: 0 }));
      }
      
      return { x: newX, y: newY };
    });
    
    // Riduci la velocità gradualmente (decelerazione)
    setVelocity(prev => ({
      x: prev.x * MOMENTUM_FACTOR,
      y: prev.y * MOMENTUM_FACTOR
    }));
    
    // Continua l'animazione
    animationFrameRef.current = requestAnimationFrame(applyMomentum);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    // Gestione zoom con pinch
    if (e.touches.length === 2 && initialTouchDistance !== null) {
      e.preventDefault();
      
      // Calcola la distanza attuale tra le dita
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Calcola la variazione rispetto all'ultimo frame per uno zoom più fluido
      const distanceDelta = lastPinchDistance ? currentDistance / lastPinchDistance : 1;
      setLastPinchDistance(currentDistance);
      
      // Calcola il punto centrale attuale tra le due dita
      const currentCenterX = (touch1.clientX + touch2.clientX) / 2;
      const currentCenterY = (touch1.clientY + touch2.clientY) / 2;
      
      // Calcola lo spostamento del centro rispetto al frame precedente
      const centerDeltaX = currentCenterX - pinchCenter.x;
      const centerDeltaY = currentCenterY - pinchCenter.y;
      
      // Aggiorna il centro del pinch
      setPinchCenter({ x: currentCenterX, y: currentCenterY });
      
      // Calcola il nuovo fattore di scala con smorzamento per movimenti fluidi
      const scaleDelta = Math.max(0.95, Math.min(1.05, distanceDelta));
      const newScale = Math.max(1, Math.min(5, scale * scaleDelta));
      
      if (containerRef.current && imageRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();
        
        // Calcola il nuovo fattore di traslazione basato sulla variazione di scala
        // e sul movimento del centro del pinch
        let newTranslateX = translate.x;
        let newTranslateY = translate.y;
        
        // Applica prima la traslazione dovuta al movimento del centro del pinch
        newTranslateX += centerDeltaX;
        newTranslateY += centerDeltaY;
        
        // Poi applica la traslazione dovuta al cambio di scala
        const scaleRatio = newScale / scale;
        const imageCenterX = imageRect.left + imageRect.width / 2;
        const imageCenterY = imageRect.top + imageRect.height / 2;
        
        // Calcola lo spostamento per mantenere il punto di pinch fisso sullo schermo
        const pinchOffsetX = currentCenterX - imageCenterX;
        const pinchOffsetY = currentCenterY - imageCenterY;
        
        // Applica lo spostamento proporzionale alla variazione di scala
        newTranslateX -= pinchOffsetX * (scaleRatio - 1);
        newTranslateY -= pinchOffsetY * (scaleRatio - 1);
        
        // Limita la traslazione per evitare spazi vuoti ai bordi
        const maxTranslateX = Math.max(0, (imageRect.width * scaleRatio - containerRect.width) / 2);
        const maxTranslateY = Math.max(0, (imageRect.height * scaleRatio - containerRect.height) / 2);
        
        newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
        newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
        
        setScale(newScale);
        setTranslate({ x: newTranslateX, y: newTranslateY });
      } else {
        setScale(newScale);
      }
      
      return;
    }
    
    // Gestione swipe verso il basso per chiudere quando non si è in zoom
    if (scale === 1 && e.touches.length === 1) {
      const touchY = e.touches[0].clientY;
      const deltaY = touchY - touchStartY;
      
      if (deltaY > 0) { // Solo verso il basso
        setSwipeDistance(deltaY);
        if (deltaY > 100) {
          setIsClosing(true);
        }
      }
      return;
    }
    
    // Gestione dello spostamento dell'immagine quando è ingrandita
    if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      // Calcola la velocità per l'inerzia
      calculateVelocity({ x: touchX, y: touchY });
      
      // Calcola lo spostamento relativo con effetto di resistenza ai bordi
      const deltaX = touchX - startTouch.x;
      const deltaY = touchY - startTouch.y;
      
      // Limita lo spostamento in base alle dimensioni dell'immagine e del contenitore
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const maxTranslateX = (scale - 1) * containerRect.width / 2;
        const maxTranslateY = (scale - 1) * containerRect.height / 2;
        
        // Calcola nuove coordinate con effetto elastico ai bordi
        let newX = startDragTranslate.x + deltaX;
        let newY = startDragTranslate.y + deltaY;
        
        // Effetto elastico quando si supera il limite
        if (Math.abs(newX) > maxTranslateX) {
          const overscroll = Math.abs(newX) - maxTranslateX;
          const damping = 0.3; // Fattore di smorzamento
          newX = Math.sign(newX) * (maxTranslateX + overscroll * damping);
        }
        
        if (Math.abs(newY) > maxTranslateY) {
          const overscroll = Math.abs(newY) - maxTranslateY;
          const damping = 0.3; // Fattore di smorzamento
          newY = Math.sign(newY) * (maxTranslateY + overscroll * damping);
        }
        
        setTranslate({ x: newX, y: newY });
      }
    }
  };
  
  const handleTouchEnd = () => {
    // Gestione della chiusura con swipe verso il basso
    if (isClosing) {
      onClose();
    }
    
    // Snap dello zoom a livelli predefiniti per una migliore esperienza utente
    if (isPinching) {
      // Snap ai livelli di zoom: 1x, 2x, 3x in base a dove siamo
      if (scale < 1.5) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else if (scale < 2.5) {
        setScale(2);
      } else {
        setScale(3);
      }
    }
    
    // Gestione dell'inerzia per lo scorrimento fluido
    if (isDragging && scale > 1) {
      const vx = velocity.x;
      const vy = velocity.y;
      
      // Avvia l'animazione di inerzia solo se la velocità è sufficiente
      if (Math.abs(vx) > MIN_VELOCITY || Math.abs(vy) > MIN_VELOCITY) {
        animationFrameRef.current = requestAnimationFrame(applyMomentum);
      }
    }
    
    // Reset degli stati touch
    setIsPinching(false);
    setInitialTouchDistance(null);
    setLastPinchDistance(null);
    setIsDragging(false);
    setSwipeDistance(0);
    setIsClosing(false);
    
    // Impedisci che il tap diventi un doppio tap se è passato troppo tempo
    if (Date.now() - lastTap > DOUBLE_TAP_DELAY * 1.5) {
      setLastTap(0);
    }
  };
  
  // Funzioni per le azioni sull'immagine
  const handleDelete = async () => {
    if (!currentImage) return;

    setIsDeleting(true);
    try {
      await deleteImage(currentImage.id);
      
      // Se ci sono altre immagini, naviga a quella successiva o precedente
      if (galleryImages.length > 1) {
        if (currentIndex < galleryImages.length - 1) {
          navigateToImage('next');
        } else {
          navigateToImage('prev');
        }
        
        // Rimuovi l'immagine dalla galleria locale
        setGalleryImages(prev => prev.filter(img => img.id !== currentImage.id));
        
        // Aggiorna la cache
        if (onImageDeleted) {
          onImageDeleted();
        }
      } else {
        // Se era l'ultima immagine, chiudi il modale
        onClose();
        if (onImageDeleted) {
          onImageDeleted();
        }
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'immagine:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  // Seleziona un'immagine dal carosello delle anteprime
  const handleThumbnailClick = (image: ImageType, index: number) => {
    // Reset degli stati
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsClosing(false);
    setSwipeDistance(0);
    setWebpLoaded(false);
    
    // Imposta la nuova immagine
    setCurrentIndex(index);
    setCurrentImage(image);
    
    // Precarica immediatamente la nuova immagine webp anche se già caricata prima
    preloadWebpImage(image.id);
  };
  
  // Scorrimento automatico per centrare la miniatura attiva
  useEffect(() => {
    if (carouselRef.current && galleryImages.length > 0) {
      const activeThumb = carouselRef.current.querySelector('.snap-center');
      if (activeThumb instanceof HTMLElement) {
        // Centramento della miniatura attiva nel contenitore
        const container = carouselRef.current;
        const scrollLeft = activeThumb.offsetLeft - (container.clientWidth / 2) + (activeThumb.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentIndex, galleryImages.length]);
  
  // Effetto per il cleanup
  useEffect(() => {
    return () => {
      // Pulisci l'animation frame quando il componente si smonta
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);
  

  // Se il modale non è aperto o non c'è un'immagine, non renderizzare nulla
  if (!isOpen || !currentImage) return null;
  
  // Determina quale immagine mostrare prioritariamente
  // Inizia con la thumbnail e passa all'immagine webp quando disponibile
  const thumbnailUrl = getImageUrl(currentImage.thumb_big_path);
  const webpUrl = fullImageData?.data?.webp_path ? getImageUrl(fullImageData.data.webp_path) : null;
  
  // Usa l'immagine più dettagliata disponibile
  const displayImage = fullImageData?.data || currentImage;

  // Formatta la data dell'immagine
  const imageDate = format(new Date(displayImage.created_at), 'EEEE d MMMM yyyy', { locale: it });

  return createPortal(
    <div 
      className="fixed inset-0 z-[60] bg-black touch-none flex flex-col pt-12 overflow-hidden"
      style={{
        opacity: isClosing ? 0.5 : 1,
        transform: `translateY(${swipeDistance}px)`,
        transition: swipeDistance > 0 ? 'none' : 'opacity 0.3s, transform 0.3s'
      }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Header con data */}
      <div className="relative py-4 flex items-center justify-center">
        {/* Pulsante chiudi in alto a sinistra */}
        <button
          onClick={onClose}
          className="absolute left-2 p-2 rounded-full bg-black/50 text-white"
          aria-label="Chiudi"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Data centrata */}
        <h2 className="text-white/90 font-medium capitalize text-center">
          {imageDate}
        </h2>
        
        
      </div>

      {/* Contenitore principale per l'immagine */}
      <div 
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onTouchStart={(e) => {
          e.stopPropagation();
          handleTouchStart(e);
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleTouchMove(e);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          handleTouchEnd();
        }}
      >
        {/* Immagine principale */}
        <div className="relative w-full h-full flex items-center justify-center">
          {imageError ? (
            <div className="text-red-500">{imageError}</div>
          ) : (
            <>
              {/* Immagine thumbnail (visibile immediatamente) */}
              <div className={`w-full flex items-center justify-center ${webpLoaded ? 'hidden' : ''}`}>
                <img
                  ref={imageRef}
                  src={thumbnailUrl}
                  alt={`Immagine ${currentImage.id}`}
                  className="max-h-[70vh] w-auto h-auto object-contain"
                  style={{
                    transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                    transition: isPinching || isDragging 
                      ? 'none' 
                      : 'transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                  }}
                />
              </div>
              
              {/* Immagine webp (caricata in background) */}
              {webpUrl && (
                <div className={`w-full flex items-center justify-center ${webpLoaded ? '' : 'hidden'}`}>
                  <img
                    ref={webpImageRef}
                    src={webpUrl}
                    alt={`Immagine ${currentImage.id} (alta qualità)`}
                    className="max-h-[70vh] w-auto h-auto object-contain"
                    style={{
                      transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                      transition: isPinching || isDragging 
                        ? 'none' 
                        : 'transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                    }}
                    onLoad={handleWebpImageLoad}
                    loading="eager"
                    decoding="async"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Carosello di miniature in basso */}
      <div className="bg-black/70 px-2 py-3 overflow-hidden">
        <div 
          ref={carouselRef}
          className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar"
          style={{
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {galleryImages.map((img, index) => (
            <div 
              key={img.id}
              className={`flex-shrink-0 w-[40px] h-[60px] rounded-md overflow-hidden transition-all duration-200 ${
                index === currentIndex 
                  ? 'border-2 border-white shadow-lg scale-110 z-10 brightness-125 snap-center' 
                  : 'border border-white/30 opacity-70 hover:opacity-100'
              }`}
              onClick={() => handleThumbnailClick(img, index)}
            >
              <img 
                src={getImageUrl(img.thumb_big_path)} 
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
                loading={Math.abs(index - currentIndex) <= 2 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Barra degli strumenti in fondo */}
      <div className="bg-black/80 py-5 pb-10">
        <div className="flex justify-center">
          {/* Toggle centrale in stile iOS con i tre pulsanti */}
          <div className="inline-flex items-center rounded-full bg-white/10 p-1 shadow-inner">
            {/* Pulsante Elimina */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-white hover:bg-white/20 active:bg-white/30 transition-colors text-sm font-medium ${isDeleting ? 'opacity-50' : ''}`}
            >
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-white">{isDeleting ? 'Eliminando...' : 'Elimina'}</span>
            </button>
            
            {/* Pulsante Scarica */}
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = webpUrl || thumbnailUrl;
                link.download = `immagine-${currentImage.id}.webp`;
                link.click();
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-white hover:bg-white/20 active:bg-white/30 transition-colors text-sm font-medium"
            >
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-white">Scarica</span>
            </button>
          </div>
        </div>
      </div>     
    </div>,
    document.body
  );
} 