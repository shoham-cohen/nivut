import { create } from 'zustand';
import type { LoadedTrack } from '../types';

interface TrackState {
  /** The actual recorded track loaded for comparison (null if none). */
  track: LoadedTrack | null;
  setTrack: (track: LoadedTrack) => void;
  clearTrack: () => void;
}

export const useTrackStore = create<TrackState>((set) => ({
  track: null,
  setTrack: (track) => set({ track }),
  clearTrack: () => set({ track: null }),
}));
