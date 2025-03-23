
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Image } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

type MemoryTimelineProps = {
  images: Image[];
};

type TimePoint = {
  date: Date;
  title: string;
  images: Image[];
};

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Group images by 3-hour slots for the timeline
  const timePoints = useMemo(() => {
    const sortedImages = [...images].sort((a, b) => a.date.getTime() - b.date.getTime());
    const points: TimePoint[] = [];
    
    if (sortedImages.length === 0) return points;
    
    // Initialize with the first image
    let currentPoint: TimePoint = {
      date: new Date(sortedImages[0].date),
      title: format(sortedImages[0].date, 'HH:mm'),
      images: [sortedImages[0]]
    };
    
    // Group by 3-hour slots
    for (let i = 1; i < sortedImages.length; i++) {
      const currentImage = sortedImages[i];
      const currentDate = new Date(currentImage.date);
      const prevDate = new Date(currentPoint.date);
      
      const hourDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60);
      
      if (hourDiff < 3) {
        // Add to current time point
        currentPoint.images.push(currentImage);
      } else {
        // Create a new time point
        points.push(currentPoint);
        currentPoint = {
          date: currentDate,
          title: format(currentDate, 'HH:mm'),
          images: [currentImage]
        };
      }
    }
    
    // Add the last time point
    points.push(currentPoint);
    
    return points;
  }, [images]);

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    if (currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    } else {
      setSelectedImage(images[0]);
    }
  };

  const handlePrevImage = () => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    } else {
      setSelectedImage(images[images.length - 1]);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Nessuna immagine disponibile</h3>
        <p className="text-muted-foreground">Non ci sono immagini per questo ricordo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center">
        <Clock className="mr-2 h-5 w-5 text-primary" />
        Cronologia del ricordo
      </h2>
      
      <div className="relative pt-4">
        {/* Timeline line */}
        <div className="absolute left-10 top-0 bottom-0 w-px bg-border"></div>
        
        {/* Timeline items */}
        <div className="space-y-8">
          {timePoints.map((point, index) => (
            <div key={index} className="relative pl-20">
              {/* Time marker */}
              <div className="absolute left-8 top-0 -translate-x-1/2 w-5 h-5 rounded-full bg-primary"></div>
              
              {/* Time point */}
              <div className="absolute left-0 top-0 text-sm font-medium">
                {format(point.date, 'HH:mm')}
              </div>
              
              {/* Content */}
              <div className="bg-card rounded-lg shadow-sm border p-4">
                <div className="mb-3 flex justify-between items-center">
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {format(point.date, 'dd MMMM yyyy')}
                    </Badge>
                    <h3 className="text-lg font-semibold">
                      Ore {format(point.date, 'HH:mm')}
                    </h3>
                  </div>
                  <Badge variant="secondary">
                    {point.images.length} {point.images.length === 1 ? 'foto' : 'foto'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {point.images.map((image) => (
                    <div 
                      key={image.id} 
                      className="aspect-square rounded-md overflow-hidden cursor-pointer relative group"
                      onClick={() => handleImageClick(image)}
                    >
                      <img 
                        src={image.thumbnailUrl} 
                        alt={image.name} 
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="text-white h-6 w-6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Image preview dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl p-0 bg-transparent border-none shadow-none max-h-[90vh] overflow-hidden">
          {selectedImage && (
            <div className="relative">
              <div className="bg-black rounded-lg overflow-hidden">
                <div className="relative aspect-auto flex justify-center">
                  <img 
                    src={selectedImage.url} 
                    alt={selectedImage.name} 
                    className="max-h-[70vh] w-auto object-contain"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="bg-black text-white p-4">
                  <h3 className="text-lg font-medium">{selectedImage.name}</h3>
                  <div className="flex items-center text-sm text-gray-300 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{format(selectedImage.date, 'dd/MM/yyyy HH:mm')}</span>
                    
                    {selectedImage.location?.name && (
                      <>
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{selectedImage.location.name}</span>
                      </>
                    )}
                    
                    {selectedImage.uploaderName && (
                      <>
                        <span className="mx-2">•</span>
                        <User className="h-4 w-4 mr-1" />
                        <span>{selectedImage.uploaderName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
