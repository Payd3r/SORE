import { useRef, useState, useCallback, useEffect } from "react";

const SHEET_PEEK_PERCENT = 32;
const SHEET_EXPANDED_PERCENT = 88;
const SNAP_THRESHOLD = 55;

export function useDetailContentSheet(initialExpanded = true) {
  const [heightPercent, setHeightPercent] = useState(
    initialExpanded ? SHEET_EXPANDED_PERCENT : SHEET_PEEK_PERCENT
  );
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const heightPercentRef = useRef(heightPercent);
  useEffect(() => {
    heightPercentRef.current = heightPercent;
  }, [heightPercent]);

  const lastY = useRef(0);
  const velocity = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    lastY.current = e.touches[0].clientY;
    startHeight.current = heightPercentRef.current;
    velocity.current = 0;
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    velocity.current = lastY.current - currentY;
    lastY.current = currentY;

    const deltaY = startY.current - currentY;
    const viewportHeight = window.innerHeight;
    const percentDelta = (deltaY / viewportHeight) * 100;
    const next = Math.min(
      SHEET_EXPANDED_PERCENT,
      Math.max(SHEET_PEEK_PERCENT, startHeight.current + percentDelta)
    );
    setHeightPercent(next);
  }, []);

  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
    const v = velocity.current;

    setHeightPercent((current) => {
      // Se il gesto è veloce, segui la direzione
      if (Math.abs(v) > 5) {
        return v > 0 ? SHEET_EXPANDED_PERCENT : SHEET_PEEK_PERCENT;
      }
      // Altrimenti usa la soglia di posizione
      return current < SNAP_THRESHOLD ? SHEET_PEEK_PERCENT : SHEET_EXPANDED_PERCENT;
    });
  }, []);

  return {
    heightPercent,
    isDragging,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
