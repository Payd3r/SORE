import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { IoCalendarOutline, IoLocationOutline, IoMusicalNotesOutline, IoPlayCircle } from 'react-icons/io5';
import { FaSpotify } from 'react-icons/fa';
import { getImageUrl } from '../../api/images';
import { Memory } from '../../api/memory';
import { getTrackDetails, SpotifyTrack } from '../../api/spotify';

// Interfacce
interface MemoryCardMobileProps {
  memory: Memory;
  onClick?: (e: React.MouseEvent) => void;
  isActive?: boolean;
}

// Memo wrapper per prevenire rendering inutili
const CardRicordoMobile = memo(({ memory, onClick, isActive }: MemoryCardMobileProps) => {
  const navigate = useNavigate();
  const [spotifyData, setSpotifyData] = useState<SpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Carica i dati Spotify solo se presente una canzone e solo per viaggi
  useEffect(() => {
    let isActive = true;
    if (memory.song && memory.type.toUpperCase() === 'VIAGGIO') {
      setIsLoading(true);
      getTrackDetails(memory.song.split(' - ')[0]) // Prendi solo il titolo prima del trattino
        .then(data => {
          if (!isActive) return;
          setSpotifyData(data);
          if (data?.preview_url) {
            const newAudio = new Audio();
            newAudio.preload = 'none'; // Evita il precaricamento automatico
            newAudio.src = data.preview_url;
            newAudio.addEventListener('ended', () => setIsPlaying(false));
            setAudio(newAudio);
          }
        })
        .catch(error => console.error('Errore nel caricamento dei dati Spotify:', error))
        .finally(() => {
          if (isActive) setIsLoading(false);
        });
    }

    // Cleanup
    return () => {
      isActive = false;
      if (audio) {
        audio.pause();
        audio.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, [memory.song, memory.type]);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate(`/ricordo/${memory.id}`);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita di navigare al ricordo quando si clicca play

    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        // Carica l'audio solo quando necessario
        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Errore nella riproduzione audio:', error);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Formatta l'intervallo di date - Memoizzato
  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate) return '';

    try {
      const start = format(parseISO(startDate), 'd MMM', { locale: it });

      if (!endDate) return start;

      // Se le date sono uguali, mostra solo una data
      if (format(parseISO(startDate), 'yyyy-MM-dd') === format(parseISO(endDate), 'yyyy-MM-dd')) {
        return start;
      }

      // Se il mese è lo stesso, mostra solo il giorno per la prima data
      if (format(parseISO(startDate), 'MM-yyyy') === format(parseISO(endDate), 'MM-yyyy')) {
        return `${format(parseISO(startDate), 'd')} - ${format(parseISO(endDate), 'd MMM', { locale: it })}`;
      }

      // Se i mesi sono diversi, mostra il mese per entrambe le date
      return `${start} - ${format(parseISO(endDate), 'd MMM', { locale: it })}`;
    } catch (error) {
      return '';
    }
  };

  // Stile in base al tipo di ricordo - Memoizzato
  const getTypeStyle = (type: string) => {
    // Normalizza il tipo convertendolo in maiuscolo e poi confrontalo
    const normalizedType = type.toUpperCase();

    if (normalizedType === 'VIAGGIO') {
      return {
        cardStyle: 'border-blue-300/50 dark:border-blue-700/50 shadow-blue-100/20 dark:shadow-blue-900/10',
        iconColor: 'text-blue-500 dark:text-blue-400',
        badge: 'bg-blue-100/80 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        darkBadge: 'bg-blue-500/80 text-white',
        badge2: 'bg-blue-500/90 text-white',
        imageHeight: 'h-52', // Più alto per i viaggi
        cardSize: 'col-span-2', // Più grande - occupa due colonne
        priority: 'z-10' // In primo piano
      };
    } else if (normalizedType === 'EVENTO') {
      return {
        cardStyle: 'border-purple-300/50 dark:border-purple-700/50 shadow-purple-100/20 dark:shadow-purple-900/10',
        iconColor: 'text-purple-500 dark:text-purple-400',
        badge: 'bg-purple-100/80 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        darkBadge: 'bg-purple-500/80 text-white',
        badge2: 'bg-purple-500/90 text-white',
        imageHeight: 'h-40', // Medio per gli eventi
        cardSize: 'col-span-1', // Medio - occupa una colonna
        priority: 'z-5' // Medio livello
      };
    } else {
      return {
        cardStyle: 'border-green-300/50 dark:border-green-700/50 shadow-green-100/20 dark:shadow-green-900/10',
        iconColor: 'text-green-500 dark:text-green-400',
        badge: 'bg-green-100/80 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        darkBadge: 'bg-green-500/80 text-white',
        badge2: 'bg-green-500/90 text-white',
        imageHeight: 'h-40', // Più basso per i ricordi semplici
        cardSize: 'col-span-1', // Più piccolo - occupa una colonna
        priority: 'z-0' // In secondo piano
      };
    }
  };

  const typeStyle = getTypeStyle(memory.type);
  const isViaggio = memory.type.toUpperCase() === 'VIAGGIO';
  const isEvento = memory.type.toUpperCase() === 'EVENTO';

  // Ottimizzato: determina il layout delle immagini in base al tipo di ricordo
  const getImagesLayout = () => {
    // Prepara le immagini da visualizzare
    const immagini = memory.images?.filter(img => img.thumb_big_path || img.webp_path) || [];
    const hasImages = immagini.length > 0;

    // Se non ci sono immagini
    if (!hasImages) {
      return (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full ${typeStyle.badge} flex items-center justify-center`}>
            <span className={`text-xl font-medium ${typeStyle.iconColor}`}>
              {memory.title.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      );
    }

    // Layout specifico per i viaggi (immagine grande + 2 piccole)
    if (isViaggio) {
      return (
        <div className="grid grid-cols-3 grid-rows-1 gap-0.5 h-full">
          {immagini.length > 0 && (
            <div className="col-span-2 row-span-1 relative">
              <img
                src={'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='} // Placeholder trasparente
                data-src={getImageUrl(immagini[0].thumb_big_path || immagini[0].webp_path || '')} // Lazy load
                alt={`${memory.title} - principale`}
                className={`w-full h-full object-cover rounded-tl-xl lazyload ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsImageLoaded(true)}
                loading="lazy"
                style={{ transition: 'opacity 0.3s ease' }}
              />

              {/* Gradiente overlay specifico per l'immagine principale */}
              <div className="absolute bottom-0 left-0 right-0 h-[58%] bg-gradient-to-t from-black/70 to-transparent"></div>

              {/* Effetto blur specifico per l'immagine principale */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[58%] pointer-events-none"
                style={{
                  background: 'transparent',
                  maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
                  backdropFilter: 'blur(8px)'
                }}
              ></div>
            </div>
          )}
          <div className="col-span-1 grid grid-rows-2 gap-0.5">
            {immagini.length > 1 && (
              <div className="row-span-1">
                <img
                  src={'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='} // Placeholder trasparente
                  data-src={getImageUrl(immagini[1].thumb_big_path || immagini[1].webp_path || '')} // Lazy load
                  alt={`${memory.title} - 2`}
                  className="w-full h-full object-cover rounded-tr-xl lazyload"
                  loading="lazy"
                />
              </div>
            )}
            {immagini.length > 2 && (
              <div className="row-span-1 relative">
                <img
                  src={'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='} // Placeholder trasparente
                  data-src={getImageUrl(immagini[2].thumb_big_path || immagini[2].webp_path || '')} // Lazy load
                  alt={`${memory.title} - 3`}
                  className="w-full h-full object-cover lazyload"
                  loading="lazy"
                />
              </div>
            )}
            {immagini.length === 1 && (
              <div className="row-span-2 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-tr-xl">
                <span className={`text-4xl ${typeStyle.iconColor}`}>+</span>
              </div>
            )}
          </div>

          {/* Badge che mostra il numero di immagini aggiuntive */}
          {memory.tot_img > 3 && (
            <div className="absolute top-2 right-2 z-10">
              <div className={`rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-lg bg-black/30 text-white`}>
                +{memory.tot_img - 3}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Layout specifico per gli eventi (2 immagini affiancate)
    if (isEvento) {
      return (
        <div className="grid grid-cols-2 gap-0.5 h-full">
          {immagini.length > 0 && (
            <div className="col-span-1 relative">
              <img
                src={'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='} // Placeholder trasparente
                data-src={getImageUrl(immagini[0].thumb_big_path || immagini[0].webp_path || '')} // Lazy load
                alt={`${memory.title} - principale`}
                className="w-full h-full object-cover rounded-tl-xl lazyload"
                loading="lazy"
              />
            </div>
          )}
          {immagini.length > 1 ? (
            <div className="col-span-1 relative">
              <img
                src={'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='} // Placeholder trasparente
                data-src={getImageUrl(immagini[1].thumb_big_path || immagini[1].webp_path || '')} // Lazy load
                alt={`${memory.title} - 2`}
                className="w-full h-full object-cover rounded-tr-xl lazyload"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="col-span-1 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-tr-xl">
              <span className={`text-3xl ${typeStyle.iconColor}`}>+</span>
            </div>
          )}

          {/* Badge che mostra il numero di immagini aggiuntive */}
          {memory.tot_img > 2 && (
            <div className="absolute top-2 right-2 z-10">
              <div className={`rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-lg bg-black/30 text-white`}>
                +{memory.tot_img - 2}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Layout per i ricordi semplici (una sola immagine)
    return (
      <div className="h-full w-full relative">
        <img
          src={'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='} // Placeholder trasparente
          data-src={getImageUrl(immagini[0].thumb_big_path || immagini[0].webp_path || '')} // Lazy load
          alt={memory.title}
          className="w-full h-full object-cover rounded-t-xl lazyload"
          loading="lazy"
        />

        {/* Badge che mostra il numero di immagini aggiuntive */}
        {memory.tot_img > 1 && (
          <div className="absolute top-2 right-2 z-10">
            <div className={`rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-lg bg-black/30 text-white`}>
              +{memory.tot_img - 1}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Componente per il player di Spotify - Memoizzato per prevenire re-render inutili
  const SpotifyPreview = () => {
    if (!memory.song) return null;

    // Se stiamo ancora caricando i dati Spotify
    if (isLoading) {
      return (
        <></>
      );
    }

    // Se ci sono dati Spotify
    if (spotifyData) {
      return (
        <div className="flex items-center py-0 px-0 bg-black/20 backdrop-blur-lg rounded-xl">
          {spotifyData.album?.images?.[0]?.url && (
            <div className="w-10 h-10 flex-shrink-0 overflow-hidden rounded">
              <img
                src={'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='} // Placeholder trasparente
                data-src={spotifyData.album.images[0].url} // Lazy load
                alt={`Album: ${spotifyData.album.name}`}
                className="w-full h-full object-cover lazyload"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex-1 truncate mx-1.5">
            <p className="text-[13px] font-medium leading-tight truncate text-white">
              {spotifyData.name}
            </p>
            <p className="text-[10px] leading-tight truncate text-gray-200/70">
              {spotifyData.artists.map(a => a.name).join(', ')}
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center">
            {spotifyData.preview_url && (
              <button
                onClick={togglePlay}
                className={`p-1.5 mr-1 rounded-full ${isPlaying
                  ? 'text-white bg-[#1DB954]/80'
                  : 'text-white bg-white/20 hover:bg-white/30'
                  }`}
              >
                <IoPlayCircle className="w-4 h-4" />
              </button>
            )}

            <a
              href={spotifyData.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-white bg-[#1DB954]/80 rounded-full"
            >
              <FaSpotify className="w-6 h-6" />
            </a>
          </div>
        </div>
      );
    }

    // Fallback quando non ci sono dati Spotify ma c'è una canzone
    return (
      <div className="flex items-center gap-1.5 py-2.5 px-3 bg-black/30 backdrop-blur-md border-t border-white/10">
        <IoMusicalNotesOutline className="w-4 h-4 text-white" />
        <span className="text-xs text-white truncate">
          {memory.song}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`relative ${typeStyle.priority} ${typeStyle.cardSize} group bg-white dark:bg-gray-800 rounded-xl 
        border ${typeStyle.cardStyle} overflow-hidden shadow-sm 
        transition-all duration-200 touch-manipulation active:scale-[0.98] ${isActive ? 'scale-95 brightness-105' : ''}`}
      onClick={handleClick}
      style={{
        // Aggiungi transizione nativa per garantire fluidità
        WebkitTapHighlightColor: 'transparent',
        transform: isActive ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, brightness 0.15s ease',
        willChange: 'transform', // Ottimizzazione per il browser
        contain: 'content' // Ottimizzazione per il browser
      }}
    >
      {/* Contenitore principale con sfondo e immagini */}
      <div className={`${isViaggio && memory.song ? 'h-56' : typeStyle.imageHeight} w-full relative overflow-hidden`}>
        {getImagesLayout()}

        {/* Gradiente overlay per leggibilità del testo - solo per non-viaggi */}
        {!isViaggio && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-black/70 to-transparent"
          ></div>
        )}

        {/* Gradiente con effetto blur che sfuma verso l'alto - solo per non-viaggi */}
        {!isViaggio && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[35%] pointer-events-none"
            style={{
              background: 'transparent',
              maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
              backdropFilter: 'blur(8px)'
            }}
          ></div>
        )}

        {/* Info sovrapposte all'immagine */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 z-10 text-white">
          <h3 className="font-semibold text-base mb-1 text-white line-clamp-2 drop-shadow-sm">
            {memory.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {/* Data */}
            <div className="flex items-center gap-1.5">
              <IoCalendarOutline className="w-3.5 h-3.5 text-white/80" />
              <span className="text-[11px] text-white/90">
                {formatDateRange(memory.start_date, memory.end_date)}
              </span>
            </div>

            {/* Località (solo per viaggi ed eventi) */}
            {memory.location && (isViaggio || isEvento) && (
              <div className="flex items-center gap-1.5">
                <IoLocationOutline className="w-3.5 h-3.5 text-white/80" />
                <span className="text-[11px] text-white/90 truncate max-w-[150px]">
                  {memory.location}
                </span>
              </div>
            )}

          </div>
          {memory.song && isViaggio && (
            <div className="max-w-52 mt-2">
              <SpotifyPreview />
            </div>
          )}
        </div>
      </div>

      {/* Effetto hover per viaggi (più importanti) */}
      {isViaggio && (
        <div className="absolute inset-0 border-2 border-blue-400/0 rounded-xl transition-all duration-300 pointer-events-none"></div>
      )}
    </div>
  );
});

export default CardRicordoMobile; 