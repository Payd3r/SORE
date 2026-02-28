import { useRef } from 'react';

interface UsePinchGridOptions {
  compact: boolean;
  onCompactChange: (compact: boolean) => void;
  inThreshold?: number;
  outThreshold?: number;
}

export function usePinchGrid({
  compact,
  onCompactChange,
  inThreshold = 0.85,
  outThreshold = 1.2,
}: UsePinchGridOptions) {
  const initialDistanceRef = useRef<number | null>(null);
  const lockRef = useRef<number>(0);

  const getDistance = (a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) =>
    Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    initialDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || initialDistanceRef.current === null) return;
    const now = Date.now();
    if (now - lockRef.current < 280) return;
    const ratio = getDistance(e.touches[0], e.touches[1]) / initialDistanceRef.current;
    if (ratio < inThreshold && !compact) {
      onCompactChange(true);
      lockRef.current = now;
    } else if (ratio > outThreshold && compact) {
      onCompactChange(false);
      lockRef.current = now;
    }
    if (Math.abs(ratio - 1) > 0.05) {
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    initialDistanceRef.current = null;
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
