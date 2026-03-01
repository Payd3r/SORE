import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Memory } from "../../../api/memory";
import SpotifyTrackBlock from "./SpotifyTrackBlock";

type DetailInfoSectionProps = {
  memory: Memory;
};

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "d MMM yyyy", { locale: it });
  } catch {
    return "";
  }
}

export default function DetailInfoSection({ memory }: DetailInfoSectionProps) {
  const startStr = formatDate(memory.start_date);
  const endStr = memory.end_date ? formatDate(memory.end_date) : null;

  return (
    <div className="pwa-detail-info-section">
      <h2 className="pwa-detail-section-title">Dettagli</h2>
      {(startStr || memory.location || memory.images?.length) && (
        <div className="pwa-detail-info-card">
          <div className="pwa-detail-info-list">
            {startStr && (
              <div className="pwa-detail-info-row">
                <span className="material-symbols-outlined pwa-detail-info-icon">calendar_today</span>
                <span className="pwa-detail-info-text">
                  {startStr}
                  {endStr && endStr !== startStr ? ` – ${endStr}` : ""}
                </span>
              </div>
            )}
            {memory.location && (
              <div className="pwa-detail-info-row">
                <span className="material-symbols-outlined pwa-detail-info-icon">location_on</span>
                <span className="pwa-detail-info-text">{memory.location}</span>
              </div>
            )}
            {memory.images?.length != null && memory.images.length > 0 && (
              <div className="pwa-detail-info-row">
                <span className="material-symbols-outlined pwa-detail-info-icon">photo_library</span>
                <span className="pwa-detail-info-text">
                  {memory.images.length} {memory.images.length === 1 ? "foto" : "foto"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {memory.song && (
        <div className="pwa-detail-spotify-wrap">
          <SpotifyTrackBlock song={memory.song} />
        </div>
      )}
    </div>
  );
}
