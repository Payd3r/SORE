import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IoChevronForwardOutline, IoMoonOutline, IoNotificationsOutline, IoKeyOutline, IoTrashOutline, IoLogOutOutline, IoPersonOutline } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { getUserInfo, getCoupleInfo } from '../../api/profile';
import { getRecapData, getRecapConfronto, RecapStats, RecapConfronto } from '../../api/recap';
import { UserInfo, CoupleInfo } from '../../api/types';
import { getImageUrl } from '../../api/images';
import EditProfileModal from '../../desktop/components/Profile/EditProfileModal';
import DeleteAccountModal from '../../desktop/components/Profile/DeleteAccountModal';
import { ChangePassModal } from '../../desktop/components/Profile/ChangePassModal';
import { useIsPwa } from '../../utils/isPwa';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Button, Card, SegmentedControl } from '../components/ui';
import { HeaderActions, MobileHeader, MobilePageWrapper } from '../components/layout';
import { SkeletonProfileHeaderMobile, SkeletonStatsMobile } from '../components/skeletons';

type ProfileTab = 'profile' | 'couple' | 'stats';

const tabOptions: Array<{ key: ProfileTab; label: string }> = [
  { key: 'profile', label: 'Profilo' },
  { key: 'couple', label: 'Coppia' },
  { key: 'stats', label: 'Statistiche' }
];

