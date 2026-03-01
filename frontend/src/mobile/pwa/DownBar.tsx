import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '../../components/ui/cn';
import { getMemories } from '../../api/memory';
import { getIdeas } from '../../api/ideas';
import { getGalleryImages } from '../../api/images';
import { getMapImages } from '../../api/map';
import { getUserInfo } from '../../api/profile';
import { useAuth } from '../../contexts/AuthContext';

interface DownBarProps {
  unreadCount?: number;
  unreadCountLoading?: boolean;
}

interface GalleryPrefetchPage {
  images: unknown[];
  nextPage: number | undefined;
}

const TAB_ITEMS: Array<{
  key: string;
  label: string;
  icon: string;
  isCentral?: boolean;
}> = [
  { key: '/', label: 'Home', icon: 'home' },
  { key: '/galleria', label: 'Galleria', icon: 'photo_library' },
  { key: '/upload', label: 'Upload', icon: 'send', isCentral: true },
  { key: '/mappa', label: 'Mappa', icon: 'map' },
  { key: '/profilo', label: 'Profilo', icon: 'person' },
];

const DownBar = ({ unreadCount = 0, unreadCountLoading = false }: DownBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentPath = location.pathname;

  useEffect(() => {
    document.body.style.paddingBottom = 'calc(4.5rem + env(safe-area-inset-bottom))';
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, []);

  const prefetchRouteData = (key: string) => {
    if (key === '/') {
      void queryClient.prefetchQuery({
        queryKey: ['memories'],
        queryFn: getMemories,
      });
      void queryClient.prefetchQuery({
        queryKey: ['ideas'],
        queryFn: getIdeas,
      });
      return;
    }

    if (key === '/galleria') {
      void queryClient.prefetchInfiniteQuery({
        queryKey: ['galleryImages'],
        queryFn: async ({ pageParam = 1 }) => {
          const images = await getGalleryImages();
          const startIndex = ((pageParam as number) - 1) * 50;
          const endIndex = startIndex + 50;
          return {
            images: images.slice(startIndex, endIndex),
            nextPage: endIndex < images.length ? (pageParam as number) + 1 : undefined,
          };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: GalleryPrefetchPage) => lastPage.nextPage,
      });
      return;
    }

    if (key === '/mappa') {
      void queryClient.prefetchQuery({
        queryKey: ['mapImages'],
        queryFn: getMapImages,
      });
      return;
    }

    if (key === '/profilo' && user?.id) {
      void queryClient.prefetchQuery({
        queryKey: ['user-info', user.id],
        queryFn: () => getUserInfo(parseInt(user.id, 10)),
      });
    }
  };

  const activeKey = useMemo(() => {
    const matched = TAB_ITEMS.find((item) =>
      item.key === '/' ? currentPath === '/' : currentPath.startsWith(item.key)
    );
    return matched?.key ?? '/';
  }, [currentPath]);

  const handleTabClick = (key: string) => {
    prefetchRouteData(key);
    if (key !== activeKey) navigate(key);
  };

  return (
    <nav
      className="pwa-tab-bar fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2"
      aria-label="Navigazione principale"
    >
      <div
        className={cn(
          'flex w-full max-w-md items-center justify-between rounded-full px-2 py-1.5',
          'bg-[var(--bottom-nav-bg)] shadow-[var(--bottom-nav-shadow)]'
        )}
      >
        {TAB_ITEMS.map((item) => {
          const active = activeKey === item.key;
          const showBadge = item.key === '/profilo' && !unreadCountLoading && unreadCount > 0;

          if (item.isCentral) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabClick(item.key)}
                onMouseEnter={() => prefetchRouteData(item.key)}
                onTouchStart={() => prefetchRouteData(item.key)}
                className={cn(
                  'relative -translate-y-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full',
                  'bg-[var(--bottom-nav-bg)] text-white',
                  'shadow-xl',
                  'transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out)]',
                  'active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bottom-nav-bg)]'
                )}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className="material-symbols-outlined rotate-[-45deg] text-[1.75rem]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  aria-hidden
                >
                  {item.icon}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleTabClick(item.key)}
              onMouseEnter={() => prefetchRouteData(item.key)}
              onTouchStart={() => prefetchRouteData(item.key)}
              className={cn(
                'relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5',
                'transition-colors duration-[var(--duration-fast)]',
                active
                  ? 'bg-[var(--bottom-nav-item-active-bg)] text-[var(--text-primary)]'
                  : 'text-white/80 hover:text-white',
                'active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bottom-nav-bg)]'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className="material-symbols-outlined text-[1.5rem]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                aria-hidden
              >
                {item.icon}
              </span>
              {active && (
                <span className="text-[0.625rem] font-medium uppercase tracking-wide">
                  {item.label}
                </span>
              )}
              {showBadge && (
                <span
                  className="pointer-events-none absolute right-0 top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--color-accent-pink)] px-1 text-[10px] font-semibold text-white"
                  aria-hidden
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DownBar;
