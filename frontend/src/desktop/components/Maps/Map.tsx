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
const makeCreateClusterCustomIcon = (images: ImageLocation[]) => (cluster: any) => {
  const count = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers();
  
  // Funzione per ottenere le miniature dei marker nel cluster
  const getThumbs = (n: number) => {
    // Filtra i marker che hanno un ID valido e trova le corrispondenti immagini
    const validMarkers = markers.filter((m: any) => m.options && typeof m.options.id !== 'undefined');
    
    // Mappa i marker validi alle loro thumbnail HTML
    const thumbs = validMarkers.slice(0, n).map((m: any) => {
      const markerId = m.options.id;
      const imgObj = images.find(img => img.id === markerId);
      
      if (imgObj && imgObj.thumb_small_path) {
        // Utilizza un URL completo per l'immagine
        const imgUrl = getImageUrl(imgObj.thumb_small_path);
        return `<div class="cluster-preview-image"><img src="${imgUrl}" alt="thumb-${markerId}" /></div>`;
      }
      return '';
    }).filter((thumb: string) => thumb !== '').join('');
    
    // Verifica che ci siano thumbnail valide
    return thumbs;
  };
  
  // Per cluster con 2 immagini, mostra una fila di 2 immagini (1x2)
  if (count === 2) {
    const thumbs = getThumbs(2);
    
    // Se abbiamo thumbnail valide, crea la fila 1x2
    if (thumbs && thumbs.length > 0) {
      return new L.DivIcon({
        html: `
          <div class="cluster-icon-row-2">
            ${thumbs}
          </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: L.point(82, 40),
        iconAnchor: L.point(41, 20)
      });
    }
  } 
  // Per cluster con 3 immagini, mostra una fila di 3 immagini (1x3)
  else if (count === 3) {
    const thumbs = getThumbs(3);
    
    // Se abbiamo thumbnail valide, crea la fila 1x3
    if (thumbs && thumbs.length > 0) {
      return new L.DivIcon({
        html: `
          <div class="cluster-icon-row-3">
            ${thumbs}
          </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: L.point(123, 40),
        iconAnchor: L.point(61, 20)
      });
    }
  }
  // Per cluster con 4-29 immagini, mostra una griglia 2x2
  else if (count >= 4 && count <= 29) {
    const thumbs = getThumbs(4);
    
    // Se abbiamo thumbnail valide, crea la griglia 2x2
    if (thumbs && thumbs.length > 0) {
      return new L.DivIcon({
        html: `
          <div class="cluster-icon-grid-2x2">
            ${thumbs}
            <div class="cluster-badge">${count}</div>
          </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: L.point(61, 82),
        iconAnchor: L.point(30, 41)
      });
    }
  } 
  // Per cluster con 30-59 immagini, mostra una griglia 3x3
  else if (count >= 30 && count <= 59) {
    const thumbs = getThumbs(9);
    
    // Se abbiamo thumbnail valide, crea la griglia 3x3
    if (thumbs && thumbs.length > 0) {
      return new L.DivIcon({
        html: `
          <div class="cluster-icon-grid-3x3">
            ${thumbs}
            <div class="cluster-badge">${count}</div>
          </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: L.point(80, 105),
        iconAnchor: L.point(40, 52)
      });
    }
  }
  // Per cluster con 60-100 immagini, mostra una griglia 4x4
  else if (count >= 60 && count <= 100) {
    const thumbs = getThumbs(16);
    
    // Se abbiamo thumbnail valide, crea la griglia 4x4
    if (thumbs && thumbs.length > 0) {
      return new L.DivIcon({
        html: `
          <div class="cluster-icon-grid-4x4">
            ${thumbs}
            <div class="cluster-badge">${count}</div>
          </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: L.point(120, 150),
        iconAnchor: L.point(60, 75)
      });
    }
  }
  
  // Fallback: cluster classico con solo il numero
  if (count > 100) {
    return new L.DivIcon({
      html: `<div class="cluster-icon cluster-icon-huge"><span>${count}</span></div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(64, 64),
      iconAnchor: L.point(32, 32)
    });
  } else {
    const size = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
    return new L.DivIcon({
      html: `<div class="cluster-icon cluster-icon-${size}"><span>${count}</span></div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(40, 40),
      iconAnchor: L.point(20, 20)
    });
  }
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

// Componente marker custom per associare l'immagine all'istanza Leaflet
function CustomMarker({ image, coords, customIcon, markerId }: { image: ImageLocation, coords: [number, number], customIcon: L.DivIcon, markerId: number }) {
  const markerRef = useRef<L.Marker | null>(null);
  
  // Assicurati che l'ID del marker sia impostato correttamente
  useEffect(() => {
    if (markerRef.current) {
      // Assegna l'ID all'opzione del marker per poterlo recuperare nel cluster
      (markerRef.current as any).options.id = markerId;
    }
  }, [markerId]);
  
  return (
    <Marker
      position={coords}
      icon={customIcon}
      ref={markerRef}
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
}

// Definiamo un'interfaccia estesa per accedere ai metodi privati di Leaflet
interface ExtendedMarkerCluster extends L.MarkerCluster {
  _spiderfy: () => any;
  _spiderfyDistanceMultiplier: number;
  _group: {
    _spiderfyDistanceMultiplier: number;
    _circleSpiralSwitchover: number;
    _spiralFootSeparation: number;
    _spiralLengthStart: number;
    _spiralLengthFactor: number;
  };
}

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

  // Estendo il comportamento di MarkerCluster per migliorare spiderfy
  useEffect(() => {
    // Vogliamo estendere il comportamento di Leaflet solo una volta
    if (typeof window !== 'undefined' && L.MarkerCluster.prototype) {
      // Override del metodo _spiderfy per migliorare la disposizione
      const originalSpiderfy = (L.MarkerCluster.prototype as any)._spiderfy;
      (L.MarkerCluster.prototype as any)._spiderfy = function(this: ExtendedMarkerCluster) {
        // Rileva la dimensione del marker
        const markerSize = 40; // Dimensione base del marker (in px)
        const isMobile = window.innerWidth < 768;
        const actualMarkerSize = isMobile ? markerSize : markerSize * 1.4;
        
        // Modifica il fattore di distanza in base al numero di markers
        const childCount = this.getAllChildMarkers().length;
        let lengthFactor = 1;
        
        if (childCount > 8) {
          lengthFactor = 1.2;
        } else if (childCount > 15) {
          lengthFactor = 1.4;
        } else if (childCount > 25) {
          lengthFactor = 1.6;
        }
        
        // Applica il fattore di distanza all'oggetto di configurazione
        this._spiderfyDistanceMultiplier = lengthFactor;
        
        // Calcola la distanza tra marker per evitare sovrapposizioni
        const originalRadius = this._group._spiderfyDistanceMultiplier || 1;
        const radius = originalRadius * actualMarkerSize * 1.5;
        const legs = this.getAllChildMarkers().length;
        
        // Imposta la distanza minima tra i marker in base al loro numero
        // più marker = maggiore distanza per evitare sovrapposizioni
        this._group._circleSpiralSwitchover = Math.min(legs, 9);
        this._group._spiralFootSeparation = radius / 3;
        this._group._spiralLengthStart = radius / 2;
        this._group._spiralLengthFactor = 3;
        
        // Chiama la funzione originale
        return originalSpiderfy.call(this);
      };
    }
  }, []);

  // Gestione del caricamento della mappa
  const handleMapReady = () => {
    setIsMapReady(true);
  };

  // URL delle tile per tema chiaro e scuro
  const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  // Opzioni di temi scuri gratuiti
  const darkTileOptions = [
    {
      name: 'CartoDB Dark Matter',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>'
    },
    {
      name: 'Stamen Toner Dark',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    {
      name: 'Stadia Dark',
      url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }
  ];

  // Seleziona il tema scuro predefinito (puoi cambiarlo a seconda di quale preferisci)
  const defaultDarkTheme = darkTileOptions[0]; // CartoDB Dark Matter

  // Funzione per determinare l'URL della tile in base al tema
  const getTileUrl = () => {
    return document.documentElement.classList.contains('dark') ? defaultDarkTheme.url : lightTileUrl;
  };

  // Funzione per ottenere l'attribuzione corretta in base al tema
  const getTileAttribution = () => {
    return document.documentElement.classList.contains('dark') 
      ? defaultDarkTheme.attribution 
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  };

  // Funzione per renderizzare il contenuto della mappa
  const renderMapContent = () => (
    <>
      <InitialLocationHandler initialLocation={initialLocation} />
      <TileLayer 
        url={getTileUrl()} 
        attribution={getTileAttribution()}
      />
      <BoundsHandler images={images} bounds={bounds} />
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={80}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        iconCreateFunction={makeCreateClusterCustomIcon(images)}
        spiderfyDistanceMultiplier={2.5}
        disableClusteringAtZoom={19}
        spiderLegPolylineOptions={{
          weight: 2,
          color: '#333',
          opacity: 0.7
        }}
        animate={true}
        // Opzioni per evitare sovrapposizioni
        removeOutsideVisibleBounds={true}
        animateAddingMarkers={true}
        singleMarkerMode={false}
      >
        {images.map((image) => {
          const coords = cleanCoordinates(image.lat, image.lon);
          if (!coords) return null;
          const customIcon = createCustomIcon(image);
          return (
            <CustomMarker
              key={image.id}
              image={image}
              coords={coords}
              customIcon={customIcon}
              markerId={image.id}
            />
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