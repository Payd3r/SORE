import { useRef } from 'react';

interface UseTapOptions {
  moveThreshold?: number;
  maxDurationMs?: number;
  onTap: () => void;
}

export function useTap({ moveThreshold = 10, maxDurationMs = 300, onTap }: UseTapOptions) {
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!startRef.current) return;
    const touch = e.changedTouches[0];
    const dx = Math.abs(touch.clientX - startRef.current.x);
    const dy = Math.abs(touch.clientY - startRef.current.y);
    const dt = Date.now() - startRef.current.t;
    if (dx <= moveThreshold && dy <= moveThreshold && dt <= maxDurationMs) {
      onTap();
    }
    startRef.current = null;
  };

  const onTouchCancel = () => {
    startRef.current = null;
  };

  return { onTouchStart, onTouchEnd, onTouchCancel };
}
