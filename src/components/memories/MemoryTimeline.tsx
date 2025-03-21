
import React from 'react';
import { format } from 'date-fns';
import { Image } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Image as ImageIcon,
  MapPin,
  Calendar,
} from 'lucide-react';

type MemoryTimelineProps = {
  images: Image[];
};

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ images }) => {
  // Sort images by date
  const sortedImages = [...images].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Group images by day
  const imagesByDay = sortedImages.reduce<Record<string, Image[]>>((acc, image) => {
    const day = format(image.date, 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(image);
    return acc;
  }, {});

  const days = Object.keys(imagesByDay).sort();

  return (
    <div className="w-full px-0 md:px-4 py-6">
      <div className="flex items-center mb-6">
        <Calendar className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-2xl font-bold">Cronologia del Ricordo</h2>
      </div>

      <Tabs defaultValue={days[0]} className="w-full">
        <TabsList className="mb-4 w-full flex overflow-x-auto md:flex-wrap justify-start">
          {days.map(day => (
            <TabsTrigger key={day} value={day} className="px-4 py-2">
              {format(new Date(day), 'dd MMM')}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map(day => (
          <TabsContent key={day} value={day} className="mt-4">
            <div className="relative border-l-2 border-primary/30 ml-2 pl-8 md:ml-4 md:pl-12">
              {/* Day header */}
              <div className="mb-6">
                <div className="absolute -left-14 md:-left-16 top-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">
                  {format(new Date(day), 'dd MMMM yyyy')}
                </h3>
              </div>
              
              {/* Masonry layout for images */}
              <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4 mb-10">
                {imagesByDay[day].map((image, i) => (
                  <div 
                    key={image.id} 
                    className="relative break-inside-avoid mb-4 fade-in-slide bg-card rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="relative">
                      <img 
                        src={image.url} 
                        alt={image.name} 
                        className="w-full h-auto"
                      />
                      <time className="absolute top-2 left-2 text-xs font-medium bg-black/50 text-white px-2 py-1 rounded-full flex items-center">
                        <Clock className="inline mr-1 h-3 w-3" />
                        {format(image.date, 'HH:mm')}
                      </time>
                    </div>
                    <div className="p-4">
                      <div className="font-medium mb-1">{image.name}</div>
                      {image.location && (
                        <div className="text-sm text-muted-foreground flex items-start">
                          <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                          <span>{image.location.name || "Posizione segnata sulla mappa"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
