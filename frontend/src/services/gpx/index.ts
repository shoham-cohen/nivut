// GPX / XML track import for actual navigation runs recorded on a device.
//
// Parses a standard GPX 1.1 document (the format exported by most GPS watches
// and phone apps) and reprojects every fix from WGS84 into the map's ITM
// coordinate system so it can be compared against a planned route in metres.

import type { LoadedTrack, TrackPoint } from '../../types';
import { wgs84ToMap } from '../projection';

function textOf(parent: Element, tag: string): string | null {
  const el = parent.getElementsByTagName(tag)[0];
  return el?.textContent?.trim() ?? null;
}

/**
 * Parses a GPX document into an actual track in map coordinates.
 *
 * Supports `<trkpt>` (track points), falling back to `<rtept>` (route points)
 * and `<wpt>` (waypoints) so a variety of exports still load.
 *
 * @throws if the XML is malformed or contains no usable points.
 */
export function parseGpxTrack(xml: string): LoadedTrack {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');

  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('This file is not valid XML/GPX.');
  }

  let nodes = Array.from(doc.getElementsByTagName('trkpt'));
  if (nodes.length === 0) nodes = Array.from(doc.getElementsByTagName('rtept'));
  if (nodes.length === 0) nodes = Array.from(doc.getElementsByTagName('wpt'));

  if (nodes.length === 0) {
    throw new Error('No track points (<trkpt>) were found in the GPX file.');
  }

  const points: TrackPoint[] = [];
  for (const node of nodes) {
    const lat = Number(node.getAttribute('lat'));
    const lon = Number(node.getAttribute('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const { mapX, mapY } = wgs84ToMap(lat, lon);
    const eleText = textOf(node, 'ele');
    points.push({
      mapX,
      mapY,
      lat,
      lon,
      time: textOf(node, 'time'),
      ele: eleText !== null ? Number(eleText) : null,
    });
  }

  if (points.length < 2) {
    throw new Error('The GPX track needs at least two valid points.');
  }

  const name = textOf(doc.documentElement, 'name') ?? 'Imported track';

  return { name, points };
}
