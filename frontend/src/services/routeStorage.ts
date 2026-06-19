import type { PlannedRoute } from '../types';

/**
 * Route persistence service.
 *
 * Starts with localStorage but is structured so it can later be swapped for a
 * backend API without changing callers (load/save/list/remove signatures stay
 * stable and return Promises).
 */

const STORAGE_KEY = 'nivut.routes.v1';

function readAll(): PlannedRoute[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlannedRoute[]) : [];
  } catch {
    return [];
  }
}

function writeAll(routes: PlannedRoute[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

export const routeStorage = {
  async list(): Promise<PlannedRoute[]> {
    return readAll();
  },

  async load(id: string): Promise<PlannedRoute | undefined> {
    return readAll().find((r) => r.id === id);
  },

  async save(route: PlannedRoute): Promise<void> {
    const routes = readAll();
    const index = routes.findIndex((r) => r.id === route.id);
    if (index >= 0) {
      routes[index] = route;
    } else {
      routes.push(route);
    }
    writeAll(routes);
  },

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter((r) => r.id !== id));
  },
};
