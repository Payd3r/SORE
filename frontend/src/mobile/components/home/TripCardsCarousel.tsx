import { useRef, useEffect, useCallback } from "react";
import type { Memory } from "../../../api/memory";
import TripCard from "./TripCard";

const CARD_WIDTH = 340;
const CARD_GAP = 20;
const CARD_TOTAL = CARD_WIDTH + CARD_GAP;

type TripCardsCarouselProps = {
  trips: Memory[];
  onFuturoClick?: (memory: Memory) => void;
};

function getScaleForIndex(containerCenter: number, cardIndex: number): number {
  const cardCenter = cardIndex * CARD_TOTAL + CARD_WIDTH / 2;
  const distance = Math.abs(containerCenter - cardCenter);
  const maxDistance = CARD_TOTAL;
  const t = Math.min(distance / maxDistance, 1);
  return 1 - 0.1 * t;
}

export default function TripCardsCarousel({ trips, onFuturoClick }: TripCardsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Refs per i wrapper di ogni card (per manipolare transform direttamente sul DOM)
  const itemRefsRef = useRef<HTMLDivElement[]>([]);
  const rafRef = useRef<number | null>(null);

  const updateScales = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    const paddingInline = Math.max(0, (el.clientWidth - CARD_WIDTH) / 2);
    el.style.paddingLeft = `${paddingInline}px`;
    el.style.paddingRight = `${paddingInline}px`;

    itemRefsRef.current.forEach((item, index) => {
      if (!item) return;
      const scale = getScaleForIndex(containerCenter, index);
      const cardCenter = index * CARD_TOTAL + CARD_WIDTH / 2;
      const isCenter = Math.abs(cardCenter - containerCenter) < CARD_WIDTH * 0.6;
      item.style.transform = `scale(${scale})`;
      item.style.zIndex = isCenter ? "2" : "1";
    });
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateScales);
  }, [updateScales]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScales();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(updateScales);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll, updateScales, trips.length]);

  if (trips.length === 0) return null;

  return (
    <div ref={scrollRef} className="pwa-trip-carousel">
      <div className="pwa-trip-carousel-inner">
        {trips.map((memory, index) => (
          <div
            key={memory.id}
            ref={(el) => { if (el) itemRefsRef.current[index] = el; }}
            className="pwa-trip-carousel-item"
            style={{ width: CARD_WIDTH, flexShrink: 0 }}
          >
            <TripCard memory={memory} onFuturoClick={onFuturoClick} />
          </div>
        ))}
      </div>
    </div>
  );
}

