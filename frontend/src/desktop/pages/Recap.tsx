import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { getRecapData, getRecapConfronto, getRecapAttivita, RecapStats, RecapConfronto, RecapAttivita } from '../../api/recap';
import { getTrackDetails, SpotifyTrack } from '../../api/spotify';
import { useQuery } from '@tanstack/react-query';
import {
    BookOpenIcon,
    PhotoIcon,
    LightBulbIcon,
    MapPinIcon,
    MusicalNoteIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { getImageUrl } from '../../api/images';
import Loader from '../components/Layout/Loader';

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

    // React Query per il fetching dei dati dell'attività
    const { data: attivitaData, isLoading: isLoadingAttivita } = useQuery<RecapAttivita>({
        queryKey: ['recap-attivita'],
        queryFn: getRecapAttivita,
        staleTime: 5 * 60 * 1000, // 5 minuti
    });

    const isLoading = isLoadingRecap || isLoadingConfronto || isLoadingAttivita;
    const error = !recapData || !confrontoData ? 'Errore nel caricamento dei dati' : null;

    // Imposta l'utente selezionato di default al primo utente quando i dati sono disponibili
    useEffect(() => {
        if (confrontoData?.data.users[0]?.id_utente) {
            setSelectedUserId(confrontoData.data.users[0].id_utente);
        }
    }, [confrontoData]);

    // Aggiorna i dettagli delle canzoni quando cambiano
    useEffect(() => {
        if (songDetailsData) {
            setSongDetails(songDetailsData);
        }
    }, [songDetailsData]);

    if (isLoading) {
        return <Loader type="spinner" size="lg" fullScreen text="Caricamento in corso..." subText="Stiamo preparando l'app per te" />;
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
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Sezione Immagini Recenti */}
                                        <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-2 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4 flex items-center gap-2">
                                                <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                                                Immagini Recenti
                                            </h3>
                                            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-4">
                                                {attivitaData?.data.images.map((image) => (
                                                    <div
                                                        key={image.id}
                                                        className="aspect-square rounded-lg overflow-hidden group relative"
                                                    >
                                                        <img
                                                            src={getImageUrl(image.thumb_big_path)}
                                                            alt={`Immagine ${image.id}`}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <div className="absolute bottom-1 left-1 right-1">
                                                                <div className="text-[10px] sm:text-xs text-white">
                                                                    {image.type === 'coppia' ? 'Coppia' : 
                                                                     image.type === 'singolo' ? 'Singolo' : 'Paesaggio'}
                                                                </div>
                                                                <div className="text-[8px] sm:text-[10px] text-white/80">
                                                                    di {image.created_by_user_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sezione Ricordi Recenti */}
                                        <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-2 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4 flex items-center gap-2">
                                                <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                                Ricordi Recenti
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                                                {attivitaData?.data.memories.map((memory) => (
                                                    <div
                                                        key={memory.id}
                                                        className="bg-white/50 dark:bg-gray-700/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300"
                                                    >
                                                        <div className="aspect-[30/9] sm:aspect-video relative">
                                                            <img
                                                                src={getImageUrl(memory.thumb_big_path)}
                                                                alt={`Ricordo ${memory.id}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute top-1 right-1">
                                                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium
                                                                    ${memory.type === 'viaggio' ? 'bg-blue-500/90 text-white' :
                                                                      memory.type === 'evento' ? 'bg-purple-500/90 text-white' :
                                                                      'bg-green-500/90 text-white'}`}>
                                                                    {memory.type === 'viaggio' ? 'Viaggio' :
                                                                     memory.type === 'evento' ? 'Evento' : 'Semplice'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="p-2">
                                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                                {memory.start_date && new Date(memory.start_date).toLocaleDateString('it-IT', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}
                                                                {memory.end_date && ` - ${new Date(memory.end_date).toLocaleDateString('it-IT', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}`}
                                                            </div>
                                                            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                di {memory.created_by_user_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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