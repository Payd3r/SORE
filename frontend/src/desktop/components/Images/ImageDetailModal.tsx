import { useEffect, useState, useRef, MouseEvent, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ImageType, ImageResponse, getOriginalImage, deleteImage, getImageUrl } from '../../../api/images';
import { format } from 'date-fns';
import { it, Locale } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { updateImageMetadata } from '../../../api/images';
import { useQueryClient } from '@tanstack/react-query';

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageType | null;
  onImageDeleted?: () => void;
}

// TouchDatePicker: un wrapper per il DatePicker per gestire meglio gli eventi touch
const TouchDatePicker = ({ selected, onChange, dateFormat, locale }: {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  dateFormat: string;
  locale: Locale;
}) => {
  const handleWrapperTouch = (e: TouchEvent<HTMLDivElement>) => {
    // Preveniamo la propagazione dell'evento touch
    e.stopPropagation();
    
    // Quando l'utente tocca il datepicker, rimuoviamo il focus da qualsiasi elemento
    // per assicurarci che la tastiera mobile si chiuda
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div onTouchStart={handleWrapperTouch} style={{ touchAction: 'manipulation' }}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat={dateFormat}
        locale={locale}
        className="block text-sm font-medium text-gray-900 dark:text-white bg-transparent border-none p-0"
      />
    </div>
  );
};

const ImageDetailModal = ({ isOpen, onClose, image, onImageDeleted }: ImageDetailModalProps) => {
  const navigate = useNavigate();
  const [fullImageData, setFullImageData] = useState<ImageResponse | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [_showInfo, setShowInfo] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    type: image?.type || '',
    created_at: image?.created_at && !isNaN(Date.parse(image.created_at)) ? new Date(image.created_at) : null,
    display_order: image?.display_order ?? ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

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

  useEffect(() => {
    console.log('[ImageDetailModal] editData aggiornato:', editData);
  }, [editData]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

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
    console.log('[ImageDetailModal] handleEdit - image?.created_at:', image?.created_at);
    let parsedDate = null;
    if (image?.created_at && !isNaN(Date.parse(image.created_at))) {
      parsedDate = new Date(image.created_at);
    } else {
      parsedDate = new Date(); // fallback: data attuale
    }
    setEditData({
      type: image?.type || '',
      created_at: parsedDate,
      display_order: image?.display_order ?? ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Usa la data selezionata o la data attuale se null
      const date = editData.created_at instanceof Date && !isNaN(editData.created_at.getTime()) ? new Date(editData.created_at) : new Date();
      date.setHours(12, 0, 0, 0);

      // Calcola il nuovo ordine
      const newOrder = editData.display_order === '' ? null : Number(editData.display_order);

      // Aggiorna tutti i metadati in un'unica chiamata
      await updateImageMetadata(image?.id || '', {
        type: editData.type,
        created_at: date.toISOString(),
        display_order: newOrder
      });

      // Invalida tutte le query relative alle immagini per aggiornare i dati
      await queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
      await queryClient.invalidateQueries({ queryKey: ['image', image?.id] });
      
      // Aggiorna i dati locali
      if (image) {
        image.type = editData.type;
        image.created_at = date.toISOString();
        image.display_order = newOrder;
        // Aggiorna anche fullImageData se esiste
        if (fullImageData?.data) {
          fullImageData.data.type = editData.type;
          fullImageData.data.created_at = date.toISOString();
          fullImageData.data.display_order = newOrder;
        }
      }
      
      setIsEditing(false);

      // Resetto editData ai valori aggiornati
      setEditData({
        type: image?.type || '',
        created_at: image?.created_at && !isNaN(Date.parse(image.created_at)) ? new Date(image.created_at) : null,
        display_order: image?.display_order ?? ''
      });
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    } finally {
      setIsSaving(false);
    }
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
      className="fixed inset-0 z-[9999] modal-backdrop"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-lg max-w-[90vw] sm:max-w-[100vw] max-h-[90vh] shadow-xl flex flex-col lg:flex-row overflow-hidden modal-content"
        onClick={(e) => {
          e.stopPropagation();
          // Preveniamo anche la propagazione dell'evento
          if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation?.();
          }
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          // Preveniamo anche la propagazione dell'evento
          if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation?.();
          }
        }}
        style={{
          position: 'relative',
          margin: 'auto',
          width: `${modalDimensions.width}px`,
          touchAction: 'auto',
          WebkitOverflowScrolling: 'touch'
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
              className="w-full h-full object-contain max-h-[60vh]"
              onLoad={handleImageLoad}
              onError={() => {
                setImageError('Errore nel caricamento dell\'immagine');
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
                    <TouchDatePicker
                      selected={editData.created_at instanceof Date && !isNaN(editData.created_at.getTime()) ? editData.created_at : null}
                      onChange={(date) => setEditData({ ...editData, created_at: date })}
                      dateFormat="dd/MM/yyyy"
                      locale={it}
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
            {isEditing && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ordine (1-8)</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={editData.display_order}
                  onChange={e => setEditData({ ...editData, display_order: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Lascia vuoto per nessun ordine"
                />
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
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    {isSaving ? 'Salvataggio...' : 'Salva'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-white focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700"
                  >
                    Annulla
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-white focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = imageUrl;
                      link.download = `immagine-${image.id}.webp`;
                      link.click();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors touchable"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Scarica
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white rounded-lg transition-colors touchable ${isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
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
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageDetailModal;
