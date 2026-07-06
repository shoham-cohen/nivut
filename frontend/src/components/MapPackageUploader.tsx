import { useRef, useState } from 'react';
import type { MapPackage } from '../context/MapContext';
import { parseWorldFile } from '../services/worldFileParser';
import { parseProjection } from '../services/projectionParser';
import { MAP_PACKAGE_ACCEPT } from '../utils/mapConfig';

interface MapPackageUploaderProps {
  onMapReady: (pkg: MapPackage) => void;
}

interface LoadedImage {
  url: string;
  width: number;
  height: number;
}

/** Reads a PNG file into an object URL plus its natural dimensions. */
function readImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the PNG image.'));
    };
    img.src = url;
  });
}

/** Sorts the dropped/selected files into the parts of a map package. */
function classify(files: File[]) {
  let png: File | undefined;
  let pgw: File | undefined;
  let prj: File | undefined;

  for (const file of files) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.png')) png = file;
    else if (name.endsWith('.pgw') || name.endsWith('.wld')) pgw = file;
    else if (name.endsWith('.prj')) prj = file;
  }

  return { png, pgw, prj };
}

/**
 * Uploads a georeferenced map package (PNG + PGW, with optional PRJ).
 * A PGW world file is required — without it the map cannot be used for
 * navigation analysis.
 */
export function MapPackageUploader({ onMapReady }: MapPackageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const { png, pgw, prj } = classify(Array.from(fileList));

    if (!png) {
      setError('Please include a PNG map image.');
      return;
    }
    if (!pgw) {
      setError(
        'This map is not georeferenced and cannot be used for navigation analysis.',
      );
      return;
    }

    setError(null);
    try {
      const [image, pgwText, prjText] = await Promise.all([
        readImage(png),
        pgw.text(),
        prj ? prj.text() : Promise.resolve(null),
      ]);

      onMapReady({
        mapId: png.name.replace(/\.png$/i, ''),
        image: image.url,
        width: image.width,
        height: image.height,
        worldFile: parseWorldFile(pgwText),
        projection: prjText ? parseProjection(prjText) : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the map package.');
    }
  }

  return (
    <div
      className="uploader"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="uploader__card">
        <h2 className="uploader__title">Upload a georeferenced map</h2>
        <p className="uploader__hint">
          Drag &amp; drop your map files here, or choose them.
        </p>
        <button
          type="button"
          className="uploader__button"
          onClick={() => inputRef.current?.click()}
        >
          Choose map files
        </button>
        <p className="uploader__formats">
          Required: <strong>PNG</strong> + <strong>PGW</strong> world file.
          <br />
          Optional: <strong>PRJ</strong> projection file. Select all together.
        </p>
        {error && <p className="uploader__error">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={MAP_PACKAGE_ACCEPT}
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
