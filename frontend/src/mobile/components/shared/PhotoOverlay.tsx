import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useScrollEdgeMask } from "../../hooks";

export interface PhotoOverlayImage {
  id: number;
  fullUrl: string;
  thumbUrl: string;
  createdAt?: string;
}

type PhotoOverlayProps = {
  isOpen: boolean;
  images: PhotoOverlayImage[];
  initialIndex: number;
  memoryTitle: string;
  locationLabel?: string | null;
  onClose: () => void;
  onDeletePhoto?: (image: PhotoOverlayImage) => void | Promise<void>;
  onShareImage?: (image: PhotoOverlayImage) => void | Promise<void>;
};

const MIN_SWIPE_DISTANCE = 50;
const MIN_CLOSE_DRAG = 120;
const MIN_CLOSE_VELOCITY = 500;

export default function PhotoOverlay({
  isOpen,
  images,
  initialIndex,
  memoryTitle,
  locationLabel,
  onClose,
  onDeletePhoto,
  onShareImage,
}: PhotoOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    if (!images.length) return;
    const safeIndex = Math.min(Math.max(initialIndex, 0), images.length - 1);
    setCurrentIndex(safeIndex);
  }, [initialIndex, images.length, isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? 0 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= images.length - 1 ? images.length - 1 : prev + 1));
  }, [images.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchEndX.current - touchStartX.current;
    if (Math.abs(diff) > MIN_SWIPE_DISTANCE) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  }, [handleNext, handlePrev]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      const { y: offsetY } = info.offset;
      const { y: velocityY } = info.velocity;
      if (offsetY > MIN_CLOSE_DRAG || velocityY > MIN_CLOSE_VELOCITY) {
        onClose();
      }
    },
    [onClose]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { atStart, atEnd } = useScrollEdgeMask(scrollRef);

  // Mantiene l'anteprima corrente visibile e preferibilmente centrata
  // nella lista delle miniature quando cambia l'immagine selezionata.
  useEffect(() => {
    if (!isOpen || !images.length) return;

    const container = scrollRef.current;
    const activeThumb = thumbRefs.current[currentIndex];
    if (!container || !activeThumb) return;

    const containerRect = container.getBoundingClientRect();
    const thumbRect = activeThumb.getBoundingClientRect();

    const containerCenter = containerRect.left + containerRect.width / 2;
    const thumbCenter = thumbRect.left + thumbRect.width / 2;
    const delta = thumbCenter - containerCenter;

    if (Math.abs(delta) < 4) {
      return;
    }

    container.scrollTo({
      left: container.scrollLeft + delta,
      behavior: "smooth",
    });
  }, [currentIndex, images.length, isOpen]);

  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[Math.min(currentIndex, images.length - 1)];

  const badgeParts = (() => {
    const parts: { date?: string; location?: string | null } = {};
    if (locationLabel) {
      parts.location = locationLabel;
    }
    if (currentImage.createdAt) {
      try {
        parts.date = format(new Date(currentImage.createdAt), "d MMM yyyy 'alle' HH:mm", {
          locale: it,
        });
      } catch {
        // ignore formatting errors
      }
    }
    return parts;
  })();

  const handleShare = async () => {
    if (!currentImage) return;

    if (onShareImage) {
      await onShareImage(currentImage);
      return;
    }

    try {
      const shareText = (badgeParts.date ? badgeParts.date + (badgeParts.location ? " • " + badgeParts.location : "") : badgeParts.location) || memoryTitle;

      if (navigator.canShare && "canShare" in navigator) {
        try {
          const response = await fetch(currentImage.fullUrl);
          const blob = await response.blob();
          const file = new File([blob], `${memoryTitle || "ricordo"}.jpg`, { type: blob.type });

          // @ts-ignore - canShare typings may not include files on all targets
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: memoryTitle,
              text: shareText,
            } as any);
            return;
          }
        } catch {
          // Fallback sotto
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: memoryTitle,
          text: shareText,
          url: currentImage.fullUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentImage.fullUrl);
        window.alert("Link immagine copiato negli appunti.");
        return;
      }

      window.prompt("Copia questo link:", currentImage.fullUrl);
    } catch (err) {
      console.error(err);
      window.alert("Impossibile condividere l'immagine.");
    }
  };

  const handleDelete = async () => {
    if (!currentImage || !onDeletePhoto) return;
    const confirmed = window.confirm("Vuoi eliminare questa foto? Questa azione non si può annullare.");
    if (!confirmed) return;
    await onDeletePhoto(currentImage);
  };

  const handleThumbClick = (index: number) => {
    if (index < 0 || index >= images.length) return;
    setCurrentIndex(index);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="pwa-photo-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-modal="true"
          role="dialog"
          aria-label="Visualizzazione immagine"
        >
          <motion.div
            className="pwa-photo-overlay-content"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pwa-photo-overlay-top">
              {(badgeParts.date || badgeParts.location) && (
                <div className="pwa-photo-overlay-top-badge">
                  {badgeParts.date && (
                    <div className="pwa-photo-overlay-top-date">{badgeParts.date}</div>
                  )}
                  {badgeParts.location && (
                    <div className="pwa-photo-overlay-top-location">{badgeParts.location}</div>
                  )}
                </div>
              )}
            </div>

            <div
              className="pwa-photo-overlay-image-wrapper"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={currentImage.fullUrl}
                alt={memoryTitle}
                className="pwa-photo-overlay-image"
              />
            </div>

            <div className="pwa-photo-overlay-thumbs" aria-label="Anteprime immagini">
              <div
                ref={scrollRef}
                className={`pwa-photo-overlay-thumbs-scroll${atStart ? " at-start" : ""}${atEnd ? " at-end" : ""}`}
              >
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    ref={(el) => {
                      thumbRefs.current[index] = el;
                    }}
                    type="button"
                    className={`pwa-photo-overlay-thumb ${index === currentIndex ? "pwa-photo-overlay-thumb-active" : ""
                      }`}
                    onClick={() => handleThumbClick(index)}
                    aria-label={`Mostra foto ${index + 1} di ${images.length}`}
                  >
                    <img src={img.thumbUrl} alt="" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pwa-photo-overlay-footer">
              <button
                type="button"
                className="pwa-photo-overlay-action pwa-photo-overlay-action-share"
                onClick={handleShare}
                aria-label="Condividi immagine"
              >
                <span className="material-symbols-outlined">ios_share</span>
              </button>
              <button
                type="button"
                className="pwa-photo-overlay-action pwa-photo-overlay-action-delete"
                onClick={handleDelete}
                aria-label="Elimina immagine"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
