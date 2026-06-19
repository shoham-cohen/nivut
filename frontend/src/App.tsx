import { MapView } from './components/MapView';
import { DEFAULT_MAP_IMAGE } from './utils/mapConfig';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Nivut</h1>
        <span className="app__subtitle">Navigation Training</span>
      </header>

      <main className="app__main">
        <MapView image={DEFAULT_MAP_IMAGE} />
      </main>
    </div>
  );
}

export default App;
