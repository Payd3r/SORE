import { useState } from "react";
import { getImageUrl } from "../../../api/images";
import type { Memory } from "../../../api/memory";

type DetailGallerySectionProps = {
  memory: Memory;
  onAddPhotos?: () => void;
};

export default function DetailGallerySection({
  memory,
  onAddPhotos,
}: DetailGallerySectionProps) {
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const images = memory.images ?? [];

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
              onClick={() => setSelectedImageId(img.id)}
              aria-label={`Foto ${img.id}`}
            >
              <img
                src={getImageUrl(img.thumb_big_path ?? "")}
                alt=""
                className="pwa-detail-gallery-img"
              />
            </button>
          ))}
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
