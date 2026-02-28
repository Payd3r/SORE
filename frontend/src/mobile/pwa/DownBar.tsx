import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  IoHomeOutline,
  IoHome,
  IoImageOutline,
  IoImage,
  IoMapOutline,
  IoMap,
  IoAddCircleOutline,
  IoAddCircle
} from 'react-icons/io5';
import { FixedBottomBar, type FixedBottomBarItemData } from '../components/layout';
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

const DownBar = ({ unreadCount = 0, unreadCountLoading = false }: DownBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentPath = location.pathname;

  useEffect(() => {
    document.body.style.paddingBottom = 'calc(64px + env(safe-area-inset-bottom))';
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
          const startIndex = (pageParam as number - 1) * 50;
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

  const items: FixedBottomBarItemData[] = useMemo(
    () => [
      {
        key: '/',
        label: 'Home',
        icon: <IoHomeOutline className="h-6 w-6" />,
        activeIcon: <IoHome className="h-6 w-6" />,
      },
      {
        key: '/galleria',
        label: 'Galleria',
        icon: <IoImageOutline className="h-6 w-6" />,
        activeIcon: <IoImage className="h-6 w-6" />,
      },
      {
        key: '/upload',
        label: 'Upload',
        icon: <IoAddCircleOutline className="h-7 w-7" />,
        activeIcon: <IoAddCircle className="h-7 w-7" />,
      },
      {
        key: '/mappa',
        label: 'Mappa',
        icon: <IoMapOutline className="h-6 w-6" />,
        activeIcon: <IoMap className="h-6 w-6" />,
      },
      {
        key: '/profilo',
        label: 'Profilo',
        icon: <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-tertiary)]" />,
        activeIcon: <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />,
        badge: unreadCountLoading ? 0 : unreadCount,
      },
    ],
    [unreadCount, unreadCountLoading]
  );

  const activeKey = useMemo(() => {
    const matched = items.find((item) => (item.key === '/' ? currentPath === '/' : currentPath.startsWith(item.key)));
    return matched?.key ?? '/';
  }, [currentPath, items]);

  return (
    <FixedBottomBar
      items={items}
      activeKey={activeKey}
      onPrefetch={prefetchRouteData}
      onChange={(key) => {
        prefetchRouteData(key);
        if (key !== activeKey) navigate(key);
      }}
    />
  );
};

export default DownBar; 