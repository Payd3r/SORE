import * as L from 'leaflet';

declare module 'leaflet' {
  export interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
  }

  export class MarkerClusterGroup extends L.FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    getChildCount(): number;
  }

  export interface MarkerCluster extends L.Marker {
    getChildCount(): number;
  }

  export function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
} 