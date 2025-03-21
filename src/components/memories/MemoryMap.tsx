
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GeoLocation, Image } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MapPin, Image as ImageIcon, Info, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

type MemoryMapProps = {
  location: GeoLocation;
  images: Image[];
  title: string;
};

export const MemoryMap: React.FC<MemoryMapProps> = ({ location, images, title }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapBoxToken, setMapBoxToken] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [customToken, setCustomToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(true);
  const isMobile = useIsMobile();

  // Filter only images with location data
  const imagesWithLocation = images.filter(img => img.location);

  const initializeMap = () => {
    if (!mapContainer.current || !mapBoxToken || !location) return;

    // Initialize map
    mapboxgl.accessToken = mapBoxToken;
    
    // Check if map already exists and remove it
    if (map.current) {
      map.current.remove();
    }
    
    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [location.longitude, location.latitude],
        zoom: 13,
      });

      // Add main location marker
      const mainMarkerEl = document.createElement('div');
      mainMarkerEl.className = 'w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white';
      mainMarkerEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

      new mapboxgl.Marker(mainMarkerEl)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${title}</strong><br>${location.name || ''}`))
        .addTo(newMap);

      // Add image markers if they have location data
      imagesWithLocation.forEach((image) => {
        if (!image.location) return;

        const el = document.createElement('div');
        el.className = 'w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md';
        
        const img = document.createElement('img');
        img.src = image.thumbnailUrl;
        img.className = 'w-full h-full object-cover';
        el.appendChild(img);

        const date = format(image.date, 'dd/MM/yyyy HH:mm');
        
        new mapboxgl.Marker(el)
          .setLngLat([image.location.longitude, image.location.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="max-width: 220px;">
                <img src="${image.thumbnailUrl}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 8px;">
                <strong>${image.name}</strong>
                <div style="color: #6b7280; font-size: 12px;">${date}</div>
              </div>`
            )
          )
          .addTo(newMap);

        // Add click event to marker
        el.addEventListener('click', () => {
          setSelectedImage(image);
        });
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Fit bounds to include all markers if there are images with location
      if (imagesWithLocation.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([location.longitude, location.latitude]);
        
        imagesWithLocation.forEach(image => {
          if (image.location) {
            bounds.extend([image.location.longitude, image.location.latitude]);
          }
        });
        
        newMap.fitBounds(bounds, { padding: isMobile ? 30 : 70, maxZoom: 15 });
      }

      map.current = newMap;

      // Add event listener to handle any errors with loading the map
      newMap.on('error', (e) => {
        console.error('Mapbox error:', e);
        setShowTokenInput(true);
        toast({
          title: "Errore di caricamento mappa",
          description: "C'è stato un problema con il caricamento della mappa. Per favore inserisci un token Mapbox valido.",
          variant: "destructive"
        });
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setShowTokenInput(true);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customToken) {
      setMapBoxToken(customToken);
      setShowTokenInput(false);
      localStorage.setItem('mapbox_token', customToken);
      toast({
        title: "Token aggiornato",
        description: "Il token Mapbox è stato aggiornato con successo."
      });
    }
  };

  useEffect(() => {
    // Try to get token from localStorage first
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapBoxToken(savedToken);
      setShowTokenInput(false);
    } else {
      // Fallback to default token or show input
      const token = 'pk.eyJ1IjoibG92YWJsZWRldjIiLCJhIjoiY2xobXR3N3FsMDR1YTNkbnlrdWdwbTlidiJ9.y2xmVFwFIKaOErM4_KGLAQ';
      setMapBoxToken(token);
      setShowTokenInput(false);
    }
  }, []);

  useEffect(() => {
    if (mapBoxToken) {
      initializeMap();
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [location, images, mapBoxToken, title, imagesWithLocation, isMobile]);

  if (!location) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2" />
          <p>Nessuna posizione disponibile per questo ricordo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Posizione</h2>
        </div>
        
        {imagesWithLocation.length > 0 && (
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center">
            <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Clicca sui marker per visualizzare le immagini</span>
            <span className="sm:hidden">Tocca i marker</span>
          </div>
        )}
      </div>
      
      {showTokenInput && (
        <div className="mb-4 p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/30 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Token Mapbox necessario</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Per visualizzare la mappa è necessario un token Mapbox valido. Puoi ottenerlo registrandoti su mapbox.com.
          </p>
          <form onSubmit={handleTokenSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Inserisci il token Mapbox"
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value)}
              className="text-xs h-8"
            />
            <Button type="submit" size="sm" className="h-8">Applica</Button>
          </form>
        </div>
      )}
      
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden shadow-md">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl p-2 sm:p-6">
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-md overflow-hidden">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold">{selectedImage.name}</h3>
                <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{format(selectedImage.date, 'dd/MM/yyyy HH:mm')}</span>
                </div>
                {selectedImage.location?.name && (
                  <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>{selectedImage.location.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