export default function ProfileMobile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isPwaMode = useIsPwa();
  const { state: pushState, enablePush, disablePush } = usePushNotifications(isPwaMode);

  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? savedTheme === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const isDarkActive = document.documentElement.classList.contains('dark');
    if (isDarkActive !== darkMode) {
      setDarkMode(isDarkActive);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', nextMode.toString());
    window.dispatchEvent(new Event('themeChange'));
  };

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
      if (!user?.id) {
        throw new Error('Utente non autenticato');
      }
      return getUserInfo(parseInt(user.id, 10));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  const { data: coupleInfo, isLoading: isLoadingCouple } = useQuery<CoupleInfo>({
    queryKey: ['couple-info', userInfoData?.couple_id],
    queryFn: async () => {
      if (!userInfoData?.couple_id) {
        throw new Error('Nessuna coppia associata all\'utente');
      }
      return getCoupleInfo(userInfoData.couple_id);
    },
    enabled: !!userInfoData?.couple_id,
    staleTime: 5 * 60 * 1000
  });

  const { data: recapData, isLoading: isLoadingRecap } = useQuery<RecapStats>({
    queryKey: ['recap-data'],
    queryFn: getRecapData,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'stats'
  });

  const { data: confrontoData, isLoading: isLoadingConfronto } = useQuery<RecapConfronto>({
    queryKey: ['recap-confronto'],
    queryFn: getRecapConfronto,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'stats'
  });

  const partner = useMemo(() => {
    if (!coupleInfo?.membri || !user?.id) {
      return null;
    }
    return coupleInfo.membri.find((membro) => membro.id !== parseInt(user.id, 10)) ?? null;
  }, [coupleInfo?.membri, user?.id]);

  useEffect(() => {
    if (confrontoData?.data.users.length && !selectedUserId) {
      setSelectedUserId(confrontoData.data.users[0].id_utente);
    }
  }, [confrontoData, selectedUserId]);

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
      <MobileHeader title="Profilo" showBack={false} rightActions={<HeaderActions.Menu />} />

      <section className="space-y-4 pt-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--bg-input)]">
              {userInfoData.profile_picture_url ? (
                <img src={getImageUrl(userInfoData.profile_picture_url)} alt={userInfoData.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[var(--text-secondary)]">
                  {userInfoData.name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-[var(--text-primary)]">{userInfoData.name}</h2>
              <p className="truncate text-sm text-[var(--text-secondary)]">{userInfoData.email}</p>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Partner: {partner?.name ?? 'Non disponibile'}</p>
            </div>
          </div>
        </Card>

        <SegmentedControl value={activeTab} options={tabOptions} onChange={setActiveTab} />

        {activeTab === 'profile' && (
          <div className="space-y-3">
            <Card className="p-0">
              <SettingsRow
                icon={<IoPersonOutline className="h-4 w-4" />}
                label="Modifica profilo"
                onClick={() => setIsEditModalOpen(true)}
                withDivider
              />
              <SettingsRow
                icon={<IoKeyOutline className="h-4 w-4" />}
                label="Cambia password"
                onClick={() => setIsChangePassModalOpen(true)}
                withDivider
              />
              <SettingsRow
                icon={<IoNotificationsOutline className="h-4 w-4" />}
                label="Notifiche push"
                value={pushState.enabled ? 'Attive' : 'Disattive'}
                action={
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (pushState.loading) {
                        return;
                      }
                      if (pushState.enabled) {
                        void disablePush();
                      } else {
                        void enablePush();
                      }
                    }}
                    className={`h-6 w-11 rounded-full px-0.5 transition-colors ${
                      pushState.enabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-secondary)]'
                    }`}
                    aria-label="Toggle notifiche push"
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                        pushState.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                }
                withDivider
              />
              <SettingsRow
                icon={<IoMoonOutline className="h-4 w-4" />}
                label="Tema scuro"
                value={darkMode ? 'Attivo' : 'Disattivo'}
                action={
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleDarkMode();
                    }}
                    className={`h-6 w-11 rounded-full px-0.5 transition-colors ${
                      darkMode ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-secondary)]'
                    }`}
                    aria-label="Toggle tema scuro"
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                }
                withDivider
              />
              <SettingsRow
                icon={<IoTrashOutline className="h-4 w-4 text-red-500" />}
                label="Elimina account"
                onClick={() => setIsDeleteModalOpen(true)}
              />
            </Card>
          </div>
        )}

        {activeTab === 'couple' && (
          <div className="space-y-3">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Profilo coppia</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{coupleInfo.name}</p>
              {coupleInfo.anniversary_date && (
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                  Anniversario: {new Date(coupleInfo.anniversary_date).toLocaleDateString('it-IT')}
                </p>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Partner</h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-input)] text-sm font-semibold text-[var(--text-secondary)]">
                  {partner?.name?.[0] ?? 'P'}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{partner?.name ?? 'Partner'}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{partner?.email ?? 'Email non disponibile'}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-3">
            {(isLoadingRecap || isLoadingConfronto) && <SkeletonStatsMobile />}

            {recapData && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Panoramica</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <StatBox label="Ricordi" value={recapData.data.statistics.tot_ricordi ?? 0} />
                  <StatBox label="Foto" value={recapData.data.statistics.tot_foto ?? 0} />
                  <StatBox label="Idee" value={recapData.data.statistics.tot_idee ?? 0} />
                  <StatBox label="Luoghi" value={recapData.data.statistics.tot_luoghi ?? 0} />
                </div>
              </Card>
            )}

            {confrontoData && confrontoData.data.users.length > 0 && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Contributo utenti</h3>
                <div className="mt-3 flex gap-2">
                  {confrontoData.data.users.map((statUser) => (
                    <button
                      key={statUser.id_utente}
                      type="button"
                      onClick={() => setSelectedUserId(statUser.id_utente)}
                      className={
                        selectedUserId === statUser.id_utente
                          ? 'rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-[var(--text-inverse)]'
                          : 'rounded-full bg-[var(--bg-input)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]'
                      }
                    >
                      {statUser.nome_utente.split(' ')[0]}
                    </button>
                  ))}
                </div>
                {selectedUserId && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(() => {
                      const selected = confrontoData.data.users.find((entry) => entry.id_utente === selectedUserId);
                      if (!selected) {
                        return null;
                      }
                      return (
                        <>
                          <StatBox label="Ricordi" value={selected.tot_ricordi_creati} />
                          <StatBox label="Foto" value={selected.tot_images_create} />
                          <StatBox label="Idee" value={selected.tot_idee_create} />
                        </>
                      );
                    })()}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        <Button variant="secondary" fullWidth onClick={handleLogout} className="mt-3 text-red-500">
          <IoLogOutOutline className="h-4 w-4" />
          Logout
        </Button>
      </section>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          refreshUserData();
        }}
      />
      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} />
      <ChangePassModal
        isOpen={isChangePassModalOpen}
        onClose={() => {
          setIsChangePassModalOpen(false);
          refreshUserData();
        }}
      />
    </MobilePageWrapper>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  action,
  onClick,
  withDivider = false
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  action?: ReactNode;
  onClick?: () => void;
  withDivider?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between px-4 py-3 text-left ${withDivider ? 'border-b border-[var(--border-default)]' : ''}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-[var(--text-secondary)]">{icon}</span>
        <span className="truncate text-sm text-[var(--text-primary)]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-[var(--text-tertiary)]">{value}</span>}
        {action ?? <IoChevronForwardOutline className="h-4 w-4 text-[var(--text-tertiary)]" />}
      </div>
    </button>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-input bg-[var(--bg-input)] p-3 text-center">
      <p className="text-lg font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
    </div>
  );
}
