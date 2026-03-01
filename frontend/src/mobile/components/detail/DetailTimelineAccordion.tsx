import { useState, useMemo } from "react";
import { format, parseISO, differenceInHours } from "date-fns";
import { it } from "date-fns/locale";
import { getImageUrl } from "../../../api/images";
import type { Memory } from "../../../api/memory";

type MemoryImage = NonNullable<Memory["images"]>[number];

interface TimelineGroup {
  timestamp: Date;
  endTimestamp: Date;
  images: MemoryImage[];
}

type DetailTimelineAccordionProps = {
  memory: Memory;
};

export default function DetailTimelineAccordion({ memory }: DetailTimelineAccordionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const groups = useMemo(() => {
    const imgs = memory.images ?? [];
    if (imgs.length === 0) return [];

    const sorted = [...imgs].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return ta - tb;
    });

    const result: TimelineGroup[] = [];
    let current: TimelineGroup | null = null;

    for (const image of sorted) {
      if (!image.created_at) continue;
      const imageDate = parseISO(image.created_at);

      if (
        !current ||
        differenceInHours(imageDate, current.timestamp) >= 2
      ) {
        current = {
          timestamp: imageDate,
          endTimestamp: imageDate,
          images: [image],
        };
        result.push(current);
      } else {
        current.images.push(image);
        current.endTimestamp = imageDate;
      }
    }
    return result;
  }, [memory.images]);

  if (groups.length === 0) {
    return (
      <div className="pwa-detail-timeline-empty">
        <p>Nessuna immagine per la timeline</p>
      </div>
    );
  }

  return (
    <div className="pwa-detail-timeline" role="region" aria-label="Timeline foto">
      <h2 className="pwa-detail-section-title">Timeline</h2>
      <div className="pwa-detail-timeline-list">
        {groups.map((group, index) => {
          const isExpanded = expandedIndex === index;
          const timeStr =
            group.images.length === 1
              ? format(group.timestamp, "HH:mm", { locale: it })
              : `${format(group.timestamp, "HH:mm", { locale: it })} – ${format(group.endTimestamp, "HH:mm", { locale: it })}`;
          const dateStr = format(group.timestamp, "d MMM yyyy", { locale: it });
          const firstImg = group.images[0];

          return (
            <div
              key={group.timestamp.toISOString()}
              className={`pwa-detail-timeline-item ${isExpanded ? "pwa-detail-timeline-item-expanded" : ""}`}
            >
              <button
                type="button"
                className="pwa-detail-timeline-item-head"
                onClick={() =>
                  setExpandedIndex(isExpanded ? null : index)
                }
                aria-expanded={isExpanded}
              >
                <div className="pwa-detail-timeline-item-time">
                  <span className="pwa-detail-timeline-item-time-value">{timeStr}</span>
                  <span className="pwa-detail-timeline-item-date">{dateStr}</span>
                </div>
                {firstImg?.thumb_big_path && (
                  <div className="pwa-detail-timeline-item-thumb">
                    <img
                      src={getImageUrl(firstImg.thumb_big_path)}
                      alt=""
                    />
                  </div>
                )}
                <span className="material-symbols-outlined pwa-detail-timeline-item-chevron">
                  {isExpanded ? "expand_less" : "expand_more"}
                </span>
              </button>
              {isExpanded && (
                <div className="pwa-detail-timeline-item-content">
                  <div className="pwa-detail-timeline-grid">
                    {group.images.map((img) => (
                      <div
                        key={img.id}
                        className="pwa-detail-timeline-grid-item"
                      >
                        <img
                          src={getImageUrl(img.thumb_big_path ?? "")}
                          alt=""
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
