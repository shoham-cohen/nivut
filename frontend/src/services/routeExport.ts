import type { ExportedRoute, RoutePoint, WorldFile } from '../types';
import { mapToPixel } from './coordinateTransformer';

/**
 * Builds the export payload for a planned route.
 *
 * Only real-world map coordinates are exported — pixel coordinates are a
 * rendering detail and are intentionally omitted so the route stays portable
 * for the future GPS comparison engine.
 */
export function buildExportedRoute(
  mapId: string,
  projection: string | null,
  points: RoutePoint[],
): ExportedRoute {
  return {
    mapId,
    projection,
    route: points.map((p) => ({ mapX: p.mapX, mapY: p.mapY })),
  };
}

/** Triggers a browser download of the route as a JSON file. */
export function downloadRouteJson(route: ExportedRoute, filename = 'route.json'): void {
  const blob = new Blob([JSON.stringify(route, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Parses an exported route JSON string back into an ExportedRoute.
 *
 * @throws if the payload is not a valid exported route.
 */
export function parseExportedRoute(json: string): ExportedRoute {
  const data = JSON.parse(json) as Partial<ExportedRoute>;
  if (!data || !Array.isArray(data.route)) {
    throw new Error('Not a valid route file (missing "route" array).');
  }
  const route = data.route.map((p) => {
    if (typeof p?.mapX !== 'number' || typeof p?.mapY !== 'number') {
      throw new Error('Route file contains an invalid point.');
    }
    return { mapX: p.mapX, mapY: p.mapY };
  });
  return {
    mapId: data.mapId ?? 'map',
    projection: data.projection ?? null,
    route,
  };
}

/**
 * Rebuilds drawable RoutePoints (with pixel coordinates for rendering) from an
 * exported route, using the current map's world file.
 */
export function exportedRouteToPoints(
  route: ExportedRoute,
  world: WorldFile,
): RoutePoint[] {
  return route.route.map(({ mapX, mapY }) => {
    const { x, y } = mapToPixel(mapX, mapY, world);
    return { mapX, mapY, pixelX: x, pixelY: y };
  });
}
