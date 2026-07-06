import { useMemo, useState } from 'react';
import { MapContainer, ImageOverlay } from 'react-leaflet';
import { CRS, type LatLngBoundsExpression, type Map as LeafletMap } from 'leaflet';
import { MAP_ZOOM } from '../utils/mapConfig';
import { useMapContext } from '../context/MapContext';
import { RouteLayer } from './RouteLayer';
import { TrackLayer } from './TrackLayer';
import { MapToolbar } from './MapToolbar';
import { ComparisonPanel } from './ComparisonPanel';
import { ZoomSlider } from './ZoomSlider';
import 'leaflet/dist/leaflet.css';

/**
 * Renders the georeferenced map image as a pannable / zoomable Leaflet map.
 *
 * Uses CRS.Simple so the image behaves as a flat pixel plane; real-world
 * coordinates are derived from the world file in the drawing layer.
 */
export function MapView() {
  const { image, width, height } = useMapContext();
  const [map, setMap] = useState<LeafletMap | null>(null);

  // Bounds in [y, x] order: bottom-left (0,0) to top-right (height, width).
  const bounds = useMemo<LatLngBoundsExpression>(
    () => [
      [0, 0],
      [height, width],
    ],
    [height, width],
  );

  const center = useMemo<[number, number]>(
    () => [height / 2, width / 2],
    [height, width],
  );

  if (!image) return null;

  return (
    <div className="map-wrap">
      <MapContainer
        ref={setMap}
        crs={CRS.Simple}
        center={center}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={1}
        minZoom={MAP_ZOOM.min}
        maxZoom={MAP_ZOOM.max}
        zoom={MAP_ZOOM.initial}
        zoomSnap={0}
        scrollWheelZoom
        className="map-view"
        attributionControl={false}
      >
        <ImageOverlay url={image} bounds={bounds} />
        <RouteLayer />
        <TrackLayer />
      </MapContainer>
      <MapToolbar />
      <ComparisonPanel />
      <ZoomSlider map={map} />
    </div>
  );
}
