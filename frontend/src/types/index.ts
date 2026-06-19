// Core domain types for the navigation training system.
// Coordinates are expressed in the map's local pixel space (Leaflet CRS.Simple),
// so saved routes stay valid regardless of how the user pans/zooms.

/** A single point in the map's local coordinate space: [y, x] (Leaflet LatLng order). */
export type MapPoint = [number, number];

/** A planned navigation path drawn by the user. */
export interface PlannedRoute {
  id: string;
  name: string;
  /** Ordered vertices that make up the polyline. */
  points: MapPoint[];
  /** ISO timestamp of when the route was created. */
  createdAt: string;
  /** ISO timestamp of the last update. */
  updatedAt: string;
}

/** Metadata describing the topographic map image being used as the base layer. */
export interface MapImageConfig {
  /** URL/path to the topographic image (static asset or remote). */
  url: string;
  /** Natural width of the image in pixels. */
  width: number;
  /** Natural height of the image in pixels. */
  height: number;
}

// --- Future feature placeholders (design-only, not implemented in the MVP) ---

/** A recorded GPS/real track sample. Reserved for the future comparison engine. */
export interface TrackPoint {
  point: MapPoint;
  /** Epoch milliseconds when the sample was recorded. */
  timestamp: number;
}

/** A recorded real-world track, to be compared against a PlannedRoute later. */
export interface RecordedTrack {
  id: string;
  routeId: string;
  points: TrackPoint[];
}
