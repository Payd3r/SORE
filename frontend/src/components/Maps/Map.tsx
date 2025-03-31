import { useEffect } from 'react';
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
      }
      .custom-popup .leaflet-popup-content {
        margin: 0;
        border: none;
      }
      .custom-popup .leaflet-popup-tip-container {
        display: none;
      }
      .custom-popup .leaflet-popup-close-button {
        display: none;
      }
      .marker-dimmed img {
        opacity: 0.3;
        transition: opacity 0.3s ease;
      }
      .leaflet-control-attribution {
        display: none;
      }
      .leaflet-control-zoom {
        border: none !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
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

// Componente per gestire i marker sulla mappa
function Markers({ images }: { images: ImageLocation[] }) {

  // Filtra le immagini con coordinate valide
  const validImages = images.filter(img => {
    const coords = cleanCoordinates(img.lat, img.lon);
    return coords !== null;
  });

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterCustomIcon}
      maxClusterRadius={40}
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
            <Popup className="custom-popup">
              <div className="relative">
                <img
                  src={getImageUrl(image.thumb_big_path)}
                  alt="Location"
                  className="w-60 h-48 object-cover rounded-lg"
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
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [images, map]);

  return null;
}

// Componente per gestire gli eventi della mappa
function MapEventHandler() {
  useMapEvents({
    click: () => {
      // Chiudi tutti i popup quando si clicca sulla mappa
      const map = useMap();
      map.closePopup();
    },
  });

  return null;
}

interface MapProps {
  images: ImageLocation[];
  isLoading?: boolean;
  error?: string | null;
}

export default function Map({ images }: MapProps) {
  return (
    <MapContainer
      center={[41.9028, 12.4964]}
      zoom={6}
      className="w-full h-full"
      preferCanvas={true}
      zoomAnimation={false}
      markerZoomAnimation={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        minZoom={3}
        keepBuffer={2}
        updateWhenIdle={true}
        updateWhenZooming={false}
      />
      <PopupManager />
      <BoundsHandler images={images} />
      <MapEventHandler />
      <Markers images={images} />
    </MapContainer>
  );
} 