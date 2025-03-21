
import React, { useState } from 'react';
import { Image as ImageType } from '@/types';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { format } from 'date-fns';
import { Calendar, MapPin, Image, X, ZoomIn, ChevronLeft, ChevronRight, Download } from 'lucide-react';

type MemoryGalleryProps = {
  images: ImageType[];
  title: string;
};

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ images, title }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);

  const handleImageClick = (image: ImageType) => {
    setSelectedImage(image);
  };

  const handleFullscreenView = (index: number) => {
    setFullscreenImageIndex(index);
    setSelectedImage(null);
  };

  const navigateFullscreen = (direction: 'next' | 'prev') => {
    if (fullscreenImageIndex === null) return;
    
    const newIndex = direction === 'next' 
      ? (fullscreenImageIndex + 1) % images.length
      : (fullscreenImageIndex - 1 + images.length) % images.length;
    
    setFullscreenImageIndex(newIndex);
  };

  const closeFullscreen = () => {
    setFullscreenImageIndex(null);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Image className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-2xl font-bold">Galleria</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setViewMode('grid')}
          >
            Griglia
          </Button>
          <Button 
            variant={viewMode === 'masonry' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setViewMode('masonry')}
          >
            Mosaico
          </Button>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
          {images.map((image, index) => (
            <div 
              key={image.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
              onClick={() => handleImageClick(image)}
            >
              <AspectRatio ratio={1}>
                <img 
                  src={image.thumbnailUrl} 
                  alt={image.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="text-white h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Masonry view */}
      {viewMode === 'masonry' && (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
          {images.map((image, index) => (
            <div 
              key={image.id}
              className="relative break-inside-avoid group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
              onClick={() => handleImageClick(image)}
            >
              <img 
                src={image.thumbnailUrl} 
                alt={image.name} 
                className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="text-white h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-4xl">
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-md overflow-hidden bg-black/5">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{selectedImage.name}</h3>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{format(selectedImage.date, 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  {selectedImage.location?.name && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{selectedImage.location.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const index = images.findIndex(img => img.id === selectedImage.id);
                      if (index !== -1) {
                        handleFullscreenView(index);
                      }
                    }}
                  >
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Schermo intero
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // This is just a placeholder for download functionality
                      window.open(selectedImage.url, '_blank');
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Scarica
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-medium mb-2">Altre foto</h4>
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((image) => (
                      <CarouselItem key={image.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                        <div 
                          className="relative aspect-square rounded overflow-hidden cursor-pointer border border-muted"
                          onClick={() => setSelectedImage(image)}
                        >
                          <img 
                            src={image.thumbnailUrl} 
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </Carousel>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image View */}
      {fullscreenImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeFullscreen}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={() => navigateFullscreen('prev')}
          >
            <ChevronLeft className="h-10 w-10" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={() => navigateFullscreen('next')}
          >
            <ChevronRight className="h-10 w-10" />
          </Button>

          <div className="w-full h-full flex items-center justify-center p-4 md:p-10">
            <img 
              src={images[fullscreenImageIndex].url} 
              alt={images[fullscreenImageIndex].name}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2">
            <h3 className="text-lg font-medium">{images[fullscreenImageIndex].name}</h3>
            <div className="text-sm text-gray-300">
              {format(images[fullscreenImageIndex].date, 'dd/MM/yyyy HH:mm')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
