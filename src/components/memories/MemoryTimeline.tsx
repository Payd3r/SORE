
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Image } from '@/types';
import {
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';

type MemoryTimelineProps = {
  images: Image[];
};

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ images }) => {
  // Sort images by date
  const sortedImages = useMemo(() => 
    [...images].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [images]
  );
  
  // Group images by day
  const timelineByDay = useMemo(() => {
    const groupedByDay: Record<string, Image[]> = {};
    
    sortedImages.forEach(image => {
      const day = format(image.date, 'yyyy-MM-dd');
      if (!groupedByDay[day]) {
        groupedByDay[day] = [];
      }
      groupedByDay[day].push(image);
    });
    
    return Object.entries(groupedByDay)
      .sort(([dayA], [dayB]) => new Date(dayA).getTime() - new Date(dayB).getTime())
      .map(([day, dayImages]) => ({
        date: new Date(day),
        images: dayImages
      }));
  }, [sortedImages]);

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Nessuna immagine con data</h3>
        <p className="text-muted-foreground">
          Questo ricordo non ha immagini con informazioni sulla data.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="flex items-center mb-6">
        <Calendar className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-2xl font-bold">Cronologia del Ricordo</h2>
      </div>

      <div className="relative border-l-2 border-primary/20 pl-6 md:pl-8 ml-3 space-y-10">
        {timelineByDay.map((day) => (
          <div key={day.date.toISOString()} className="relative">
            {/* Day marker */}
            <div className="absolute -left-[27px] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center text-primary">
                <span className="font-bold">{format(day.date, 'dd')}</span>
              </div>
            </div>
            
            {/* Day content */}
            <div className="pt-2 pl-4">
              <h3 className="text-lg font-medium mb-4 pl-2">
                {format(day.date, 'EEEE dd MMMM yyyy', { locale: it })}
              </h3>
              
              <div className="space-y-8">
                {/* Group images by approximate time (every 3 hours) */}
                {(() => {
                  const timeGroups: Record<string, Image[]> = {};
                  day.images.forEach(img => {
                    // Round to the nearest 3 hour block
                    const hour = new Date(img.date).getHours();
                    const timeBlock = Math.floor(hour / 3) * 3;
                    const timeKey = `${timeBlock.toString().padStart(2, '0')}:00`;
                    
                    if (!timeGroups[timeKey]) {
                      timeGroups[timeKey] = [];
                    }
                    timeGroups[timeKey].push(img);
                  });
                  
                  return Object.entries(timeGroups)
                    .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
                    .map(([time, timeImages]) => (
                      <div key={time} className="relative">
                        {/* Time marker */}
                        <div className="absolute -left-10 top-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                            {time}
                          </div>
                        </div>
                        
                        {/* Images for this time block */}
                        <div className="pl-0 pt-1">
                          <div className="flex flex-wrap gap-3">
                            {timeImages.map(image => (
                              <div 
                                key={image.id} 
                                className="relative group w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all"
                              >
                                <img 
                                  src={image.thumbnailUrl} 
                                  alt={image.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="absolute bottom-2 left-2 right-2 text-white">
                                    <div className="text-xs font-medium truncate">{image.name}</div>
                                    <div className="flex items-center text-[10px] mt-1">
                                      <Clock className="h-2.5 w-2.5 mr-1" />
                                      {format(image.date, 'HH:mm')}
                                    </div>
                                    
                                    {image.location && (
                                      <div className="flex items-center text-[10px] mt-0.5">
                                        <MapPin className="h-2.5 w-2.5 mr-1" />
                                        <span className="truncate">{image.location.name || "Posizione segnata"}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
