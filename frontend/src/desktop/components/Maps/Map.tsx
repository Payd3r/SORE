import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import { getImageUrl } from '../../../api/images';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import './map.css';

interface ImageLocation {
  id: number;
  lat: number;
  lon: number;
  thumb_small_path: string;
  thumb_big_path: string;
}

// Fix per le icone di Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Funzione per validare e pulire le coordinate
const cleanCoordinates = (lat: number | string, lon: number | string): [number, number] | null => {
  try {
    // Converti le coordinate in numeri se sono stringhe
    const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    const numLon = typeof lon === 'string' ? parseFloat(lon) : lon;

    // Verifica che i numeri siano validi
    if (isNaN(numLat) || isNaN(numLon)) {
      return null;
    }

    // Assicurati che i numeri siano finiti e validi
    const cleanLat = parseFloat(numLat.toFixed(6));
    const cleanLon = parseFloat(numLon.toFixed(6));

    // Valida i range delle coordinate
    if (cleanLat < -90 || cleanLat > 90) {
      return null;
    }
    if (cleanLon < -180 || cleanLon > 180) {
      return null;
    }

    return [cleanLat, cleanLon];
  } catch {
    return null;
  }
};

// Funzione per creare l'icona del cluster personalizzata
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
  
  return new L.DivIcon({
    html: `<div class="cluster-icon cluster-icon-${size}">
            <span>${count}</span>
          </div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40),
    iconAnchor: L.point(20, 20)
  });
};

// Funzione per creare l'icona del marker personalizzata
const createCustomIcon = (image: ImageLocation) => {
  return new L.DivIcon({
    html: `
      <div class="marker-icon">
        <img src="${getImageUrl(image.thumb_small_path)}" alt="thumbnail" />
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: L.point(40, 40),
    iconAnchor: L.point(20, 40),
    popupAnchor: L.point(0, -40)
  });
};

// Componente per gestire il bounds della mappa
function BoundsHandler({ images, bounds }: { images: ImageLocation[], bounds?: MapProps['bounds'] }) {
  const map = useMap();

  useEffect(() => {
    // Se abbiamo bounds specifici, usiamoli
    if (bounds) {
      const latLngBounds = L.latLngBounds(
        [[bounds.south, bounds.west], [bounds.north, bounds.east]]
      );
      
      const isMobile = window.innerWidth < 768;
      map.fitBounds(latLngBounds, { 
        padding: isMobile ? [50, 50] : [100, 100],
        maxZoom: isMobile ? 13 : 15,
        animate: true,
        duration: 1
      });
      return;
    }

    // Altrimenti, calcola i bounds dalle immagini
    const validImages = images.filter(img => {
      const coords = cleanCoordinates(img.lat, img.lon);
      return coords !== null;
    });

    if (validImages.length > 0) {
      const bounds = L.latLngBounds(
        validImages.map(img => {
          const coords = cleanCoordinates(img.lat, img.lon);
          return coords ? [coords[0], coords[1]] : [0, 0];
        })
      );
      
      const isMobile = window.innerWidth < 768;
      map.fitBounds(bounds, { 
        padding: isMobile ? [50, 50] : [100, 100],
        maxZoom: isMobile ? 13 : 15,
        animate: true,
        duration: 1
      });
    }
  }, [images, map, bounds]);

  // Adatta la vista quando cambia la dimensione della finestra
  useEffect(() => {
    const handleResize = () => {
      // Verifica se la mappa è ancora valida
      if (!map || !(map as any)._loaded) return;
      
      // Ricalcola i bounds quando cambia la dimensione della finestra
      if (bounds) {
        const latLngBounds = L.latLngBounds(
          [[bounds.south, bounds.west], [bounds.north, bounds.east]]
        );
        
        const isMobile = window.innerWidth < 768;
        map.fitBounds(latLngBounds, { 
          padding: isMobile ? [50, 50] : [100, 100],
          maxZoom: isMobile ? 13 : 15,
          animate: false
        });
        return;
      }
      
      // Solo se non ci sono bounds specifici, usa le immagini
      const validImages = images.filter(img => {
        const coords = cleanCoordinates(img.lat, img.lon);
        return coords !== null;
      });

      if (validImages.length > 0) {
        const bounds = L.latLngBounds(
          validImages.map(img => {
            const coords = cleanCoordinates(img.lat, img.lon);
            return coords ? [coords[0], coords[1]] : [0, 0];
          })
        );
        
        const isMobile = window.innerWidth < 768;
        map.fitBounds(bounds, { 
          padding: isMobile ? [50, 50] : [100, 100],
          maxZoom: isMobile ? 13 : 15,
          animate: false
        });
      }
    };

    // Debounce la funzione di resize per evitare chiamate troppo frequenti
    let resizeTimeout: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(handleResize, 300);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedResize);
    };
  }, [map, bounds, images]);  // Aggiungiamo images come dipendenza ma con debounce

  return null;
}

