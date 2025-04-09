import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Map from '../components/Maps/Map';
import { getMapImages } from '../api/map';
import { PhotoIcon, GlobeAltIcon, CalendarIcon, ChartBarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Loader from '../components/Loader';

type StatsType = {
  countries: { name: string; count: number }[];
  totalCountries: number;
  monthStats: { month: string; count: number }[];
};

export default function Mappa() {
  const location = useLocation();
  const mapState = location.state as {
    latitude?: number;
    longitude?: number;
    imageId?: string;
    imagePath?: string;
    zoom?: number;
    focusedImage?: boolean;
  } | null;

  const { data: images = [], isLoading, error: queryError } = useQuery({
    queryKey: ['mapImages'],
    queryFn: getMapImages,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  const error = queryError ? queryError.message : null;

  // Calcola le statistiche dai dati
  const stats: StatsType = {
    countries: [],
    totalCountries: 0,
    monthStats: []
  };

  if (images.length > 0) {
    const countriesCount: Record<string, number> = {};
    const monthsCount: Record<string, number> = {};

    images.forEach(img => {
      // Calcola statistiche per paese
      countriesCount[img.country] = (countriesCount[img.country] || 0) + 1;

      // Calcola statistiche per mese
      const date = new Date(img.created_at);
      const month = date.toLocaleString('it-IT', { month: 'long' });
      monthsCount[month] = (monthsCount[month] || 0) + 1;
    });

    stats.countries = Object.entries(countriesCount).map(([name, count]) => ({ name, count }));
    stats.totalCountries = Object.keys(countriesCount).length;
    stats.monthStats = Object.entries(monthsCount).map(([month, count]) => ({ month, count }));
  }

  return (
    <div className="min-h-screen bg-transparent pb-[30px] sm:pb-[180px]">
      <div className="relative max-w-7xl mx-auto">
        {/* Safe area per la notch */}
        <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>
        <div className="mx-2 sm:mx-0 px-2 sm:px-6 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          {/* Header Section */}
          <div className="mb-4 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">            
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Mappa dei Ricordi</h1>
            </div>
            <p className="hidden sm:block text-gray-600 dark:text-gray-300">
              Esplora i tuoi momenti speciali attraverso il mondo
            </p>
          </div>

          {/* Map Container */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8 relative z-[1]">
            <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full relative">
              {isLoading && (
                <Loader type="spinner" size="md" text="Caricamento in corso..." subText="Stiamo preparando la tua mappa" />
              )}
              {!isLoading && (
                <Map
                  images={images}
                  isLoading={isLoading}
                  error={error}
                  initialLocation={mapState ? {
                    lat: mapState.latitude,
                    lon: mapState.longitude,
                    zoom: mapState.zoom || 18,
                    imageId: mapState.imageId,
                    imagePath: mapState.imagePath,
                    focusedImage: mapState.focusedImage
                  } : undefined}
                />
              )}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mt-6">
            {/* Countries Progress */}
            <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <GlobeAltIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Paesi Esplorati</h2>
              </div>
              <div className="space-y-4">
                {stats.countries.map(country => (
                  <div key={country.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{country.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{country.count} foto</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(country.count / Math.max(...stats.countries.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Distribution */}
            <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Distribuzione Mensile</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stats.monthStats.map(month => (
                  <div key={month.month} className="text-center p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/50">
                    <p className="text-2xl font-bold text-purple-500">{month.count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{month.month}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-1 lg:col-start-5 grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <PhotoIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Foto Totali</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{images.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Luoghi Unici</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Set(images.map(img => `${img.lat},${img.lon}`)).size}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <GlobeAltIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Paesi Visitati</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCountries}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Media Paese</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalCountries ? Math.round(images.length / stats.totalCountries) : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 