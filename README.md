# Nivut — Topographic Navigation Training

A web + mobile-friendly system for practicing land navigation on topographic maps.
Plan a route on a map, later compare it against a real GPS track, and get an
automatic accuracy report.

## Vision

Trainees and instructors use topographic maps to plan and review navigation
exercises. Nivut lets a user:

1. Load a white topographic map (image-based or tiled).
2. Zoom and pan smoothly.
3. Draw a planned navigation path (polyline) on the map.
4. Save and export the planned route.
5. Later upload/sync a real GPS track from a device.
6. Compare planned vs. actual route.
7. Get a **navigation accuracy report** — distance deviation, time/position
   drift, and missed waypoints / divergence points.

## Tech Stack

- **React + TypeScript** (Vite)
- **Leaflet** via `react-leaflet` for map rendering
- **Zustand** for lightweight state (introduced as features land)
- **localStorage** for persistence, structured to swap for a backend later

### Why Leaflet (not Mapbox GL)?

Leaflet is free, needs no API key/account, and its `CRS.Simple` mode treats a
static image as a flat pixel plane. That is exactly what we need for overlaying
a topographic image and storing route coordinates that stay stable across zoom
levels and devices. Mapbox GL adds tokens, billing, and geo-projection
complexity we don't need yet.

## Project Structure

```
frontend/
  public/
    sample-topo-map.svg     # sample base map (replace with real topo image)
  src/
    components/             # UI + map components (MapView)
    hooks/                  # custom React hooks
    services/              # storage / data access (routeStorage)
    types/                 # shared domain types
    utils/                 # config & helpers (mapConfig)
    App.tsx
    main.tsx
```

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL. The app renders a sample topographic map with
zoom/pan enabled. Works on desktop and mobile browsers.



