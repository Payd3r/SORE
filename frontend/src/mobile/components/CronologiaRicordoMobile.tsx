import { useState, useMemo } from 'react';
import { Memory } from '../../api/types';
import { format, parseISO, differenceInHours } from 'date-fns';
import { it } from 'date-fns/locale';
import { ImageType, getOriginalImage } from '../../api/images';
import { getImageUrl } from '../../api/images';
import ImageDetailMobile from '../pages/ImageDetailMobile';

type MemoryImage = NonNullable<Memory['images']>[number];

interface TimelineGroup {
  timestamp: Date;
  endTimestamp: Date;
  images: MemoryImage[];
}

interface CronologiaRicordoMobileProps {
  memory: Memory;
}

export default function CronologiaRicordoMobile({ memory }: CronologiaRicordoMobileProps) {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Raggruppa le immagini per intervalli di tempo (2 ore)
  const timelineGroups = useMemo(() => {
    if (!memory.images || memory.images.length === 0) return [];

    // Ordina le immagini per data
    const sortedImages = [...memory.images].sort((a, b) => {
      if (!a.created_at || !b.created_at) return 0;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const groups: TimelineGroup[] = [];
    let currentGroup: TimelineGroup | undefined;
    let currentImages: MemoryImage[] = [];

    sortedImages.forEach(image => {
      if (!image.created_at) return;

      const imageDate = parseISO(image.created_at);

      // Se non c'è un gruppo corrente o sono passate più di 2 ore dall'ultimo gruppo
      if (!currentGroup || differenceInHours(imageDate, currentGroup.timestamp) >= 2) {
        if (currentGroup) {
          groups.push(currentGroup);
        }

        currentImages = [image];
        currentGroup = {
          timestamp: imageDate,
          endTimestamp: imageDate,
          images: currentImages
        };
      } else {
        currentImages.push(image);
        currentGroup.endTimestamp = imageDate;
        currentGroup.images = currentImages;
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [memory.images]);

  const handleImageClick = async (image: MemoryImage, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    try {
      const response = await getOriginalImage(image.id);
      setSelectedImage(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Errore nel caricamento dell\'immagine:', error);
    }
  };

  const handleCloseImageModal = () => {
    setIsDetailModalOpen(false);
    setSelectedImage(null);
  };

  if (!memory.images || memory.images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Nessuna immagine disponibile per la cronologia
      </div>
    );
  }

  return (
    <div className="relative py-4 px-1">
      {/* Timeline line */}
      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

      {/* Timeline groups */}
      <div className="space-y-2">
        {timelineGroups.map((group) => (
          <div key={group.timestamp.toISOString()} className="relative flex gap-2">
            {/* Timeline dot */}
            <div className="absolute left-1.5 w-3 h-3 -translate-x-1.5 mt-1.5 rounded-full border-2 border-blue-500 bg-white dark:bg-gray-800"></div>

            {/* Content */}
            <div className="ml-6 flex-grow">
              {/* Timestamp */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {group.images?.length === 1 
                    ? format(group.timestamp, 'HH:mm', { locale: it })
                    : `${format(group.timestamp, 'HH:mm', { locale: it })} - ${format(group.endTimestamp, 'HH:mm', { locale: it })}`
                  }
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(group.timestamp, 'd MMMM yyyy', { locale: it })}
                </span>
              </div>

              {/* Images grid - stile iOS 18 con angoli più arrotondati e spaziatura uniforme */}
              <div 
                className={`grid ${
                  group.images.length <= 6 
                    ? 'grid-cols-3 gap-1.5' 
                    : group.images.length <= 12 
                      ? 'grid-cols-4 gap-1' 
                      : 'grid-cols-5 gap-0.5'
                } `}
              >
                {group.images?.map((image) => (
                  <div
                    key={image.id}
                    onClick={(e) => handleImageClick(image, e)}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`aspect-square ${
                      group.images.length <= 6 
                        ? 'rounded-xl' 
                        : group.images.length <= 12 
                          ? 'rounded-lg' 
                          : 'rounded-md'
                    } overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm relative interactive cursor-pointer group touch-manipulation transition-all duration-200`}
                  >
                    <img
                      src={getImageUrl(image.thumb_big_path || '')}
                      alt={`Immagine ${image.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 duration-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Detail Modal - per mobile */}
      <ImageDetailMobile
        isOpen={isDetailModalOpen}
        onClose={handleCloseImageModal}
        image={selectedImage}
      />
    </div>
  );
} 