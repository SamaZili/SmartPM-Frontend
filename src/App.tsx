import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { ProjectProvider } from './context/ProjectContext';
import { useAuth } from './features/Auth/hooks/useAuth';

import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import TasksPage from './pages/TasksPage/TasksPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import MyTasksPage from './pages/MyTasksPage/MyTasksPage';

/** ✅ Garde-fou professionnel : pages réservées au chef de projet */
const RoleGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.type === 'developer') {
    return <Navigate to="/my-tasks" replace />;
  }
  return children;
};

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <ProjectProvider>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<RoleGuard><DashboardPage /></RoleGuard>} />
        <Route path="/projects" element={<RoleGuard><ProjectsPage /></RoleGuard>} />
        <Route path="/tasks" element={<RoleGuard><TasksPage /></RoleGuard>} />
        <Route path="/my-tasks" element={<MyTasksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </ProjectProvider>
  );
}

export default App;