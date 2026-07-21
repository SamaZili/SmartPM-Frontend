import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage'; // Si tu l'as mis dans un dossier
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import TasksPage from './pages/TasksPage/TasksPage';

// ... le reste de ton code App.tsx reste identique

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* <-- AJOUT */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
      <Route path="/tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default App;