
import React, { useEffect, useState } from 'react';
import { MemoryMap } from '@/components/memories/MemoryMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GeoLocation, Image } from '@/types';
import { mockMemories } from './MemoriesPage';
import { MapPin, Image as ImageIcon } from 'lucide-react';

const MapPage: React.FC = () => {
  const [allLocations, setAllLocations] = useState<GeoLocation[]>([]);
  const [allImages, setAllImages] = useState<Image[]>([]);
  
  // Extract all locations and images with locations
  useEffect(() => {
    const locations: GeoLocation[] = [];
    const images: Image[] = [];
    
    mockMemories.forEach(memory => {
      // Add memory location
      if (memory.location) {
        const exists = locations.some(
          loc => loc.latitude === memory.location?.latitude && 
                loc.longitude === memory.location?.longitude
        );
        
        if (!exists) {
          locations.push(memory.location);
        }
      }
      
      // Add all images with locations and add to collection
      memory.images.forEach(image => {
        if (image.location) {
          images.push(image);
        }
      });
    });
    
    setAllLocations(locations);
    setAllImages(images);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Mappa dei ricordi</h1>
        <p className="text-muted-foreground mt-1">
          Visualizza tutti i posti che avete visitato insieme
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Mappa</CardTitle>
            <CardDescription>
              {allLocations.length} luoghi visitati, {allImages.length} immagini con posizione
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[70vh]">
              <MemoryMap 
                locations={allLocations} 
                images={allImages} 
                title="I nostri ricordi" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistiche</CardTitle>
            <CardDescription>
              Dettagli dei luoghi visitati
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center mb-2">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Luoghi visitati
                </h3>
                <div className="space-y-2">
                  {allLocations.slice(0, 5).map((location, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-primary/10 text-primary p-1.5 rounded-md mr-3">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{location.name || "Luogo senza nome"}</p>
                        <p className="text-xs text-muted-foreground">
                          {mockMemories.filter(m => 
                            m.location?.latitude === location.latitude && 
                            m.location?.longitude === location.longitude
                          ).length} ricordi
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {allLocations.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      + altri {allLocations.length - 5} luoghi
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium flex items-center mb-2">
                  <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                  Immagini per regione
                </h3>
                
                <div className="space-y-3">
                  {Object.entries(
                    allImages.reduce<Record<string, number>>((acc, img) => {
                      const name = img.location?.name?.split(',')[0] || 'Sconosciuta';
                      acc[name] = (acc[name] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort(([, countA], [, countB]) => countB - countA)
                    .slice(0, 5)
                    .map(([name, count], index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{name}</span>
                        <div className="flex items-center">
                          <span className="text-sm mr-2">{count}</span>
                          <div className="bg-primary h-4" style={{ width: `${Math.min(count * 5, 100)}px` }}></div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapPage;
