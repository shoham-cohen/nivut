import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { WorldFile } from '../types';

/** The georeferencing state of the currently loaded map. */
export interface MapState {
  image: string | null;
  worldFile: WorldFile | null;
  projection: string | null;
  isGeoreferenced: boolean;
}

/** A fully-loaded, georeferenced map package ready to render and draw on. */
export interface MapPackage {
  mapId: string;
  image: string;
  width: number;
  height: number;
  worldFile: WorldFile;
  projection: string | null;
}

interface MapContextValue extends MapState {
  /** Identifier derived from the map file name; used when exporting routes. */
  mapId: string | null;
  width: number;
  height: number;
  setMapPackage: (pkg: MapPackage) => void;
  clearMap: () => void;
}

const MapContext = createContext<MapContextValue | null>(null);

function revokeIfBlob(url: string | null | undefined): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function MapProvider({ children }: { children: ReactNode }) {
  const [pkg, setPkg] = useState<MapPackage | null>(null);

  const setMapPackage = useCallback((next: MapPackage) => {
    setPkg((prev) => {
      revokeIfBlob(prev?.image);
      return next;
    });
  }, []);

  const clearMap = useCallback(() => {
    setPkg((prev) => {
      revokeIfBlob(prev?.image);
      return null;
    });
  }, []);

  const value = useMemo<MapContextValue>(
    () => ({
      image: pkg?.image ?? null,
      worldFile: pkg?.worldFile ?? null,
      projection: pkg?.projection ?? null,
      isGeoreferenced: pkg?.worldFile != null,
      mapId: pkg?.mapId ?? null,
      width: pkg?.width ?? 0,
      height: pkg?.height ?? 0,
      setMapPackage,
      clearMap,
    }),
    [pkg, setMapPackage, clearMap],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return ctx;
}
