import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  IoCalendarOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoDocumentTextOutline,
  IoImagesOutline
} from 'react-icons/io5';
import { FaSpotify } from 'react-icons/fa';
import { getTrackDetails, SpotifyTrack } from '../../api/spotify';
import { Memory } from '../../api/memory';
import { getMemoryMapImages, type ImageLocation } from '../../api/map';
import Map from '../../desktop/components/Maps/Map';

// Estendiamo l'interfaccia Memory con i campi extra
interface ExtendedMemory extends Memory {
  description?: string | null;
  created_by_name?: string;
}

interface InfoRicordoMobileProps {
  memory: ExtendedMemory;
  onVisitGallery: () => void;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export default function InfoRicordoMobile({ memory, onVisitGallery }: InfoRicordoMobileProps) {
  const [trackInfo, setTrackInfo] = useState<SpotifyTrack | null>(null);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [mapImages, setMapImages] = useState<ImageLocation[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  
  // Riferimento al contenitore principale
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Flag per tracciare se il tocco iniziale è su un elemento interattivo
  const touchStartedOnInteractiveRef = useRef<boolean>(false);
  // Riferimento alla posizione iniziale del tocco
  const touchStartYRef = useRef<number | null>(null);
  // Flag per indicare se stiamo scrollando
  const isScrollingRef = useRef<boolean>(false);

  // Formattazione data nel formato "15 Giugno 2023"
  const formatDateLong = useCallback((dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy', { locale: it });
    } catch (error) {
      return '';
    }
  }, []);
  
  // Formattazione intelligente dell'intervallo di date
  const formatDateRange = useCallback((startDate: string, endDate: string) => {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      // Ottieni anno, mese e giorno per entrambe le date
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      const startMonth = start.getMonth();
      const endMonth = end.getMonth();
      
      // Se gli anni sono diversi, mostra entrambi completamente
      if (startYear !== endYear) {
        return `${format(start, 'dd MMMM yyyy', { locale: it })} - ${format(end, 'dd MMMM yyyy', { locale: it })}`;
      }
      
      // Se gli anni sono uguali ma i mesi diversi
      if (startMonth !== endMonth) {
        return `${format(start, 'dd MMMM', { locale: it })} - ${format(end, 'dd MMMM yyyy', { locale: it })}`;
      }
      
      // Se sia anno che mese sono uguali
      return `${format(start, 'dd', { locale: it })} - ${format(end, 'dd MMMM yyyy', { locale: it })}`;
    } catch (error) {
      return `${formatDateLong(startDate)} - ${formatDateLong(endDate)}`;
    }
  }, [formatDateLong]);

  // Funzione helper per verificare se un elemento è interattivo
  const isInteractiveElement = useCallback((element: Element): boolean => {
    // Controlla se l'elemento o qualsiasi suo genitore è un pulsante, un link, un input o ha la classe interactive
    const isButton = element.closest('button') !== null;
    const isLink = element.closest('a') !== null;
    const isInput = element.closest('input') !== null;
    const isInteractive = isButton || isLink || isInput || element.classList.contains('interactive');
    return isInteractive;
  }, []);
  
  // Gestione del tocco iniziale
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Memorizziamo la posizione iniziale del tocco
    if (e.touches.length === 1) {
      touchStartYRef.current = e.touches[0].clientY;
    }
    
