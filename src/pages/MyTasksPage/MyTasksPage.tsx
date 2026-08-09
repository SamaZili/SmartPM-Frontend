import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyTasks, ActionStatus } from '../../features/Tasks/hooks/useMyTasks';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Task } from '../../types';
import styles from './MyTasksPage.module.css';

const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, isLoading, updateStatus } = useMyTasks();
  const { message, type: msgType, showMessage } = useTemporaryMessage();

  const handleStatusChange = async (taskId: number, status: ActionStatus) => {
    try {
      await updateStatus(taskId, status);
      showMessage('Statut de la tâche mis à jour !');
    } catch {
      showMessage('Erreur lors de la mise à jour du statut.', 3000, 'error');
    }
  };

  const getStatusLabel = (status?: string | null) => {
    const labels: Record<string, string> = {
      pending: '⏳ En attente',
      accepted: '✅ Acceptée',
      in_progress: '🔄 En cours',
      completed: '🎉 Terminée',
    };
    return status ? labels[status] || status : '—';
  };

  const getStatusColor = (status?: string | null) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      accepted: '#3b82f6',
      in_progress: '#8b5cf6',
      completed: '#10b981',
    };
    return status ? colors[status] || '#64748b' : '#94a3b8';
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const userName = user?.name || 'Utilisateur';
  const userRole = user?.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur';

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><span className={styles.logoLetter}>S</span></div>
          <h1 className={styles.logoText}>SmartPM</h1>
        </div>
        <nav className={styles.navMenu}>
          <button onClick={() => navigate('/dashboard')} className={styles.navButton}>📊 Tableau de bord</button>
          <button onClick={() => navigate('/projects')} className={styles.navButton}>📁 Projets</button>
          <button onClick={() => navigate('/tasks')} className={styles.navButton}>✅ Tâches</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>📥 Mes Tâches</button>
          <button onClick={() => navigate('/profile')} className={styles.navButton}>👤 Profil</button>
        </nav>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{userInitial}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{userName}</p>
            <p className={styles.userRole}>{userRole}</p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
            className={styles.logoutBtn}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>📥 Mes Tâches Assignées</h1>
        {message && (
          <div className={msgType === 'error' ? styles.errorAlert : styles.successAlert}>{message}</div>
        )}

        {isLoading ? (
          <div className={styles.emptyState}>⏳ Chargement de vos tâches...</div>
        ) : tasks.length === 0 ? (
          <div className={styles.emptyState}>Aucune tâche ne vous est assignée pour le moment.</div>
        ) : (
          <div className={styles.tasksList}>
            {tasks.map((task: Task) => (
              <div key={task.id} className={styles.taskCard}>
                <div className={styles.taskHeader}>
                  <h4>{task.name}</h4>
                  <span
                    className={styles.assignmentBadge}
                    style={{ backgroundColor: getStatusColor(task.assignment_status) }}
                  >
                    {getStatusLabel(task.assignment_status)}
                  </span>
                </div>
                <p className={styles.taskDesc}>{task.description || 'Aucune description'}</p>
                {task.project && <p className={styles.projectInfo}>📁 Projet : {task.project.name}</p>}

                <div className={styles.taskActions}>
                  {task.assignment_status === 'pending' && (
                    <button onClick={() => handleStatusChange(task.id, 'accepted')} className={styles.acceptBtn}>
                      ✅ Accepter la tâche
                    </button>
                  )}
                  {task.assignment_status === 'accepted' && (
                    <button onClick={() => handleStatusChange(task.id, 'in_progress')} className={styles.startBtn}>
                      🔄 Commencer le travail
                    </button>
                  )}
                  {task.assignment_status === 'in_progress' && (
                    <button onClick={() => handleStatusChange(task.id, 'completed')} className={styles.completeBtn}>
                      🎉 Marquer comme terminée
                    </button>
                  )}
                  {task.assignment_status === 'completed' && (
                    <span className={styles.doneLabel}>🏆 Tâche terminée, bravo !</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTasksPage;