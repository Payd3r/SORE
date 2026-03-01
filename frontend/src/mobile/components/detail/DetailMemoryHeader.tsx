import { useEffect, useRef, useState } from "react";
import type { Memory } from "../../../api/memory";

type DetailMemoryHeaderProps = {
  memory: Memory;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
};

const TYPE_LABELS: Record<string, string> = {
  VIAGGIO: "Viaggio",
  EVENTO: "Evento",
  SEMPLICE: "Ricordo",
  FUTURO: "Futuro",
};

export default function DetailMemoryHeader({
  memory,
  onBack,
  onEdit,
  onDelete,
  onShare,
}: DetailMemoryHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const typeLabel = TYPE_LABELS[memory.type] ?? memory.type;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("touchstart", onPointerDown);
    }

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <header className="pwa-detail-memory-header">
      <button
        type="button"
        className="pwa-detail-memory-back"
        onClick={onBack}
        aria-label="Indietro"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <div className="pwa-detail-memory-header-center">
        <span className="pwa-detail-memory-type-badge">{typeLabel}</span>
        <h1 className="pwa-detail-memory-title">{memory.title}</h1>
      </div>
      <div className="pwa-detail-memory-actions">
        <div className="pwa-detail-memory-actions-menu" ref={menuRef}>
          <button
            type="button"
            className="pwa-detail-memory-action"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Apri menu azioni"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          {menuOpen && (
            <div className="pwa-detail-memory-dropdown">
              <button
                type="button"
                className="pwa-detail-memory-dropdown-item"
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
                className="pwa-detail-memory-dropdown-item"
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
                className="pwa-detail-memory-dropdown-item pwa-detail-memory-dropdown-item-danger"
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
    </header>
  );
}
