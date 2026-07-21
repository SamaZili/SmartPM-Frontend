import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../features/Dashboard/api/dashboardApi';
import { useProjects } from '../../features/Dashboard/hooks/useProjects';
import { useTasks } from '../../features/Dashboard/hooks/useTasks';
import { useDashboardStats } from '../../features/Dashboard/hooks/useDashboardStats';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Project, Task, Estimation } from '../../types';
import styles from './DashboardPage.module.css';
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Hooks personnalisés
  const { projects, addProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { tasks, addTask } = useTasks(projects, selectedProject?.id || null);
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [estimationResult, setEstimationResult] = useState<Estimation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();
  
  // Form states
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Stats calculées
  const stats = useDashboardStats(projects, tasks, estimations);

  // Handlers
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    
    try {
      await addProject({ 
        name: newProjectName, 
        description: 'Nouveau projet',
        status: 'en_cours'
      });
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
      await addTask(selectedProject.id, {
        name: newTaskName,
        description: newTaskDesc,
        status: 'a_faire',
        complexity: 'moyenne',
      });
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
    navigate('/login');
  };

  const maxStatusCount = Math.max(...Object.values(stats.statusDistribution), 1);

  return (
    <div className={styles.pageContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>🏗️</div>
          <h1 className={styles.sidebarTitle}>SmartPM</h1>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={styles.navButtonActive}> Tableau de bord</button>
          <button className={styles.navButton} onClick={() => navigate('/projects')}>📁 Projets</button>
          <button className={styles.navButton} onClick={() => navigate('/tasks')}>✅ Tâches</button>
          <button className={styles.navButton} onClick={() => navigate('/profile')}>👤 Profil</button>
        </nav>

        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>AT</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>Admin Test</p>
            <p className={styles.userRole}>Chef de projet</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>Déconnexion</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <h2 className={styles.pageTitle}>Vue d'ensemble analytique</h2>

        {/* Messages */}
        {successMsg && (
          <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>
            {successMsg}
          </div>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Projets actifs</p>
            <p className={styles.statValue}>{stats.activeProjects}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Tâches en cours</p>
            <p className={styles.statValue}>{stats.tasksInProgress}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Taux de complétion</p>
            <p className={styles.statValue}>{stats.completionRate}%</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Estimation IA moyenne</p>
            <p className={styles.statValuePrimary}>{stats.avgEstimation}h</p>
          </div>
        </div>

        {/* Chart */}
        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>📊 Distribution des tâches par statut</h3>
          <div className={styles.chartContainer}>
            {[
              { label: 'À faire', value: stats.statusDistribution.a_faire, color: '#94a3b8' },
              { label: 'En cours', value: stats.statusDistribution.en_cours, color: '#f59e0b' },
              { label: 'Terminée', value: stats.statusDistribution.terminee, color: '#10b981' },
            ].map(item => (
              <div key={item.label} className={styles.chartBar}>
                <div 
                  className={styles.chartBarFill}
                  style={{ 
                    height: `${(item.value / maxStatusCount) * 200}px`,
                    backgroundColor: item.color 
                  }}
                >
                  {item.value}
                </div>
                <span className={styles.chartBarLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estimation History */}
        <div className={styles.estimationHistory}>
          <h3 className={styles.estimationHistoryTitle}>🤖 Historique des estimations IA</h3>
          {estimations.length === 0 ? (
            <p className={styles.estimationEmpty}>Aucune estimation pour le moment.</p>
          ) : (
            <div className={styles.estimationList}>
              {estimations.slice(-5).reverse().map((est, idx) => (
                <div key={idx} className={styles.estimationItem}>
                  <div className={styles.estimationInfo}>
                    <strong className={styles.estimationId}>Estimation #{est.id}</strong>
                    <p className={styles.estimationDate}>
                      {new Date(est.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className={styles.estimationResult}>
                    <p className={styles.estimationEffort}>{est.predicted_effort}h</p>
                    <p className={styles.estimationConfidence}>
                      Confiance: {(est.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className={styles.projectsSection}>
          <h3 className={styles.projectsSectionTitle}>📁 Mes Projets</h3>
          
          <form onSubmit={handleAddProject} className={styles.projectForm}>
            <input 
              type="text" 
              placeholder="Nom du nouveau projet..." 
              value={newProjectName} 
              onChange={(e) => setNewProjectName(e.target.value)} 
            />
            <button type="submit">+ Nouveau projet</button>
          </form>

          <div className={styles.projectsGrid}>
            {projects.map((project: Project) => (
              <div 
                key={project.id} 
                className={selectedProject?.id === project.id ? styles.projectCardSelected : styles.projectCard}
                onClick={() => setSelectedProject(project)}
              >
                <div className={styles.projectCardHeader}>
                  <div className={styles.projectCardIcon}>
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.projectCardBadge}>ACTIF</span>
                </div>
                <h4 className={styles.projectCardTitle}>{project.name}</h4>
                <p className={styles.projectCardId}>ID: {project.id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        {selectedProject && (
          <div className={styles.tasksSection}>
            <h3 className={styles.tasksSectionTitle}>
              📋 Tâches pour : <span>{selectedProject.name}</span>
            </h3>
            
            <form onSubmit={handleAddTask} className={styles.taskForm}>
              <input 
                type="text" 
                placeholder="Nom de la tâche..." 
                value={newTaskName} 
                onChange={(e) => setNewTaskName(e.target.value)} 
                required
              />
              <textarea 
                placeholder="Description (importante pour l'IA)..." 
                value={newTaskDesc} 
                onChange={(e) => setNewTaskDesc(e.target.value)} 
              />
              <button type="submit">+ Ajouter une tâche</button>
            </form>

            <div className={styles.taskList}>
              {tasks.map((task: Task) => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskItemContent}>
                    <h4 className={styles.taskItemTitle}>{task.name}</h4>
                    <p className={styles.taskItemDescription}>
                      {task.description || 'Aucune description'}
                    </p>
                  </div>
                  {/* 🔴 BOUTON ESTIMER VIA IA - LE CŒUR DU PROJET */}
                  <button 
                    onClick={() => handleEstimate(task.id)}
                    disabled={isLoading}
                    className={styles.estimateButton}
                    title="Estimer l'effort de cette tâche via l'IA"
                  >
                    🤖 Estimer via IA
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className={styles.taskEmpty}>
                  Aucune tâche pour ce projet. Ajoutez une tâche pour utiliser l'estimation IA.
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Result */}
        {estimationResult && (
          <div className={styles.aiResult}>
            <h3 className={styles.aiResultTitle}>✅ Résultat de l'Estimation IA</h3>
            <div className={styles.aiResultContent}>
              <div className={styles.aiResultInfo}>
                <p><span>Effort prédit :</span> {estimationResult.predicted_effort} heures</p>
                <p><span>Score de confiance :</span> {(estimationResult.confidence_score * 100).toFixed(0)}%</p>
              </div>
              <div className={styles.aiResultDate}>
                <p>Généré le {new Date(estimationResult.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;