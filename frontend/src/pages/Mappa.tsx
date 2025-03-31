import { useState, useEffect } from 'react';
import Map from '../components/Maps/Map';
import { getMapImages, type ImageLocation } from '../api/map';
import { PhotoIcon, GlobeAltIcon, CalendarIcon, ChartBarIcon, MapPinIcon } from '@heroicons/react/24/outline';

type StatsType = {
  countries: { name: string; count: number }[];
  totalCountries: number;
  monthStats: { month: string; count: number }[];
};

export default function Mappa() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageLocation[]>([]);
  const [stats, setStats] = useState<StatsType>({
    countries: [],
    totalCountries: 0,
    monthStats: []
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        const data = await getMapImages();

        if (!data) {
          throw new Error('Nessun dato ricevuto');
        }

        setImages(data);
        // Calcola le statistiche
        const countriesCount: Record<string, number> = {};
        const monthsCount: Record<string, number> = {};

        data.forEach(img => {
          // Calcola statistiche per paese
          countriesCount[img.country] = (countriesCount[img.country] || 0) + 1;

          // Calcola statistiche per mese
          const date = new Date(img.created_at);
          const month = date.toLocaleString('it-IT', { month: 'long' });
          monthsCount[month] = (monthsCount[month] || 0) + 1;
        });

        setStats({
          countries: Object.entries(countriesCount).map(([name, count]) => ({ name, count })),
          totalCountries: Object.keys(countriesCount).length,
          monthStats: Object.entries(monthsCount).map(([month, count]) => ({ month, count }))
        });
      } catch (err) {
        console.error('Errore nel caricamento delle immagini:', err);
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle immagini');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mappa dei Ricordi</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Esplora i tuoi momenti speciali attraverso il mondo
          </p>
        </div>

        {/* Map Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="h-[600px] w-full">
            {isLoading && (
              <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-16 h-16 mb-4">
                  <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Caricamento in corso...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Stiamo preparando la tua mappa</p>
              </div>
            )}
            {!isLoading && (
              <Map
                images={images}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Countries Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <GlobeAltIcon className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Paesi Esplorati</h2>
            </div>
            <div className="space-y-4">
              {stats.countries.map(country => (
                <div key={country.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{country.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{country.count} foto</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(country.count / Math.max(...stats.countries.map(c => c.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CalendarIcon className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Distribuzione Mensile</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stats.monthStats.map(month => (
                <div key={month.month} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-2xl font-bold text-blue-500">{month.count}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{month.month}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <PhotoIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Foto Totali</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{images.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Luoghi Unici</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(images.map(img => `${img.lat},${img.lon}`)).size}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <GlobeAltIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Paesi Visitati</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCountries}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Media per Paese</p>
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
  );
} 