import { useMemo } from 'react';
import { MapContainer, ImageOverlay } from 'react-leaflet';
import { CRS, type LatLngBoundsExpression } from 'leaflet';
import type { MapImageConfig } from '../types';
import { MAP_ZOOM } from '../utils/mapConfig';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  image: MapImageConfig;
}

/**
 * Renders a static topographic image as a pannable / zoomable map.
 *
 * Uses Leaflet's CRS.Simple so the map behaves as a flat pixel plane:
 * coordinates map 1:1 to image pixels, which keeps drawn/saved routes stable
 * across zoom levels and devices.
 */
export function MapView({ image }: MapViewProps) {
  // Bounds in [y, x] order: bottom-left (0,0) to top-right (height, width).
  const bounds = useMemo<LatLngBoundsExpression>(
    () => [
      [0, 0],
      [image.height, image.width],
    ],
    [image.height, image.width],
  );

  const center = useMemo<[number, number]>(
    () => [image.height / 2, image.width / 2],
    [image.height, image.width],
  );

  return (
    <MapContainer
      crs={CRS.Simple}
      center={center}
      bounds={bounds}
      maxBounds={bounds}
      maxBoundsViscosity={1}
      minZoom={MAP_ZOOM.min}
      maxZoom={MAP_ZOOM.max}
      zoom={MAP_ZOOM.initial}
      scrollWheelZoom
      className="map-view"
      attributionControl={false}
    >
      <ImageOverlay url={image.url} bounds={bounds} />
    </MapContainer>
  );
}
