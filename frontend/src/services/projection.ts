import proj4 from 'proj4';

/**
 * Reprojection between WGS84 (GPS lat/lon, as found in GPX device tracks) and
 * the map's projected coordinate system.
 *
 * The topographic maps used by this app are georeferenced in the Israeli TM
 * Grid (ITM / EPSG:2039), which is the coordinate system the planned routes are
 * stored in (mapX = easting, mapY = northing, in metres). Working in metres is
 * what makes the comparison metrics (deviation, length) physically meaningful.
 */
export const ITM_EPSG = 'EPSG:2039';

const ITM_DEF =
  '+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 +k=1.0000067 ' +
  '+x_0=219529.584 +y_0=626907.39 +ellps=GRS80 ' +
  '+towgs84=-24.0024,-17.1032,-17.8444,-0.33077,-1.85269,1.66969,5.4262 ' +
  '+units=m +no_defs';

proj4.defs(ITM_EPSG, ITM_DEF);

/** WGS84 lat/lon (degrees) -> ITM map coordinates (metres). */
export function wgs84ToMap(lat: number, lon: number): { mapX: number; mapY: number } {
  const [mapX, mapY] = proj4('WGS84', ITM_EPSG, [lon, lat]);
  return { mapX, mapY };
}

/** ITM map coordinates (metres) -> WGS84 lat/lon (degrees). */
export function mapToWgs84(mapX: number, mapY: number): { lat: number; lon: number } {
  const [lon, lat] = proj4(ITM_EPSG, 'WGS84', [mapX, mapY]);
  return { lat, lon };
}
