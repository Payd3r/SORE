import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserInfo, getCoupleInfo } from '../api/profile';
import { UserInfo, CoupleInfo } from '../api/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tab } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../components/Profile/EditProfileModal';
import DeleteAccountModal from '../components/Profile/DeleteAccountModal';
import { ChangePassModal } from '../components/Profile/ChangePassModal';
import { getImageUrl } from '../api/images';


const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Funzione per aggiornare i dati dell'utente
    const refreshUserData = () => {
        if (user?.id) {
            queryClient.invalidateQueries({ queryKey: ['user-info', user.id] });
        }
    };

    // Funzione per chiudere il modal e aggiornare i dati
    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        refreshUserData();
    };

    // Funzione per chiudere il modal di cambio password e aggiornare i dati
    const handlePasswordModalClose = () => {
        setIsChangePassModalOpen(false);
        refreshUserData();
    };

    // React Query per il fetching dei dati dell'utente
    const { data: userInfo, isLoading: isLoadingUser } = useQuery<UserInfo>({
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
        queryKey: ['couple-info', userInfo?.couple_id],
        queryFn: async () => {
            if (!userInfo?.couple_id) throw new Error('Nessuna coppia associata all\'utente');
            return getCoupleInfo(userInfo.couple_id);
        },
        enabled: !!userInfo?.couple_id,
        staleTime: 5 * 60 * 1000, // 5 minuti
    });

    const isLoading = isLoadingUser || isLoadingCouple;
    const error = !user?.id ? 'Utente non autenticato' :
        !userInfo?.couple_id ? 'Nessuna coppia associata all\'utente' : null;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-16 h-16 mb-4">
                    <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Caricamento in corso...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Stiamo caricando il tuo profilo</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-900">
                <div className="text-red-600 dark:text-red-400">{error}</div>
            </div>
        );
    }

    if (!userInfo || !coupleInfo) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-900">
                <div className="text-gray-900 dark:text-white">Nessun dato disponibile</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-transparent">
            <div className="relative max-w-7xl mx-auto">
                {/* Safe area per la notch */}
                <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>
                <div className="mx-2 sm:mx-0 px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
                    <div className="max-w-[2000px] mx-auto space-y-4 sm:space-y-6">
                        <div className="mb-4 lg:mb-12">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-0 lg:mb-3">Profilo</h1>
                            <p className="hidden sm:block text-sm lg:text-base text-gray-500 dark:text-gray-400">Gestisci il tuo profilo e le impostazioni dell'account</p>
                        </div>

                        <Tab.Group>
                            <Tab.List className="tab-menu">
                                <Tab
                                    className={({ selected }) =>
                                        `tab-menu-item ${selected ? 'tab-menu-item-active' : 'tab-menu-item-inactive'
                                        }`
                                    }
                                >
                                    Profilo
                                </Tab>
                                <Tab
                                    className={({ selected }) =>
                                        `tab-menu-item ${selected ? 'tab-menu-item-active' : 'tab-menu-item-inactive'
                                        }`
                                    }
                                >
                                    Coppia
                                </Tab>
                            </Tab.List>

                            <Tab.Panels className="w-full max-w-[2000px] mx-auto">
                                <Tab.Panel className="w-full">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mt-4 sm:mt-6">
                                        <div className="lg:col-span-2">
                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-gray-200 dark:border-gray-700">
                                                <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 dark:text-white mb-6 lg:mb-8">Informazioni personali</h2>
                                                <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-8">
                                                    <div className="w-32 h-32 lg:w-48 lg:h-48 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center text-2xl lg:text-3xl text-blue-500 dark:text-blue-400 font-medium shadow-sm">
                                                        {
                                                            userInfo.profile_picture_url
                                                                ? <img src={getImageUrl(userInfo.profile_picture_url)} alt={userInfo.name} className="w-full h-full rounded-2xl object-cover" />
                                                                : userInfo.name[0]}
                                                    </div>
                                                    <div className="flex-1 text-center md:text-left">
                                                        <h3 className="text-xl lg:text-2xl font-medium text-gray-800 dark:text-white mb-2">{userInfo.name}</h3>
                                                        <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-4">
                                                            {userInfo.email}
                                                        </p>
                                                        <div className="space-y-2 mb-6 lg:mb-8">
                                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm lg:text-base">
                                                                <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                <span>Tema preferito: {userInfo.theme_preference === 'system' ? 'Sistema' : userInfo.theme_preference === 'light' ? 'Chiaro' : 'Scuro'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm lg:text-base">
                                                                <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                <span>Membro dal: {new Date(userInfo.created_at).toLocaleDateString('it-IT', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-center md:justify-start gap-3 lg:gap-4 w-full">
                                                            <button
                                                                onClick={() => {
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 lg:py-2.5 px-4 lg:px-6 rounded-xl 
                                                                transition-all duration-200 outline-none focus:outline-none active:outline-none text-sm lg:text-base"
                                                            >
                                                                Modifica profilo
                                                            </button>
                                                            <button
                                                                onClick={handleLogout}
                                                                className="flex-1 px-4 lg:px-6 py-2 lg:py-2.5 bg-red-500 text-white text-sm lg:text-base font-medium rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-1.5 lg:gap-2 outline-none focus:outline-none active:outline-none"
                                                            >
                                                                <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                Logout
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-1">
                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-gray-200 dark:border-gray-700">
                                                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-4 lg:mb-6">Privacy e sicurezza</h2>
                                                <div className="space-y-3 lg:space-y-4">
                                                    <div className="group hover:scale-[1.02] transition-all duration-200">
                                                        <div className="p-4 lg:p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                                            <h3 className="text-base lg:text-lg text-gray-800 dark:text-white font-medium mb-1.5 lg:mb-2">Cambia password</h3>
                                                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-3 lg:mb-4">Aggiorna la tua password per maggiore sicurezza</p>
                                                            <button
                                                                onClick={() => setIsChangePassModalOpen(true)}
                                                                className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow outline-none focus:outline-none active:outline-none"
                                                            >
                                                                Cambia
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="group hover:scale-[1.02] transition-all duration-200">
                                                        <div className="p-4 lg:p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                                            <h3 className="text-base lg:text-lg text-gray-800 dark:text-white font-medium mb-1.5 lg:mb-2">Elimina account</h3>
                                                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-3 lg:mb-4">Elimina definitivamente il tuo account</p>
                                                            <button
                                                                onClick={() => setIsDeleteModalOpen(true)}
                                                                className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow outline-none focus:outline-none active:outline-none"
                                                            >
                                                                Elimina
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Panel>

                                <Tab.Panel className="w-full">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mt-4 sm:mt-6">
                                        <div className="lg:col-span-2">
                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-gray-200 dark:border-gray-700">
                                                <div className="flex flex-col items-center text-center mb-3 lg:mb-6">
                                                    <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-white mb-3 lg:mb-4">{coupleInfo.name}</h2>
                                                    {coupleInfo.anniversary_date && (
                                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1 lg:mb-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl text-sm lg:text-base">
                                                            <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span>Anniversario: {new Date(coupleInfo.anniversary_date).toLocaleDateString('it-IT', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}</span>
                                                        </div>
                                                    )}
                                                    <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400">La vostra storia</p>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 lg:gap-6">
                                                    <div className="group hover:scale-[1.02] transition-all duration-200">
                                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 lg:p-8 rounded-xl lg:rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                                                            <div className="text-2xl lg:text-4xl font-bold text-white mb-1 lg:mb-3">{coupleInfo.num_ricordi ?? 0}</div>
                                                            <div className="text-sm lg:text-lg text-blue-50">Ricordi</div>
                                                        </div>
                                                    </div>
                                                    <div className="group hover:scale-[1.02] transition-all duration-200">
                                                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 lg:p-8 rounded-xl lg:rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                                                            <div className="text-2xl lg:text-4xl font-bold text-white mb-1 lg:mb-3">{coupleInfo.num_foto ?? 0}</div>
                                                            <div className="text-sm lg:text-lg text-purple-50">Foto</div>
                                                        </div>
                                                    </div>
                                                    <div className="group hover:scale-[1.02] transition-all duration-200">
                                                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-4 lg:p-8 rounded-xl lg:rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                                                            <div className="text-2xl lg:text-4xl font-bold text-white mb-1 lg:mb-3">{coupleInfo.num_idee ?? 0}</div>
                                                            <div className="text-sm lg:text-lg text-pink-50">Idee</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-1">
                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-gray-200 dark:border-gray-700">
                                                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-4 lg:mb-6">Membri</h2>
                                                <div className="space-y-3 lg:space-y-4">
                                                    {coupleInfo.membri && coupleInfo.membri.map((membro, index) => (
                                                        <div key={index} className="group hover:scale-[1.02] transition-all duration-200">
                                                            <div className={`flex items-center gap-3 lg:gap-4 ${membro.id === userInfo.id ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700/50'} p-4 lg:p-5 rounded-xl`}>
                                                                <div className={`w-12 h-12 lg:w-16 lg:h-16 ${membro.id === userInfo.id ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500 dark:to-blue-600'} rounded-xl flex items-center justify-center text-xl lg:text-2xl ${membro.id === userInfo.id ? 'text-white' : 'text-blue-500 dark:text-white'} font-medium`}>
                                                                    {membro.name[0]}
                                                                </div>
                                                                <div>
                                                                    <div className={`text-base lg:text-lg font-medium ${membro.id === userInfo.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'}`}>{membro.name}</div>
                                                                    <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{membro.email}</div>
                                                                    {membro.id === userInfo.id && (
                                                                        <div className="mt-1.5 lg:mt-2 inline-flex items-center gap-1 lg:gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-medium px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-lg">
                                                                            <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="currentColor" />
                                                                            </svg>
                                                                            Tu
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </div>

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
};

export default Profile; 