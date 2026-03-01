interface PullToRefreshIndicatorProps {
  pullDistance: number;
  threshold?: number;
  className?: string;
}

export default function PullToRefreshIndicator({
  pullDistance,
  threshold = 56,
  className,
}: PullToRefreshIndicatorProps) {
  return (
    <div
      className={className ?? 'mx-auto mb-2 h-1.5 w-14 rounded-full bg-[var(--color-primary)]/30 transition-all'}
      style={{ transform: `scaleX(${Math.min(1, pullDistance / threshold)})` }}
      aria-hidden="true"
    />
  );
}
