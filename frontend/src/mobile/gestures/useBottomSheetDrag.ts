import { useRef, useState } from 'react';

interface UseBottomSheetDragOptions {
  closeThreshold?: number;
  onClose: () => void;
}

export function useBottomSheetDrag({ closeThreshold = 110, onClose }: UseBottomSheetDragOptions) {
  const startYRef = useRef<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || startYRef.current === null) return;
    const delta = e.touches[0].clientY - startYRef.current;
    setTranslateY(Math.max(0, Math.min(220, delta)));
  };

  const onTouchEnd = () => {
    if (translateY >= closeThreshold) {
      onClose();
    }
    setTranslateY(0);
    setIsDragging(false);
    startYRef.current = null;
  };

  return { translateY, isDragging, onTouchStart, onTouchMove, onTouchEnd };
}
