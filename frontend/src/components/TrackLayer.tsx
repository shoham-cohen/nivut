import { useMemo } from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import { useTrackStore } from '../hooks/useTrackStore';
import { useComparison } from '../hooks/useComparison';
import { useMapContext } from '../context/MapContext';
import { mapToPixel } from '../services/coordinateTransformer';
import { pixelToLatLng } from '../utils/pixelMapping';

/**
 * Renders the loaded actual GPS track over the map, plus red markers where the
 * track diverged from the planned route beyond tolerance. Must be a child of
 * <MapContainer>.
 */
export function TrackLayer() {
  const track = useTrackStore((s) => s.track);
  const report = useComparison();
  const { worldFile, height } = useMapContext();

  const positions = useMemo<LatLngTuple[]>(() => {
    if (!track || !worldFile) return [];
    return track.points.map((p) => {
      const { x, y } = mapToPixel(p.mapX, p.mapY, worldFile);
      return pixelToLatLng(x, y, height);
    });
  }, [track, worldFile, height]);

  const divergences = useMemo(() => {
    if (!report || !worldFile) return [];
    return report.divergences.map((d) => {
      const { x, y } = mapToPixel(d.mapX, d.mapY, worldFile);
      return { pos: pixelToLatLng(x, y, height), deviationM: d.deviationM };
    });
  }, [report, worldFile, height]);

  if (positions.length < 2) return null;

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{ color: '#0d6efd', weight: 3, opacity: 0.9, dashArray: '6 6' }}
      />
      {divergences.map((d, i) => (
        <CircleMarker
          key={i}
          center={d.pos}
          radius={5}
          pathOptions={{ color: '#dc3545', weight: 1, fillColor: '#dc3545', fillOpacity: 0.8 }}
        >
          <Tooltip>{`${d.deviationM.toFixed(0)} m off route`}</Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
