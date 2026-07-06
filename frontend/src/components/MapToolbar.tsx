import { useRouteStore } from '../hooks/useRouteStore';
import { useMapContext } from '../context/MapContext';
import { buildExportedRoute, downloadRouteJson } from '../services/routeExport';

/** Floating controls for drawing the planned route. Rendered over the map. */
export function MapToolbar() {
  const points = useRouteStore((s) => s.points);
  const isDrawing = useRouteStore((s) => s.isDrawing);
  const toggleDrawing = useRouteStore((s) => s.toggleDrawing);
  const undo = useRouteStore((s) => s.undo);
  const clear = useRouteStore((s) => s.clear);
  const { mapId, projection } = useMapContext();

  function handleExport() {
    const id = mapId ?? 'map';
    const route = buildExportedRoute(id, projection, points);
    downloadRouteJson(route, `${id}-route.json`);
  }

  return (
    <div className="toolbar">
      <button
        type="button"
        className={`toolbar__btn${isDrawing ? ' toolbar__btn--active' : ''}`}
        onClick={toggleDrawing}
        aria-pressed={isDrawing}
      >
        {isDrawing ? 'Drawing…' : 'Draw route'}
      </button>
      <button
        type="button"
        className="toolbar__btn"
        onClick={undo}
        disabled={points.length === 0}
      >
        Undo
      </button>
      <button
        type="button"
        className="toolbar__btn"
        onClick={clear}
        disabled={points.length === 0}
      >
        Clear
      </button>
      <button
        type="button"
        className="toolbar__btn"
        onClick={handleExport}
        disabled={points.length === 0}
      >
        Export
      </button>
      <span className="toolbar__count">
        {points.length} {points.length === 1 ? 'point' : 'points'}
      </span>
    </div>
  );
}
