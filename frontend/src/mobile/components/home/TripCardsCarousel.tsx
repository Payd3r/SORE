import { useRef, useState, useCallback, useEffect } from "react";
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
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollLeft(el.scrollLeft);
    setContainerWidth(el.clientWidth);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener("scroll", updateScroll, { passive: true });
    const ro = new ResizeObserver(updateScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScroll);
      ro.disconnect();
    };
  }, [updateScroll, trips.length]);

  if (trips.length === 0) return null;

  const containerCenter = scrollLeft + containerWidth / 2;
  const paddingInline = containerWidth > 0 ? Math.max(0, (containerWidth - CARD_WIDTH) / 2) : 24;

  return (
    <div
      ref={scrollRef}
      className="pwa-trip-carousel"
      style={{ paddingLeft: paddingInline, paddingRight: paddingInline }}
    >
      <div className="pwa-trip-carousel-inner">
        {trips.map((memory, index) => {
          const scale = containerWidth > 0 ? getScaleForIndex(containerCenter, index) : 1;
          const isCenter = containerWidth > 0 && Math.abs((index * CARD_TOTAL + CARD_WIDTH / 2) - containerCenter) < CARD_WIDTH * 0.6;
          return (
            <div
              key={memory.id}
              className="pwa-trip-carousel-item"
              style={{
                width: CARD_WIDTH,
                flexShrink: 0,
                transform: `scale(${scale})`,
                zIndex: isCenter ? 2 : 1,
              }}
            >
              <TripCard memory={memory} onFuturoClick={onFuturoClick} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
