import { MapView } from './components/MapView';
import { MapPackageUploader } from './components/MapPackageUploader';
import { MapProvider, useMapContext } from './context/MapContext';
import { useRouteStore } from './hooks/useRouteStore';
import './App.css';

function AppShell() {
  const { image, setMapPackage, clearMap } = useMapContext();
  const clearRoute = useRouteStore((s) => s.clear);

  function handleChangeMap() {
    // The drawn route belongs to the current map, so reset it too.
    clearRoute();
    clearMap();
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Nivut</h1>
        <span className="app__subtitle">Navigation Training</span>
        {image && (
          <button
            type="button"
            className="app__action"
            onClick={handleChangeMap}
          >
            Change map
          </button>
        )}
      </header>

      <main className="app__main">
        {image ? <MapView /> : <MapPackageUploader onMapReady={setMapPackage} />}
      </main>
    </div>
  );
}

function App() {
  return (
    <MapProvider>
      <AppShell />
    </MapProvider>
  );
}

export default App;
