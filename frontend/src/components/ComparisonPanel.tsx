import { useRef, useState } from 'react';
import { useTrackStore } from '../hooks/useTrackStore';
import { useRouteStore } from '../hooks/useRouteStore';
import { useComparison } from '../hooks/useComparison';
import { useMapContext } from '../context/MapContext';
import { parseGpxTrack } from '../services/gpx';
import { parseExportedRoute, exportedRouteToPoints } from '../services/routeExport';

function fmtMeters(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(2)} km` : `${v.toFixed(0)} m`;
}

function fmtDuration(sec: number | null): string {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

/**
 * Floating panel to import an actual GPS track (GPX), optionally load a saved
 * planned route (JSON), and display the navigation accuracy report comparing
 * the two. Rendered over the map.
 */
export function ComparisonPanel() {
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const routeInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const track = useTrackStore((s) => s.track);
  const setTrack = useTrackStore((s) => s.setTrack);
  const clearTrack = useTrackStore((s) => s.clearTrack);

  const plannedCount = useRouteStore((s) => s.points.length);
  const setPoints = useRouteStore((s) => s.setPoints);

  const { worldFile, isGeoreferenced } = useMapContext();
  const report = useComparison();

  async function handleGpx(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      setTrack(parseGpxTrack(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the GPX file.');
    }
  }

  async function handlePlannedRoute(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!worldFile) {
      setError('Load a georeferenced map before importing a planned route.');
      return;
    }
    try {
      const route = parseExportedRoute(await file.text());
      setPoints(exportedRouteToPoints(route, worldFile));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the route file.');
    }
  }

  return (
    <div className={`compare${open ? '' : ' compare--closed'}`}>
      <button
        type="button"
        className="compare__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Route comparison {open ? '▾' : '▸'}
      </button>

      {open && (
        <div className="compare__body">
          <div className="compare__actions">
            <button
              type="button"
              className="compare__btn"
              onClick={() => routeInputRef.current?.click()}
              disabled={!isGeoreferenced}
            >
              Load planned route
            </button>
            <button
              type="button"
              className="compare__btn compare__btn--primary"
              onClick={() => gpxInputRef.current?.click()}
            >
              {track ? 'Replace track' : 'Load GPS track'}
            </button>
            {track && (
              <button type="button" className="compare__btn" onClick={clearTrack}>
                Clear track
              </button>
            )}
          </div>

          {error && <p className="compare__error">{error}</p>}

          {!error && !report && (
            <p className="compare__hint">
              {plannedCount < 2
                ? 'Draw or load a planned route (2+ points), then load a GPS track (.gpx) to compare.'
                : 'Load a recorded GPS track (.gpx) to compare against the planned route.'}
            </p>
          )}

          {report && (
            <>
              <p className="compare__track-name">{track?.name}</p>
              <dl className="compare__grid">
                <div>
                  <dt>Mean deviation</dt>
                  <dd>{fmtMeters(report.meanDeviationM)}</dd>
                </div>
                <div>
                  <dt>Max deviation</dt>
                  <dd>{fmtMeters(report.maxDeviationM)}</dd>
                </div>
                <div>
                  <dt>On route</dt>
                  <dd>
                    {report.withinTolerancePct.toFixed(0)}%{' '}
                    <span className="compare__sub">
                      (±{report.toleranceM} m)
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Divergences</dt>
                  <dd>{report.divergences.length}</dd>
                </div>
                <div>
                  <dt>Planned length</dt>
                  <dd>{fmtMeters(report.plannedLengthM)}</dd>
                </div>
                <div>
                  <dt>Actual length</dt>
                  <dd>{fmtMeters(report.actualLengthM)}</dd>
                </div>
                <div>
                  <dt>Start offset</dt>
                  <dd>{fmtMeters(report.startOffsetM)}</dd>
                </div>
                <div>
                  <dt>End offset</dt>
                  <dd>{fmtMeters(report.endOffsetM)}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{fmtDuration(report.durationSec)}</dd>
                </div>
                <div>
                  <dt>Track points</dt>
                  <dd>{report.trackPointCount}</dd>
                </div>
              </dl>
              <p className="compare__legend">
                <span className="compare__swatch compare__swatch--planned" /> planned
                <span className="compare__swatch compare__swatch--actual" /> actual
                <span className="compare__swatch compare__swatch--diverge" /> off route
              </p>
            </>
          )}

          <input
            ref={gpxInputRef}
            type="file"
            accept=".gpx,.xml"
            hidden
            onChange={(e) => {
              void handleGpx(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <input
            ref={routeInputRef}
            type="file"
            accept=".json"
            hidden
            onChange={(e) => {
              void handlePlannedRoute(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      )}
    </div>
  );
}
