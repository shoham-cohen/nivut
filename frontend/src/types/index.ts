// Core domain types for the GIS-based navigation training system.
// The application works internally in real-world map coordinates (from the
// georeferenced map's world file). Pixel coordinates are kept only for
// rendering on screen.

/** Affine georeferencing parameters parsed from a PGW world file. */
export interface WorldFile {
  A: number;
  D: number;
  B: number;
  E: number;
  C: number;
  F: number;
}

/**
 * A single planned-route vertex.
 *
 * `mapX`/`mapY` (real-world coordinates) are the source of truth.
 * `pixelX`/`pixelY` (image pixels, top-left origin) are for rendering only.
 */
export interface RoutePoint {
  mapX: number;
  mapY: number;
  pixelX: number;
  pixelY: number;
}

/** A planned navigation path drawn by the user. */
export interface PlannedRoute {
  id: string;
  name: string;
  /** Ordered vertices that make up the polyline. */
  points: RoutePoint[];
  /** ISO timestamp of when the route was created. */
  createdAt: string;
  /** ISO timestamp of the last update. */
  updatedAt: string;
}

/** Serialized route payload (map coordinates only — no pixels). */
export interface ExportedRoute {
  mapId: string;
  projection: string | null;
  route: Array<{ mapX: number; mapY: number }>;
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

/**
 * A single fix from an actual (recorded) GPS track.
 *
 * `mapX`/`mapY` (ITM metres, reprojected from WGS84) are used for all analysis;
 * `lat`/`lon` are kept for reference/debugging.
 */
export interface TrackPoint {
  mapX: number;
  mapY: number;
  lat: number;
  lon: number;
  /** ISO timestamp from the device, if the track recorded one. */
  time: string | null;
  /** Elevation in metres, if present. */
  ele: number | null;
}

/** An actual navigation track imported from a device (e.g. a GPX file). */
export interface LoadedTrack {
  name: string;
  points: TrackPoint[];
}

/** A point on the actual track that strayed beyond the deviation tolerance. */
export interface DivergencePoint {
  /** Index of the offending point within the actual track. */
  index: number;
  mapX: number;
  mapY: number;
  /** Perpendicular distance from the planned polyline, in metres. */
  deviationM: number;
}

/** Result of comparing an actual track against a planned route. */
export interface ComparisonReport {
  /** Total length of the planned polyline, in metres. */
  plannedLengthM: number;
  /** Total length walked on the actual track, in metres. */
  actualLengthM: number;
  /** actualLength - plannedLength (positive = walked further than planned). */
  lengthDiffM: number;
  /** Average perpendicular distance from the planned route, in metres. */
  meanDeviationM: number;
  /** Worst perpendicular distance from the planned route, in metres. */
  maxDeviationM: number;
  /** Root-mean-square deviation, in metres. */
  rmsDeviationM: number;
  /** Tolerance used to judge "on track", in metres. */
  toleranceM: number;
  /** Share of track points within tolerance of the planned route (0-100). */
  withinTolerancePct: number;
  /** Distance between planned start and actual start, in metres. */
  startOffsetM: number;
  /** Distance between planned end and actual end, in metres. */
  endOffsetM: number;
  /** Elapsed time of the actual track, in seconds (null if untimed). */
  durationSec: number | null;
  /** Number of points in the actual track. */
  trackPointCount: number;
  /** Points that exceeded the tolerance (candidate divergence markers). */
  divergences: DivergencePoint[];
}
