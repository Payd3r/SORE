import { useState, useCallback, useEffect } from "react";

export function useScrollEdgeMask(scrollRef: React.RefObject<HTMLDivElement | null>) {
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const left = el.scrollLeft <= 1;
    const right =
      el.scrollWidth <= el.clientWidth + 1 ||
      el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
    setAtStart(left);
    setAtEnd(right);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  return { atStart, atEnd };
}
