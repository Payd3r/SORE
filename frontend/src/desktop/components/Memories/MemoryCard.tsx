import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Memory, MemoryType } from '../../../api/memory';
import { getImageUrl } from '../../../api/images';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { getTrackDetails, SpotifyTrack } from '../../../api/spotify';
import { FaSpotify } from 'react-icons/fa';
import { IoCalendarOutline, IoLocationOutline, IoMusicalNotesOutline } from 'react-icons/io5';

interface MemoryImage {
  id: number;
  thumb_big_path: string | null;
  webp_path: string | null;
  created_at: string;
  width: number;
  height: number;
}

interface MemoryWithImages extends Memory {
  images: MemoryImage[];
}

interface MemoryCardProps {
  memory?: MemoryWithImages;
  onClick?: () => void;
  futureMemories?: MemoryWithImages[];
}

export default function MemoryCard({ memory, onClick, futureMemories }: MemoryCardProps) {
  const navigate = useNavigate();
  const [trackInfo, setTrackInfo] = useState<SpotifyTrack | null>(null);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [optimizedImages, setOptimizedImages] = useState<MemoryImage[]>([]);

  // Ottimizza il layout delle immagini
  const optimizeImageLayout = useMemo(() => {
    if (!memory?.images?.length) return [];
    
    const isViaggio = memory.type.toLowerCase() === 'viaggio';
    const isEvento = memory.type.toLowerCase() === 'evento';
    
    // Ordina le immagini per data di creazione
    const sortedImages = [...memory.images].sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    // Per i viaggi, trova l'immagine migliore per la copertina
    if (isViaggio) {
      // Prendi le prime 5 immagini
      const selectedImages = sortedImages.slice(0, 5);
      // Trova l'immagine con il miglior rapporto per la copertina (idealmente landscape)
      const coverIndex = selectedImages.findIndex(img => {
        const aspectRatio = img.width / img.height;
        return aspectRatio >= 1.3 && aspectRatio <= 1.8; // Rapporto ideale per la copertina
      });
      
      if (coverIndex !== -1) {
        // Sposta l'immagine migliore all'inizio
        const [bestCover] = selectedImages.splice(coverIndex, 1);
        selectedImages.unshift(bestCover);
      }
      
      return selectedImages;
    }
    
    // Per gli eventi, prendi le prime 4 immagini
    if (isEvento) {
      return sortedImages.slice(0, 4);
    }
    
    // Per i ricordi semplici, prendi solo la prima immagine
    return sortedImages.slice(0, 1);
  }, [memory?.images, memory?.type]);

  useEffect(() => {
    setOptimizedImages(optimizeImageLayout);
  }, [optimizeImageLayout]);

  useEffect(() => {
    const fetchTrackInfo = async () => {
      if (memory?.song) {
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

    if (memory?.type.toLowerCase() === 'viaggio') {
      fetchTrackInfo();
    }
  }, [memory?.song, memory?.type]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/ricordo/${memory?.id}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data non disponibile';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy', { locale: it });
    } catch (error) {
      return 'Data non valida';
    }
  };

  const getTypeLabel = (type: MemoryType) => {
    switch (type.toLowerCase()) {
      case 'viaggio':
        return {
          text: 'Viaggio',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          gradient: 'from-blue-500/20 to-transparent',
          border: 'border-blue-500/20',
          hover: 'hover:border-blue-300 dark:hover:border-blue-700',
          shadow: 'shadow-blue-100 dark:shadow-blue-900/20'
        };
      case 'evento':
        return {
          text: 'Evento',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
          gradient: 'from-purple-500/20 to-transparent',
          border: 'border-purple-500/20',
          hover: 'hover:border-purple-300 dark:hover:border-purple-700',
          shadow: 'shadow-purple-100 dark:shadow-purple-900/20'
        };
      case 'semplice':
        return {
          text: 'Ricordo',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          gradient: 'from-green-500/20 to-transparent',
          border: 'border-green-500/20',
          hover: 'hover:border-green-300 dark:hover:border-green-700',
          shadow: 'shadow-green-100 dark:shadow-green-900/20'
        };
      default:
        return {
          text: 'Ricordo',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
          gradient: 'from-gray-500/20 to-transparent',
          border: 'border-gray-500/20',
          hover: 'hover:border-gray-300 dark:hover:border-gray-700',
          shadow: 'shadow-gray-100 dark:shadow-gray-900/20'
        };
    }
  };

  const typeStyle = getTypeLabel(memory?.type ?? 'SEMPLICE');
  const isViaggio = memory?.type?.toLowerCase() === 'viaggio';
  const isEvento = memory?.type?.toLowerCase() === 'evento';
  const isFuturo = memory?.type?.toLowerCase() === 'futuro';

  if (futureMemories && futureMemories.length > 0) {
    return (
      <div
        className={
          'group bg-gradient-to-br from-blue-100/80 to-blue-300/60 dark:from-blue-900/60 dark:to-blue-800/80 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-blue-100 dark:shadow-blue-900/20 overflow-hidden cursor-pointer transition-all duration-300 h-full flex flex-col items-center justify-center min-h-[140px] sm:min-h-[200px] p-3 text-center relative'
        }
        onClick={() => {
          if (onClick) onClick();
          else if (futureMemories.length === 1) navigate(`/ricordo/${futureMemories[0].id}`);
        }}
      >
        <div className="flex flex-col items-center gap-2 w-full justify-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-800 mb-1">
            <IoCalendarOutline className="w-7 h-7 text-blue-600 dark:text-blue-300" />
          </div>
          <span className="inline-block px-3 py-1 mb-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm uppercase tracking-wide">Futuro</span>
          <div className="flex flex-col items-center gap-0.5 w-full">
            {futureMemories.slice(0, 3).map(fm => (
              <div key={fm.id} className="w-full flex flex-col items-center">
                <h3 className="font-bold text-sm text-blue-900 dark:text-blue-100 line-clamp-1">{fm.title}</h3>
                {fm.start_date && (
                  <div className="flex items-center justify-center gap-1 text-blue-700 dark:text-blue-200 text-xs mb-0.5">
                    <IoCalendarOutline className="w-3.5 h-3.5" />
                    <span>{formatDate(fm.start_date)}</span>
                  </div>
                )}
              </div>
            ))}
            {futureMemories.length > 3 && (
              <div className="text-xs text-blue-800 dark:text-blue-200 opacity-80 mt-1">+{futureMemories.length - 3} altri ricordi futuri</div>
            )}
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-200 opacity-80 mt-1">Presto potrai aggiungere foto e dettagli a questi ricordi!</p>
        </div>
      </div>
    );
  }

  if (isFuturo) {
    return (
      <div
        className={
          'group bg-gradient-to-br from-blue-100/80 to-blue-300/60 dark:from-blue-900/60 dark:to-blue-800/80 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-blue-100 dark:shadow-blue-900/20 overflow-hidden cursor-pointer transition-all duration-300 h-full flex flex-col items-center justify-center p-6 text-center relative'
        }
        onClick={handleClick}
        style={{ minHeight: 220 }}
      >
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-200 dark:bg-blue-800 mb-2">
            <IoCalendarOutline className="w-9 h-9 text-blue-600 dark:text-blue-300" />
          </div>
          <span className="inline-block px-3 py-1 mb-2 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm uppercase tracking-wide">Futuro</span>
          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-1 line-clamp-2">{memory?.title}</h3>
          {memory?.start_date && (
            <div className="flex items-center justify-center gap-1 text-blue-700 dark:text-blue-200 text-sm mb-2">
              <IoCalendarOutline className="w-4 h-4" />
              <span>In programma per il {formatDate(memory.start_date)}</span>
            </div>
          )}
          <p className="text-sm text-blue-800 dark:text-blue-200 opacity-80 mt-2">Presto potrai aggiungere foto e dettagli a questo ricordo!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group bg-white dark:bg-gray-800 rounded-xl border-2 ${typeStyle.border} sm:${typeStyle.hover} ${typeStyle.shadow} overflow-hidden cursor-pointer transition-all duration-300 h-full sm:hover:shadow-lg sm:hover:-translate-y-0.5`}
      onClick={handleClick}
    >
      <div className="relative h-full flex flex-col">
        {/* Image Grid Section */}
        <div className="relative flex-grow">
          <div className={`grid gap-0.5 h-full ${
            isViaggio ? 'grid-cols-3 grid-rows-2 min-h-[200px] sm:min-h-[180px]' :
            isEvento ? 'grid-cols-4 grid-rows-1 min-h-[160px] sm:min-h-[180px]' :
            'grid-cols-1 grid-rows-1 min-h-[140px] sm:min-h-[200px]'
          }`}>
            {optimizedImages.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden ${
                  isViaggio && index === 0 ? 'col-span-2 row-span-2' :
                  isViaggio ? 'col-span-1 row-span-1' :
                  isEvento ? 'col-span-1' :
                  'col-span-1 row-span-1'
                }`}
              >
                <img
                  src={getImageUrl(
                    // Utilizziamo webp_path per:
                    // 1. La prima immagine di un viaggio
                    // 2. L'unica immagine di un ricordo semplice
                    ((isViaggio && index === 0 && image.webp_path) || 
                    (memory?.type.toLowerCase() === 'semplice' && image.webp_path) || 
                    image.thumb_big_path) || ''
                  )}
                  alt={`${memory?.title} - ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 sm:group-hover:scale-105"
                />
                {((isViaggio && index === 4) || (isEvento && index === 3) || (!isViaggio && !isEvento && index === 0)) &&
                  (memory?.tot_img && (memory.tot_img > (isViaggio ? 5 : isEvento ? 4 : 1))) && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">+{memory.tot_img - (isViaggio ? 5 : isEvento ? 4 : 1)} foto</span>
                    </div>
                  )}
              </div>
            ))}
          </div>
          <div className={`absolute inset-0 bg-gradient-to-t ${
            memory?.type.toLowerCase() === 'semplice' 
              ? 'from-black/40 via-black/5 to-transparent dark:from-black/70'
              : 'from-black/70 via-black/5 to-transparent'
          }`} />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 text-white z-10">
            {/* Badge Section - Top */}
            <div className="flex items-center gap-2">
              {(!isViaggio && memory?.type.toLowerCase() !== 'semplice') && (
                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${typeStyle.color} shadow-sm backdrop-blur-sm`}>
                  {typeStyle.text}
                </span>
              )}
              {(!isViaggio && isEvento && memory?.location) && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-black/30 text-white backdrop-blur-sm flex items-center gap-1 shadow-sm border border-white/10">
                  <IoLocationOutline className="w-3.5 h-3.5" />
                  {memory?.location}
                </span>
              )}
            </div>

            {/* Bottom Content Section */}
            <div>
              {/* Badge Section - Bottom (only for Viaggio) */}
              {isViaggio && (
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${typeStyle.color} shadow-sm backdrop-blur-sm`}>
                    {typeStyle.text}
                  </span>
                  {memory?.location && (
                    <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-black/30 text-white backdrop-blur-sm flex items-center gap-1 shadow-sm border border-white/10">
                      <IoLocationOutline className="w-3.5 h-3.5" />
                      {memory?.location}
                    </span>
                  )}
                </div>
              )}
              
              <h3 className={`font-bold ${
                isViaggio ? 'text-lg mb-1' : isEvento ? 'text-base mb-1.5' : 'text-base mb-1.5'
              }`}>
                {memory?.title}
              </h3>

              {/* Date Section */}
              <div className="flex items-center gap-1.5 text-sm text-white">
                <IoCalendarOutline className="w-3.5 h-3.5" />
                <div className="flex items-center gap-1">
                  <span>{formatDate(memory?.start_date ?? null)}</span>
                  {memory?.end_date && memory?.end_date !== memory?.start_date && (
                    <>
                      <span className="mx-1">→</span>
                      <span>{formatDate(memory.end_date)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spotify Track Section - Only for Viaggi with song */}
        {isViaggio && memory?.song ? (
          <div className="p-2 border-t border-gray-100 dark:border-gray-700 shrink-0">
            {isLoadingTrack ? (
              <div className="animate-pulse flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ) : trackInfo ? (
              <div className="flex items-center gap-2">
                <img
                  src={trackInfo.album.images[2]?.url || trackInfo.album.images[0]?.url}
                  alt={`${trackInfo.name} album cover`}
                  className="w-8 h-8 rounded shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {trackInfo.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {trackInfo.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                {trackInfo.external_urls?.spotify && (
                  <a
                    href={trackInfo.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1DB954] hover:bg-[#1ed760] transition-colors focus:outline-none flex-shrink-0"
                  >
                    <FaSpotify className="w-3 h-3 text-white" />
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoMusicalNotesOutline className="w-3.5 h-3.5" />
                <span className="truncate">{memory?.song}</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
} 