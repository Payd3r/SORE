declare module '@changey/react-leaflet-markercluster' {
  import { ComponentType } from 'react';
  import { MarkerClusterGroupOptions, MarkerCluster } from 'leaflet.markercluster';

  interface MarkerClusterGroupProps extends MarkerClusterGroupOptions {
    children: React.ReactNode;
    chunkedLoading?: boolean;
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
  }

  const MarkerClusterGroup: ComponentType<MarkerClusterGroupProps>;
  export default MarkerClusterGroup;
} 