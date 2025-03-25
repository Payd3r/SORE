
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GeoLocation, Image } from '@/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MemoryMapProps {
  locations: GeoLocation[];
  images: Image[];
  title: string;
}

export const MemoryMap: React.FC<MemoryMapProps> = ({ locations, images, title }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [token, setToken] = useState<string>(localStorage.getItem('mapbox_token') || '');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fallback token (note: this is a limited public token)
  const fallbackToken = 'pk.eyJ1IjoibWFwYm94LWRlbW8iLCJhIjoiY2t4dWRma2pkNXQycDJucHQycnVrd2FpcSJ9.LrW_wCOLQmGe_iUbIx6LnA';
  
  const initializeMap = () => {
    if (!mapContainer.current) return;
    
    // Cleanup previous map instance
    if (map.current) {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current.remove();
      map.current = null;
    }
    
    // Use stored token or fallback
    const accessToken = token || fallbackToken;
    
    try {
      console.log("Initializing map with token:", accessToken);
      mapboxgl.accessToken = accessToken;
      
      // Get map center and bounds
      const locs = locations.length > 0 ? locations : images
        .filter(img => img.location)
        .map(img => img.location as GeoLocation);
      
      if (locs.length === 0) {
        // Default to Italy if no locations
        locs.push({ latitude: 41.9028, longitude: 12.4964 });
      }
      
      const center = locs.length === 1 
        ? [locs[0].longitude, locs[0].latitude]
        : calculateCenterAndZoom(locs.map(l => [l.longitude, l.latitude])).center;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: locs.length === 1 ? 12 : 9,
        attributionControl: false
      });
      
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.AttributionControl({ compact: true }));
      
      // Add handlers
      map.current.on('load', () => {
        setMapLoaded(true);
        setError(null);
        
        // Add markers
        if (locs.length > 0) {
          locs.forEach(loc => {
            const relevantImages = images.filter(img => 
              img.location && 
              img.location.latitude === loc.latitude && 
              img.location.longitude === loc.longitude
            );
            
            if (relevantImages.length > 0) {
              // Create custom element for marker
              const el = document.createElement('div');
              el.className = 'marker-image rounded-full border-2 border-white shadow-lg';
              el.style.backgroundImage = `url(${relevantImages[0].thumbnailUrl})`;
              el.style.width = '40px';
              el.style.height = '40px';
              el.style.backgroundSize = 'cover';
              el.style.borderRadius = '50%';
              
              if (relevantImages.length > 1) {
                const badge = document.createElement('div');
                badge.className = 'absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md';
                badge.textContent = `+${relevantImages.length - 1}`;
                el.appendChild(badge);
                el.style.position = 'relative';
              }
              
              // Create popup
              const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-bold">${loc.name || title}</h3>
                    <p class="text-sm">${relevantImages.length} immagini</p>
                    <div class="grid grid-cols-${Math.min(relevantImages.length, 3)} gap-1 mt-2">
                      ${relevantImages.slice(0, 6).map(img => `
                        <img src="${img.thumbnailUrl}" alt="${img.name}" class="w-12 h-12 object-cover rounded" />
                      `).join('')}
                    </div>
                  </div>
                `);
              
              // Add marker to map
              const marker = new mapboxgl.Marker(el)
                .setLngLat([loc.longitude, loc.latitude])
                .setPopup(popup)
                .addTo(map.current!);
              
              markers.current.push(marker);
            } else {
              // Simple marker for locations without images
              const marker = new mapboxgl.Marker()
                .setLngLat([loc.longitude, loc.latitude])
                .addTo(map.current!);
              
              markers.current.push(marker);
            }
          });
        }
      });
      
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Errore nel caricamento della mappa. Verifica il token Mapbox.');
      });
      
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Errore nell\'inizializzazione della mappa. Riprova più tardi.');
    }
  };
  
  const calculateCenterAndZoom = (coordinates: [number, number][]) => {
    // Calculate the bounds of all points
    const bounds = coordinates.reduce(
      (bounds, coord) => bounds.extend(coord),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );
    
    return {
      center: [
        (bounds.getEast() + bounds.getWest()) / 2,
        (bounds.getNorth() + bounds.getSouth()) / 2
      ] as [number, number],
      bounds
    };
  };
  
  const saveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setToken(tokenInput.trim());
      setTokenInput('');
    }
  };
  
  // Initialize or reinitialize map when token changes
  useEffect(() => {
    initializeMap();
    
    // Cleanup function
    return () => {
      if (map.current) {
        markers.current.forEach(marker => marker.remove());
        markers.current = [];
        try {
          map.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
        map.current = null;
      }
    };
  }, [token, locations]);
  
  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      {error && (
        <div className="absolute inset-0 bg-muted/90 flex flex-col items-center justify-center z-10 p-4">
          <p className="text-destructive mb-4">{error}</p>
          <div className="flex flex-col w-full max-w-md gap-2">
            <p className="text-sm">Inserisci il tuo token Mapbox:</p>
            <div className="flex gap-2">
              <Input 
                value={tokenInput} 
                onChange={(e) => setTokenInput(e.target.value)} 
                placeholder="pk.eyJ1..." 
                className="flex-1"
              />
              <Button onClick={saveToken}>Salva</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ottieni un token su <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
            </p>
          </div>
        </div>
      )}
      
      {!mapLoaded && !error && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
