import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getImageUrl, updateImageMetadata } from "../../../api/images";
import type { Memory } from "../../../api/memory";
import { invalidateOnMemoryChange } from "../../utils/queryInvalidations";

type DetailGallerySectionProps = {
  memory: Memory;
  memoryId?: string;
  onAddPhotos?: () => void;
};

export default function DetailGallerySection({
  memory,
  memoryId,
  onAddPhotos,
}: DetailGallerySectionProps) {
  const queryClient = useQueryClient();
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [orderMenuImageId, setOrderMenuImageId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const images = memory.images ?? [];
  const selectedOrderImage = images.find((img) => img.id === orderMenuImageId) ?? null;
  const currentOrder = selectedOrderImage?.display_order ?? null;

  useEffect(() => {
    if (!selectedOrderImage) return;
    setSelectedOrder(selectedOrderImage.display_order != null ? String(selectedOrderImage.display_order) : "");
  }, [selectedOrderImage]);

  useEffect(() => {
    if (orderMenuImageId == null) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setOrderMenuImageId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOrderMenuImageId(null);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [orderMenuImageId]);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startLongPress = (imageId: number) => {
    clearLongPressTimer();
    longPressTriggeredRef.current = false;

    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      setOrderMenuImageId(imageId);
    }, 450);
  };

  const handleApplyOrder = async () => {
    if (!selectedOrderImage) return;
    const nextOrder = selectedOrder === "" ? null : Number(selectedOrder);
    if (Number.isNaN(nextOrder)) return;

    if (nextOrder === currentOrder) {
      setOrderMenuImageId(null);
      return;
    }

    const occupiedImage =
      nextOrder == null
        ? null
        : images.find(
            (img) => img.id !== selectedOrderImage.id && img.display_order === nextOrder
          ) ?? null;

    const updates: Array<Promise<void>> = [
      updateImageMetadata(String(selectedOrderImage.id), {
        type: selectedOrderImage.type ?? "landscape",
        created_at: selectedOrderImage.created_at,
        display_order: nextOrder,
      }),
    ];

    if (occupiedImage) {
      updates.push(
        updateImageMetadata(String(occupiedImage.id), {
          type: occupiedImage.type ?? "landscape",
          created_at: occupiedImage.created_at,
          display_order: currentOrder,
        })
      );
    }

    setIsSavingOrder(true);
    try {
      await Promise.all(updates);
      await invalidateOnMemoryChange(queryClient, memoryId ?? memory.id);
      setOrderMenuImageId(null);
    } catch (error) {
      console.error(error);
      window.alert("Impossibile aggiornare l'ordine della foto.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className="pwa-detail-gallery-section">
      <div className="pwa-detail-gallery-header">
        <h2 className="pwa-detail-section-title">Galleria</h2>
        {onAddPhotos && (
          <button
            type="button"
            className="pwa-detail-gallery-add-btn"
            onClick={onAddPhotos}
            aria-label="Aggiungi foto"
          >
            <span className="material-symbols-outlined">add_photo_alternate</span>
            
          </button>
        )}
      </div>
      {images.length === 0 ? (
        <div className="pwa-detail-gallery-empty">
          <span className="material-symbols-outlined pwa-detail-gallery-empty-icon">photo_library</span>
          <p className="pwa-detail-gallery-empty-text">Nessuna foto</p>
          {onAddPhotos && (
            <button
              type="button"
              className="pwa-detail-gallery-add-btn"
              onClick={onAddPhotos}
            >
              Aggiungi la prima foto
            </button>
          )}
        </div>
      ) : (
        <div className="pwa-detail-gallery-grid">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              className="pwa-detail-gallery-item"
              onClick={() => {
                if (longPressTriggeredRef.current) {
                  longPressTriggeredRef.current = false;
                  return;
                }
                setSelectedImageId(img.id);
              }}
              onTouchStart={() => startLongPress(img.id)}
              onTouchEnd={clearLongPressTimer}
              onTouchCancel={clearLongPressTimer}
              onMouseDown={() => startLongPress(img.id)}
              onMouseUp={clearLongPressTimer}
              onMouseLeave={clearLongPressTimer}
              onContextMenu={(e) => e.preventDefault()}
              aria-label={`Foto ${img.id}`}
            >
              {img.display_order != null && (
                <span className="pwa-detail-gallery-order-badge">{img.display_order}</span>
              )}
              <img
                src={getImageUrl(img.thumb_big_path ?? "")}
                alt=""
                className="pwa-detail-gallery-img"
              />
            </button>
          ))}
        </div>
      )}
      {selectedOrderImage && (
        <div className="pwa-detail-gallery-order-menu-backdrop">
          <div
            ref={menuRef}
            className="pwa-detail-gallery-order-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Imposta ordine foto"
          >
            <h3 className="pwa-detail-gallery-order-menu-title">Ordine foto</h3>
            <p className="pwa-detail-gallery-order-menu-text">
              Se l'ordine e' gia' occupato, le foto verranno scambiate.
            </p>
            <select
              className="pwa-detail-gallery-order-select"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              disabled={isSavingOrder}
            >
              <option value="">Nessun ordine</option>
              {Array.from({ length: images.length }, (_, i) => i + 1).map((order) => (
                <option key={order} value={String(order)}>
                  Posizione {order}
                </option>
              ))}
            </select>
            <div className="pwa-detail-gallery-order-menu-actions">
              <button
                type="button"
                className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
                onClick={() => setOrderMenuImageId(null)}
                disabled={isSavingOrder}
              >
                Annulla
              </button>
              <button
                type="button"
                className="pwa-idea-detail-btn pwa-idea-detail-btn-save"
                onClick={handleApplyOrder}
                disabled={isSavingOrder}
              >
                {isSavingOrder ? "Salvataggio..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedImageId != null && (
        <div
          className="pwa-detail-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Dettaglio immagine"
          onClick={() => setSelectedImageId(null)}
        >
          <img
            src={getImageUrl(
              images.find((i) => i.id === selectedImageId)?.thumb_big_path ?? ""
            )}
            alt=""
            className="pwa-detail-gallery-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="pwa-detail-gallery-lightbox-close"
            onClick={() => setSelectedImageId(null)}
            aria-label="Chiudi"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
