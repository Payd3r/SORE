import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpenIcon,
  PhotoIcon,
  LightBulbIcon,
  MapIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  MapPinIcon,
  ChevronRightIcon,
  HeartIcon,
  BookmarkIcon,
  CalendarDaysIcon,
  GlobeEuropeAfricaIcon,
  BeakerIcon,
  CameraIcon,
  FilmIcon,
  GiftIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  StarIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState, useMemo } from 'react';
import { getHomeData, HomeStats } from '../api/home';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { getImageUrl } from '../api/images';

const Home = () => {
  const [homeData, setHomeData] = useState<HomeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const data = await getHomeData();
        setHomeData(data);
      } catch (err) {
        setError('Errore nel caricamento dei dati');
        console.error('Errore nel caricamento dei dati della home:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const quickActions = [
    {
      name: 'Nuovo Ricordo',
      icon: PlusIcon,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Carica Immagini',
      icon: ArrowUpTrayIcon,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      name: 'Nuova Idea',
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

  const formatDateRange = (startDate: Date, endDate: Date | null) => {
    const start = format(new Date(startDate), 'd', { locale: it });
    if (!endDate) return start;
    const end = format(new Date(endDate), 'd MMMM', { locale: it });
    return `${start} - ${end}`;
  };

  const getRandomIcon = (category: string) => {
    const iconsByCategory = {
      vacanza: [
        { icon: GlobeEuropeAfricaIcon, color: 'text-blue-600 dark:text-blue-400' },
        { icon: MapPinIcon, color: 'text-blue-600 dark:text-blue-400' },
        { icon: BeakerIcon, color: 'text-blue-600 dark:text-blue-400' },
        { icon: SunIcon, color: 'text-blue-600 dark:text-blue-400' }
      ],
      weekend: [
        { icon: CalendarDaysIcon, color: 'text-yellow-600 dark:text-yellow-400' },
        { icon: HomeIcon, color: 'text-yellow-600 dark:text-yellow-400' },
        { icon: StarIcon, color: 'text-yellow-600 dark:text-yellow-400' },
        { icon: TicketIcon, color: 'text-yellow-600 dark:text-yellow-400' }
      ],
      default: [
        { icon: CameraIcon, color: 'text-purple-600 dark:text-purple-400' },
        { icon: FilmIcon, color: 'text-purple-600 dark:text-purple-400' },
        { icon: GiftIcon, color: 'text-purple-600 dark:text-purple-400' },
        { icon: MoonIcon, color: 'text-purple-600 dark:text-purple-400' }
      ]
    };

    let categoryIcons;
    if (category.includes('vacanza')) {
      categoryIcons = iconsByCategory.vacanza;
    } else if (category.includes('weekend')) {
      categoryIcons = iconsByCategory.weekend;
    } else {
      categoryIcons = iconsByCategory.default;
    }

    // Use the ricordo id to get a consistent icon for each ricordo
    const randomIndex = Math.floor(Math.random() * categoryIcons.length);
    return categoryIcons[randomIndex];
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 mb-4">
          <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Caricamento in corso...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Stiamo preparando i tuoi ricordi</p>
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
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-0 left-0 right-0 h-[100px] sm:h-[200px] bg-gradient-to-b from-blue-600/10 dark:from-blue-500/10 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-[2000px] mx-auto space-y-4 sm:space-y-6">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-blue-950 dark:via-gray-800 dark:to-purple-950" />

            {/* Content */}
            <div className="relative p-4 sm:p-8 bg-white dark:bg-gray-800/80 sm:bg-white/50 sm:dark:bg-gray-800/50 backdrop-blur-sm">
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">
                {getGreeting()}, <span className="text-blue-600 dark:text-blue-400">{user?.name || 'Utente'}</span>!
              </h1>
              <p className="text-sm sm:text-base text-gray-800 dark:text-gray-300 mb-4 sm:mb-6">
                Benvenuto nei tuoi ricordi speciali
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    onClick={
                      action.name === 'Nuovo Ricordo'
                        ? handleNewMemoryClick
                        : action.name === 'Carica Immagini'
                          ? handleUploadImagesClick
                          : action.name === 'Nuova Idea'
                            ? handleNewIdeaClick
                            : undefined
                    }
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-700 sm:bg-white/90 sm:dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg text-xs sm:text-sm flex-1 sm:flex-initial justify-center shadow-sm"
                  >
                    <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.color}`} />
                    <span className="text-gray-800 dark:text-gray-200">{action.name}</span>
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
                  className="group block p-3 sm:p-5 rounded-xl bg-white/80 dark:bg-transparent border border-gray-200/80 dark:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-3">
                    <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-xl sm:rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${item.name === 'Ricordi' ? 'text-blue-400 dark:text-blue-400' :
                          item.name === 'Galleria' ? 'text-purple-400 dark:text-purple-400' :
                            item.name === 'Idee' ? 'text-yellow-400 dark:text-yellow-400' :
                              'text-green-400 dark:text-green-400'
                        }`} />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg sm:text-base font-semibold text-gray-900 dark:text-white group-hover:translate-x-1 transition-transform">{item.name}</h2>
                      <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats and Highlights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Stats Section */}
            {stats.length > 0 && (
              <div className="lg:col-span-2 bg-white/80 dark:bg-transparent rounded-xl border border-gray-200/80 dark:border-white/10 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">La vostra storia</h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Inizia la vostra avventura insieme</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className={`p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer ${stat.label === 'Ricordi' ? 'bg-blue-50 dark:bg-blue-950/50' :
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
                <button className="w-full sm:w-auto mt-4 sm:mt-6 px-4 py-2 text-xs sm:text-sm bg-transparent border border-gray-200/80 dark:border-white/10 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all duration-300 text-center hover:scale-105 rounded-lg">
                  Vedi tutte le statistiche
                </button>
              </div>
            )}

            {/* Highlights Section */}
            {ricordi.length > 0 && (
              <div className="bg-white/80 dark:bg-transparent rounded-xl border border-gray-200/80 dark:border-white/10 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">In evidenza</h2>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {ricordi.map((ricordo) => {
                    const { icon: IconComponent, color } = getRandomIcon(ricordo.title.toLowerCase());
                    return (
                      <div
                        key={ricordo.id}
                        onClick={() => handleRicordoClick(ricordo.id)}
                        className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-gray-200/10 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer hover:translate-x-1"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200/50 dark:bg-white/10 flex items-center justify-center">
                            <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">{ricordo.title}</h3>
                          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                            {formatDateRange(ricordo.data_inizio, ricordo.data_fine)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Recent Photos Section */}
          {images.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2 sm:mb-4 px-1">
                <h2 className="text-lg sm:text-2xl font-semibold">Foto recenti</h2>
                <Link to="/galleria" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all duration-300">
                  Vedi tutte <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-4">
                {images.slice(0, 6).map((image) => (
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
  );
};

export default Home; 