interface MapProps {
  images: ImageLocation[];
  isLoading?: boolean;
  error?: string | null;
  initialLocation?: {
    lat?: number;
    lon?: number;
    zoom?: number;
    imageId?: string;
    imagePath?: string;
    focusedImage?: boolean;
  };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Componente per gestire la posizione iniziale della mappa
function InitialLocationHandler({ initialLocation }: { initialLocation?: MapProps['initialLocation'] }) {
  const map = useMap();

  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lon) {
      const lat = Number(initialLocation.lat);
      const lon = Number(initialLocation.lon);
      const zoom = Number(initialLocation.zoom || 18);

      // Aggiungiamo un piccolo delay per assicurarci che la mappa sia completamente caricata
      const timer = setTimeout(() => {
        // Verifichiamo che la mappa sia effettivamente inizializzata
        if (map && !map.getContainer().classList.contains('leaflet-container')) {
          return;
        }

        // Impostiamo la vista con una durata di animazione più lunga
        map.setView(
          [lat, lon],
          zoom,
          { 
            animate: true,
            duration: 1.5, // Aumentiamo la durata dell'animazione
            easeLinearity: 0.25 // Aggiungiamo una curva di easing più fluida
          }
        );

        // Forziamo un refresh della mappa dopo lo zoom
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [map, initialLocation]);

  return null;
}

const Map = ({ images, isLoading, error, initialLocation, bounds }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Gestione della pulizia della mappa
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          // Rimuoviamo tutti i layer
          mapRef.current.eachLayer((layer: L.Layer) => {
            if (layer && typeof layer.remove === 'function') {
              layer.remove();
            }
          });

          // Chiudiamo tutti i popup aperti
          mapRef.current.closePopup();

          // Rimuoviamo la mappa
          if (typeof mapRef.current.remove === 'function') {
            mapRef.current.remove();
          }
        } catch (error) {
          console.error('Errore durante la pulizia della mappa:', error);
        }
      }
    };
  }, []);

  // Gestione del caricamento della mappa
  const handleMapReady = () => {
    setIsMapReady(true);
  };

  // URL delle tile per tema chiaro e scuro
  const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

  // Funzione per determinare l'URL della tile in base al tema
  const getTileUrl = () => {
    return document.documentElement.classList.contains('dark') ? darkTileUrl : lightTileUrl;
  };

  // Funzione per renderizzare il contenuto della mappa
  const renderMapContent = () => (
    <>
      <InitialLocationHandler initialLocation={initialLocation} />
      <TileLayer url={getTileUrl()} />
      <BoundsHandler images={images} bounds={bounds} />
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        iconCreateFunction={createClusterCustomIcon}
        spiderfyDistanceMultiplier={2}
        disableClusteringAtZoom={19}
      >
        {images.map((image) => {
          const coords = cleanCoordinates(image.lat, image.lon);
          if (!coords) return null;

          const customIcon = createCustomIcon(image);

          return (
            <Marker
              key={image.id}
              position={coords}
              icon={customIcon}
            >
              <Popup className="custom-popup">
                <img
                  src={getImageUrl(image.thumb_big_path)}
                  alt={`Location ${image.id}`}
                  className="custom-popup-image"
                />
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </>
  );

  const mapContainer = (
    <MapContainer
      center={[41.9028, 12.4964]}
      zoom={6}
      className="w-full h-full"
      zoomControl={true}
      ref={mapRef}
      whenReady={handleMapReady}
    >
      {isMapReady && renderMapContent()}
    </MapContainer>
  );

  if (isLoading) {
    return (
      <div className="relative w-full h-full">
        {mapContainer}
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-full">
        {mapContainer}
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
          <div className="text-red-500 dark:text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-full">
        {mapContainer}
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Nessuna immagine con coordinate geografiche
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {mapContainer}
    </div>
  );
};

export default Map; 