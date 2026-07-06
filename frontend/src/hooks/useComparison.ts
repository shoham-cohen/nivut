import { useMemo } from 'react';
import { useRouteStore } from './useRouteStore';
import { useTrackStore } from './useTrackStore';
import { compareRoutes } from '../services/comparison';
import type { ComparisonReport } from '../types';

/**
 * Computes the accuracy report from the current planned route and the loaded
 * actual track. Returns null until both a planned route (>= 2 points) and a
 * track are available.
 */
export function useComparison(): ComparisonReport | null {
  const planned = useRouteStore((s) => s.points);
  const track = useTrackStore((s) => s.track);

  return useMemo(() => {
    if (!track || planned.length < 2) return null;
    return compareRoutes(planned, track.points);
  }, [planned, track]);
}
