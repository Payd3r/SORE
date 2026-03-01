import { useRef, useState, useCallback, useEffect } from "react";
import type { IdeaType } from "../../../api/ideas";

const IDEA_TYPES: { value: "Tutti" | IdeaType; label: string }[] = [
  { value: "Tutti", label: "Tutti" },
  { value: "RISTORANTI", label: "Ristoranti" },
  { value: "VIAGGI", label: "Viaggi" },
  { value: "SFIDE", label: "Sfide" },
  { value: "SEMPLICI", label: "Semplici" },
];

type IdeaTypeBadgesProps = {
  selected: "Tutti" | IdeaType;
  onSelect: (value: "Tutti" | IdeaType) => void;
};

function useScrollEdgeMask(scrollRef: React.RefObject<HTMLDivElement | null>) {
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const left = el.scrollLeft <= 1;
    const right = el.scrollWidth <= el.clientWidth + 1 || el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
    setAtStart(left);
    setAtEnd(right);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  return { atStart, atEnd };
}

export default function IdeaTypeBadges({
  selected,
  onSelect,
}: IdeaTypeBadgesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { atStart, atEnd } = useScrollEdgeMask(scrollRef);

  return (
    <div
      ref={scrollRef}
      className={`pwa-gallery-categories${atStart ? " at-start" : ""}${atEnd ? " at-end" : ""}`}
      role="tablist"
    >
      {IDEA_TYPES.map((cat) => {
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
