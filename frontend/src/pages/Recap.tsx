import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { getRecapData, getRecapConfronto, RecapStats, RecapConfronto } from '../api/recap';
import { getTrackDetails, SpotifyTrack } from '../api/spotify';
import { useQuery } from '@tanstack/react-query';
import {
    BookOpenIcon,
    PhotoIcon,
    LightBulbIcon,
    MapPinIcon,
    MusicalNoteIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const Recap: React.FC = () => {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [songDetails, setSongDetails] = useState<Record<string, SpotifyTrack>>({});

    // React Query per il fetching dei dati del recap
    const { data: recapData, isLoading: isLoadingRecap } = useQuery<RecapStats>({
        queryKey: ['recap-data'],
        queryFn: getRecapData,
        staleTime: 5 * 60 * 1000, // 5 minuti
    });

    // React Query per il fetching dei dati del confronto
    const { data: confrontoData, isLoading: isLoadingConfronto } = useQuery<RecapConfronto>({
        queryKey: ['recap-confronto'],
        queryFn: getRecapConfronto,
        staleTime: 5 * 60 * 1000, // 5 minuti
    });

    // React Query per il fetching dei dettagli delle canzoni
    const { data: songDetailsData } = useQuery<Record<string, SpotifyTrack>>({
        queryKey: ['song-details', recapData?.data.canzoni],
        queryFn: async () => {
            if (!recapData?.data.canzoni) return {};
            const details = await Promise.all(
                recapData.data.canzoni.slice(0, 8).map(async (canzone) => {
                    const details = await getTrackDetails(canzone.song);
                    return details ? { [canzone.song]: details } : {};
                })
            );
            return details.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        },
        enabled: !!recapData?.data.canzoni,
        staleTime: 5 * 60 * 1000, // 5 minuti
    });

    const isLoading = isLoadingRecap || isLoadingConfronto;
    const error = !recapData || !confrontoData ? 'Errore nel caricamento dei dati' : null;

    // Imposta l'utente selezionato di default al primo utente quando i dati sono disponibili
    React.useEffect(() => {
        if (confrontoData?.data.users[0]?.id_utente) {
            setSelectedUserId(confrontoData.data.users[0].id_utente);
        }
    }, [confrontoData]);

    // Aggiorna i dettagli delle canzoni quando cambiano
    React.useEffect(() => {
        if (songDetailsData) {
            setSongDetails(songDetailsData);
        }
    }, [songDetailsData]);

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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Stiamo preparando il tuo riepilogo</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-red-500 dark:text-red-400">{error}</div>
            </div>
        );
    }

    const stats = [
        {
            name: 'Ricordi',
            value: recapData?.data.statistics.tot_ricordi || 0,
            icon: BookOpenIcon,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10 dark:bg-blue-500/20'
        },
        {
            name: 'Foto',
            value: recapData?.data.statistics.tot_foto || 0,
            icon: PhotoIcon,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10 dark:bg-purple-500/20'
        },
        {
            name: 'Idee',
            value: recapData?.data.statistics.tot_idee || 0,
            icon: LightBulbIcon,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/20'
        },
        {
            name: 'Luoghi',
            value: recapData?.data.statistics.tot_luoghi || 0,
            icon: MapPinIcon,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10 dark:bg-green-500/20'
        }
    ];

    return (
        <div className="min-h-screen bg-transparent">
            <div className="relative max-w-7xl mx-auto">
                {/* Safe area per la notch */}
                <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>
                <div className="mx-2 sm:mx-0 px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
                    <div className="mb-10 sm:mb-6">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Recap</h1>
                        <p className="hidden sm:block text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 sm:pb-4">Statistiche e analisi dei vostri ricordi insieme</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="-mt-6 pb-8">
                        <Tab.Group>
                            <Tab.List className="tab-menu">
                                <Tab className={({ selected }) => `
                                    tab-menu-item
                                    ${selected ? 'tab-menu-item-active' : 'tab-menu-item-inactive'}
                                `}>
                                    Panoramica
                                </Tab>
                                <Tab className={({ selected }) => `
                                    tab-menu-item
                                    ${selected ? 'tab-menu-item-active' : 'tab-menu-item-inactive'}
                                `}>
                                    Attività
                                </Tab>
                                <Tab className={({ selected }) => `
                                    tab-menu-item
                                    ${selected ? 'tab-menu-item-active' : 'tab-menu-item-inactive'}
                                `}>
                                    Confronto
                                </Tab>
                            </Tab.List>

                            <Tab.Panels className="mt-4 sm:mt-8 focus:outline-none focus:ring-0 space-y-4 sm:space-y-6">
                                <Tab.Panel className="focus:outline-none focus:ring-0">
                                    {/* La vostra storia */}
                                    <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                                        <h2 className="text-lg sm:text-xl font-semibold mb-4">La vostra storia</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4">
                                            {stats.map((stat) => (
                                                <div
                                                    key={stat.name}
                                                    className={`rounded-lg p-3 sm:p-4 text-center transition-all duration-200 hover:scale-105 ${stat.bgColor}`}
                                                >
                                                    <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 ${stat.color}`} />
                                                    <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">{stat.value}</div>
                                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
                                        {/* Ricordi per tipo */}
                                        <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm md:col-span-2 border-2 border-gray-200 dark:border-gray-700">
                                            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                                <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                                Ricordi per tipo
                                            </h3>
                                            <div className="space-y-3 sm:space-y-4">
                                                <div className="flex items-center">
                                                    <div className="w-24 text-sm">Viaggi</div>
                                                    <div className="flex-1">
                                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full"
                                                                style={{ width: `${(recapData?.data.statistics.tot_ricordi_viaggi || 0) / (recapData?.data.statistics.tot_ricordi || 1) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-8 text-right text-sm">{recapData?.data.statistics.tot_ricordi_viaggi}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-24 text-sm">Eventi</div>
                                                    <div className="flex-1">
                                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-purple-500 rounded-full"
                                                                style={{ width: `${(recapData?.data.statistics.tot_ricordi_eventi || 0) / (recapData?.data.statistics.tot_ricordi || 1) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-8 text-right text-sm">{recapData?.data.statistics.tot_ricordi_eventi}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-24 text-sm">Semplici</div>
                                                    <div className="flex-1">
                                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 rounded-full"
                                                                style={{ width: `${(recapData?.data.statistics.tot_ricordi_semplici || 0) / (recapData?.data.statistics.tot_ricordi || 1) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-8 text-right text-sm">{recapData?.data.statistics.tot_ricordi_semplici}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Idee e progetti */}
                                        <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                                            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                                <LightBulbIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                                                Idee e progetti
                                            </h3>
                                            <div className="flex items-center justify-around text-center">
                                                <div>
                                                    <div className="text-3xl font-bold text-green-500">{recapData?.data.statistics.tot_idee_checked}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completate</div>
                                                </div>
                                                <div>
                                                    <div className="text-3xl font-bold text-yellow-500">{recapData?.data.statistics.tot_idee_unchecked}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Da fare</div>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${(recapData?.data.statistics.tot_idee_checked || 0) / (recapData?.data.statistics.tot_idee || 1) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400">
                                                    Progresso totale
                                                </div>
                                            </div>
                                        </div>

                                        {/* Luoghi più visitati */}
                                        <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                                            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                                <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                                Luoghi più visitati
                                            </h3>
                                            <div className="space-y-2 sm:space-y-3">
                                                {recapData?.data.luoghi.slice(0, 5).map((luogo, index) => (
                                                    <div key={luogo.location} className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium">{luogo.location}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Canzoni dei ricordi */}
                                        <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm md:col-span-2 border-2 border-gray-200 dark:border-gray-700">
                                            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                                <MusicalNoteIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                                                Canzoni dei ricordi
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {recapData?.data.canzoni.slice(0, 8).map((canzone) => {
                                                    const trackDetails = songDetails[canzone.song];
                                                    return (
                                                        <a
                                                            key={canzone.song}
                                                            href={trackDetails?.external_urls.spotify}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                                        >
                                                            {trackDetails ? (
                                                                <img
                                                                    src={trackDetails.album.images[2]?.url}
                                                                    alt={trackDetails.album.name}
                                                                    className="w-10 h-10 rounded-md shadow-sm"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                                                    <MusicalNoteIcon className="w-5 h-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium truncate">
                                                                    {trackDetails?.name || canzone.song}
                                                                </div>
                                                                {trackDetails && (
                                                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                        {trackDetails.artists.map(a => a.name).join(', ')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Panel>

                                <Tab.Panel className="focus:outline-none focus:ring-0">
                                    {/* Contenuto Attività */}
                                    <div className="space-y-6">
                                        {/* Contenuto da aggiungere */}
                                    </div>
                                </Tab.Panel>

                                <Tab.Panel className="focus:outline-none focus:ring-0">
                                    {/* Contenuto Confronto */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        {/* Confronto attività */}
                                        <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                                            <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
                                                <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                                Confronto attività
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                                                Chi contribuisce di più alla vostra storia
                                            </p>
                                            <div className="space-y-6 sm:space-y-8">
                                                {confrontoData?.data.users.map((user) => (
                                                    <div key={user.id_utente} className="space-y-3 sm:space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm sm:font-medium">
                                                                {user.nome_utente.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm sm:font-medium">{user.nome_utente}</div>
                                                            </div>
                                                        </div>

                                                        {/* Ricordi creati */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 text-sm">Ricordi creati</div>
                                                            <div className="flex-1">
                                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                                        style={{ width: `${(user.tot_ricordi_creati / (confrontoData?.data.totals.tot_ricordi || 1)) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="w-12 text-right text-sm">{user.tot_ricordi_creati}</div>
                                                        </div>

                                                        {/* Foto caricate */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 text-sm">Foto caricate</div>
                                                            <div className="flex-1">
                                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                                                        style={{ width: `${(user.tot_images_create / (confrontoData?.data.totals.tot_images || 1)) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="w-12 text-right text-sm">{user.tot_images_create}</div>
                                                        </div>

                                                        {/* Idee proposte e completate */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-24 text-sm">Idee proposte</div>
                                                                <div className="flex-1">
                                                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                                                                            style={{ width: `${(user.tot_idee_create / (confrontoData?.data.totals.tot_idee || 1)) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="w-12 text-right text-sm">{user.tot_idee_create}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Stats personali */}
                                        <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                                            <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
                                                <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                                Stats personali
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                                                Statistiche dettagliate per utente
                                            </p>

                                            {/* Tab per selezionare l'utente */}
                                            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1 flex mb-4 sm:mb-6 text-xs sm:text-sm">
                                                {confrontoData?.data.users.map((user) => (
                                                    <button
                                                        key={user.id_utente}
                                                        onClick={() => setSelectedUserId(user.id_utente)}
                                                        className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-md font-medium transition-all duration-200
                                                            focus:outline-none focus:ring-0
                                                            ${selectedUserId === user.id_utente
                                                                ? 'bg-blue-500 text-white shadow-sm'
                                                                : 'bg-transparent hover:bg-white/10 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'}`}
                                                    >
                                                        {user.nome_utente.split(' ')[0]}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Statistiche */}
                                            {confrontoData && selectedUserId && (
                                                <>
                                                    <div className="grid grid-cols-4 gap-4 mb-8">
                                                        {(() => {
                                                            const selectedUser = confrontoData.data.users.find(u => u.id_utente === selectedUserId);
                                                            if (!selectedUser) return null;

                                                            return (
                                                                <>
                                                                    <div className="text-center">
                                                                        <div className="text-2xl font-bold text-blue-500">{selectedUser.tot_ricordi_creati}</div>
                                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ricordi</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="text-2xl font-bold text-purple-500">{selectedUser.tot_images_create}</div>
                                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Foto</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="text-2xl font-bold text-yellow-500">{selectedUser.tot_idee_create}</div>
                                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Idee</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="text-2xl font-bold text-green-500">-</div>
                                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Preferiti</div>
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>

                                                    {/* Contributi */}
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium mb-2">Contributi</h4>
                                                        <div className="space-y-2">
                                                            {(() => {
                                                                const selectedUser = confrontoData.data.users.find(u => u.id_utente === selectedUserId);
                                                                if (!selectedUser) return null;

                                                                return (
                                                                    <>
                                                                        <div>
                                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Percentuale ricordi creati</div>
                                                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-blue-500 rounded-full"
                                                                                    style={{ width: `${(selectedUser.tot_ricordi_creati / (confrontoData.data.totals.tot_ricordi || 1)) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Percentuale foto caricate</div>
                                                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-purple-500 rounded-full"
                                                                                    style={{ width: `${(selectedUser.tot_images_create / (confrontoData.data.totals.tot_images || 1)) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Percentuale idee proposte</div>
                                                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-yellow-500 rounded-full"
                                                                                    style={{ width: `${(selectedUser.tot_idee_create / (confrontoData.data.totals.tot_idee || 1)) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                        </div>
                                    </div>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recap; 