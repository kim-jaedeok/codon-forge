import { Header } from './components/layout/Header';
import { OptimizerPage } from './components/optimizer/OptimizerPage';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="px-6 py-6">
        <OptimizerPage />
      </main>
    </div>
  );
}

export default App;
