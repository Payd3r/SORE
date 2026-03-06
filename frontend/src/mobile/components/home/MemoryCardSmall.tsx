import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Memory } from "../../../api/memory";
import { getImageUrl } from "../../../api/images";
import { usePwaPrefetch } from "../../hooks";

type MemoryCardSmallProps = {
  memory: Memory;
  /** Se fornito, per i ricordi FUTURO si apre questo callback invece di navigare al dettaglio */
  onFuturoClick?: (memory: Memory) => void;
  /** Variante dimensionale: default = compatto, large = più alta e larga (es. Più visti) */
  size?: "default" | "large";
  /** Mostra il badge con la data (default true) */
  showDate?: boolean;
};

export default function MemoryCardSmall({ memory, onFuturoClick, size = "default", showDate = true }: MemoryCardSmallProps) {
  const navigate = useNavigate();
  const isFuturo = memory.type?.toUpperCase() === "FUTURO";
  const { prefetchMemoryDetails } = usePwaPrefetch();

  const handlePrefetch = useCallback(() => {
    if (!isFuturo) void prefetchMemoryDetails([memory.id]);
  }, [isFuturo, memory.id, prefetchMemoryDetails]);
  const imagePath = useMemo(() => {
    if (isFuturo) return "";
    const images = memory.images ?? [];
    if (images.length === 0) return "";

    const preferred = images.find((img) => img.display_order === 1);
    if (preferred) {
      return preferred.webp_path || preferred.thumb_big_path || "";
    }

    const fallback = images[Math.floor(Math.random() * images.length)];
    return fallback?.webp_path || fallback?.thumb_big_path || "";
  }, [isFuturo, memory.images]);

  const dateStr = memory.start_date
    ? format(new Date(memory.start_date), "d MMM yyyy", { locale: it })
    : "";

  const handleClick = () => {
    if (isFuturo && onFuturoClick) {
      onFuturoClick(memory);
    } else {
      navigate(`/ricordo/${memory.id}`);
    }
  };

  return (
    <button
      type="button"
      className={`pwa-memory-card-small${size === "large" ? " pwa-memory-card-small--large" : ""}`}
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
    >
      <div className="pwa-memory-card-small-media">
        {imagePath ? (
          <img
            src={getImageUrl(imagePath)}
            alt={memory.title}
            className="pwa-memory-card-small-img"
          />
        ) : (
          <div className={`pwa-memory-card-small-placeholder ${isFuturo ? "pwa-memory-card-small-placeholder-futuro" : ""}`}>
            {isFuturo && <span className="material-symbols-outlined pwa-memory-card-small-placeholder-icon" aria-hidden>schedule</span>}
          </div>
        )}
      </div>
      {showDate && dateStr ? (
        <span className="pwa-memory-card-small-badge">{dateStr}</span>
      ) : null}
      <div className="pwa-memory-card-small-content">
        <h3 className="pwa-memory-card-small-title">{memory.title}</h3>
      </div>
    </button>
  );
}
