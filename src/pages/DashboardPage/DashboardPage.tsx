import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../features/Dashboard/api/dashboardApi';
import { useProjects } from '../../features/Projects/hooks/useProjects'; //  IMPORT DU HOOK PARTAGÉ 
import { useTasks } from '../../features/Tasks/hooks/useTasks'; // Hook partagé
import { useDashboardStats } from '../../features/Dashboard/hooks/useDashboardStats';
import { useAuth } from '../../features/Auth/hooks/useAuth'; // Infos utilisateur dynamiques
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Project, Task, Estimation } from '../../types';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Utilisation du même hook que ProjectsPage pour garantir la synchronisation
  const { projects, addProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { tasks, addTask } = useTasks(projects, selectedProject?.id || null);
  
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [estimationResult, setEstimationResult] = useState<Estimation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();
  
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const stats = useDashboardStats(projects, tasks, estimations);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      await addProject({ name: newProjectName, description: 'Nouveau projet', status: 'en_cours' });
      setNewProjectName('');
      showMessage('Projet créé avec succès !');
    } catch (err: any) {
      showMessage(err.message || 'Erreur lors de la création.', 5000, 'error');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskName) return;
    try {
      await addTask(selectedProject.id, { name: newTaskName, description: newTaskDesc, status: 'a_faire', complexity: 'moyenne' });
      setNewTaskName('');
      setNewTaskDesc('');
      showMessage('Tâche ajoutée avec succès !');
    } catch (err: any) {
      showMessage(err.message || 'Erreur lors de la création.', 5000, 'error');
    }
  };

  const handleEstimate = async (taskId: number) => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      const response = await dashboardApi.estimateTask(selectedProject.id, taskId);
      if (response.success && response.data) {
        setEstimationResult(response.data);
        setEstimations(prev => [...prev, response.data!]);
        showMessage('Estimation IA générée avec succès !');
      }
    } catch (err: any) {
      showMessage(err.response?.data?.message || "Erreur lors de l'estimation.", 5000, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const userName = user?.name || 'Utilisateur';
  const userRole = user?.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur';
  const maxStatusCount = Math.max(...Object.values(stats.statusDistribution), 1);

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><span className={styles.logoLetter}>S</span></div>
          <h1 className={styles.logoText}>SmartPM</h1>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>📊 Tableau de bord</button>
          <button className={styles.navButton} onClick={() => navigate('/projects')}>📁 Projets</button>
          <button className={styles.navButton} onClick={() => navigate('/tasks')}>✅ Tâches</button>
          <button className={styles.navButton} onClick={() => navigate('/profile')}>👤 Profil</button>
        </nav>

        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{userInitial}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{userName}</p>
            <p className={styles.userRole}>{userRole}</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>Déconnexion</button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h2 className={styles.pageTitle}>Vue d'ensemble analytique</h2>

        {successMsg && <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>{successMsg}</div>}

        <div className={styles.statsGrid}>
          <div className={styles.statCard}><p className={styles.statLabel}>Projets actifs</p><p className={styles.statValue}>{stats.activeProjects}</p></div>
          <div className={styles.statCard}><p className={styles.statLabel}>Tâches en cours</p><p className={styles.statValue}>{stats.tasksInProgress}</p></div>
          <div className={styles.statCard}><p className={styles.statLabel}>Taux de complétion</p><p className={styles.statValue}>{stats.completionRate}%</p></div>
          <div className={styles.statCard}><p className={styles.statLabel}>Estimation IA moyenne</p><p className={styles.statValuePrimary}>{stats.avgEstimation}h</p></div>
        </div>

        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>📊 Distribution des tâches par statut</h3>
          <div className={styles.chartContainer}>
            {[
              { label: 'À faire', value: stats.statusDistribution.a_faire || 0, color: '#94a3b8' },
              { label: 'En cours', value: stats.statusDistribution.en_cours || 0, color: '#f59e0b' },
              { label: 'Terminée', value: stats.statusDistribution.terminee || 0, color: '#10b981' },
            ].map(item => (
              <div key={item.label} className={styles.chartBar}>
                <div className={styles.chartBarFill} style={{ height: `${(item.value / maxStatusCount) * 200}px`, backgroundColor: item.color }}>{item.value}</div>
                <span className={styles.chartBarLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.projectsSection}>
          <h3 className={styles.projectsSectionTitle}>📁 Mes Projets</h3>
          <form onSubmit={handleAddProject} className={styles.projectForm}>
            <input type="text" placeholder="Nom du nouveau projet..." value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
            <button type="submit">+ Nouveau projet</button>
          </form>
          <div className={styles.projectsGrid}>
            {projects.map((project: Project) => (
              <div key={project.id} className={selectedProject?.id === project.id ? styles.projectCardSelected : styles.projectCard} onClick={() => setSelectedProject(project)}>
                <div className={styles.projectCardHeader}>
                  <div className={styles.projectCardIcon}>{project.name?.charAt(0)?.toUpperCase() ?? '?'}</div>
                  <span className={styles.projectCardBadge}>ACTIF</span>
                </div>
                <h4 className={styles.projectCardTitle}>{project.name}</h4>
                <p className={styles.projectCardId}>ID: {project.id}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedProject && (
          <div className={styles.tasksSection}>
            <h3 className={styles.tasksSectionTitle}>📋 Tâches pour : <span>{selectedProject.name}</span></h3>
            <form onSubmit={handleAddTask} className={styles.taskForm}>
              <input type="text" placeholder="Nom de la tâche..." value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} required />
              <textarea placeholder="Description (importante pour l'IA)..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
              <button type="submit">+ Ajouter une tâche</button>
            </form>
            <div className={styles.taskList}>
              {tasks.map((task: Task) => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskItemContent}>
                    <h4 className={styles.taskItemTitle}>{task.name}</h4>
                    <p className={styles.taskItemDescription}>{task.description || 'Aucune description'}</p>
                  </div>
                  <button onClick={() => handleEstimate(task.id)} disabled={isLoading} className={styles.estimateButton}>🤖 Estimer via IA</button>
                </div>
              ))}
              {tasks.length === 0 && <div className={styles.taskEmpty}>Aucune tâche pour ce projet.</div>}
            </div>
          </div>
        )}

        {estimationResult && (
          <div className={styles.aiResult}>
            <h3 className={styles.aiResultTitle}>✅ Résultat de l'Estimation IA</h3>
            <div className={styles.aiResultContent}>
              <div className={styles.aiResultInfo}>
                <p><span>Effort prédit :</span> {estimationResult.predicted_effort} heures</p>
                <p><span>Score de confiance :</span> {(estimationResult.confidence_score * 100).toFixed(0)}%</p>
              </div>
              <div className={styles.aiResultDate}><p>Généré le {new Date(estimationResult.created_at).toLocaleString('fr-FR')}</p></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;