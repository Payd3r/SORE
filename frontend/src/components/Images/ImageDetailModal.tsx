import { useEffect, useState, useRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ImageType, ImageResponse, getOriginalImage, deleteImage, getImageUrl } from '../../api/images';
import { IoChevronUp } from 'react-icons/io5';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { updateImageMetadata } from '../../api/images';
import { useQueryClient } from '@tanstack/react-query';

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageType | null;
  onImageDeleted?: () => void;
}

const ImageDetailModal = ({ isOpen, onClose, image, onImageDeleted }: ImageDetailModalProps) => {
  const navigate = useNavigate();
  const [fullImageData, setFullImageData] = useState<ImageResponse | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    type: image?.type || '',
    created_at: new Date(image?.created_at || '')
  });
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const infoToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowInfo(false); // Reset info panel state when opening
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && image?.id) {
      // Non mostriamo il loading iniziale perché usiamo la thumbnail
      setImageError(null);
      
      const imageId = parseInt(image.id, 10);
      if (isNaN(imageId)) {
        setImageError('ID immagine non valido');
        return;
      }

      // Carichiamo l'immagine originale in background
      getOriginalImage(imageId)
        .then(response => {
          setFullImageData(response);
          setImageError(null);
        })
        .catch(error => {
          console.error('Errore nel caricamento dell\'immagine originale:', error);
          // Non mostriamo l'errore all'utente perché abbiamo già la thumbnail
        });
    }
  }, [isOpen, image?.id]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  };

  const handleDelete = async () => {
    if (!image) return;

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
    if (!image || !fullImageData?.data) return;

    onClose();
    navigate('/mappa', { 
      state: { 
        latitude: fullImageData.data.latitude,
        longitude: fullImageData.data.longitude,
        imageId: image.id,
        imagePath: image.thumb_big_path,
        zoom: 18,
        focusedImage: true
      } 
    });
  };

  const handleEdit = () => {
    setEditData({
      type: image?.type || '',
      created_at: new Date(image?.created_at || '')
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Imposta l'ora a mezzogiorno
      const date = new Date(editData.created_at);
      date.setHours(12, 0, 0, 0);

      await updateImageMetadata(image?.id || '', {
        type: editData.type,
        created_at: date.toISOString()
      });

      // Invalida tutte le query relative alle immagini per aggiornare i dati
      await queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
      await queryClient.invalidateQueries({ queryKey: ['image', image?.id] });
      
      // Aggiorna i dati locali
      if (image) {
        image.type = editData.type;
        image.created_at = date.toISOString();
        // Aggiorna anche fullImageData se esiste
        if (fullImageData?.data) {
          fullImageData.data.type = editData.type;
          fullImageData.data.created_at = date.toISOString();
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Funzione dedicata per gestire il toggle delle info
  const handleInfoToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setShowInfo(prev => !prev);
  };

  if (!isOpen || !image) return null;

  // Usiamo prima la thumbnail, poi l'immagine originale quando disponibile
  const imageUrl = fullImageData?.data?.webp_path
    ? getImageUrl(fullImageData.data.webp_path)
    : getImageUrl(image.thumb_big_path);

  const displayImage = fullImageData?.data || image;
  const hasLocation = displayImage.latitude !== null && displayImage.longitude !== null;

  // Calcola le dimensioni ottimali per il modal
  const calculateModalDimensions = () => {
    const maxWidth = window.innerWidth * 0.98;
    const maxHeight = window.innerHeight * 0.98;
    const aspectRatio = imageSize.width / imageSize.height;

    let modalWidth = imageSize.width;
    let modalHeight = imageSize.height;

    if (modalWidth > maxWidth) {
      modalWidth = maxWidth;
      modalHeight = modalWidth / aspectRatio;
    }

    if (modalHeight > maxHeight) {
      modalHeight = maxHeight;
      modalWidth = modalHeight * aspectRatio;
    }

    return {
      width: modalWidth,
      height: modalHeight
    };
  };

  const modalDimensions = calculateModalDimensions();

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-[90vw] sm:max-w-[100vw] max-h-[90vh] shadow-xl flex flex-col lg:flex-row overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{
          position: 'relative',
          margin: 'auto',
          width: `${modalDimensions.width}px`,
        }}
      >
        {/* Immagine */}
        <div className="relative flex-1 bg-black/20">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4">
              {imageError}
            </div>
          ) : (
            <img
              ref={imageRef}
              src={imageUrl}
              alt={`Immagine ${image.id}`}
              className="w-full h-full object-contain"
              onLoad={handleImageLoad}
              onError={() => {
                setImageError('Errore nel caricamento dell\'immagine');
              }}
              style={{
                maxHeight: `${modalDimensions.height}px`
              }}
            />
          )}          
        </div>

        {/* Dettagli Desktop */}
        <div className="hidden lg:block w-[280px] overflow-y-auto border-l border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-3">
              {isEditing ? (
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="px-3 py-1.5 text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full uppercase border-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="cibo" className="py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">CIBO</option>
                  <option value="coppia" className="py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">COPPIA</option>
                  <option value="singolo" className="py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">SINGOLO</option>
                  <option value="paesaggio" className="py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">LUOGO</option>
                </select>
              ) : (
                <span className="px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full uppercase">
                {displayImage.type}
              </span>
              )}
            </div>
            {/* Card Tipo e Data/Ora */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <svg className="w-6 h-6 mt-1 flex-shrink-0 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  {isEditing ? (
                    <DatePicker
                      selected={editData.created_at}
                      onChange={(date) => setEditData({ ...editData, created_at: date || new Date() })}
                      dateFormat="dd/MM/yyyy"
                      locale={it}
                      className="block text-sm font-medium text-gray-900 dark:text-white bg-transparent border-none p-0"
                    />
                  ) : (
                    <>
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(displayImage.created_at), 'dd/MM/yyyy', { locale: it })}
                      </span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(displayImage.created_at), 'HH:mm', { locale: it })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Card Creatore */}
            {displayImage.created_by_name && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-medium text-white">
                    {displayImage.created_by_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Caricata da</span>
                    <span className="block text-sm font-medium text-gray-900 dark:text-white break-words">
                    {displayImage.created_by_name}
                  </span>
                  </div>
                </div>
              </div>
            )}

            {/* Card Posizione */}
            {hasLocation && (
              <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <button
                  onClick={handleMapClick}
                  className="w-full flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors bg-transparent"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  <span className="text-sm font-medium text-left">Visualizza sulla mappa</span>
                </button>
              </div>
            )}

            {/* Azioni (fuori dalle card) */}
            <div className="flex flex-col gap-2 mb-auto">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isSaving ? 'Salvataggio...' : 'Salva'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifica
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = imageUrl;
                      link.download = `immagine-${image.id}.webp`;
                      link.click();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Scarica
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white rounded-lg transition-colors ${isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {isDeleting ? 'Eliminazione...' : 'Elimina'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Versione mobile dei dettagli */}
        <div className="lg:hidden">
          {/* Toggle per le info su mobile */}
          <button
            ref={infoToggleRef}
            onClick={handleInfoToggle}
            className={`w-full py-3 px-4 flex items-center justify-between text-sm font-medium bg-white dark:bg-gray-800  ${showInfo ? 'border-none rounded-none' : 'border-t border-gray-200 dark:border-gray-700 rounded-t-lg'}`}
          >
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Informazioni immagine</span>
            </div>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 transition-transform duration-300 ${showInfo ? 'rotate-180' : ''}`}>
              <IoChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
          </button>

          <div 
            className={`w-full overflow-y-auto bg-white dark:bg-gray-800 transition-all duration-300 ${showInfo ? 'max-h-[50vh]' : 'max-h-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Info base - Riduci margine inferiore */}
              <div className="flex items-center justify-between mb-4">
                {isEditing ? (
                  <select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                    className="px-2 me-3 py-3 ps-4 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full uppercase border-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="cibo" className="py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">CIBO</option>
                    <option value="coppia" className="py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">COPPIA</option>
                    <option value="singolo" className="py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">SINGOLO</option>
                    <option value="paesaggio" className="py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">LUOGO</option>
                  </select>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full uppercase">
                    {displayImage.type}
                  </span>
                )}
                <div className="text-right">
                  {isEditing ? (
                    <DatePicker
                      selected={editData.created_at}
                      onChange={(date) => setEditData({ ...editData, created_at: date || new Date() })}
                      dateFormat="dd/MM/yyyy"
                      locale={it}
                      className="text-right text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none p-0"
                      onCalendarOpen={() => {
                        // Forza la chiusura della tastiera su mobile con un piccolo ritardo
                        setTimeout(() => {
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }, 100);
                      }}
                    />
                  ) : (
                    <>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(displayImage.created_at), 'dd/MM/yyyy', { locale: it })}
                      </span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(displayImage.created_at), 'HH:mm', { locale: it })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Creatore */}
              {displayImage.created_by_name && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {displayImage.created_by_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">Caricata da</span>
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">
                      {displayImage.created_by_name}
                    </span>
                  </div>
                </div>
              )}

              {/* Posizione */}
              {hasLocation && (
                <button
                  onClick={handleMapClick}
                  className="w-full flex items-center justify-center gap-2 py-2 mb-4 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors bg-transparent"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Visualizza sulla mappa
                </button>
              )}

              {/* Azioni */}
              <div className="flex gap-2">
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isSaving ? 'Salvataggio...' : 'Salva'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifica
                    </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageUrl;
                  link.download = `immagine-${image.id}.webp`;
                  link.click();
                }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                      Scarica
              </button>
              <button
                      onClick={handleDelete}
                disabled={isDeleting}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-white rounded-lg ${isDeleting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                      {isDeleting ? '...' : 'Elimina'}
              </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageDetailModal;
