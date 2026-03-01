import { useRef, useState, useCallback, useEffect } from "react";

type UseBottomSheetDragOptions = {
  closeThreshold?: number;
  onClose: () => void;
  open?: boolean;
};

export function useBottomSheetDrag({
  closeThreshold = 110,
  onClose,
  open = true,
}: UseBottomSheetDragOptions) {
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startTranslate = useRef(0);
  const currentTranslate = useRef(0);

  useEffect(() => {
    currentTranslate.current = translateY;
  }, [translateY]);

  useEffect(() => {
    if (!open) setTranslateY(0);
  }, [open]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startTranslate.current = currentTranslate.current;
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startY.current;
    const next = Math.max(0, startTranslate.current + delta);
    setTranslateY(next);
  }, []);

  const onTouchEnd = useCallback(() => {
    const value = currentTranslate.current;
    setIsDragging(false);
    if (value >= closeThreshold) {
      onClose();
    } else {
      setTranslateY(0);
    }
  }, [closeThreshold, onClose]);

  return { translateY, isDragging, onTouchStart, onTouchMove, onTouchEnd };
}
