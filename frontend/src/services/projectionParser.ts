/**
 * Minimal PRJ (WKT) reader.
 *
 * A full CRS parser is out of scope; for now we extract the human-readable
 * coordinate system name so it can be stored and exported with a route.
 */
export function parseProjection(content: string): string {
  const match = content.match(/(?:PROJCS|PROJCRS|GEOGCS|GEOGCRS)\s*\[\s*"([^"]+)"/i);
  return match ? match[1] : content.trim().slice(0, 120);
}
