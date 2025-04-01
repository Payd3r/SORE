import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup, useMapEvents } from 'react-leaflet';
import { getImageUrl } from '../../api/images';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import '../../styles/map.css';

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
  
  // Per cluster grandi (più di 50 immagini)
  if (count > 50) {
    const markers = cluster.getAllChildMarkers();
    // Prendi 4 marker casuali
    const randomMarkers = markers
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    
    const previewsHtml = randomMarkers.map((marker: any, index: number) => {
      const image = marker.options.image as ImageLocation;
      return `
        <div class="cluster-preview-image" style="grid-area: img${index + 1}">
          <img src="${getImageUrl(image.thumb_small_path)}" alt="preview" />
        </div>
      `;
    }).join('');

    return new L.DivIcon({
      html: `
        <div class="cluster-icon-grid">
          ${previewsHtml}
          <div class="cluster-counter">+${count}</div>
        </div>
      `,
      className: 'custom-cluster-icon',
      iconSize: L.point(80, 80),
      iconAnchor: L.point(40, 40)
    });
  }
  
  // Per cluster più piccoli, usa lo stile normale
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

// Componente per gestire i popup
function PopupManager() {
  useEffect(() => {
    // Aggiungi stili CSS personalizzati per il popup e marker oscurato
    const style = document.createElement('style');
    style.textContent = `
      .custom-popup .leaflet-popup-content-wrapper {
        background: transparent;
        box-shadow: none;
        padding: 0;
      }
      .custom-popup .leaflet-popup-content {
        margin: 0;
        border: none;
        background: transparent;
      }
      .custom-popup .leaflet-popup-tip-container {
        display: none;
      }
      .custom-popup .leaflet-popup-close-button {
        display: none;
      }
      .custom-popup-image {
        max-width: 300px;
        max-height: 400px;
        width: auto;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: transform 0.2s ease;
      }
      .custom-popup-image:hover {
        transform: scale(1.02);
      }
      .dark .custom-popup-image {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.18);
      }
      .marker-dimmed img {
        opacity: 0.3;
        transition: opacity 0.3s ease;
      }
      .leaflet-control-attribution {
        display: none;
      }
      .leaflet-container {
        z-index: 1 !important;
      }
      .leaflet-control-zoom {
        border: none !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        margin-left: 16px !important;
        margin-bottom: 16px !important;
        z-index: 1 !important;
      }
      .leaflet-control-zoom-in,
      .leaflet-control-zoom-out {
        width: 36px !important;
        height: 36px !important;
        line-height: 36px !important;
        background-color: white !important;
        border: none !important;
        font-size: 18px !important;
        font-weight: bold !important;
        color: #4B5563 !important;
        transition: all 0.2s ease !important;
      }
      .leaflet-control-zoom-in:hover,
      .leaflet-control-zoom-out:hover {
        background-color: #F3F4F6 !important;
        color: #1F2937 !important;
      }
      .leaflet-control-zoom-in {
        border-top-left-radius: 8px !important;
        border-top-right-radius: 8px !important;
      }
      .leaflet-control-zoom-out {
        border-bottom-left-radius: 8px !important;
        border-bottom-right-radius: 8px !important;
      }
      .dark .leaflet-control-zoom-in,
      .dark .leaflet-control-zoom-out {
        background-color: #374151 !important;
        color: #D1D5DB !important;
      }
      .dark .leaflet-control-zoom-in:hover,
      .dark .leaflet-control-zoom-out:hover {
        background-color: #4B5563 !important;
        color: #F9FAFB !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}

// Componente per gestire gli eventi della mappa
function MapEventHandler() {
  const map = useMap();
  
  useMapEvents({
    click: () => {
      map.closePopup();
    },
  });

  return null;
}

// Componente per gestire i marker sulla mappa
function Markers({ images }: { images: ImageLocation[] }) {  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Filtra le immagini con coordinate valide
  const validImages = images.filter(img => {
    const coords = cleanCoordinates(img.lat, img.lon);
    return coords !== null;
  });

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterCustomIcon}
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}
      zoomToBoundsOnClick={true}
      disableClusteringAtZoom={isMobile ? 16 : 18}
      spiderLegPolylineOptions={{
        weight: 1.5,
        color: '#222',
        opacity: 0.5,
        className: 'dark:!stroke-gray-200'
      }}
      spiderfyDistanceMultiplier={isMobile ? 2 : 1.5}
      maxClusterRadius={(zoom: number) => {
        const baseFactor = isMobile ? 1.25 : 1;
        if (zoom <= 10) return 120 * baseFactor;
        if (zoom <= 13) return 100 * baseFactor;
        if (zoom <= 15) return 80 * baseFactor;
        if (zoom <= 16) return 60 * baseFactor;
        if (zoom <= 17) return 40 * baseFactor;
        return 20 * baseFactor;
      }}
      animate={true}
      animateAddingMarkers={true}
      removeOutsideVisibleBounds={true}
      polygonOptions={{
        fillColor: '#3B82F6',
        color: '#2563EB',
        weight: 2,
        opacity: 0.5
      }}
      chunkInterval={100}
      chunkDelay={50}
      chunkProgress={(processed: number, total: number) => {
        if (processed === total && total > 500) {
          console.log('Rendering completato: ', processed, ' marker su ', total);
        }
      }}
      singleMarkerMode={false}
    >
      {validImages.map((image) => {
        const coords = cleanCoordinates(image.lat, image.lon);
        if (!coords) return null;
        const [lat, lon] = coords;

        return (
          <Marker
            key={image.id}
            position={[lat, lon]}
            icon={createCustomIcon(image)}
          >
            <Popup 
              className="custom-popup"
              maxWidth={isMobile ? 250 : 300}
              minWidth={isMobile ? 150 : 200}
              autoPanPadding={isMobile ? [50, 50] : [100, 100]}
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(image.thumb_big_path)}
                  alt="Location"
                  className="custom-popup-image"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
                  }}
                />
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
}

// Componente per gestire il bounds della mappa
function BoundsHandler({ images }: { images: ImageLocation[] }) {
  const map = useMap();

  useEffect(() => {
    // Filtra le immagini con coordinate valide
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
      
      // Aggiungi un padding più grande e una durata di animazione più lunga
      // Aumentato il padding per essere più mobile-friendly
      const isMobile = window.innerWidth < 768;
      map.fitBounds(bounds, { 
        padding: isMobile ? [50, 50] : [100, 100],
        maxZoom: isMobile ? 13 : 15,  // Zoom più limitato su mobile
        animate: true,
        duration: 1
      });
    }
  }, [images, map]);

  // Adatta la vista quando cambia la dimensione della finestra
  useEffect(() => {
    const handleResize = () => {
      // Ricalcola i bounds quando cambia la dimensione della finestra
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

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [images, map]);

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

const Map = ({ images, isLoading, error, initialLocation }: MapProps) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(initialLocation?.imageId || null);

  useEffect(() => {
    if (initialLocation?.imageId) {
      setSelectedMarkerId(initialLocation.imageId);
    }
  }, [initialLocation]);

  // URL delle tile per tema chiaro e scuro
  const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

  // Funzione per determinare l'URL della tile in base al tema
  const getTileUrl = () => {
    return document.documentElement.classList.contains('dark') ? darkTileUrl : lightTileUrl;
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-full">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          className="w-full h-full"
          attributionControl={false}
        >
          <TileLayer
            url={getTileUrl()}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <PopupManager />
          <InitialLocationHandler initialLocation={initialLocation} />
          <Markers images={images} />
          <BoundsHandler images={images} />
          <MapEventHandler />
        </MapContainer>
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-full">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          className="w-full h-full"
          attributionControl={false}
        >
          <TileLayer
            url={getTileUrl()}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <PopupManager />
          <InitialLocationHandler initialLocation={initialLocation} />
          <Markers images={images} />
          <BoundsHandler images={images} />
          <MapEventHandler />
        </MapContainer>
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
          <div className="text-red-500 dark:text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-full">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          className="w-full h-full"
          attributionControl={false}
        >
          <TileLayer
            url={getTileUrl()}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <PopupManager />
          <InitialLocationHandler initialLocation={initialLocation} />
          <Markers images={images} />
          <BoundsHandler images={images} />
          <MapEventHandler />
        </MapContainer>
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Nessuna immagine con coordinate geografiche
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[41.9028, 12.4964]}
        zoom={6}
        className="w-full h-full"
        zoomControl={true}
      >
        <InitialLocationHandler initialLocation={initialLocation} />
        <TileLayer url={getTileUrl()} />
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
      </MapContainer>
    </div>
  );
};

export default Map; 