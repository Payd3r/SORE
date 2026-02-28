import Skeleton from '../../../components/ui/Skeleton';

interface SkeletonListProps {
  count?: number;
}

export function SkeletonMemoryCardMobile({ count = 4 }: SkeletonListProps) {
  return (
    <div className="grid grid-cols-2 gap-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`memory-skeleton-${index}`} className="rounded-2xl bg-white/70 p-2 dark:bg-gray-800/60">
          <Skeleton className="aspect-[4/5] w-full rounded-xl" />
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-1 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonIdeasListMobile({ count = 5 }: SkeletonListProps) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`idea-skeleton-${index}`} className="rounded-2xl bg-white/70 p-4 dark:bg-gray-800/60">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGalleryGridMobile({ count = 20, compact = true }: SkeletonListProps & { compact?: boolean }) {
  return (
    <div className={`grid ${compact ? 'grid-cols-5' : 'grid-cols-3'} gap-[2px]`} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={`gallery-skeleton-${index}`} className="aspect-square w-full rounded-none" />
      ))}
    </div>
  );
}

export function SkeletonNotificationItemMobile({ count = 6 }: SkeletonListProps) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`notification-skeleton-${index}`} className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-800/70">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfileHeaderMobile() {
  return (
    <div className="rounded-2xl bg-white/70 p-6 dark:bg-gray-800/60" aria-hidden="true">
      <Skeleton className="mx-auto h-24 w-24 rounded-full" />
      <Skeleton className="mx-auto mt-4 h-5 w-40" />
      <Skeleton className="mx-auto mt-2 h-4 w-52" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonStatsMobile() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`stats-card-${index}`} className="rounded-2xl bg-white/70 p-4 dark:bg-gray-800/60">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-3 h-7 w-1/3" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white/70 p-5 dark:bg-gray-800/60">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-4 h-2 w-full rounded-full" />
        <Skeleton className="mt-3 h-2 w-5/6 rounded-full" />
        <Skeleton className="mt-3 h-2 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonMapMobile() {
  return (
    <div className="h-full w-full p-4" aria-hidden="true">
      <Skeleton className="h-full min-h-[320px] w-full rounded-2xl" />
    </div>
  );
}

export function SkeletonMemoryDetailMobile() {
  return (
    <div className="fixed inset-0 z-[100000] bg-white dark:bg-gray-900" aria-hidden="true">
      <Skeleton className="h-[55vh] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-6 h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
