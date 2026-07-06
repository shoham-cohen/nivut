// Comparison engine: planned route vs. actual recorded track.
//
// Everything is computed in ITM metres, so distances and deviations are real
// ground distances. Inputs only need { mapX, mapY }, which both a planned
// RoutePoint and an actual TrackPoint satisfy.

import type { ComparisonReport, DivergencePoint, TrackPoint } from '../../types';

/** A planned route vertex in real-world map coordinates. */
export interface PlannedPoint {
  mapX: number;
  mapY: number;
}

/** Default tolerance (metres) within which a track point counts as "on route". */
export const DEFAULT_TOLERANCE_M = 25;

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

/** Total length of a polyline in metres. */
function polylineLength(points: Array<{ mapX: number; mapY: number }>): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distance(
      points[i - 1].mapX,
      points[i - 1].mapY,
      points[i].mapX,
      points[i].mapY,
    );
  }
  return total;
}

/** Shortest distance from point P to segment AB, in metres. */
function pointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distance(px, py, ax, ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return distance(px, py, ax + t * dx, ay + t * dy);
}

/** Shortest distance from a point to the whole planned polyline, in metres. */
function deviationFromRoute(
  px: number,
  py: number,
  planned: PlannedPoint[],
): number {
  let min = Infinity;
  for (let i = 1; i < planned.length; i++) {
    const d = pointToSegment(
      px,
      py,
      planned[i - 1].mapX,
      planned[i - 1].mapY,
      planned[i].mapX,
      planned[i].mapY,
    );
    if (d < min) min = d;
  }
  return min;
}

function durationSeconds(points: TrackPoint[]): number | null {
  const first = points.find((p) => p.time)?.time;
  const last = [...points].reverse().find((p) => p.time)?.time;
  if (!first || !last) return null;
  const sec = (new Date(last).getTime() - new Date(first).getTime()) / 1000;
  return Number.isFinite(sec) ? sec : null;
}

/**
 * Compares an actual track against a planned route and produces an accuracy
 * report. `planned` must have at least two vertices and `actual` at least one.
 */
export function compareRoutes(
  planned: PlannedPoint[],
  actual: TrackPoint[],
  toleranceM: number = DEFAULT_TOLERANCE_M,
): ComparisonReport {
  if (planned.length < 2) {
    throw new Error('A planned route needs at least two points to compare.');
  }
  if (actual.length === 0) {
    throw new Error('The actual track is empty.');
  }

  let sum = 0;
  let sumSq = 0;
  let max = 0;
  let within = 0;
  const divergences: DivergencePoint[] = [];

  actual.forEach((point, index) => {
    const dev = deviationFromRoute(point.mapX, point.mapY, planned);
    sum += dev;
    sumSq += dev * dev;
    if (dev > max) max = dev;
    if (dev <= toleranceM) {
      within += 1;
    } else {
      divergences.push({ index, mapX: point.mapX, mapY: point.mapY, deviationM: dev });
    }
  });

  const plannedLengthM = polylineLength(planned);
  const actualLengthM = polylineLength(actual);
  const first = actual[0];
  const last = actual[actual.length - 1];

  return {
    plannedLengthM,
    actualLengthM,
    lengthDiffM: actualLengthM - plannedLengthM,
    meanDeviationM: sum / actual.length,
    maxDeviationM: max,
    rmsDeviationM: Math.sqrt(sumSq / actual.length),
    toleranceM,
    withinTolerancePct: (within / actual.length) * 100,
    startOffsetM: distance(
      first.mapX,
      first.mapY,
      planned[0].mapX,
      planned[0].mapY,
    ),
    endOffsetM: distance(
      last.mapX,
      last.mapY,
      planned[planned.length - 1].mapX,
      planned[planned.length - 1].mapY,
    ),
    durationSec: durationSeconds(actual),
    trackPointCount: actual.length,
    divergences,
  };
}
