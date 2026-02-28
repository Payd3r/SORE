import { useRef, useState } from 'react';

interface UseBottomSheetDragOptions {
  closeThreshold?: number;
  onClose: () => void;
}

export function useBottomSheetDrag({ closeThreshold = 110, onClose }: UseBottomSheetDragOptions) {
  const startYRef = useRef<number | null>(null);
  const translateYRef = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || startYRef.current === null || e.touches.length === 0) return;
    const delta = e.touches[0].clientY - startYRef.current;
    const nextTranslateY = Math.max(0, Math.min(220, delta));
    translateYRef.current = nextTranslateY;
    setTranslateY(nextTranslateY);
  };

  const onTouchEnd = () => {
    if (translateYRef.current >= closeThreshold) {
      onClose();
    }
    translateYRef.current = 0;
    setTranslateY(0);
    setIsDragging(false);
    startYRef.current = null;
  };

  return { translateY, isDragging, onTouchStart, onTouchMove, onTouchEnd };
}
