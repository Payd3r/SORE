import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { getUserInfo, getCoupleInfo, updateUserInfo } from '../../api/profile';
import { getRecapData, RecapStats } from '../../api/recap';
import { getMapImages } from '../../api/map';
import { UserInfo, CoupleInfo } from '../../api/types';
import EditProfileModal from '../../desktop/components/Profile/EditProfileModal';
import { useIsPwa } from '../../utils/isPwa';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { MobileHeader, MobilePageWrapper } from '../components/layout';
import {
  ProfileHeader,
  JourneyCards,
  TogetherForCard,
  SettingsMenuRow,
} from '../components/profile';
import { SkeletonProfileHeaderMobile, SkeletonStatsMobile } from '../components/skeletons';
import Card from '../components/ui/Card';
import { ToggleSwitch } from '../components/ui';
import MaterialIcon from '../components/ui/MaterialIcon';

function getDaysTogether(anniversaryDate: string | null | undefined): number {
  if (!anniversaryDate) return 0;
  const start = new Date(anniversaryDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - start) / 86400000));
}

export default function ProfileMobile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isPwaMode = useIsPwa();
  const { state: pushState, enablePush, disablePush } = usePushNotifications(isPwaMode);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [darkModeState, setDarkModeState] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const sync = () =>
      setDarkModeState(document.documentElement.classList.contains('dark'));
    sync();
    window.addEventListener('themeChange', sync);
    return () => window.removeEventListener('themeChange', sync);
  }, []);

  const toggleDarkMode = useCallback(async () => {
    const nextMode = !document.documentElement.classList.contains('dark');
    const themeValue = nextMode ? 'dark' : 'light';

    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setDarkModeState(nextMode);
    localStorage.setItem('darkMode', nextMode.toString());
    window.dispatchEvent(new Event('themeChange'));

    if (user?.id) {
      try {
        const updated = await updateUserInfo({ theme_preference: themeValue });
        updateUser({ ...user, theme_preference: updated.theme_preference });
      } catch {
        // Fallback: keep local state
      }
    }
  }, [user, updateUser]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/welcome');
  }, [logout, navigate]);

  const refreshUserData = useCallback(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['user-info', user.id] });
    }
  }, [queryClient, user?.id]);

  const { data: userInfoData, isLoading: isLoadingUser } = useQuery<UserInfo>({
    queryKey: ['user-info', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Utente non autenticato');
      return getUserInfo(parseInt(user.id, 10));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: coupleInfo, isLoading: isLoadingCouple } = useQuery<CoupleInfo>({
    queryKey: ['couple-info', userInfoData?.couple_id],
    queryFn: async () => {
      if (!userInfoData?.couple_id) throw new Error('Nessuna coppia associata');
      return getCoupleInfo(userInfoData.couple_id);
    },
    enabled: !!userInfoData?.couple_id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: recapData } = useQuery<RecapStats>({
    queryKey: ['recap-data'],
    queryFn: getRecapData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: mapImages } = useQuery({
    queryKey: ['map-images'],
    queryFn: getMapImages,
    staleTime: 5 * 60 * 1000,
  });

  const partner = useMemo(() => {
    if (!coupleInfo?.membri || !user?.id) return null;
    return coupleInfo.membri.find((m) => m.id !== parseInt(user.id, 10)) ?? null;
  }, [coupleInfo?.membri, user?.id]);

  const displayName = coupleInfo?.name ?? [userInfoData?.name, partner?.name].filter(Boolean).join(' & ') ?? 'Lovers';
  const daysTogether = getDaysTogether(coupleInfo?.anniversary_date ?? null);
  const countriesCount = useMemo(() => {
    if (!mapImages?.length) return 0;
    const countries = new Set(mapImages.map((img) => img.country).filter(Boolean));
    return countries.size;
  }, [mapImages]);

  const memoriesCount = recapData?.data?.statistics?.tot_ricordi ?? 0;
  const tripsCount = recapData?.data?.statistics?.tot_ricordi_viaggi ?? 0;

  if (isLoadingUser || isLoadingCouple) {
    return (
      <MobilePageWrapper accentBg>
        <div className="space-y-4">
          <SkeletonProfileHeaderMobile />
          <SkeletonStatsMobile />
        </div>
      </MobilePageWrapper>
    );
  }

  if (!user?.id || !userInfoData || !coupleInfo) {
    return (
      <MobilePageWrapper accentBg>
        <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
          Nessun dato disponibile
        </div>
      </MobilePageWrapper>
    );
  }

  return (
    <MobilePageWrapper accentBg className="h-full overflow-auto pb-24">
      <MobileHeader title="Profilo" showBack={false} />

      <section className="space-y-6 pt-4">
        <ProfileHeader
          avatarUrl={userInfoData.profile_picture_url}
          displayName={displayName}
          anniversaryDate={coupleInfo.anniversary_date}
          onEditPhoto={() => setIsEditModalOpen(true)}
        />

        <JourneyCards
          memoriesCount={memoriesCount}
          tripsCount={tripsCount}
          countriesCount={countriesCount}
        />

        <TogetherForCard
          daysTogether={daysTogether}
          storageUsed="24.5 GB / 50 GB"
          storagePercent={49}
        />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            Profile
          </h3>
          <Card className="divide-y divide-[var(--border-default)] p-0">
            <SettingsMenuRow
              icon={<MaterialIcon name="person" size={20} className="text-[var(--color-primary)]" />}
              iconBgClass="bg-[var(--color-primary)]/15"
              label="Account Details"
              onClick={() => setIsEditModalOpen(true)}
              withDivider
            />
            <SettingsMenuRow
              icon={<MaterialIcon name="favorite" size={20} className="text-[var(--color-accent-pink)]" />}
              iconBgClass="bg-[var(--color-accent-pink)]/15"
              label="Couples Connection"
              onClick={() => navigate('/profilo/coppia')}
              withDivider
            />
            <SettingsMenuRow
              icon={<MaterialIcon name="notifications" size={20} className="text-[var(--color-link)]" />}
              iconBgClass="bg-[var(--color-link)]/15"
              label="Notifications"
              action={
                <ToggleSwitch
                  checked={pushState.enabled}
                  onChange={() => {
                    if (pushState.loading) return;
                    if (pushState.enabled) void disablePush();
                    else void enablePush();
                  }}
                  disabled={pushState.loading}
                  aria-label="Toggle notifiche"
                />
              }
            />
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            Preferences
          </h3>
          <Card className="divide-y divide-[var(--border-default)] p-0">
            <SettingsMenuRow
              icon={<MaterialIcon name="shield" size={20} className="text-[var(--idea-badge-emerald-text)]" />}
              iconBgClass="bg-[var(--idea-badge-emerald-bg)]"
              label="Privacy & Security"
              onClick={() => navigate('/profilo/privacy')}
              withDivider
            />
            <SettingsMenuRow
              icon={<MaterialIcon name="share" size={20} className="text-[var(--color-primary)]" />}
              iconBgClass="bg-[var(--color-primary)]/15"
              label="Share Space"
              onClick={() => navigate('/profilo/condivisione')}
            />
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            Support
          </h3>
          <Card className="divide-y divide-[var(--border-default)] p-0">
            <SettingsMenuRow
              icon={<MaterialIcon name="help" size={20} className="text-[var(--text-tertiary)]" />}
              iconBgClass="bg-[var(--bg-input)]"
              label="Help Center"
              onClick={() => navigate('/profilo/aiuto')}
            />
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            Display
          </h3>
          <Card className="divide-y divide-[var(--border-default)] p-0">
            <SettingsMenuRow
              icon={<MaterialIcon name="dark_mode" size={20} className="text-[var(--text-secondary)]" />}
              iconBgClass="bg-[var(--bg-input)]"
              label="Dark Mode"
              action={
                <ToggleSwitch
                  checked={darkModeState}
                  onChange={() => void toggleDarkMode()}
                  aria-label="Toggle Dark Mode"
                />
              }
            />
          </Card>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-card bg-[var(--color-danger)] py-3.5 font-semibold uppercase text-white shadow-md transition-colors active:opacity-90"
        >
          <MaterialIcon name="logout" size={20} />
          Log out
        </button>
      </section>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          refreshUserData();
        }}
      />
    </MobilePageWrapper>
  );
}
