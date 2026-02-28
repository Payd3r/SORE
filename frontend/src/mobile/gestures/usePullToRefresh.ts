import { useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  enabled?: boolean;
  threshold?: number;
  maxPull?: number;
  onRefresh: () => Promise<void> | void;
}

export function usePullToRefresh({
  enabled = true,
  threshold = 56,
  maxPull = 120,
  onRefresh,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent, scrollTop: number) => {
    if (!enabled || isRefreshing || scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
    setIsPulling(false);
    setPullDistance(0);
  };

  const onTouchMove = (e: React.TouchEvent, scrollTop: number) => {
    if (!enabled || startYRef.current === null || scrollTop > 0) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta <= 0) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }
    const clamped = Math.min(maxPull, delta);
    setIsPulling(true);
    setPullDistance(clamped);
    if (clamped > 24) e.preventDefault();
  };

  const onTouchEnd = async () => {
    if (!enabled) return;
    if (isPulling && pullDistance >= threshold) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setIsPulling(false);
    setPullDistance(0);
    startYRef.current = null;
  };

  return { pullDistance, isPulling, isRefreshing, onTouchStart, onTouchMove, onTouchEnd };
}
