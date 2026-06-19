import type { MapImageConfig } from '../types';

/**
 * Default topographic base map.
 *
 * The sample asset lives in /public so it is served from the site root.
 * Replace `url`/`width`/`height` to swap in a different topographic map.
 */
export const DEFAULT_MAP_IMAGE: MapImageConfig = {
  url: '/sample-topo-map.svg',
  width: 1600,
  height: 1200,
};

/** Zoom limits for the CRS.Simple image map. */
export const MAP_ZOOM = {
  min: -2,
  max: 4,
  initial: 0,
} as const;
