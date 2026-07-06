// One-off generator for a realistic mock GPS track (GPX) used to test the
// route-comparison feature. Produces a WGS84 GPX track that follows the sample
// planned route (ITM/EPSG:2039) with natural lateral wander and timestamps.
//
// Run: node scripts/gen-mock-track.cjs
const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

const ITM =
  '+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 +k=1.0000067 ' +
  '+x_0=219529.584 +y_0=626907.39 +ellps=GRS80 ' +
  '+towgs84=-24.0024,-17.1032,-17.8444,-0.33077,-1.85269,1.66969,5.4262 ' +
  '+units=m +no_defs';

// Sample planned route vertices in ITM meters (from govmap-route (4).json).
const planned = [
  [180286.76, 507196.99],
  [179683.71, 507715.05],
  [179708.23, 507845.78],
  [179664.1, 507986.19],
  [179757.26, 508213.75],
  [179874.92, 508446.15],
  [179615.07, 508717.29],
];

// Densify each segment and add a smooth wandering lateral deviation so the
// track looks like a real navigator (never perfectly on the planned line).
const track = [];
for (let i = 0; i < planned.length - 1; i++) {
  const [x1, y1] = planned[i];
  const [x2, y2] = planned[i + 1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len; // unit normal (lateral direction)
  const ny = dx / len;
  const n = Math.max(1, Math.round(len / 20)); // ~1 sample every 20 m
  for (let k = 0; k < n; k++) {
    const t = i + k / n;
    const px = x1 + dx * (k / n);
    const py = y1 + dy * (k / n);
    // Base wander (a competent navigator drifts a few metres) plus one
    // deliberate off-route excursion around the middle of the run so the
    // comparison report surfaces real divergence points.
    const wander =
      Math.sin(t * 1.7) * 6 + Math.sin(t * 0.6) * 4 + Math.cos(t * 3.1) * 2;
    const excursion = 46 * Math.exp(-Math.pow(t - 3.3, 2) / 0.25);
    const dev = wander + excursion;
    track.push([px + nx * dev, py + ny * dev]);
  }
}
track.push(planned[planned.length - 1]);

let time = new Date('2026-07-06T06:00:00Z').getTime();
let prev = null;

const lines = [];
lines.push('<?xml version="1.0" encoding="UTF-8"?>');
lines.push(
  '<gpx version="1.1" creator="Nivut Mock Device" xmlns="http://www.topografix.com/GPX/1/1">',
);
lines.push('  <metadata>');
lines.push('    <name>Mock navigation track</name>');
lines.push('    <desc>Simulated GPS recording for route comparison testing</desc>');
lines.push('  </metadata>');
lines.push('  <trk>');
lines.push('    <name>Trainee run 06:00</name>');
lines.push('    <trkseg>');

for (const [x, y] of track) {
  const [lon, lat] = proj4(ITM, 'WGS84', [x, y]);
  if (prev) {
    // walking pace ~1.4 m/s -> time advances with distance
    time += Math.round((Math.hypot(x - prev[0], y - prev[1]) / 1.4) * 1000);
  }
  const iso = new Date(time).toISOString().replace('.000', '');
  const ele = (430 + Math.sin(x / 50) * 5).toFixed(1);
  lines.push(`      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}">`);
  lines.push(`        <ele>${ele}</ele>`);
  lines.push(`        <time>${iso}</time>`);
  lines.push('      </trkpt>');
  prev = [x, y];
}

lines.push('    </trkseg>');
lines.push('  </trk>');
lines.push('</gpx>');

const outPath = path.join(__dirname, '..', 'src', 'assets', 'mock-track.gpx');
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${track.length} track points to ${outPath}`);
