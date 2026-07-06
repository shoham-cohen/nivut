import type { WorldFile } from '../types';

export interface MapCoord {
  mapX: number;
  mapY: number;
}

export interface PixelCoord {
  x: number;
  y: number;
}

/**
 * Affine transform from image pixel space to real-world map coordinates.
 *
 *   mapX = A*x + B*y + C
 *   mapY = D*x + E*y + F
 */
export function pixelToMap(x: number, y: number, world: WorldFile): MapCoord {
  return {
    mapX: world.A * x + world.B * y + world.C,
    mapY: world.D * x + world.E * y + world.F,
  };
}

/**
 * Inverse affine transform from map coordinates back to image pixel space.
 *
 * Solves the 2x2 system:
 *   [A B] [x]   [mapX - C]
 *   [D E] [y] = [mapY - F]
 */
export function mapToPixel(mapX: number, mapY: number, world: WorldFile): PixelCoord {
  const { A, B, C, D, E, F } = world;
  const determinant = A * E - B * D;

  if (determinant === 0) {
    throw new Error('World file is not invertible (determinant is zero).');
  }

  const dx = mapX - C;
  const dy = mapY - F;

  return {
    x: (E * dx - B * dy) / determinant,
    y: (-D * dx + A * dy) / determinant,
  };
}
