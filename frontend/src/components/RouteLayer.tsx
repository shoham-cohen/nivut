import { useMemo } from 'react';
import { Polyline, Marker, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useRouteStore } from '../hooks/useRouteStore';
import { useMapContext } from '../context/MapContext';
import { pixelToMap } from '../services/coordinateTransformer';
import { latLngToPixel, pixelToLatLng } from '../utils/pixelMapping';
import type { RoutePoint } from '../types';

/** Small circular handle used for each draggable polyline vertex. */
const vertexIcon = divIcon({
  className: '',
  html: '<div class="route-vertex"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/**
 * Renders the planned polyline and its draggable vertices.
 *
 * Drawing flow: click -> Leaflet latlng -> image pixel -> map coordinate.
 * Map coordinates are stored as the source of truth; pixels are kept for
 * rendering. Must be rendered as a child of <MapContainer>.
 */
export function RouteLayer() {
  const points = useRouteStore((s) => s.points);
  const isDrawing = useRouteStore((s) => s.isDrawing);
  const addPoint = useRouteStore((s) => s.addPoint);
  const movePoint = useRouteStore((s) => s.movePoint);
  const { worldFile, height, isGeoreferenced } = useMapContext();

  /** Build a RoutePoint from a Leaflet click/drag position. */
  function toRoutePoint(lat: number, lng: number): RoutePoint | null {
    if (!worldFile) return null;
    const { pixelX, pixelY } = latLngToPixel(lat, lng, height);
    const { mapX, mapY } = pixelToMap(pixelX, pixelY, worldFile);
    return { mapX, mapY, pixelX, pixelY };
  }

  useMapEvents({
    click(e) {
      if (!isDrawing || !isGeoreferenced) return;
      const point = toRoutePoint(e.latlng.lat, e.latlng.lng);
      if (point) addPoint(point);
    },
  });

  const positions = useMemo(
    () => points.map((p) => pixelToLatLng(p.pixelX, p.pixelY, height)),
    [points, height],
  );

  return (
    <>
      {positions.length > 1 && (
        <Polyline positions={positions} pathOptions={{ color: '#d63384', weight: 4 }} />
      )}
      {points.map((point, index) => (
        <Marker
          key={index}
          position={pixelToLatLng(point.pixelX, point.pixelY, height)}
          icon={vertexIcon}
          draggable
          eventHandlers={{
            drag: (e) => {
              const { lat, lng } = e.target.getLatLng();
              const moved = toRoutePoint(lat, lng);
              if (moved) movePoint(index, moved);
            },
          }}
        />
      ))}
    </>
  );
}
