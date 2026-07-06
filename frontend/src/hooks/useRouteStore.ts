import { create } from 'zustand';
import type { RoutePoint } from '../types';

interface RouteState {
  /** Ordered vertices of the planned polyline (map coords are source of truth). */
  points: RoutePoint[];
  /** When true, clicking the map appends a vertex. */
  isDrawing: boolean;
  addPoint: (point: RoutePoint) => void;
  movePoint: (index: number, point: RoutePoint) => void;
  /** Replaces the whole polyline (e.g. when loading a saved planned route). */
  setPoints: (points: RoutePoint[]) => void;
  undo: () => void;
  clear: () => void;
  setDrawing: (value: boolean) => void;
  toggleDrawing: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  points: [],
  isDrawing: false,
  addPoint: (point) => set((s) => ({ points: [...s.points, point] })),
  movePoint: (index, point) =>
    set((s) => {
      const points = s.points.slice();
      points[index] = point;
      return { points };
    }),
  setPoints: (points) => set({ points }),
  undo: () => set((s) => ({ points: s.points.slice(0, -1) })),
  clear: () => set({ points: [] }),
  setDrawing: (value) => set({ isDrawing: value }),
  toggleDrawing: () => set((s) => ({ isDrawing: !s.isDrawing })),
}));
