import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { getUserInfo, getCoupleInfo } from '../../api/profile';
import { MobileHeader, MobilePageWrapper } from '../components/layout';
import { SkeletonProfileHeaderMobile } from '../components/skeletons';

export default function CouplesConnectionMobile() {
  const { user } = useAuth();

  const { data: userInfoData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-info', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Utente non autenticato');
      return getUserInfo(parseInt(user.id, 10));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: coupleInfo, isLoading: isLoadingCouple } = useQuery({
    queryKey: ['couple-info', userInfoData?.couple_id],
    queryFn: async () => {
      if (!userInfoData?.couple_id) throw new Error('Nessuna coppia associata');
      return getCoupleInfo(userInfoData.couple_id);
    },
    enabled: !!userInfoData?.couple_id,
    staleTime: 5 * 60 * 1000,
  });

  const partner = useMemo(() => {
    if (!coupleInfo?.membri || !user?.id) return null;
    return coupleInfo.membri.find((m) => m.id !== parseInt(user.id, 10)) ?? null;
  }, [coupleInfo?.membri, user?.id]);

  if (isLoadingUser || isLoadingCouple) {
    return (
      <MobilePageWrapper accentBg>
        <MobileHeader title="Couples Connection" showBack />
        <div className="pt-4">
          <SkeletonProfileHeaderMobile />
        </div>
      </MobilePageWrapper>
    );
  }

  if (!userInfoData || !coupleInfo) {
    return (
      <MobilePageWrapper accentBg>
        <MobileHeader title="Couples Connection" showBack />
        <div className="flex min-h-[200px] items-center justify-center text-sm text-[var(--text-secondary)]">
          Nessun dato disponibile
        </div>
      </MobilePageWrapper>
    );
  }

  return (
    <MobilePageWrapper accentBg className="h-full overflow-auto pb-24">
      <MobileHeader title="Couples Connection" showBack />
      <section className="space-y-4 pt-4">
        <div className="rounded-card border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-md)]">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            Profilo coppia
          </h3>
          <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">{coupleInfo.name}</p>
          {coupleInfo.anniversary_date && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Anniversario: {new Date(coupleInfo.anniversary_date).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="rounded-card border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-md)]">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            Partner
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--bg-input)] text-sm font-semibold text-[var(--text-secondary)]">
              {partner?.name?.[0] ?? 'P'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)]">{partner?.name ?? 'Partner'}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{partner?.email ?? 'Email non disponibile'}</p>
            </div>
          </div>
        </div>
      </section>
    </MobilePageWrapper>
  );
}
