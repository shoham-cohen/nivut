# Nivut Architecture

Nivut is a GIS-based navigation training system. Maps are **georeferenced**
(PNG + PGW world file, optional PRJ), so the application works internally in
**real-world map coordinates** rather than image pixels. Pixels are used only
for rendering on screen.

## Pipeline

```
Map Package (PNG + PGW + PRJ)
        |
        v
Coordinate Transformer        (pixel <-> map, via the world file)
        |
        v
Student draws route           (click -> pixel -> pixelToMap)
        |
        v
Save geographic route         (map coordinates are the source of truth)
        |
        v
Import GPX / XML              (future: device GPS tracks)
        |
        v
Comparison Engine             (future: planned vs. actual)
        |
        v
Navigation Diagnosis Report   (future: deviation, drift, missed waypoints)
```

## Modules

| Stage | Module | Status |
| --- | --- | --- |
| Map package upload | `components/MapPackageUploader.tsx` | done |
| World file parsing | `services/worldFileParser.ts` | done |
| Projection parsing | `services/projectionParser.ts` | done |
| Coordinate transform | `services/coordinateTransformer.ts` | done |
| Map state | `context/MapContext.tsx` | done |
| Drawing engine | `components/RouteLayer.tsx` + `hooks/useRouteStore.ts` | done |
| Route export | `services/routeExport.ts` | done |
| GPX/XML import | `services/gpx/` | planned |
| Comparison engine | `services/comparison/` | planned |
| Diagnosis report | `services/diagnosis/` | planned |

## Coordinate model

- **Pixel space:** origin top-left, X right, Y down (same as world files).
- **Map space:** real-world coordinates from the PGW affine transform:
  - `mapX = A*x + B*y + C`
  - `mapY = D*x + E*y + F`
  - inverse (`mapToPixel`) solves the 2x2 affine system.
- **Leaflet space:** `CRS.Simple`, `[lat, lng]` with the image bounded by
  `[[0, 0], [height, width]]`. Bridged in `utils/pixelMapping.ts`
  (`pixelX = lng`, `pixelY = height - lat`).

## Route data model

A stored route point keeps both representations, with map coordinates as the
source of truth:

```ts
type RoutePoint = {
  mapX: number;   // source of truth
  mapY: number;   // source of truth
  pixelX: number; // rendering only
  pixelY: number; // rendering only
};
```

Exported routes contain only `mapX` / `mapY` so they remain portable for the
future comparison engine.