    // Se stiamo toccando un elemento interattivo, segnalo
    if (e.target instanceof Element) {
      touchStartedOnInteractiveRef.current = isInteractiveElement(e.target);
      
      // Se è un tocco su elemento interattivo, non facciamo altro
      if (touchStartedOnInteractiveRef.current) {
        e.stopPropagation();
      }
    }
  }, [isInteractiveElement]);

  // Gestione del movimento del tocco
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Se il tocco è iniziato su un elemento interattivo, blocchiamo la propagazione
    if (touchStartedOnInteractiveRef.current) {
      e.stopPropagation();
      return;
    }
    
    // Se non abbiamo registrato un punto di inizio, usciamo
    if (touchStartYRef.current === null || e.touches.length !== 1) return;
    
    // Calcoliamo la distanza percorsa
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current;
    
    // Determiniamo se stiamo scrollando verticalmente
    if (!isScrollingRef.current && Math.abs(deltaY) > 10) {
      isScrollingRef.current = true;
    }
    
    // Se stiamo scrollando, non blocchiamo l'evento ma interrompiamo la propagazione
    // per evitare che il motiondiv lo catturi
    if (isScrollingRef.current) {
      e.stopPropagation();
    }
  }, []);

  // Gestione del rilascio del tocco
  const handleTouchEnd = useCallback(() => {
    // Resetta i flag e i riferimenti
    touchStartedOnInteractiveRef.current = false;
    touchStartYRef.current = null;
    isScrollingRef.current = false;
  }, []);
  
  // Gestione nativa dei tocchi sui pulsanti e altri elementi interattivi
  const handleNativeTouchStart = useCallback((e: Event) => {
    // Assicuriamoci che sia un evento touch
    if (e instanceof TouchEvent && e.target instanceof Element && isInteractiveElement(e.target)) {
      e.stopPropagation();
    }
  }, [isInteractiveElement]);
  
  // Effetto per aggiungere listener nativi per i tocchi
  useEffect(() => {
    // Cattura gli elementi interattivi nel componente
    const container = containerRef.current;
    if (!container) return;
    
    // Tutti gli elementi interattivi nel componente
    const interactiveElements = container.querySelectorAll('button, a, input, .interactive');
    
    // Aggiunge listener a ciascun elemento interattivo
    interactiveElements.forEach(element => {
      element.addEventListener('touchstart', handleNativeTouchStart, { passive: false });
    });
    
    return () => {
      interactiveElements.forEach(element => {
        element.removeEventListener('touchstart', handleNativeTouchStart);
      });
    };
  }, [handleNativeTouchStart]);

  // Effetto per caricare i dati Spotify se il ricordo ha una canzone
  useEffect(() => {
    const fetchTrackInfo = async () => {
      if (memory.song) {
        setIsLoadingTrack(true);
        try {
          const track = await getTrackDetails(memory.song);
          setTrackInfo(track);
        } catch (error) {
          console.error('Errore nel recupero delle informazioni della canzone:', error);
        } finally {
          setIsLoadingTrack(false);
        }
      }
    };

    fetchTrackInfo();
  }, [memory.song]);

  // Effetto per caricare le immagini della mappa
  useEffect(() => {
    let isMounted = true;
    const fetchMapImages = async () => {
      setIsLoadingMap(true);
      setMapError(null);
      try {
        const images = await getMemoryMapImages(memory.id);
        
        // Verifica che il componente sia ancora montato prima di aggiornare lo stato
        if (!isMounted) return;
        
        setMapImages(images);
        
        // Calcola i bounds della mappa
        if (images.length > 0) {
          const bounds = images.reduce((acc, img) => ({
            north: Math.max(acc.north, img.lat),
            south: Math.min(acc.south, img.lat),
            east: Math.max(acc.east, img.lon),
            west: Math.min(acc.west, img.lon)
          }), {
            north: images[0].lat,
            south: images[0].lat,
            east: images[0].lon,
            west: images[0].lon
          });

          // Aggiungi un po' di padding ai bounds
          const padding = 0.05; // Ridotto per mobile
          setMapBounds({
            north: bounds.north + padding,
            south: bounds.south - padding,
            east: bounds.east + padding,
            west: bounds.west - padding
          });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Errore nel caricamento delle immagini sulla mappa:', error);
        setMapError('Errore nel caricamento delle immagini sulla mappa');
      } finally {
        if (isMounted) {
          setIsLoadingMap(false);
        }
      }
    };

    fetchMapImages();
    
    return () => {
      isMounted = false;
    };
  }, [memory.id]);
  
  // Memoizziamo la mappa per evitare re-rendering non necessari
  const mapComponent = useMemo(() => (
    <Map
      images={mapImages}
      isLoading={isLoadingMap}
      error={mapError}
      bounds={mapBounds || undefined}
    />
  ), [mapImages, isLoadingMap, mapError, mapBounds]);

  return (
    <div 
      ref={containerRef}
      className="py-4 h-full overflow-y-auto pb-24"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Sezione principale con descrizione */}
      {memory.description && (
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-white mb-2">Descrizione</h3>
          <div className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">
            {memory.description}
          </div>
        </div>
      )}

      {/* Mappa */}
      <div 
        className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 interactive"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="h-64 interactive">
          {mapComponent}
        </div>
      </div>

      {/* Card con dettagli principali */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white mb-3">Dettagli</h3>
        
        <div className="space-y-4">
          {/* Tipo di ricordo */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <IoDocumentTextOutline className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
              <p className="text-sm text-gray-800 dark:text-white">
                {memory.type === 'VIAGGIO' ? 'Viaggio' : 
                 memory.type === 'EVENTO' ? 'Evento' : 'Ricordo semplice'}
              </p>
            </div>
          </div>
          
          {/* Date */}
          {memory.start_date && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <IoCalendarOutline className="w-4 h-4 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {memory.end_date && memory.end_date !== memory.start_date ? 'Periodo' : 'Data'}
                </p>
                <p className="text-sm text-gray-800 dark:text-white">
                  {memory.end_date && memory.end_date !== memory.start_date 
                    ? formatDateRange(memory.start_date, memory.end_date) 
                    : formatDateLong(memory.start_date)
                  }
                </p>
              </div>
            </div>
          )}
          
          {/* Luogo */}
          {memory.location && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <IoLocationOutline className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Luogo</p>
                <p className="text-sm text-gray-800 dark:text-white">{memory.location}</p>
              </div>
            </div>
          )}
          
          {/* Creatore */}
          {"created_by_name" in memory && memory.created_by_name && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <IoPersonOutline className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Creato da</p>
                <p className="text-sm text-gray-800 dark:text-white">{memory.created_by_name}</p>
              </div>
            </div>
          )}
          
          {/* Canzone */}
          {memory.song && (
            <div className="flex items-start gap-1 ps-0">              
              <div className="flex-1 min-w-0">               
                {isLoadingTrack ? (
                  <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1 w-4/5"></div>
                ) : trackInfo ? (
                  <div className="flex items-center gap-2 mt-1">
                    {trackInfo.album?.images?.[0]?.url && (
                      <img 
                        src={trackInfo.album.images[0].url} 
                        alt="Album cover"
                        className="w-8 h-8 rounded object-cover interactive"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-white font-medium truncate">
                        {trackInfo.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {trackInfo.artists.map(a => a.name).join(', ')}
                      </p>
                    </div>
                    {trackInfo.external_urls?.spotify && (
                      <a 
                        href={trackInfo.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex-shrink-0 w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center interactive"
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <FaSpotify className="w-3.5 h-3.5 text-white" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 dark:text-white">{memory.song}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Numero immagini */}
          {memory.tot_img > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <IoImagesOutline className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Foto</p>
                <div className="flex items-center">
                  <p className="text-sm text-gray-800 dark:text-white">{memory.tot_img} immagini</p>
                  <button 
                    onClick={onVisitGallery}
                    className="ml-2 text-xs font-medium text-blue-500 dark:text-blue-400 interactive"
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    Visualizza
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Metadati e info di sistema */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Informazioni di sistema</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Creato il</span>
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {memory.created_at ? formatDateLong(memory.created_at) : 'Data non disponibile'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Ultimo aggiornamento</span>
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {memory.updated_at ? formatDateLong(memory.updated_at) : 'Data non disponibile'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">ID Ricordo</span>
            <span className="text-xs text-gray-700 dark:text-gray-300">#{memory.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 