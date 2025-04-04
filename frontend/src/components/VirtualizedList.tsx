import React, { useEffect, useRef, useState } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  className = '',
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateVisibleRange = () => {
      const { scrollTop, clientHeight } = container;
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const end = Math.min(
        items.length,
        Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
      );
      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', updateVisibleRange);
    updateVisibleRange();

    return () => {
      container.removeEventListener('scroll', updateVisibleRange);
    };
  }, [itemHeight, items.length, overscan]);

  const totalHeight = items.length * itemHeight;
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: (visibleRange.start + index) * itemHeight,
              width: '100%',
              height: itemHeight,
            }}
          >
            {renderItem(item, visibleRange.start + index)}
          </div>
        ))}
      </div>
    </div>
  );
} 