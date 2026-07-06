import type { WorldFile } from '../types';

/**
 * Parses an ESRI world file (PGW) used to georeference a PNG.
 *
 * PGW files contain six numeric lines, in this order:
 *   line 1 = A  (x-scale: map units per pixel in X)
 *   line 2 = D  (rotation about the Y axis)
 *   line 3 = B  (rotation about the X axis)
 *   line 4 = E  (y-scale: map units per pixel in Y, usually negative)
 *   line 5 = C  (map X of the center of the top-left pixel)
 *   line 6 = F  (map Y of the center of the top-left pixel)
 */
export function parseWorldFile(content: string): WorldFile {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 6) {
    throw new Error('Invalid world file: expected 6 numeric lines.');
  }

  const [A, D, B, E, C, F] = lines.slice(0, 6).map((line, index) => {
    const value = Number(line);
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid world file: line ${index + 1} is not a number.`);
    }
    return value;
  });

  return { A, D, B, E, C, F };
}
