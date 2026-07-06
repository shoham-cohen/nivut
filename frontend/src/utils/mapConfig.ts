/** Zoom limits for the CRS.Simple image map. */
export const MAP_ZOOM = {
  min: -2,
  max: 4,
  initial: 0,
} as const;

/**
 * File extensions accepted for a georeferenced map package.
 *
 * A map package is a PNG raster plus a PGW world file (required) and an
 * optional PRJ projection file. `.wld` is accepted as a PGW alias.
 */
export const MAP_PACKAGE_ACCEPT = '.png,.pgw,.wld,.prj';
