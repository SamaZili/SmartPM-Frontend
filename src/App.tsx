import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { ProjectProvider } from './context/ProjectContext';

import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import TasksPage from './pages/TasksPage/TasksPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <ProjectProvider>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </ProjectProvider>
  );
}

export default App;