import { useEffect, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { MAP_ZOOM } from '../utils/mapConfig';

interface ZoomSliderProps {
  map: LeafletMap | null;
}

/** Convert a Leaflet zoom level into a 1–100 scale. */
function zoomToPercent(zoom: number): number {
  const ratio = (zoom - MAP_ZOOM.min) / (MAP_ZOOM.max - MAP_ZOOM.min);
  return Math.round(1 + ratio * 99);
}

/** Convert a 1–100 value back into a Leaflet zoom level. */
function percentToZoom(percent: number): number {
  const ratio = (percent - 1) / 99;
  return MAP_ZOOM.min + ratio * (MAP_ZOOM.max - MAP_ZOOM.min);
}

function clamp(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.min(100, Math.max(1, value));
}

/**
 * A 1–100 zoom control (slider + number input) that stays in sync with the
 * map's actual zoom, including zooms triggered by scroll or the +/- buttons.
 */
export function ZoomSlider({ map }: ZoomSliderProps) {
  const [percent, setPercent] = useState(() => zoomToPercent(MAP_ZOOM.initial));

  useEffect(() => {
    if (!map) return;
    const update = () => setPercent(zoomToPercent(map.getZoom()));
    update();
    map.on('zoom', update);
    return () => {
      map.off('zoom', update);
    };
  }, [map]);

  function applyZoom(value: number) {
    const next = clamp(value);
    setPercent(next);
    map?.setZoom(percentToZoom(next));
  }

  return (
    <div className="zoom">
      <span className="zoom__label">Zoom</span>
      <input
        type="range"
        className="zoom__slider"
        min={1}
        max={100}
        value={percent}
        onChange={(e) => applyZoom(Number(e.target.value))}
        aria-label="Zoom level"
      />
      <input
        type="number"
        className="zoom__number"
        min={1}
        max={100}
        value={percent}
        onChange={(e) => applyZoom(Number(e.target.value))}
        aria-label="Zoom level (1 to 100)"
      />
    </div>
  );
}
