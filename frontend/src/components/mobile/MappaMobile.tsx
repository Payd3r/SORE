import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Map from '../Maps/Map';
import { getMapImages } from '../../api/map';
import Loader from '../Loader';
import { useRef, useState } from 'react';
import { PhotoIcon, GlobeAltIcon, CalendarIcon, ChartBarIcon, MapPinIcon } from '@heroicons/react/24/outline';

type StatsType = {
  countries: { name: string; count: number }[];
  totalCountries: number;
  monthStats: { month: string; count: number }[];
};

export default function MappaMobile() {
  const location = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'mappa' | 'stats'>('mappa');

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

    stats.countries = Object.entries(countriesCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Mostrane solo 5 nella versione mobile

    stats.totalCountries = Object.keys(countriesCount).length;
    stats.monthStats = Object.entries(monthsCount)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Mostrane solo 4 nella versione mobile
  }

  return (
    <div className="flex flex-col relative h-full pb-16">
      {/* Header iOS style */}
      <div className="sticky top-0 z-50 px-20 pt-[calc(env(safe-area-inset-top)-0.5rem)] pb-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        {/* Toggle in stile iOS 18 */}
        <div className="mt-2 flex justify-center">
          <div className="inline-flex items-center rounded-full bg-gray-200/70 dark:bg-gray-800/70 p-1.5 backdrop-blur-xl shadow-sm w-48">
            <button
              onClick={() => setActiveTab('mappa')}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'mappa'
                ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
              }`}
              aria-selected={activeTab === 'mappa'}
            >
              Mappa
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'stats'
                ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
              }`}
              aria-selected={activeTab === 'stats'}
            >
              Stats
            </button>
          </div>
        </div>
      </div>

      {/* Contenuto in base alla tab attiva */}
      {activeTab === 'mappa' ? (
        /* Contenitore della mappa */
        <div
          ref={mapContainerRef}
          className="flex-1 relative overflow-hidden touch-manipulation"
        >
          {isLoading ? (
            <Loader type="spinner" size="md" text="Caricamento mappa..." subText="Stiamo preparando la tua mappa" />
          ) : (
            <div className="h-full w-full">
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
            </div>
          )}
        </div>
      ) : (
        /* Contenitore delle statistiche in stile iOS 18 */
        <div className="flex-1 overflow-auto p-4 pt-6 pb-8">
          {isLoading ? (
            <Loader type="spinner" size="md" text="Caricamento statistiche..." subText="Stiamo analizzando i tuoi dati" />
          ) : (
            <div className="space-y-6">
              {/* Quick Stats in stile iOS 18 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100/80 dark:bg-blue-900/20">
                      <PhotoIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Foto Totali</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{images.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100/80 dark:bg-green-900/20">
                      <MapPinIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Luoghi Unici</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Set(images.map(img => `${img.lat},${img.lon}`)).size}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-100/80 dark:bg-yellow-900/20">
                      <GlobeAltIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Paesi Visitati</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCountries}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100/80 dark:bg-red-900/20">
                      <ChartBarIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Media Paese</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalCountries ? Math.round(images.length / stats.totalCountries) : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paesi Esplorati */}
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-blue-100/80 dark:bg-blue-900/20">
                    <GlobeAltIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Paesi Esplorati</h2>
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

              {/* Distribuzione Mensile */}
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-purple-100/80 dark:bg-purple-900/20">
                    <CalendarIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Distribuzione Mensile</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {stats.monthStats.map(month => (
                    <div key={month.month} className="text-center p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/30">
                      <p className="text-xl font-bold text-purple-500">{month.count}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{month.month}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 