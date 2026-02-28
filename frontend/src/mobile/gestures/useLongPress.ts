import { useRef } from 'react';

interface UseLongPressOptions<T> {
  item: T;
  delay?: number;
  moveThreshold?: number;
  onLongPress: (item: T, e: React.TouchEvent | React.MouseEvent) => void;
}

export function useLongPress<T>({
  item,
  delay = 500,
  moveThreshold = 12,
  onLongPress,
}: UseLongPressOptions<T>) {
  const timeoutRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const clear = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    startPosRef.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    timeoutRef.current = window.setTimeout(() => onLongPress(item, e), delay);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!startPosRef.current) return;
    const dx = Math.abs(e.touches[0].clientX - startPosRef.current.x);
    const dy = Math.abs(e.touches[0].clientY - startPosRef.current.y);
    if (dx > moveThreshold || dy > moveThreshold) clear();
  };

  const onTouchEnd = () => clear();
  const onTouchCancel = () => clear();
  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress(item, e);
  };

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel, onContextMenu, clear };
}
