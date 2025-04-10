import React, { useState, useEffect } from 'react';
import { Memory } from '../../api/types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { IoCalendarOutline, IoLocationOutline, IoImagesOutline, IoInformationCircleOutline } from 'react-icons/io5';
import { FaSpotify } from 'react-icons/fa';
import { getTrackDetails, SpotifyTrack } from '../../api/spotify';
import { getMemoryMapImages, type ImageLocation } from '../../api/map';
import Map from '../Maps/Map';
import { getImageUrl } from '../../api/images';
import ImageDetailModal from '../Images/ImageDetailModal';
import { ImageType } from '../../api/images';

interface InfoRicordoProps {
  memory: Memory;
  onVisitGallery: () => void;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const InfoRicordo: React.FC<InfoRicordoProps> = ({ memory, onVisitGallery }) => {
  const [trackInfo, setTrackInfo] = useState<SpotifyTrack | null>(null);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [mapImages, setMapImages] = useState<ImageLocation[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  useEffect(() => {
    const fetchTrackInfo = async () => {
      if (memory.song) {
        setIsLoadingTrack(true);
        try {
          const track = await getTrackDetails(memory.song);
          setTrackInfo(track);
        } catch (error) {
          // console.error('Errore nel recupero delle informazioni della canzone:', error);
        } finally {
          setIsLoadingTrack(false);
        }
      }
    };

    const fetchMapImages = async () => {
      setIsLoadingMap(true);
      setMapError(null);
      try {
        const images = await getMemoryMapImages(memory.id);
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
          const padding = 0.1;
          setMapBounds({
            north: bounds.north + padding,
            south: bounds.south - padding,
            east: bounds.east + padding,
            west: bounds.west - padding
          });
        }
      } catch (error) {
        // console.error('Errore nel caricamento delle immagini sulla mappa:', error);
        setMapError('Errore nel caricamento delle immagini sulla mappa');
      } finally {
        setIsLoadingMap(false);
      }
    };

    fetchTrackInfo();
    fetchMapImages();
  }, [memory.song, memory.id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: it });
    } catch (error) {
      // console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleGalleryClick = () => {
    onVisitGallery();
  };

  const handleImageClick = async (image: NonNullable<Memory['images']>[number]) => {
    try {
      if (!image.thumb_big_path) return;
      
      setSelectedImage({
        id: String(image.id),
        memory_id: -1,
        latitude: null,
        longitude: null,
        created_by_user_id: 0,
        created_by_name: null,
        type: image.type || 'all',
        image: image.thumb_big_path,
        thumb_big_path: image.thumb_big_path,
        created_at: image.created_at || new Date().toISOString(),
        webp_path: undefined
      });
      setIsDetailModalOpen(true);
    } catch (error) {
      // console.error('Errore nel caricamento dell\'immagine:', error);
    }
  };
  
  const handleCloseImageModal = () => {
    setIsDetailModalOpen(false);
    setSelectedImage(null);
  };
  
  return (
    <div className="space-y-4 sm:space-y-6 px-1">
      {/* Prima row - Info e Mappa */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6 lg:min-h-[300px]">
        {/* Colonna sinistra - Card Info */}
        <div className="lg:col-span-2 h-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border-2 border-gray-100 dark:border-gray-700 h-full flex flex-col">
            {/* Bordo superiore decorativo */}

            <div className="p-4 sm:p-6 flex-grow overflow-auto">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 group">
                <IoInformationCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />
                Informazioni del Ricordo
              </h2>

              <div className="space-y-2 sm:space-y-3">
                {/* Data */}
                {memory.start_date && (
                  <div className="flex items-start gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="mt-1">
                      <IoCalendarOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    </div>
                    <div>
                      {memory.end_date && memory.end_date !== memory.start_date ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Da</span>
                            <span className="text-sm sm:text-base text-gray-900 dark:text-white">{formatDate(memory.start_date)}</span>
                          </div>
                          <div className="w-px h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 mx-1 sm:mx-2"></div>
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">A</span>
                            <span className="text-sm sm:text-base text-gray-900 dark:text-white">{formatDate(memory.end_date)}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm sm:text-base text-gray-900 dark:text-white">{formatDate(memory.start_date)}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {memory.location && (
                  <div className="flex items-start gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="mt-1">
                      <IoLocationOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Luogo</p>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white">{memory.location}</p>
                    </div>
                  </div>
                )}

                {/* Numero immagini */}
                <div className="flex items-start gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="mt-1">
                    <IoImagesOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Immagini</p>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">{memory.images?.length || 0}</p>
                  </div>
                </div>

                {/* Canzone */}
                {memory.song && (
                  <div className="mt-3 sm:mt-4">
                    {isLoadingTrack ? (
                      <div className="animate-pulse h-12 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    ) : trackInfo ? (
                      <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3">
                        <img
                          src={trackInfo.album.images[1]?.url || trackInfo.album.images[0]?.url}
                          alt={`${trackInfo.name} album cover`}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-md shadow-sm"
                        />
                        <div className="flex-grow min-w-0">
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium truncate">{trackInfo.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {trackInfo.artists.map(artist => artist.name).join(', ')}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{trackInfo.album.name}</p>
                        </div>
                        {trackInfo.external_urls?.spotify && (
                          <a
                            href={trackInfo.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1DB954] hover:bg-[#1ed760] transition-colors focus:outline-none"
                          >
                            <FaSpotify className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white">{memory.song}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Colonna destra - Mappa */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border-2 border-gray-100 dark:border-gray-700 h-full flex flex-col">
            {/* Bordo superiore decorativo */}
            <div className="flex-grow min-h-[230px]">
              <Map
                images={mapImages}
                isLoading={isLoadingMap}
                error={mapError}
                bounds={mapBounds || undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seconda row - Anteprima Galleria (solo per ricordi non semplici) */}
      {memory.type.toLowerCase() !== 'semplice' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border-2 border-gray-100 dark:border-gray-700">
          {/* Bordo superiore decorativo */}
          <div className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 group">
                <IoImagesOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />
                Galleria
              </h3>
              <button
                onClick={handleGalleryClick}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 hover:shadow-md focus:outline-none transform hover:-translate-y-0.5"
              >
                Visita galleria
              </button>
            </div>

            {memory.images && memory.images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-3">
                {memory.images.slice(0, 5).map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(image)}
                    className="group relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer touch-manipulation active:scale-95 active:opacity-90"
                  >
                    <img
                      src={getImageUrl(image.thumb_big_path || '')}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                  </div>
                ))}
                {memory.images.length > 5 && (
                  <div
                    onClick={handleGalleryClick}
                    className="group relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center border border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    <div className="text-center">
                      <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                        +{memory.images.length - 5}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                        altre foto
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                <IoImagesOutline className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                <p className="text-sm sm:text-base">Nessuna immagine disponibile</p>
              </div>
            )}
          </div>
        </div>
      )}
      <ImageDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseImageModal}
        image={selectedImage}
      />
    </div>
  );
};

export default InfoRicordo; 