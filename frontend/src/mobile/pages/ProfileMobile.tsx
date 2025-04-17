
import { useAuth } from '../../contexts/AuthContext';
import { getUserInfo, getCoupleInfo } from '../../api/profile';
import { UserInfo, CoupleInfo } from '../../api/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../../desktop/components/Profile/EditProfileModal';
import DeleteAccountModal from '../../desktop/components/Profile/DeleteAccountModal';
import { ChangePassModal } from '../../desktop/components/Profile/ChangePassModal';
import { getImageUrl } from '../../api/images';
import Loader from '../../desktop/components/Layout/Loader';
import { getRecapData, getRecapConfronto, RecapStats, RecapConfronto } from '../../api/recap';
import { useEffect, useState, useCallback } from 'react';

export default function ProfileMobile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'couple' | 'stats'>('profile');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? savedTheme === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Verifica il tema corrente attivo nel documento
  useEffect(() => {
    const isDarkActive = document.documentElement.classList.contains('dark');
    if (isDarkActive !== darkMode) {
      setDarkMode(isDarkActive);
    }
  }, []);

  // Gestisce il cambio del tema
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', newDarkMode.toString());

    // Dispatch degli eventi per notificare altri componenti del cambio tema
    const themeChangeEvent = new Event('themeChange');
    window.dispatchEvent(themeChangeEvent);

    // Forzare un ridisegno del DOM e un controllo di tutti i componenti
    document.body.style.backgroundColor = newDarkMode ? "#000" : "#fff";
    setTimeout(() => {
      document.body.style.backgroundColor = "";
    }, 50);
  };

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Funzione per aggiornare i dati dell'utente
  const refreshUserData = useCallback(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['user-info', user.id] });
    }
  }, [queryClient, user?.id]);

  // Funzione per chiudere il modal e aggiornare i dati
  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    refreshUserData();
  }, [refreshUserData]);

  // Funzione per chiudere il modal di cambio password e aggiornare i dati
  const handlePasswordModalClose = useCallback(() => {
    setIsChangePassModalOpen(false);
    refreshUserData();
  }, [refreshUserData]);

  // React Query per il fetching dei dati dell'utente
  const { data: userInfoData, isLoading: isLoadingUser } = useQuery<UserInfo>({
    queryKey: ['user-info', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Utente non autenticato');
      return getUserInfo(parseInt(user.id));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  // React Query per il fetching dei dati della coppia
  const { data: coupleInfo, isLoading: isLoadingCouple } = useQuery<CoupleInfo>({
    queryKey: ['couple-info', userInfoData?.couple_id],
    queryFn: async () => {
      if (!userInfoData?.couple_id) throw new Error('Nessuna coppia associata all\'utente');
      return getCoupleInfo(userInfoData.couple_id);
    },
    enabled: !!userInfoData?.couple_id,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  // React Query per il fetching dei dati del recap
  const { data: recapData, isLoading: isLoadingRecap } = useQuery<RecapStats>({
    queryKey: ['recap-data'],
    queryFn: getRecapData,
    staleTime: 5 * 60 * 1000, // 5 minuti
    enabled: activeTab === 'stats',
  });

  // React Query per il fetching dei dati del confronto
  const { data: confrontoData, isLoading: isLoadingConfronto } = useQuery<RecapConfronto>({
    queryKey: ['recap-confronto'],
    queryFn: getRecapConfronto,
    staleTime: 5 * 60 * 1000, // 5 minuti
    enabled: activeTab === 'stats',
  });

  const isLoading = isLoadingUser || isLoadingCouple || isLoadingRecap || isLoadingConfronto;
  const error = !user?.id ? 'Utente non autenticato' :
    !userInfoData?.couple_id ? 'Nessuna coppia associata all\'utente' : null;

  // Trova il partner nella lista dei membri della coppia
  const getPartner = useCallback(() => {
    if (!coupleInfo?.membri || !user?.id) return null;
    return coupleInfo.membri.find(membro => membro.id !== parseInt(user.id));
  }, [coupleInfo, user]);

  const partner = getPartner();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[100000]">
        <Loader fullScreen text="Caricamento in corso..." subText="Stiamo preparando l'app per te" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F2F2F7] dark:bg-black">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!userInfoData || !coupleInfo) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F2F2F7] dark:bg-black">
        <div className="text-gray-900 dark:text-white">Nessun dato disponibile</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative pb-[19%]">
      {/* Contenuto principale - scrolling */}
      <div className="flex-1 overflow-auto py-4 px-4 pt-[32%]">
        {activeTab === 'profile' ? (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/40">
              <div className="flex flex-col items-center text-center relative">
                <div className="w-24 h-24 mb-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center text-xl text-blue-500 dark:text-blue-400 font-medium shadow-sm">
                  {
                    userInfoData.profile_picture_url
                      ? <img src={getImageUrl(userInfoData.profile_picture_url)} alt={userInfoData.name} className="w-full h-full rounded-full object-cover" />
                      : userInfoData.name[0]
                  }
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-1">{userInfoData.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {userInfoData.email}
                </p>

                <div className="space-y-2 mb-5 w-full">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Membro dal: {new Date(userInfoData.created_at).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>

                <button
                  onClick={toggleDarkMode}
                  className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 mb-4 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label={darkMode ? "Passa al tema chiaro" : "Passa al tema scuro"}
                >
                  {darkMode ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.32031 11.6835C3.32031 16.6541 7.34975 20.6835 12.3203 20.6835C16.1075 20.6835 19.3483 18.3443 20.6768 15.032C19.6402 15.4486 18.5059 15.6835 17.3203 15.6835C12.3497 15.6835 8.32031 11.6541 8.32031 6.68359C8.32031 5.49796 8.55517 4.36367 8.97181 3.32715C5.65957 4.65561 3.32031 7.89639 3.32031 11.6835Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <span>{darkMode ? "Passa al tema chiaro" : "Passa al tema scuro"}</span>
                </button>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-xl 
                    transition-all duration-200 text-sm"
                  >
                    Modifica profilo
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/40">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Privacy e sicurezza</h2>
              <div className="space-y-4">
                <div className="group hover:scale-[1.02] transition-all duration-200">
                  <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-700/40 backdrop-blur-sm">
                    <h3 className="text-base text-gray-800 dark:text-white font-medium mb-2">Cambia password</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Aggiorna la tua password per maggiore sicurezza</p>
                    <button
                      onClick={() => setIsChangePassModalOpen(true)}
                      className="w-full px-3 py-2.5 bg-blue-500/90 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-sm"
                    >
                      Cambia
                    </button>
                  </div>
                </div>
                <div className="group hover:scale-[1.02] transition-all duration-200">
                  <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-700/40 backdrop-blur-sm">
                    <h3 className="text-base text-gray-800 dark:text-white font-medium mb-2">Elimina account</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Elimina definitivamente il tuo account</p>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-full px-3 py-2.5 bg-red-500/90 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'couple' ? (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/40">
              <div className="flex flex-col items-center text-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">{coupleInfo.name}</h2>
                {coupleInfo.anniversary_date && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2 bg-gray-50/80 dark:bg-gray-700/40 backdrop-blur-sm px-4 py-2 rounded-xl text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Anniversario: {new Date(coupleInfo.anniversary_date).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                )}
                <p className="text-base text-gray-500 dark:text-gray-400">La vostra storia</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="group hover:scale-[1.02] transition-all duration-200">
                  <div className="bg-gradient-to-br from-blue-500/80 to-blue-600/80 backdrop-blur-sm p-4 rounded-xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-white mb-1">{coupleInfo.num_ricordi ?? 0}</div>
                    <div className="text-sm text-blue-50">Ricordi</div>
                  </div>
                </div>
                <div className="group hover:scale-[1.02] transition-all duration-200">
                  <div className="bg-gradient-to-br from-purple-500/80 to-purple-600/80 backdrop-blur-sm p-4 rounded-xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-white mb-1">{coupleInfo.num_foto ?? 0}</div>
                    <div className="text-sm text-purple-50">Foto</div>
                  </div>
                </div>
                <div className="group hover:scale-[1.02] transition-all duration-200">
                  <div className="bg-gradient-to-br from-green-500/80 to-green-600/80 backdrop-blur-sm p-4 rounded-xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-white mb-1">{coupleInfo.num_idee ?? 0}</div>
                    <div className="text-sm text-green-50">Idee</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/40">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Partner</h2>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-sm rounded-full flex items-center justify-center text-xl text-purple-500 dark:text-purple-400 font-medium shadow-sm">
                  {partner ? partner.name[0] : 'P'}
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                  {partner ? partner.name : 'Partner'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {partner ? partner.email : 'Email non disponibile'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {(isLoadingRecap || isLoadingConfronto) ? (
              <div className="flex justify-center items-center py-10">
                <Loader type="spinner" size="md" />
              </div>
            ) : (
              <>
                {/* Sezione Panoramica */}
                <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/40">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">La vostra storia</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-500/20 dark:bg-blue-900/30 backdrop-blur-sm p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-blue-500 mb-1">{recapData?.data.statistics.tot_ricordi || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Ricordi</div>
                    </div>
                    <div className="bg-purple-500/20 dark:bg-purple-900/30 backdrop-blur-sm p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-purple-500 mb-1">{recapData?.data.statistics.tot_foto || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Foto</div>
                    </div>
                    <div className="bg-yellow-500/20 dark:bg-yellow-900/30 backdrop-blur-sm p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-yellow-500 mb-1">{recapData?.data.statistics.tot_idee || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Idee</div>
                    </div>
                    <div className="bg-green-500/20 dark:bg-green-900/30 backdrop-blur-sm p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-green-500 mb-1">{recapData?.data.statistics.tot_luoghi || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Luoghi</div>
                    </div>
                  </div>
                </div>

                {/* Ricordi per tipo */}
                <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/40">
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    Ricordi per tipo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-24 text-sm text-gray-600 dark:text-gray-400">Viaggi</div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(recapData?.data.statistics.tot_ricordi_viaggi || 0) / (recapData?.data.statistics.tot_ricordi || 1) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-right text-sm text-gray-600 dark:text-gray-400">{recapData?.data.statistics.tot_ricordi_viaggi || 0}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 text-sm text-gray-600 dark:text-gray-400">Eventi</div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(recapData?.data.statistics.tot_ricordi_eventi || 0) / (recapData?.data.statistics.tot_ricordi || 1) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-right text-sm text-gray-600 dark:text-gray-400">{recapData?.data.statistics.tot_ricordi_eventi || 0}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 text-sm text-gray-600 dark:text-gray-400">Semplici</div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(recapData?.data.statistics.tot_ricordi_semplici || 0) / (recapData?.data.statistics.tot_ricordi || 1) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-right text-sm text-gray-600 dark:text-gray-400">{recapData?.data.statistics.tot_ricordi_semplici || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Confronto attività */}
                <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/40">
                  <h3 className="text-base font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-white">
                    Confronto attività
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    Chi contribuisce di più alla vostra storia
                  </p>

                  {confrontoData && confrontoData.data.users.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-24 text-sm text-gray-600 dark:text-gray-400">Ricordi</div>
                        <div className="flex-1">
                          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            {confrontoData.data.users.map((user, index) => (
                              <div
                                key={user.id_utente}
                                className={`h-full absolute top-0 ${index === 0 ? 'bg-blue-500 left-0' : 'bg-purple-500 right-0'}`}
                                style={{
                                  width: `${(user.tot_ricordi_creati / (confrontoData.data.totals.tot_ricordi || 1)) * 100}%`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-24 text-sm text-gray-600 dark:text-gray-400">Foto</div>
                        <div className="flex-1">
                          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            {confrontoData.data.users.map((user, index) => (
                              <div
                                key={user.id_utente}
                                className={`h-full absolute top-0 ${index === 0 ? 'bg-blue-500 left-0' : 'bg-purple-500 right-0'}`}
                                style={{
                                  width: `${(user.tot_images_create / (confrontoData.data.totals.tot_images || 1)) * 100}%`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-24 text-sm text-gray-600 dark:text-gray-400">Idee</div>
                        <div className="flex-1">
                          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            {confrontoData.data.users.map((user, index) => (
                              <div
                                key={user.id_utente}
                                className={`h-full absolute top-0 ${index === 0 ? 'bg-blue-500 left-0' : 'bg-purple-500 right-0'}`}
                                style={{
                                  width: `${(user.tot_idee_create / (confrontoData.data.totals.tot_idee || 1)) * 100}%`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {confrontoData.data.users.map((user) => (
                          <div key={user.id_utente} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${user.id_utente === confrontoData.data.users[0].id_utente ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                            {user.nome_utente.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats personali */}
                <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/40">
                  <h3 className="text-base font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-white">
                    Stats personali
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    Statistiche dettagliate per utente
                  </p>

                  {/* Tab per selezionare l'utente */}
                  {confrontoData && (
                    <div className="bg-gray-100/80 dark:bg-gray-700/40 backdrop-blur-sm rounded-lg p-1 flex mb-4 text-xs">
                      {confrontoData.data.users.map((user) => (
                        <button
                          key={user.id_utente}
                          onClick={() => setSelectedUserId(user.id_utente)}
                          className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all duration-200
                              focus:outline-none focus:ring-0
                              ${selectedUserId === user.id_utente
                              ? 'bg-blue-500/90 text-white shadow-sm'
                              : 'bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20 text-gray-600 dark:text-gray-400'}`}
                        >
                          {user.nome_utente.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Statistiche */}
                  {confrontoData && selectedUserId && (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {(() => {
                          const selectedUser = confrontoData.data.users.find(u => u.id_utente === selectedUserId);
                          if (!selectedUser) return null;

                          return (
                            <>
                              <div className="text-center bg-blue-500/20 dark:bg-blue-900/30 backdrop-blur-sm p-3 rounded-xl">
                                <div className="text-xl font-bold text-blue-500">{selectedUser.tot_ricordi_creati}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ricordi</div>
                              </div>
                              <div className="text-center bg-purple-500/20 dark:bg-purple-900/30 backdrop-blur-sm p-3 rounded-xl">
                                <div className="text-xl font-bold text-purple-500">{selectedUser.tot_images_create}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Foto</div>
                              </div>
                              <div className="text-center bg-yellow-500/20 dark:bg-yellow-900/30 backdrop-blur-sm p-3 rounded-xl">
                                <div className="text-xl font-bold text-yellow-500">{selectedUser.tot_idee_create}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Idee</div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controlli sovrapposti alle immagini */}
      <div className="absolute top-0 left-0 right-0 z-40 px-4 pt-14 pb-2">
        <div className="flex justify-center items-center">
          {/* Toggle visualizzazione al centro */}
          <div className="inline-flex items-center rounded-full bg-gray-200/70 dark:bg-gray-800/70 p-1.5 backdrop-blur-xl shadow-sm w-full">
            <button
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'profile'
                  ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                }`}
              onClick={() => setActiveTab('profile')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profilo</span>
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'couple'
                  ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                }`}
              onClick={() => setActiveTab('couple')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Coppia</span>
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'stats'
                  ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                }`}
              onClick={() => setActiveTab('stats')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* Effetto blur ultra fluido con approccio avanzato */}
      <div
        className="absolute top-0 left-0 right-0 z-30 pointer-events-none h-[120px]"
        style={{
          background: 'transparent',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          backdropFilter: 'blur(16px)'
        }}
      ></div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      <ChangePassModal
        isOpen={isChangePassModalOpen}
        onClose={handlePasswordModalClose}
      />
    </div>
  );
} 