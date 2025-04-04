import { Link, useNavigate, } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpenIcon,
  PhotoIcon,
  LightBulbIcon,
  MapIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ChevronRightIcon,
  HeartIcon,
  BookmarkIcon,
  CheckIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { getHomeData, HomeStats } from '../api/home';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { getImageUrl } from '../api/images';
import { getTrackDetails, SpotifyTrack } from '../api/spotify';
import { FaSpotify } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: homeData, isLoading, error } = useQuery<HomeStats, Error>({
    queryKey: ['homeData'],
    queryFn: getHomeData,
    staleTime: 5 * 60 * 1000, // 5 minuti
    gcTime: 30 * 60 * 1000, // 30 minuti
  });

  const { data: songDetails = {} } = useQuery<Record<string, SpotifyTrack>, Error>({
    queryKey: ['songDetails', homeData?.data?.Songs],
    queryFn: async () => {
      if (!homeData?.data?.Songs) return {};

      const songDetailsMap: Record<string, SpotifyTrack> = {};

      // Processa ogni canzone in sequenza
      for (const song of homeData.data.Songs) {
        try {
          // Estrai il titolo dalla stringa completa (rimuovi artista e album)
          const title = song.title.split(' - ')[0];
          const details = await getTrackDetails(title);

          if (details) {
            // Usa il titolo completo come chiave univoca
            songDetailsMap[song.title] = details;
          }
        } catch (error) {
          console.error(`Errore nel recupero dei dettagli per la canzone ${song.title}:`, error);
        }
      }

      return songDetailsMap;
    },
    enabled: !!homeData?.data?.Songs,
    staleTime: 5 * 60 * 1000, // 5 minuti
    gcTime: 30 * 60 * 1000, // 30 minuti
  });

  const quickActions = [
    {
      name: 'Ricordo',
      longName: 'Nuovo Ricordo',
      icon: PlusIcon,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Immagini',
      longName: 'Carica Immagini',
      icon: ArrowUpTrayIcon,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      name: 'Idea',
      longName: 'Nuova Idea',
      icon: LightBulbIcon,
      color: 'text-yellow-600 dark:text-yellow-400'
    },
  ];

  const exploreItems = [
    {
      name: 'Ricordi',
      description: 'Salva i momenti speciali con la tua persona amata',
      icon: BookOpenIcon,
      link: '/ricordi',
      color: 'bg-blue-100 dark:bg-blue-500/10'
    },
    {
      name: 'Galleria',
      description: 'Visualizza e organizza le tue fotografie insieme',
      icon: PhotoIcon,
      link: '/galleria',
      color: 'bg-purple-100 dark:bg-purple-500/10'
    },
    {
      name: 'Idee',
      description: 'Pianifica nuove avventure e cose da fare insieme',
      icon: LightBulbIcon,
      link: '/idee',
      color: 'bg-yellow-100 dark:bg-yellow-500/10'
    },
    {
      name: 'Mappa',
      description: 'Esplora i luoghi visitati e pianifica nuove mete',
      icon: MapIcon,
      link: '/mappa',
      color: 'bg-green-100 dark:bg-green-500/10'
    }
  ];

  const stats = useMemo(() => {
    if (!homeData?.data) return [];

    return [
      { label: 'Ricordi', value: homeData.data.num_ricordi.toString(), color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
      { label: 'Foto', value: homeData.data.num_foto.toString(), color: 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' },
      { label: 'Idee', value: homeData.data.num_idee.toString(), color: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
      { label: 'Luoghi', value: homeData.data.num_luoghi.toString(), color: 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' }
    ];
  }, [homeData]);

  const ricordi = useMemo(() => homeData?.data?.Ricordi ?? [], [homeData]);
  const images = useMemo(() => homeData?.data?.Images ?? [], [homeData]);
  const ideas = useMemo(() => homeData?.data?.Ideas ?? [], [homeData]);

  const formatDateRange = (startDate: Date, endDate: Date | null) => {
    const start = format(new Date(startDate), 'd MMMM', { locale: it });
    
    if (!endDate) return start;
    
    // Se le date sono uguali, mostra solo una data
    if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      return start;
    }
    
    // Se il mese è lo stesso, mostra solo il giorno per la prima data
    if (format(startDate, 'MM-yyyy') === format(endDate, 'MM-yyyy')) {
      return `${format(startDate, 'd')} - ${format(endDate, 'd MMMM', { locale: it })}`;
    }
    
    // Se i mesi sono diversi, mostra il mese per entrambe le date
    return `${start} - ${format(endDate, 'd MMMM', { locale: it })}`;
  };


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Buongiorno";
    if (hour >= 12 && hour < 18) return "Buon pomeriggio";
    return "Buonasera";
  };

  const handleNewMemoryClick = () => {
    navigate('/ricordi', { state: { openUploadModal: true } });
  };

  const handleUploadImagesClick = () => {
    navigate('/galleria', { state: { openUploadModal: true } });
  };

  const handleNewIdeaClick = () => {
    navigate('/idee', { state: { openUploadModal: true } });
  };

  const handleRicordoClick = (ricordoId: number) => {
    navigate(`/ricordo/${ricordoId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-transparent">
        <div className="relative max-w-7xl mx-auto">
          <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>
          <div className="px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
            <div className="max-w-[2000px] mx-auto space-y-4 sm:space-y-6">
              {/* Quick Actions con skeleton */}
              <div className="px-4 sm:px-6 py-6">
                <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-blue-950 dark:via-gray-800 dark:to-purple-950" />
                  <div className="relative p-4 sm:p-8 bg-white dark:bg-gray-800/80 sm:bg-white/50 sm:dark:bg-gray-800/50 backdrop-blur-sm">
                    <div className="animate-pulse">
                      <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                      <div className="flex gap-2 sm:gap-4">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explore con skeleton */}
              <div className="px-4 sm:px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-3 sm:p-5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-white/10">
                      <div className="animate-pulse">
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="absolute top-0 left-0 right-0 h-[100px] sm:h-[200px] bg-gradient-to-b from-blue-600/10 dark:from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-[2000px] mx-auto space-y-4 sm:space-y-6">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️</div>
                <p className="text-red-600 dark:text-red-400">{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen pb-[30px] sm:pb-[150px] overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 h-[100px] sm:h-[200px] bg-gradient-to-b from-blue-600/10 dark:bg-gray-900 pointer-events-none z-0" />
      <div className="relative max-w-7xl mx-auto z-10">
        {/* Safe area per la notch */}
        <div className="fixed inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent pointer-events-none"></div>
        <div className="px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0 overflow-y-auto -webkit-overflow-scrolling-touch">
          <div className="max-w-[2000px] mx-auto space-y-4 sm:space-y-6 relative">
            {/* Quick Actions */}
            <div className="px-4 sm:px-6 py-6">
              <div className="mb-4 sm:mb-8 relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-blue-950 dark:via-gray-800 dark:to-purple-950" />

                {/* Content */}
                <div className="relative p-4 sm:p-8 bg-white dark:bg-gray-800/80 sm:bg-white/50 sm:dark:bg-gray-800/50 backdrop-blur-sm">
                  <h1 className="text-2xl sm:text-4xl font-bold mb-2">
                    {getGreeting()}, <span className="text-blue-600 dark:text-blue-400">{user?.name || 'Utente'}</span>!
                  </h1>
                  <p className="hidden sm:block text-sm sm:text-base text-gray-800 dark:text-gray-300 mb-4 sm:mb-6">
                    Benvenuto nei tuoi ricordi speciali
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:gap-4">
                    {quickActions.map((action) => (
                      <button
                        key={action.name}
                        onClick={
                          action.longName === 'Nuovo Ricordo'
                            ? handleNewMemoryClick
                            : action.longName === 'Carica Immagini'
                              ? handleUploadImagesClick
                              : action.longName === 'Nuova Idea'
                                ? handleNewIdeaClick
                                : undefined
                        }
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-700 sm:bg-white/90 sm:dark:bg-gray-700/90 sm:hover:bg-white dark:sm:hover:bg-gray-600 transition-all duration-300 sm:hover:scale-105 sm:hover:shadow-lg text-xs sm:text-sm flex-1 sm:flex-initial justify-center shadow-sm"
                      >
                        <action.icon className={`w-5 h-5 sm:w-5 sm:h-5 ${action.color}`} />
                        <span className="text-gray-800 dark:text-gray-200">
                          <span className="hidden sm:inline">{action.longName}</span>
                          <span className="sm:hidden">{action.name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Explore Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6 px-1">
                  <h2 className="text-xl sm:text-2xl font-semibold">Esplora</h2>
                  <Link to="/ricordi" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all duration-300 hover:opacity-80">
                    Vedi tutti <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {exploreItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.link}
                      className="group block p-2 sm:p-5 rounded-xl bg-white/80 dark:bg-transparent border-2 border-gray-200/80 dark:border-white/10 sm:hover:bg-white/5 dark:sm:hover:bg-white/5 transition-all duration-300 sm:hover:scale-[1.02] sm:hover:shadow-xl"
                    >
                      <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-3">
                        <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-xl sm:rounded-lg flex items-center justify-center transition-all duration-300 sm:group-hover:scale-110 sm:group-hover:rotate-3`}>
                          <item.icon className={`w-8 h-8 sm:w-8 sm:h-8 ${item.name === 'Ricordi' ? 'text-blue-400 dark:text-blue-400' :
                            item.name === 'Galleria' ? 'text-purple-400 dark:text-purple-400' :
                              item.name === 'Idee' ? 'text-yellow-400 dark:text-yellow-400' :
                                'text-green-400 dark:text-green-400'
                            }`} />
                        </div>
                        <div className="text-center sm:text-left">
                          <h2 className="sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:translate-x-1 transition-transform">{item.name}</h2>
                          <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Stats and Highlights Section */}
              <div className="space-y-4 sm:space-y-6 mb-5">
                {/* Row 1: Highlights and Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                  {/* Highlights Section - col-span-8 */}
                  {ricordi.length > 0 && (
                    <div className="lg:col-span-8 bg-white/90 dark:bg-transparent rounded-xl border-2 border-gray-200/80 dark:border-white/10 p-4 sm:p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Ultimi Ricordi</h2>
                        </div>
                        <Link to="/ricordi" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all duration-300">
                          Vedi tutti <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                        {ricordi.slice(0, 6).map((ricordo: any) => (
                          <div
                            key={ricordo.id}
                            onClick={() => handleRicordoClick(ricordo.id)}
                            className="flex items-center gap-3 sm:p-2 p-0  rounded-lg bg-gray-200/10 dark:bg-white/5 sm:hover:bg-white/10 dark:sm:hover:bg-white/10 transition-all duration-300 cursor-pointer sm:hover:translate-y-[-2px]"
                          >
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden">
                              <img
                                src={getImageUrl(ricordo.image)}
                                alt={ricordo.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate mb-1">{ricordo.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {formatDateRange(new Date(ricordo.data_inizio), ricordo.data_fine ? new Date(ricordo.data_fine) : null)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Section - col-span-4 */}
                  {stats.length > 0 && (
                    <div className="lg:col-span-4 bg-white/80 dark:bg-transparent rounded-xl border-2 border-gray-200/80 dark:border-white/10 p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">La vostra storia</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:mt-8">
                        {stats.map((stat) => (
                          <div
                            key={stat.label}
                            className={`p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center sm:hover:scale-105 transition-all duration-300 cursor-pointer ${stat.label === 'Ricordi' ? 'bg-blue-50 dark:bg-blue-950/50' :
                              stat.label === 'Foto' ? 'bg-purple-50 dark:bg-[#2D1B69]/50' :
                                stat.label === 'Idee' ? 'bg-yellow-50 dark:bg-[#392C1B]/50' :
                                  'bg-green-50 dark:bg-[#1B392C]/50'
                              }`}
                          >
                            <div className={`text-2xl sm:text-3xl font-bold mb-1 ${stat.label === 'Ricordi' ? 'text-blue-600 dark:text-blue-400' :
                              stat.label === 'Foto' ? 'text-purple-600 dark:text-purple-400' :
                                stat.label === 'Idee' ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-green-600 dark:text-green-400'
                              }`}>
                              {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 2: Songs and Ideas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                  {/* Songs Section - col-span-4 */}
                  {homeData?.data?.Songs && homeData.data.Songs.length > 0 && (
                    <div className="lg:col-span-4 bg-white/90 dark:bg-transparent rounded-xl border-2 border-gray-200/80 dark:border-white/10 p-4 sm:p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MusicalNoteIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Ultime Canzoni</h2>
                        </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {homeData.data.Songs.map((song) => {
                          const trackDetails = songDetails[song.title];
                          return (
                            <div
                              key={song.title}
                              className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-gray-200/10 dark:bg-white/5 sm:hover:bg-white/10 dark:sm:hover:bg-white/10 transition-all duration-300 cursor-pointer sm:hover:translate-x-1"
                            >
                              <div className="flex-shrink-0">
                                {trackDetails ? (
                                  <img
                                    src={trackDetails.album.images[2]?.url || trackDetails.album.images[0]?.url}
                                    alt={`${trackDetails.name} album cover`}
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg shadow-sm"
                                  />
                                ) : (
                                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <MusicalNoteIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                                  {trackDetails?.name || song.title}
                                </h3>
                                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {trackDetails ? trackDetails.artists.map(a => a.name).join(', ') : song.artist}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 truncate">
                                  {trackDetails?.album.name || song.album}
                                </p>
                              </div>
                              {trackDetails?.external_urls?.spotify && (
                                <a
                                  href={trackDetails.external_urls.spotify}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1DB954] hover:bg-[#1ed760] transition-colors focus:outline-none"
                                >
                                  <FaSpotify className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ideas Section - col-span-8 */}
                  {ideas.length > 0 && (
                    <div className="lg:col-span-8 bg-white/90 dark:bg-transparent rounded-xl border-2 border-gray-200/80 dark:border-white/10 p-4 sm:p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <LightBulbIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Ultime Sfide</h2>
                        </div>
                        <Link to="/idee" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all duration-300">
                          Vedi tutte <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {ideas.map((idea: any) => (
                          <div
                            key={idea.id}
                            className="flex flex-col p-2 sm:p-3 rounded-lg bg-gray-200/10 dark:bg-white/5 sm:hover:bg-white/10 dark:sm:hover:bg-white/10 transition-all duration-300 cursor-pointer sm:hover:translate-y-[-2px]"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${idea.completed_at
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-yellow-100 dark:bg-yellow-900/30'
                                }`}>
                                {idea.completed_at ? (
                                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <LightBulbIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">{idea.title}</h3>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
                                  {format(new Date(idea.created_at), 'd MMMM yyyy', { locale: it })}
                                </p>
                              </div>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {idea.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Photos Section */}
              {images.length > 0 && (
                <div className="bg-white/90 dark:bg-transparent rounded-xl border-2 border-gray-200/80 dark:border-white/10 p-4 sm:p-6 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2 sm:mb-4 px-1">
                    <h2 className="text-lg sm:text-2xl font-semibold">Foto recenti</h2>
                    <Link to="/galleria" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all duration-300">
                      Vedi tutte <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-4">
                    {images.slice(0, 6).map((image: any) => (
                      <div
                        key={image.id}
                        className="aspect-square rounded-md sm:rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        <img
                          src={getImageUrl(image.image)}
                          alt={`Foto del ${format(new Date(image.created_at), 'd MMMM yyyy', { locale: it })}`}
                          className="w-full h-full object-cover hover:scale-110 transition-all duration-500"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 