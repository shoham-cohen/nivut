import type { LatLngTuple } from 'leaflet';

/**
 * Bridges image pixel space and Leaflet's CRS.Simple coordinate space.
 *
 * Image pixels use a top-left origin with Y increasing downward (the same
 * convention as world files). Leaflet CRS.Simple uses [lat, lng] where lat
 * increases upward, with the image overlay bounded by [[0,0],[height,width]].
 */

/** Image pixel (top-left origin, Y down) -> Leaflet latlng. */
export function pixelToLatLng(
  pixelX: number,
  pixelY: number,
  imageHeight: number,
): LatLngTuple {
  return [imageHeight - pixelY, pixelX];
}

/** Leaflet latlng -> image pixel (top-left origin, Y down). */
export function latLngToPixel(
  lat: number,
  lng: number,
  imageHeight: number,
): { pixelX: number; pixelY: number } {
  return { pixelX: lng, pixelY: imageHeight - lat };
}
