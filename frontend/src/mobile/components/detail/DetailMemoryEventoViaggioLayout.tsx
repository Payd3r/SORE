import { useState, useRef, useEffect } from "react";
import type { Memory } from "../../../api/memory";
import { useDetailContentSheet } from "../../gestures/useDetailContentSheet";
import DetailCarousel from "./DetailCarousel";
import DetailInfoSection from "./DetailInfoSection";
import DetailTimelineAccordion from "./DetailTimelineAccordion";
import DetailGallerySection from "./DetailGallerySection";

const TYPE_LABELS: Record<string, string> = {
  VIAGGIO: "Viaggio",
  EVENTO: "Evento",
};

type DetailMemoryEventoViaggioLayoutProps = {
  memory: Memory;
  memoryId: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
  onAddPhotos: () => void;
};

export default function DetailMemoryEventoViaggioLayout({
  memory,
  memoryId,
  onBack,
  onEdit,
  onDelete,
  onShare,
  onAddPhotos,
}: DetailMemoryEventoViaggioLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    heightPercent,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useDetailContentSheet(false);

  const typeLabel = TYPE_LABELS[memory.type] ?? memory.type;
  const carouselHeightPercent = 100 - heightPercent;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="pwa-detail-evento-viaggio">
      <div
        className="pwa-detail-evento-viaggio-carousel-wrap"
        style={{ height: `${carouselHeightPercent}dvh` }}
      >
        <div className="pwa-detail-evento-viaggio-carousel">
          <DetailCarousel memoryId={memoryId} />
        </div>
        <div className="pwa-detail-evento-viaggio-overlay">
          <button
            type="button"
            className="pwa-detail-evento-viaggio-overlay-btn"
            onClick={onBack}
            aria-label="Indietro"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="pwa-detail-evento-viaggio-overlay-actions" ref={menuRef}>
            <button
              type="button"
              className="pwa-detail-evento-viaggio-overlay-btn pwa-detail-evento-viaggio-overlay-btn-menu"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {menuOpen && (
              <div className="pwa-detail-evento-viaggio-dropdown">
                <button
                  type="button"
                  className="pwa-detail-evento-viaggio-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                >
                  <span className="material-symbols-outlined">edit</span>
                  Modifica
                </button>
                <button
                  type="button"
                  className="pwa-detail-evento-viaggio-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onShare?.();
                  }}
                >
                  <span className="material-symbols-outlined">share</span>
                  Condividi
                </button>
                <button
                  type="button"
                  className="pwa-detail-evento-viaggio-dropdown-item pwa-detail-evento-viaggio-dropdown-item-danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                >
                  <span className="material-symbols-outlined">delete</span>
                  Elimina
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="pwa-detail-content-sheet"
        style={{ height: `${heightPercent}dvh` }}
      >
        <div
          className="pwa-detail-content-sheet-handle"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          aria-hidden
        >
          <span className="pwa-detail-content-sheet-handle-bar" />
        </div>
        <div className="pwa-detail-content-sheet-inner">
          <header className="pwa-detail-content-sheet-header">
            <span className="pwa-detail-content-sheet-type">{typeLabel}</span>
            <h1 className="pwa-detail-content-sheet-title">{memory.title}</h1>
          </header>
          <div className="pwa-detail-content-sheet-scroll">
            <DetailInfoSection memory={memory} />
            <DetailTimelineAccordion memory={memory} />
            <DetailGallerySection memory={memory} onAddPhotos={onAddPhotos} />
          </div>
        </div>
      </div>
    </div>
  );
}
