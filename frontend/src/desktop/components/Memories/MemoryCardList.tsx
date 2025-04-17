import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Memory } from '../../../api/memory';
import { getImageUrl } from '../../../api/images';
import { useNavigate } from 'react-router-dom';
import { IoCalendar, IoLocationOutline } from 'react-icons/io5';

interface MemoryCardListProps {
  memory?: Memory;
  onClick?: () => void;
  futureMemories?: Memory[];
}

export default function MemoryCardList({ memory, onClick, futureMemories }: MemoryCardListProps) {
  const navigate = useNavigate();
  const isViaggio = memory?.type.toLowerCase() === 'viaggio';
  const isSemplice = memory?.type.toLowerCase() === 'semplice';
  const isFuturo = memory?.type.toLowerCase() === 'futuro';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/ricordo/${memory?.id}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data non disponibile';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy', { locale: it });
    } catch (error) {
      return 'Data non valida';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'viaggio':
        return {
          text: 'Viaggio',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        };
      case 'evento':
        return {
          text: 'Evento',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
        };
      case 'semplice':
        return {
          text: 'Ricordo',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      default:
        return {
          text: 'Ricordo',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        };
    }
  };

  const typeStyle = getTypeLabel(memory?.type || '');
  const firstImage = memory?.images[0];
  
  // Determiniamo quale percorso immagine utilizzare in base al tipo di ricordo
  const imagePath = isViaggio || isSemplice
    ? (firstImage?.webp_path || firstImage?.thumb_big_path || '')
    : (firstImage?.thumb_big_path || '');

  // Se futureMemories è presente, mostra la card compatta multipla
  if (futureMemories && futureMemories.length > 0) {
    const showCount = Math.min(4, futureMemories.length);
    return (
      <div
        className="bg-gradient-to-br from-blue-100/80 to-blue-300/60 dark:from-blue-900/60 dark:to-blue-800/80 rounded-lg border border-blue-300 dark:border-blue-700 shadow-blue-100 dark:shadow-blue-900/20 overflow-hidden cursor-pointer flex items-center min-h-28 p-4 gap-4"
        onClick={() => {
          if (onClick) onClick();
          else if (futureMemories.length === 1) navigate(`/ricordo/${futureMemories[0].id}`);
        }}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-200 dark:bg-blue-800">
          <IoCalendar className="w-8 h-8 text-blue-600 dark:text-blue-300" />
        </div>
        <div className="flex-1 flex flex-col justify-center overflow-hidden">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500 text-white uppercase tracking-wide">Futuro</span>
          </div>
          <div className={`grid gap-x-4 gap-y-1 ${showCount > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {futureMemories.slice(0, showCount).map(fm => (
              <div key={fm.id} className="truncate">
                <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm truncate">{fm.title}</div>
                {fm.start_date && (
                  <div className="text-xs text-blue-700 dark:text-blue-200 truncate">{formatDate(fm.start_date)}</div>
                )}
              </div>
            ))}
          </div>
          {futureMemories.length > showCount && (
            <div className="text-xs text-blue-800 dark:text-blue-200 opacity-80 mt-2">+{futureMemories.length - showCount} altri ricordi futuri</div>
          )}
          <p className="text-xs text-blue-800 dark:text-blue-200 opacity-80 mt-2">Presto potrai aggiungere foto e dettagli!</p>
        </div>
      </div>
    );
  }

  if (isFuturo) {
    return (
      <div
        className="bg-gradient-to-br from-blue-100/80 to-blue-300/60 dark:from-blue-900/60 dark:to-blue-800/80 rounded-lg border border-blue-300 dark:border-blue-700 shadow-blue-100 dark:shadow-blue-900/20 overflow-hidden cursor-pointer flex items-center h-24 p-3 gap-3"
        onClick={handleClick}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-200 dark:bg-blue-800">
          <IoCalendar className="w-8 h-8 text-blue-600 dark:text-blue-300" />
        </div>
        <div className="flex-1 flex flex-col justify-center overflow-hidden">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-500 text-white">Futuro</span>
          </div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 line-clamp-1">{memory?.title}</h3>
          {memory?.start_date && (
            <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-200 mt-1">
              <IoCalendar className="w-3.5 h-3.5" />
              <span>In programma per il {formatDate(memory?.start_date ?? null)}</span>
            </div>
          )}
          <p className="text-xs text-blue-800 dark:text-blue-200 opacity-80 mt-1">Presto potrai aggiungere foto e dettagli!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={handleClick}
    >
      <div className="flex flex-row items-stretch h-24">
        {/* Immagine */}
        <div className="w-24 h-24 relative shrink-0">
          {firstImage && (
            <img
              src={getImageUrl(imagePath)}
              alt={memory?.title || ''}
              className="w-full h-full object-cover"
            />
          )}
          {!firstImage && (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Contenuto */}
        <div className="flex-1 flex flex-col p-3 justify-between overflow-hidden">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2 mb-1">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-md ${typeStyle.color}`}
              >
                {typeStyle.text}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {memory?.title}
            </h3>
          </div>

          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4 mt-1">
            <div className="flex items-center space-x-1">
              <IoCalendar className="w-3.5 h-3.5" />
              <span>{formatDate(memory?.start_date ?? null)}</span>
            </div>
            {memory?.location && (
              <div className="flex items-center space-x-1 truncate">
                <IoLocationOutline className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{memory?.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 