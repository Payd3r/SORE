import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../api/images";
import type { MapMemory } from "../../../api/map";

type MapMemoryPreviewSheetProps = {
  memory: MapMemory;
  onClose: () => void;
};

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return "";
  if (startDate && endDate) {
    return `${new Date(startDate).toLocaleDateString("it-IT")} - ${new Date(endDate).toLocaleDateString("it-IT")}`;
  }
  const date = startDate ?? endDate;
  return date ? new Date(date).toLocaleDateString("it-IT") : "";
}

export default function MapMemoryPreviewSheet({
  memory,
  onClose,
}: MapMemoryPreviewSheetProps) {
  const navigate = useNavigate();
  const coverPath = memory.thumb_path || memory.thumb_small_path;
  const dateLabel = formatDateRange(memory.start_date, memory.end_date);

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
          <p className="pwa-map-memory-sheet-type">{memory.type}</p>
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
