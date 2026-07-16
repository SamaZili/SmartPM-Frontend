import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Exemple avec des valeurs en dur pour tester, à remplacer par des params dynamiques plus tard */}
      <Route path="/dashboard" element={<DashboardPage projectId={1} taskId={1} taskName="Intégration Stripe" />} />
    </Routes>
  );
}

export default App;