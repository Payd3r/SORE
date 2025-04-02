import { useState, useMemo } from 'react';
import { Memory } from '../../api/types';
import { format, parseISO, differenceInHours } from 'date-fns';
import { it } from 'date-fns/locale';
import ImageDetailModal from '../Images/ImageDetailModal';
import { ImageType, getOriginalImage } from '../../api/images';
import { getImageUrl } from '../../api/images';

type MemoryImage = NonNullable<Memory['images']>[number];

interface TimelineGroup {
  timestamp: Date;
  endTimestamp: Date;
  images: MemoryImage[];
}

interface CronologiaRicordoProps {
  memory: Memory;
}

export default function CronologiaRicordo({ memory }: CronologiaRicordoProps) {
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

  const handleImageClick = async (image: MemoryImage) => {
    try {
      const response = await getOriginalImage(image.id);
      setSelectedImage(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Errore nel caricamento dell\'immagine:', error);
    }
  };

  if (!memory.images || memory.images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Nessuna immagine disponibile per la cronologia
      </div>
    );
  }

  return (
    <div className="relative py-4">
      {/* Timeline line */}
      <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>

      {/* Timeline groups */}
      <div className="space-y-2 sm:space-y-8">
        {timelineGroups.map((group) => (
          <div key={group.timestamp.toISOString()} className="relative flex gap-6">
            {/* Timeline dot */}
            <div className="absolute left-3 sm:left-6 w-3 h-3 -translate-x-1.5 mt-2 rounded-full border-2 border-blue-500 bg-white dark:bg-gray-800"></div>

            {/* Content */}
            <div className="ml-8 sm:ml-16 flex-grow">
              {/* Timestamp */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {group.images?.length === 1 
                    ? format(group.timestamp, 'HH:mm', { locale: it })
                    : `${format(group.timestamp, 'HH:mm', { locale: it })} - ${format(group.endTimestamp, 'HH:mm', { locale: it })}`
                  }
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {format(group.timestamp, 'd MMMM yyyy', { locale: it })}
                </span>
              </div>

              {/* Images grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {group.images?.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => handleImageClick(image)}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                  >
                    <img
                      src={getImageUrl(image.thumb_big_path)}
                      alt={`Immagine ${image.id}`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Detail Modal */}
      <ImageDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedImage(null);
        }}
        image={selectedImage}
      />
    </div>
  );
} 