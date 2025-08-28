
import { Route, Routes } from 'react-router-dom';
import './app.scss';
import { ClassicPortfolio } from './pages/Portfolio/Portfolio';

export function App() {
  return (
    <div className="app-container">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<ClassicPortfolio />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
