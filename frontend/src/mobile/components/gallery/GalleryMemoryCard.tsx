import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { FaSpotify } from "react-icons/fa";
import type { Memory, MemoryType } from "../../../api/memory";
import { getImageUrl } from "../../../api/images";

const TYPE_LABELS: Record<MemoryType, string> = {
  VIAGGIO: "Viaggio",
  EVENTO: "Evento",
  SEMPLICE: "Semplice",
  FUTURO: "Futuro",
};

type GalleryMemoryCardProps = {
  memory: Memory;
  /** Se fornito, per i ricordi FUTURO si apre questo callback invece di navigare al dettaglio */
  onFuturoClick?: (memory: Memory) => void;
};

export default function GalleryMemoryCard({ memory, onFuturoClick }: GalleryMemoryCardProps) {
  const navigate = useNavigate();
  const isFuturo = memory.type?.toUpperCase() === "FUTURO";
  const imagePath =
    !isFuturo && (memory.images?.[0]?.webp_path || memory.images?.[0]?.thumb_big_path)
      ? (memory.images?.[0]?.webp_path || memory.images?.[0]?.thumb_big_path || "")
      : "";

  const startDate = memory.start_date ? new Date(memory.start_date) : null;
  const endDate = memory.end_date ? new Date(memory.end_date) : null;

  const isSimple = memory.type?.toUpperCase() === "SEMPLICE";
  const typeLabel = TYPE_LABELS[memory.type] ?? memory.type;
  const hasSong = Boolean(memory.song?.trim());

  let dateStr = "";
  if (startDate && endDate) {
    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();
    const sameDay = sameMonth && startDate.getDate() === endDate.getDate();

    if (sameDay) {
      dateStr = format(startDate, "d MMM yyyy", { locale: it });
    } else if (sameMonth) {
      dateStr = `${format(startDate, "d", { locale: it })} – ${format(endDate, "d MMM yyyy", { locale: it })}`;
    } else if (sameYear) {
      dateStr = `${format(startDate, "d MMM", { locale: it })} – ${format(endDate, "d MMM yyyy", { locale: it })}`;
    } else {
      dateStr = `${format(startDate, "d MMM yyyy", { locale: it })} – ${format(endDate, "d MMM yyyy", { locale: it })}`;
    }
  } else if (startDate) {
    dateStr = format(startDate, "d MMM yyyy", { locale: it });
  } else if (endDate) {
    dateStr = format(endDate, "d MMM yyyy", { locale: it });
  }

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
      className="pwa-gallery-memory-card"
      onClick={handleClick}
    >
      <div className="pwa-gallery-memory-card-media">
        {imagePath ? (
          <img
            src={getImageUrl(imagePath)}
            alt={memory.title}
            className="pwa-gallery-memory-card-img"
          />
        ) : (
          <div className={`pwa-gallery-memory-card-placeholder ${isFuturo ? "pwa-gallery-memory-card-placeholder-futuro" : ""}`}>
            {isFuturo && <span className="material-symbols-outlined pwa-gallery-memory-card-placeholder-icon" aria-hidden>schedule</span>}
          </div>
        )}
        <div className="pwa-gallery-memory-card-overlay" />
        {!isSimple && (
          <span className="pwa-gallery-memory-card-type-badge">{typeLabel}</span>
        )}
      </div>
      <div className="pwa-gallery-memory-card-content">
        <h3 className="pwa-gallery-memory-card-title">{memory.title}</h3>
        <p className="pwa-gallery-memory-card-date">{dateStr}</p>
      </div>
      {hasSong && (
        <span
          className="pwa-gallery-memory-card-song-icon"
          title="Ha una canzone"
          aria-hidden
        >
          <FaSpotify className="pwa-gallery-memory-card-spotify-icon" />
        </span>
      )}
    </button>
  );
}
