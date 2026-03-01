import { useRef } from "react";
import type { MemoryType } from "../../../api/memory";
import { useScrollEdgeMask } from "../../hooks";

const CATEGORIES: { value: "Tutti" | MemoryType; label: string }[] = [
  { value: "Tutti", label: "Tutti" },
  { value: "VIAGGIO", label: "Viaggio" },
  { value: "EVENTO", label: "Evento" },
  { value: "SEMPLICE", label: "Semplice" },
  { value: "FUTURO", label: "Futuro" },
];

type GalleryCategoryBadgesProps = {
  selected: "Tutti" | MemoryType;
  onSelect: (value: "Tutti" | MemoryType) => void;
};

export default function GalleryCategoryBadges({
  selected,
  onSelect,
}: GalleryCategoryBadgesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { atStart, atEnd } = useScrollEdgeMask(scrollRef);

  return (
    <div
      ref={scrollRef}
      className={`pwa-gallery-categories${atStart ? " at-start" : ""}${atEnd ? " at-end" : ""}`}
      role="tablist"
    >
      {CATEGORIES.map((cat) => {
        const isActive =
          selected === cat.value ||
          (selected === "Tutti" && cat.value === "Tutti");
        return (
          <button
            key={cat.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`pwa-gallery-category-pill ${isActive ? "pwa-gallery-category-pill-active" : ""}`}
            onClick={() => onSelect(cat.value)}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
