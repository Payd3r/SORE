import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMemories, type Memory } from '../../api/memory';
import { getIdeas, type Idea } from '../../api/ideas';
import { getUserInfo, getCoupleInfo } from '../../api/profile';
import { useAuth } from '../../contexts/AuthContext';
import { usePullToRefresh } from '../gestures';
import IdeaDetailBottomSheet from '../components/home/IdeaDetailBottomSheet';
import { MobilePageWrapper } from '../components/layout';
import { PullToRefreshIndicator } from '../components/ui';
import {
  HomeHeader,
  HomeUploadBar,
  FeaturedTrips,
  OurIdeas,
  MonthlyHighlightCard,
  LatestMemories,
} from '../components/home';

export default function HomeMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (location.state?.openNotifications) {
      setShowNotificationsDropdown(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openNotifications, location.pathname, navigate]);

  const { data: memories = [], isLoading: memoriesLoading, refetch: refetchMemories } = useQuery<Memory[]>({
    queryKey: ['memories'],
    queryFn: getMemories,
  });

  const { data: ideas = [], isLoading: ideasLoading, refetch: refetchIdeas } = useQuery<Idea[]>({
    queryKey: ['ideas'],
    queryFn: getIdeas,
  });

  const { data: userInfo } = useQuery({
    queryKey: ['user-info', user?.id],
    queryFn: () => getUserInfo(parseInt(user!.id, 10)),
    enabled: Boolean(user?.id),
  });

  const { data: coupleInfo } = useQuery({
    queryKey: ['couple-info', userInfo?.couple_id],
    queryFn: () => getCoupleInfo(userInfo!.couple_id!),
    enabled: Boolean(userInfo?.couple_id),
  });

  const togetherDays =
    coupleInfo?.anniversary_date != null
      ? Math.floor(
          (Date.now() - new Date(coupleInfo.anniversary_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const refreshAll = async () => {
    await Promise.all([refetchMemories(), refetchIdeas()]);
  };

  const pullToRefresh = usePullToRefresh({
    enabled: true,
    onRefresh: refreshAll,
  });

  const handleReviewNow = () => {
    navigate('/galleria');
  };

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto"
      onTouchStart={(e) => pullToRefresh.onTouchStart(e, scrollRef.current?.scrollTop ?? 0)}
      onTouchMove={(e) => pullToRefresh.onTouchMove(e, scrollRef.current?.scrollTop ?? 0)}
      onTouchEnd={pullToRefresh.onTouchEnd}
    >
      <MobilePageWrapper accentBg className="pb-[max(6rem,calc(5rem+env(safe-area-inset-bottom)))]">
        <PullToRefreshIndicator
          pullDistance={pullToRefresh.pullDistance}
          className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-[var(--color-home-accent)]/30 transition-all"
        />

        <HomeHeader
          userName={userInfo?.name ?? 'Lovers'}
          avatarUrl={userInfo?.profile_picture_url ?? user?.profile_picture_url}
          profileDisplayName={coupleInfo?.name ?? userInfo?.name ?? 'Lovers'}
          togetherDays={togetherDays}
          isNotificationsOpen={showNotificationsDropdown}
          onNotificationsClose={() => setShowNotificationsDropdown(false)}
          onNotificationsClick={() => {
            setShowProfileDropdown(false);
            setShowNotificationsDropdown(true);
          }}
          isProfileOpen={showProfileDropdown}
          onProfileClose={() => setShowProfileDropdown(false)}
          onProfileClick={() => {
            setShowNotificationsDropdown(false);
            setShowProfileDropdown(true);
          }}
        />

        <div className="mt-4 space-y-6">
          <HomeUploadBar />

          <FeaturedTrips memories={memories} isLoading={memoriesLoading} />

          <LatestMemories memories={memories} isLoading={memoriesLoading} />

          <OurIdeas
            ideas={ideas}
            isLoading={ideasLoading}
            onOpenIdea={setSelectedIdea}
            onSeeAll={() => navigate('/galleria')}
          />

          <MonthlyHighlightCard memories={memories} onReview={handleReviewNow} />
        </div>
      </MobilePageWrapper>

      <IdeaDetailBottomSheet
        idea={selectedIdea}
        isOpen={Boolean(selectedIdea)}
        onClose={() => setSelectedIdea(null)}
      />
    </div>
  );
}
