import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup, useMapEvents } from 'react-leaflet';
import { getImageUrl } from '../../api/images';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';

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

// Funzione per creare l'icona del cluster
const createClusterCustomIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers();

  // Prendi fino a 4 immagini per il preview
  const previewMarkers = markers.slice(0, 4);
  const remainingCount = count - 4;

  // Calcola dimensioni della griglia
  const size = 120;
  const previewSize = size / 2 - 2; // 2px di gap

  const previews = previewMarkers.map((marker: L.Marker, index: number) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const iconHtml = ((marker.options.icon as L.DivIcon).options.html || '').toString();
    const imageUrl = iconHtml.match(/src="([^"]+)"/)?.[1] || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';

    return `
      <div style="position: absolute; left: ${col * (previewSize + 2)}px; top: ${row * (previewSize + 2)}px;">
        <img 
          src="${imageUrl}"
          alt="Preview"
          class="rounded-lg"
          style="width: ${previewSize}px; height: ${previewSize}px; object-fit: cover; display: block;"
          onerror="this.onerror=null; this.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';"
        />
      </div>
    `;
  }).join('');

  const counterHtml = remainingCount > 0 ? `
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
      +${remainingCount}
    </div>
  ` : '';

  return L.divIcon({
    html: `
      <div class="relative" style="width: ${size}px; height: ${size}px;">
        ${previews}
        ${counterHtml}
      </div>
    `,
    className: 'custom-cluster',
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2)
  });
};

// Funzione per creare l'icona personalizzata del marker
const createCustomIcon = (image: ImageLocation) => {
  const imageUrl = getImageUrl(image.thumb_small_path);
  return L.divIcon({
    html: `
      <div class="relative group">
        <div class="w-12 h-12 overflow-hidden transform transition-transform duration-200 hover:scale-110">
          <img
            src="${imageUrl}"
            alt="Location"
            class="w-full h-full object-cover rounded-lg"
            onerror="this.onerror=null; this.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';"
          />
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
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
}

const Map = ({ images, isLoading, error }: MapProps) => {
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
        <Markers images={images} />
        <BoundsHandler images={images} />
        <MapEventHandler />
      </MapContainer>
    </div>
  );
};

export default Map; 