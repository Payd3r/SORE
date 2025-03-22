
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GeoLocation } from '@/types';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface MemoryMapProps {
  locations?: GeoLocation[];
  interactive?: boolean;
  height?: string;
  singleMarker?: boolean;
}

const defaultToken = 'pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNscHFremoyZzAyZnUya3BnZDRmdjk4aTYifQ.iyznFn33gWGrr5YyLAGxQg';

export const MemoryMap: React.FC<MemoryMapProps> = ({ 
  locations = [], 
  interactive = true,
  height = '400px',
  singleMarker = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [mapboxToken, setMapboxToken] = useState(() => {
    return localStorage.getItem('mapbox_token') || defaultToken;
  });
  const [customToken, setCustomToken] = useState('');

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      // Set the token
      mapboxgl.accessToken = mapboxToken;
      
      // Calculate map center and bounds
      let center: [number, number] = [9.1900, 45.4642]; // Default: Milan
      let zoom = 12;
      
      if (locations.length > 0) {
        if (locations.length === 1 || singleMarker) {
          // Single location or singleMarker mode: center on the first location
          center = [locations[0].longitude, locations[0].latitude];
          zoom = 13;
        } else {
          // Multiple locations: calculate center from all locations
          const lngs = locations.map(loc => loc.longitude);
          const lats = locations.map(loc => loc.latitude);
          
          const avgLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
          const avgLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
          
          center = [avgLng, avgLat];
          zoom = 10;
        }
      }
      
      // Create a new map instance
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center,
        zoom,
        interactive
      });
      
      // Store the map instance
      mapRef.current = map;
      
      // Add markers
      if (locations.length > 0) {
        locations.forEach(location => {
          const marker = new mapboxgl.Marker()
            .setLngLat([location.longitude, location.latitude])
            .addTo(map);
          
          markersRef.current.push(marker);
        });
      }
      
      // Add navigation controls if interactive
      if (interactive) {
        map.addControl(new mapboxgl.NavigationControl());
      }
      
      // Set error state to null since map loaded successfully
      setMapError(null);
      
      // Cleanup
      return () => {
        // Remove all markers
        markersRef.current.forEach(marker => {
          marker.remove();
        });
        markersRef.current = [];
        
        // Only call remove() if the map is valid
        if (map && !map._removed) {
          map.remove();
        }
        mapRef.current = null;
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Errore nel caricamento della mappa. Potrebbe essere necessario un token Mapbox valido.');
      setTokenModalOpen(true);
      return undefined;
    }
  }, [locations, interactive, singleMarker, mapboxToken]);

  const handleSaveToken = () => {
    if (customToken.trim()) {
      localStorage.setItem('mapbox_token', customToken.trim());
      setMapboxToken(customToken.trim());
      setTokenModalOpen(false);
      toast.success('Token Mapbox salvato. La mappa verrà ricaricata.');
    }
  };

  return (
    <div className="relative">
      {mapError ? (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Errore mappa</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{mapError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => setTokenModalOpen(true)}
            >
              Configura token Mapbox
            </Button>
          </div>
        </div>
      ) : (
        <div 
          ref={mapContainer} 
          className="w-full rounded-md overflow-hidden"
          style={{ height }}
        />
      )}
      
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configura Mapbox Token</DialogTitle>
            <DialogDescription>
              Per visualizzare correttamente le mappe, inserisci un token Mapbox valido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Token Mapbox</label>
              <Input 
                value={customToken} 
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="Inserisci il tuo token Mapbox"
              />
              <p className="text-xs text-muted-foreground">
                Puoi ottenere un token gratuito registrandoti su{' '}
                <a 
                  href="https://account.mapbox.com/auth/signup/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTokenModalOpen(false)}>Annulla</Button>
            <Button onClick={handleSaveToken}>Salva Token</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
