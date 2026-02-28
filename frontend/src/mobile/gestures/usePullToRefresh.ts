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
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const isPullingRef = useRef(false);

  const onTouchStart = (e: React.TouchEvent, scrollTop: number) => {
    if (!enabled || isRefreshing || scrollTop > 0 || e.touches.length === 0) return;
    startYRef.current = e.touches[0].clientY;
    setIsPulling(false);
    isPullingRef.current = false;
    setPullDistance(0);
    pullDistanceRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent, scrollTop: number) => {
    if (!enabled || startYRef.current === null || scrollTop > 0 || e.touches.length === 0) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta <= 0) {
      setIsPulling(false);
      isPullingRef.current = false;
      setPullDistance(0);
      pullDistanceRef.current = 0;
      return;
    }
    const clamped = Math.min(prefersReducedMotion ? threshold : maxPull, delta);
    setIsPulling(true);
    isPullingRef.current = true;
    setPullDistance(clamped);
    pullDistanceRef.current = clamped;
    if (!prefersReducedMotion && clamped > 24) e.preventDefault();
  };

  const onTouchEnd = async () => {
    if (!enabled) return;
    if (isPullingRef.current && pullDistanceRef.current >= threshold) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setIsPulling(false);
    isPullingRef.current = false;
    setPullDistance(0);
    pullDistanceRef.current = 0;
    startYRef.current = null;
  };

  return { pullDistance, isPulling, isRefreshing, onTouchStart, onTouchMove, onTouchEnd };
}
