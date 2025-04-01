import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageType, ImageResponse, getOriginalImage, deleteImage, getImageUrl } from '../../api/images';

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageType | null;
  onImageDeleted?: () => void;
}

const ImageDetailModal = ({ isOpen, onClose, image, onImageDeleted }: ImageDetailModalProps) => {
  const navigate = useNavigate();
  const [fullImageData, setFullImageData] = useState<ImageResponse | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function per formattare le coordinate in modo sicuro
  const formatCoordinate = (value: number | string | null): string => {
    if (value === null) return '---';
    try {
      return Number(value).toFixed(6);
    } catch (e) {
      console.error('Errore nella formattazione della coordinata:', e);
      return '---';
    }
  };

  useEffect(() => {
    if (isOpen && image?.id) {
      setIsImageLoading(true);
      setImageError(null);
      
      const imageId = parseInt(image.id, 10);
      if (isNaN(imageId)) {
        setImageError('ID immagine non valido');
        setIsImageLoading(false);
        return;
      }

      getOriginalImage(imageId)
        .then((response: ImageResponse) => {
          setFullImageData(response);
          setImageError(null);
        })
        .catch(error => {
          console.error('Errore nel caricamento dell\'immagine originale:', error);
          setImageError('Impossibile caricare l\'immagine originale');
        })
        .finally(() => {
          setIsImageLoading(false);
        });
    }
  }, [isOpen, image?.id]);

  if (!isOpen) return null;
  if (!image) return null;

  // Usa il jpg_path per l'immagine ad alta risoluzione se disponibile, altrimenti usa thumb_big_path
  const imageUrl = fullImageData?.data?.jpg_path 
    ? getImageUrl(fullImageData.data.jpg_path)
    : getImageUrl(image.thumb_big_path);

  // Usa i dati completi dell'immagine se disponibili, altrimenti usa i dati base
  const displayImage = fullImageData?.data || image;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasLocation = displayImage.latitude !== null && displayImage.longitude !== null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteImage(image.id);
      onClose();
      if (onImageDeleted) {
        onImageDeleted();
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'immagine:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMapClick = () => {
    onClose();
    navigate('/mappa', { 
      state: { 
        latitude: displayImage.latitude, 
        longitude: displayImage.longitude,
        imageId: displayImage.id,
        imagePath: displayImage.thumb_big_path,
        zoom: 18,
        focusedImage: true
      } 
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="relative flex flex-col lg:flex-row bg-white dark:bg-gray-900 rounded-xl overflow-hidden h-[80vh] sm:h-[85vh] lg:h-[85vh] w-[92vw] lg:w-fit lg:max-w-[95vw] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image container */}
          <div className="relative flex-1 h-[55vh] sm:h-[60vh] lg:h-full lg:max-w-[70vw] bg-black/20">
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4">
                <p className="text-center">{imageError}</p>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={`Immagine ${image.id}`}
                className="w-full h-full object-contain"
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setImageError('Errore nel caricamento dell\'immagine');
                  setIsImageLoading(false);
                }}
              />
            )}
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-gray-300/20 border-t-blue-500"></div>
              </div>
            )}
          </div>

          {/* Details panel */}
          <div className="relative flex flex-col p-4 sm:p-6 lg:w-[350px] h-[25vh] sm:h-[25vh] lg:h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full uppercase tracking-wider">
                {displayImage.type}
              </span>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(displayImage.created_at)}
              </div>
            </div>

            {displayImage.created_by_name && (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3">
                <div className="flex-shrink-0 w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-sm text-white font-medium">
                    {displayImage.created_by_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Caricata da</span>
                  <span className="block text-sm text-gray-900 dark:text-white font-medium">
                    {displayImage.created_by_name}
                  </span>
                </div>
              </div>
            )}

            {hasLocation && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl p-4 mb-3 border border-gray-200/50 dark:border-gray-700/30">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Posizione geografica
                      </span>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white mt-0.5 font-mono">
                        {formatCoordinate(displayImage.latitude)}, {formatCoordinate(displayImage.longitude)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleMapClick}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-all duration-200 group"
                  >
                    <span>Visualizza sulla mappa</span>
                    <svg 
                      className="w-4 h-4 ml-2 transform transition-transform duration-200 group-hover:translate-x-0.5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-auto">
              <button
                type="button"
                className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageUrl;
                  link.download = `immagine-${image.id}.jpg`;
                  link.click();
                }}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Scarica</span>
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-xs font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDeleting 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{isDeleting ? 'Eliminazione...' : 'Elimina'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageDetailModal;
