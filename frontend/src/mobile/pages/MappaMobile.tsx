import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, Marker, TileLayer, useMap, ZoomControl } from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { getImageUrl } from "../../api/images";
import { getMapMemories, type MapMemory } from "../../api/map";
import PwaBottomSheet from "../components/ui/BottomSheet";
import MapMemoryPreviewSheet from "../components/detail/MapMemoryPreviewSheet";
import "../styles/map-mobile.css";

const DEFAULT_CENTER: [number, number] = [42.5, 12.5];
const DEFAULT_ZOOM = 5;

function cleanCoordinates(lat: number | string, lon: number | string): [number, number] | null {
  const numLat = typeof lat === "string" ? parseFloat(lat) : Number(lat);
  const numLon = typeof lon === "string" ? parseFloat(lon) : Number(lon);
  if (!Number.isFinite(numLat) || !Number.isFinite(numLon)) return null;
  if (numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) return null;
  return [numLat, numLon];
}

function createMemoryIcon(memory: MapMemory) {
  const cover = memory.thumb_small_path || memory.thumb_path;
  const html = cover
    ? `<div class="pwa-map-marker"><img src="${getImageUrl(cover)}" alt="marker-${memory.id}" /></div>`
    : `<div class="pwa-map-marker pwa-map-marker-placeholder"><span class="material-symbols-outlined">photo</span></div>`;

  return new L.DivIcon({
    html,
    className: "pwa-map-marker-wrapper",
    iconSize: L.point(40, 40),
    iconAnchor: L.point(20, 40),
  });
}

function createClusterIcon(isDark: boolean) {
  return (cluster: L.MarkerCluster) => {
    const childCount = cluster.getChildCount();
    const markers = cluster.getAllChildMarkers();
    const thumbs = markers
      .slice(0, 3)
      .map((marker: any) => marker.options?.memoryThumb as string | undefined)
      .filter(Boolean);

    if (childCount <= 3 && thumbs.length >= 2) {
      const imagesHtml = thumbs
        .map((thumb) => `<span class="pwa-map-cluster-thumb"><img src="${getImageUrl(thumb)}" alt="" /></span>`)
        .join("");
      return new L.DivIcon({
        html: `<div class="pwa-map-cluster pwa-map-cluster-thumbs">${imagesHtml}</div>`,
        className: isDark
          ? "pwa-map-cluster-wrapper pwa-map-cluster-wrapper-dark"
          : "pwa-map-cluster-wrapper",
        iconSize: L.point(62, 62),
        iconAnchor: L.point(31, 31),
      });
    }

    return new L.DivIcon({
      html: `<div class="pwa-map-cluster pwa-map-cluster-badge"><span>${childCount}</span></div>`,
      className: isDark
        ? "pwa-map-cluster-wrapper pwa-map-cluster-wrapper-dark"
        : "pwa-map-cluster-wrapper",
      iconSize: L.point(52, 52),
      iconAnchor: L.point(26, 26),
    });
  };
}

function FitMapToMemories({ memories }: { memories: MapMemory[] }) {
  const map = useMap();

  useEffect(() => {
    const valid = memories
      .map((memory) => cleanCoordinates(memory.lat, memory.lon))
      .filter((coords): coords is [number, number] => Boolean(coords));

    if (!valid.length) return;

    const bounds = L.latLngBounds(valid);
    map.fitBounds(bounds, {
      padding: [48, 48],
      maxZoom: 15,
      animate: false,
    });
  }, [map, memories]);

  return null;
}

function MemoryMarker({
  memory,
  onPress,
}: {
  memory: MapMemory;
  onPress: (memory: MapMemory) => void;
}) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const coords = cleanCoordinates(memory.lat, memory.lon);

  useEffect(() => {
    if (!markerRef.current) return;
    const markerOptions = markerRef.current.options as any;
    markerOptions.memoryId = memory.id;
    markerOptions.memoryThumb = memory.thumb_small_path || memory.thumb_path || undefined;
  }, [memory.id, memory.thumb_small_path, memory.thumb_path]);

  if (!coords) return null;

  return (
    <Marker
      ref={markerRef}
      position={coords}
      icon={createMemoryIcon(memory)}
      eventHandlers={{
        click: () => onPress(memory),
      }}
    />
  );
}

export default function MappaMobile() {
  const [selectedMemory, setSelectedMemory] = useState<MapMemory | null>(null);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const { data: memories = [], isLoading, isError } = useQuery({
    queryKey: ["mapMemories"],
    queryFn: getMapMemories,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const clusterIcon = useMemo(() => createClusterIcon(isDark), [isDark]);

  return (
    <section className="pwa-map-screen">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="pwa-map-container"
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer key={isDark ? "dark" : "light"} url={tileUrl} attribution={tileAttribution} />
        <FitMapToMemories memories={memories} />
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          zoomToBoundsOnClick
          maxClusterRadius={70}
          disableClusteringAtZoom={18}
          iconCreateFunction={clusterIcon}
        >
          {memories.map((memory) => (
            <MemoryMarker
              key={memory.id}
              memory={memory}
              onPress={setSelectedMemory}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {isLoading ? (
        <div className="pwa-map-status-overlay">Caricamento mappa...</div>
      ) : null}
      {isError ? (
        <div className="pwa-map-status-overlay pwa-map-status-overlay-error">
          Impossibile caricare la mappa.
        </div>
      ) : null}

      <PwaBottomSheet
        open={Boolean(selectedMemory)}
        onClose={() => setSelectedMemory(null)}
        panelClassName="pwa-bottom-sheet-panel-map"
        contentClassName="pwa-bottom-sheet-content-map"
      >
        {selectedMemory ? (
          <MapMemoryPreviewSheet
            memory={selectedMemory}
            onClose={() => setSelectedMemory(null)}
          />
        ) : null}
      </PwaBottomSheet>
    </section>
  );
}
