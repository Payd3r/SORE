import { cn } from './cn';

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-ios-md bg-[var(--skeleton-bg)]', className)}
    />
  );
}

export function SkeletonListItem() {
  return (
    <div className="rounded-ios-lg bg-[var(--skeleton-card-bg)] p-4">
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-ios-xl bg-[var(--skeleton-card-bg)] p-4 shadow-ios-card">
      <Skeleton className="mb-3 h-4 w-1/3" />
      <Skeleton className="h-32 w-full rounded-ios-lg" />
    </div>
  );
}
