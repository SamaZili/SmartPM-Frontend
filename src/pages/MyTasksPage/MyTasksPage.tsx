import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyTasks, ActionStatus } from '../../features/Tasks/hooks/useMyTasks';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Task, AssignmentStatus, TaskPriority } from '../../types';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import styles from './MyTasksPage.module.css';

type AssignmentFilter = 'toutes' | AssignmentStatus;

const FILTERS: { value: AssignmentFilter; label: string }[] = [
  { value: 'toutes', label: 'Toutes' },
  { value: 'pending', label: '⏳ En attente' },
  { value: 'accepted', label: '✅ Acceptées' },
  { value: 'in_progress', label: '🔄 En cours' },
  { value: 'completed', label: '🎉 Terminées' },
];

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: '🟢 Basse', medium: '🟡 Moyenne', high: '🟠 Haute', urgent: '🔴 Urgente',
};

// ✅ DESIGN V2 : badges "soft" (fond pastel + texte foncé)
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#d1fae5',      // vert pastel
  medium: '#fef3c7',   // jaune pastel
  high: '#ffedd5',     // orange pastel
  urgent: '#fee2e2',   // rouge pastel
};

const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, isLoading, updateStatus } = useMyTasks();
  const { message, type: msgType, showMessage } = useTemporaryMessage();
  const [filter, setFilter] = useState<AssignmentFilter>('toutes');

  // ✅ GARDE-FOU : Si ce n'est pas un développeur, rediriger vers Dashboard
  if (user?.type !== 'developer') {
    navigate('/dashboard');
    return null;
  }

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.assignment_status === 'pending').length,
    inProgress: tasks.filter(t => t.assignment_status === 'accepted' || t.assignment_status === 'in_progress').length,
    completed: tasks.filter(t => t.assignment_status === 'completed').length,
  }), [tasks]);

  const filteredTasks = useMemo(
    () => (filter === 'toutes' ? tasks : tasks.filter(t => t.assignment_status === filter)),
    [tasks, filter]
  );

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

  // ✅ DESIGN V2 : couleurs pastel pour les badges d'assignation
  const getStatusColor = (status?: string | null) => {
    const colors: Record<string, string> = {
      pending: '#fef3c7',     // jaune pastel
      accepted: '#dbeafe',    // bleu pastel
      in_progress: '#ede9fe', // violet pastel
      completed: '#d1fae5',   // vert pastel
    };
    return status ? colors[status] || '#f1f5f9' : '#f1f5f9';
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.assignment_status === 'completed') return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(task.due_date) < today;
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const userName = user?.name || 'Utilisateur';

  return (
    <div className={styles.pageContainer}>
      <NotificationBell />
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><span className={styles.logoLetter}>S</span></div>
          <h1 className={styles.logoText}>SmartPM</h1>
        </div>
        <nav className={styles.navMenu}>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>📥 Mes Tâches</button>
          <button onClick={() => navigate('/profile')} className={styles.navButton}>👤 Profil</button>
        </nav>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{userInitial}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{userName}</p>
            <p className={styles.userRole}>Développeur</p>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }} className={styles.logoutBtn}>Déconnexion</button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>📥 Mes Tâches Assignées</h1>
        {message && <div className={msgType === 'error' ? styles.errorAlert : styles.successAlert}>{message}</div>}

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{stats.total}</p>
            <p className={styles.statLabel}>Total assignées</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue} style={{ color: '#f59e0b' }}>{stats.pending}</p>
            <p className={styles.statLabel}>En attente</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue} style={{ color: '#8b5cf6' }}>{stats.inProgress}</p>
            <p className={styles.statLabel}>En cours</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue} style={{ color: '#10b981' }}>{stats.completed}</p>
            <p className={styles.statLabel}>Terminées</p>
          </div>
        </div>

        <div className={styles.filterChips}>
          {FILTERS.map((f) => (
            <button key={f.value}
              className={`${styles.chip} ${filter === f.value ? styles.chipActive : ''}`}
              onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={styles.emptyState}>⏳ Chargement de vos tâches...</div>
        ) : filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>Aucune tâche ne correspond à ce filtre.</div>
        ) : (
          <div className={styles.tasksList}>
            {filteredTasks.map((task: Task) => (
              <div key={task.id} className={styles.taskCard}>
                <div className={styles.taskHeader}>
                  <h4>{task.name}</h4>
                  <span className={styles.assignmentBadge} style={{ backgroundColor: getStatusColor(task.assignment_status) }}>
                    {getStatusLabel(task.assignment_status)}
                  </span>
                </div>
                <p className={styles.taskDesc}>{task.description || 'Aucune description'}</p>
                {task.project && <p className={styles.projectInfo}>📁 Projet : {task.project.name}</p>}

                <div className={styles.badgesRow}>
                  <span className={styles.priorityBadge} style={{ backgroundColor: PRIORITY_COLORS[task.priority || 'medium'] }}>
                    {PRIORITY_LABELS[task.priority || 'medium']}
                  </span>
                  {task.due_date && (
                    <span className={`${styles.dueBadge} ${isOverdue(task) ? styles.dueBadgeOverdue : ''}`}>
                      {isOverdue(task) ? '⚠️ En retard — ' : '📅 '}
                      {new Date(task.due_date).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>

                {task.estimation && (
                  <p className={styles.estimationInfo}>
                    🤖 Estimation IA : <strong>{task.estimation.predicted_effort} heures</strong>
                  </p>
                )}

                <div className={styles.taskActions}>
                  {task.assignment_status === 'pending' && (
                    <button onClick={() => handleStatusChange(task.id, 'accepted')} className={styles.acceptBtn}>✅ Accepter la tâche</button>
                  )}
                  {task.assignment_status === 'accepted' && (
                    <button onClick={() => handleStatusChange(task.id, 'in_progress')} className={styles.startBtn}>🔄 Commencer le travail</button>
                  )}
                  {task.assignment_status === 'in_progress' && (
                    <button onClick={() => handleStatusChange(task.id, 'completed')} className={styles.completeBtn}>🎉 Marquer comme terminée</button>
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