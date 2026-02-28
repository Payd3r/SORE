import { cn } from './cn';

export default function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-ios-md bg-gray-200 dark:bg-gray-700', className)} />;
}

export function SkeletonListItem() {
  return (
    <div className="rounded-ios-lg bg-gray-50 p-4 dark:bg-gray-800/60">
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-ios-xl bg-white/90 p-4 shadow-ios-card dark:bg-[#1C1C1E]/90">
      <Skeleton className="mb-3 h-4 w-1/3" />
      <Skeleton className="h-32 w-full rounded-ios-lg" />
    </div>
  );
}
