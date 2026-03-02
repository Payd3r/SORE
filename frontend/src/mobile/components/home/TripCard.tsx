import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Memory } from "../../../api/memory";
import { getImageUrl } from "../../../api/images";

type TripCardProps = {
  memory: Memory;
  /** Se fornito, per i ricordi FUTURO si apre questo callback invece di navigare al dettaglio */
  onFuturoClick?: (memory: Memory) => void;
};

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "";
  try {
    const startDate = new Date(start);
    if (!end) return format(startDate, "d MMMM yyyy", { locale: it });
    const endDate = new Date(end);
    if (format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd")) {
      return format(startDate, "d MMMM yyyy", { locale: it });
    }
    return `${format(startDate, "d", { locale: it })} - ${format(endDate, "d MMMM yyyy", { locale: it })}`;
  } catch {
    return "";
  }
}

export default function TripCard({ memory, onFuturoClick }: TripCardProps) {
  const navigate = useNavigate();
  const isFuturo = memory.type?.toUpperCase() === "FUTURO";
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

  const handleClick = () => {
    if (isFuturo && onFuturoClick) {
      onFuturoClick(memory);
    } else {
      navigate(`/ricordo/${memory.id}`);
    }
  };

  return (
    <article className="pwa-trip-card">
      <div
        role="button"
        tabIndex={0}
        className="pwa-trip-card-tap-area"
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        aria-label={`Vedi ${memory.title}`}
      >
        <div className="pwa-trip-card-media">
          {imagePath ? (
            <img
              src={getImageUrl(imagePath)}
              alt=""
              className="pwa-trip-card-img"
            />
          ) : (
            <div className="pwa-trip-card-placeholder" />
          )}
          <div className="pwa-trip-card-overlay" />
          <button
            type="button"
            className="pwa-trip-card-fav"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isFuturo && onFuturoClick) onFuturoClick(memory);
              else navigate(`/ricordo/${memory.id}`);
            }}
            aria-label="Preferiti"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              favorite_border
            </span>
          </button>
        </div>
        <div className="pwa-trip-card-content">
          {memory.location && (
            <span className="pwa-trip-card-subtitle">{memory.location}</span>
          )}
          <h3 className="pwa-trip-card-title">{memory.title}</h3>
          {formatDateRange(memory.start_date, memory.end_date) && (
            <p className="pwa-trip-card-meta">
              {formatDateRange(memory.start_date, memory.end_date)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
