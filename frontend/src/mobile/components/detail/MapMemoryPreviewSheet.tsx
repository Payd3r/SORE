import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getImageUrl } from "../../../api/images";
import type { MapMemory } from "../../../api/map";

const TYPE_LABELS: Record<string, string> = {
  VIAGGIO: "Viaggio",
  EVENTO: "Evento",
  SEMPLICE: "Semplice",
  FUTURO: "Futuro",
};

type MapMemoryPreviewSheetProps = {
  memory: MapMemory;
  onClose: () => void;
};

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return "";
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && end) {
    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();
    const sameDay = sameMonth && start.getDate() === end.getDate();

    if (sameDay) {
      return format(start, "d MMM yyyy", { locale: it });
    }
    if (sameMonth) {
      return `${format(start, "d", { locale: it })} – ${format(end, "d MMM yyyy", { locale: it })}`;
    }
    if (sameYear) {
      return `${format(start, "d MMM", { locale: it })} – ${format(end, "d MMM yyyy", { locale: it })}`;
    }
    return `${format(start, "d MMM yyyy", { locale: it })} – ${format(end, "d MMM yyyy", { locale: it })}`;
  }

  const date = start ?? end;
  return date ? format(date, "d MMM yyyy", { locale: it }) : "";
}

export default function MapMemoryPreviewSheet({
  memory,
  onClose,
}: MapMemoryPreviewSheetProps) {
  const navigate = useNavigate();
  const coverPath = memory.thumb_path || memory.thumb_small_path;
  const dateLabel = formatDateRange(memory.start_date, memory.end_date);

  const typeUpper = memory.type?.toUpperCase();
  const isSimple = typeUpper === "SEMPLICE";
  const typeLabel = TYPE_LABELS[typeUpper] ?? memory.type;

  const goToDetail = () => {
    onClose();
    navigate(`/ricordo/${memory.id}`);
  };

  return (
    <article className="pwa-map-memory-sheet">
      <button
        type="button"
        className="pwa-map-memory-sheet-main"
        onClick={goToDetail}
      >
        <div className="pwa-map-memory-sheet-media">
          {coverPath ? (
            <img
              src={getImageUrl(coverPath)}
              alt={memory.title}
              className="pwa-map-memory-sheet-image"
            />
          ) : (
            <div className="pwa-map-memory-sheet-image-placeholder" />
          )}
        </div>
        <div className="pwa-map-memory-sheet-content">
          <div className="pwa-map-memory-sheet-header">
            {!isSimple && typeLabel && (
              <span className="pwa-map-memory-sheet-type-badge">{typeLabel}</span>
            )}
          </div>
          <h3 className="pwa-map-memory-sheet-title">{memory.title}</h3>
          {dateLabel ? <p className="pwa-map-memory-sheet-date">{dateLabel}</p> : null}
        </div>
      </button>
      <button
        type="button"
        className="pwa-map-memory-sheet-cta"
        onClick={goToDetail}
      >
        Vedi dettaglio
      </button>
    </article>
  );
}

