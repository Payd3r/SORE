import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Memory, MemoryType } from '../../api/memory';
import { getImageUrl } from '../../api/images';
import { useNavigate } from 'react-router-dom';
import { IoCalendarOutline } from 'react-icons/io5';

interface MemoryImage {
  id: number;
  thumb_big_path: string;
  created_at: string;
}

interface MemoryWithImages extends Memory {
  images: MemoryImage[];
}

interface MemoryCardListProps {
  memory: MemoryWithImages;
  onClick?: () => void;
}

export default function MemoryCardList({ memory, onClick }: MemoryCardListProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/ricordo/${memory.id}`);
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

  const getTypeLabel = (type: MemoryType) => {
    switch (type.toLowerCase()) {
      case 'viaggio':
        return {
          text: 'Viaggio',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          border: 'border-blue-500/20',
          hover: 'hover:border-blue-300 dark:hover:border-blue-700',
          shadow: 'shadow-blue-100 dark:shadow-blue-900/20'
        };
      case 'evento':
        return {
          text: 'Evento',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
          border: 'border-purple-500/20',
          hover: 'hover:border-purple-300 dark:hover:border-purple-700',
          shadow: 'shadow-purple-100 dark:shadow-purple-900/20'
        };
      default:
        return {
          text: 'Ricordo',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          border: 'border-green-500/20',
          hover: 'hover:border-green-300 dark:hover:border-green-700',
          shadow: 'shadow-green-100 dark:shadow-green-900/20'
        };
    }
  };

  const typeStyle = getTypeLabel(memory.type);
  const firstImage = memory.images?.[0];

  return (
    <div
      className={`group bg-white dark:bg-gray-800 rounded-lg border-2 ${typeStyle.border} ${typeStyle.hover} ${typeStyle.shadow} overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4 p-3">
        {/* Thumbnail */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md overflow-hidden">
          {firstImage ? (
            <img
              src={getImageUrl(firstImage.thumb_big_path)}
              alt={memory.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
            </div>
          )}
          {memory.tot_img > 1 && (
            <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs text-white font-medium">
              +{memory.tot_img - 1}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeStyle.color}`}>
              {typeStyle.text}
            </span>
          </div>
          
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-1">
            {memory.title}
          </h3>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <IoCalendarOutline className="w-3.5 h-3.5 flex-shrink-0" />
            <div className="flex items-center gap-1 min-w-0">
              <span className="truncate">{formatDate(memory.start_date)}</span>
              {memory.end_date && memory.end_date !== memory.start_date && (
                <>
                  <span className="mx-1 flex-shrink-0">→</span>
                  <span className="truncate">{formatDate(memory.end_date)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 