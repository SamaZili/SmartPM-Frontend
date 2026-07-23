import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardApi } from '../../features/Dashboard/api/dashboardApi';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useTasks } from '../../features/Tasks/hooks/useTasks';
import { useDashboardStats } from '../../features/Dashboard/hooks/useDashboardStats';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Project, Task, Estimation } from '../../types';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { tasks, addTask } = useTasks(projects, selectedProject?.id || null);
  
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [estimationResult, setEstimationResult] = useState<Estimation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();
  
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const stats = useDashboardStats(projects, tasks, estimations);

  // 🧠 CALCUL DES INSIGHTS IA (Idée 3)
  const aiInsights = useMemo(() => {
    const totalEstimations = estimations.length;
    const avgConfidence = totalEstimations > 0 
      ? (estimations.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0) / totalEstimations * 100).toFixed(0)
      : 0;
    
    const tasksWithoutEstimation = tasks.filter(t => 
      !estimations.some(e => e.task_id === t.id)
    ).length;

    return { totalEstimations, avgConfidence, tasksWithoutEstimation };
  }, [estimations, tasks]);

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

  // 📊 Données pour le graphique Recharts
  const chartData = [
    { name: 'À faire', value: stats.statusDistribution.a_faire || 0, color: '#94a3b8' },
    { name: 'En cours', value: stats.statusDistribution.en_cours || 0, color: '#f59e0b' },
    { name: 'Terminée', value: stats.statusDistribution.terminee || 0, color: '#10b981' },
  ];

  // 📁 Projets récents (Idée 1 : on n'affiche que les 3 derniers)
  const recentProjects = projects.slice(0, 3);

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

        {/* 1. CARTES DE STATISTIQUES */}
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

        {/* 2. NOUVEAU : CARTE INSIGHT IA (Idée 3) */}
        <div className={styles.aiInsightCard}>
          <div className={styles.aiInsightHeader}>
            <span className={styles.aiIcon}>🤖</span>
            <h3>Insights de l'Intelligence Artificielle</h3>
          </div>
          <div className={styles.aiInsightMetrics}>
            <div className={styles.aiMetric}>
              <span className={styles.aiMetricValue}>{aiInsights.totalEstimations}</span>
              <span className={styles.aiMetricLabel}>Estimations réalisées</span>
            </div>
            <div className={styles.aiMetric}>
              <span className={styles.aiMetricValue}>{aiInsights.avgConfidence}%</span>
              <span className={styles.aiMetricLabel}>Confiance moyenne de l'IA</span>
            </div>
            <div className={styles.aiMetric}>
              <span className={styles.aiMetricValue}>{aiInsights.tasksWithoutEstimation}</span>
              <span className={styles.aiMetricLabel}>Tâches en attente d'estimation</span>
            </div>
          </div>
        </div>

        <div className={styles.dashboardSplit}>
          {/* 3. GRAPHIQUE PROFESSIONNEL */}
          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>📊 Distribution des tâches</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. NOUVEAU : PROJETS RÉCENTS (Idée 1) */}
          <div className={styles.recentProjectsSection}>
            <div className={styles.recentProjectsHeader}>
              <h3 className={styles.chartTitle}>📁 Projets Récents</h3>
              <button onClick={() => navigate('/projects')} className={styles.viewAllBtn}>
                Voir tous →
              </button>
            </div>
            <div className={styles.recentProjectsList}>
              {recentProjects.length > 0 ? (
                recentProjects.map((project: Project) => (
                  <div 
                    key={project.id} 
                    className={styles.recentProjectItem}
                    onClick={() => { setSelectedProject(project); window.scrollTo({ top: 500, behavior: 'smooth' }); }}
                  >
                    <div className={styles.recentProjectIcon}>{project.name?.charAt(0)?.toUpperCase() ?? '?'}</div>
                    <div className={styles.recentProjectInfo}>
                      <h4>{project.name}</h4>
                      <span className={styles.recentProjectStatus}>{project.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyRecent}>
                  <p>Aucun projet pour le moment.</p>
                  <button onClick={() => navigate('/projects')} className={styles.createProjectBtn}>
                    + Créer mon premier projet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. SECTION TÂCHES DU PROJET SÉLECTIONNÉ */}
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
                  <button onClick={() => handleEstimate(task.id)} disabled={isLoading} className={styles.estimateButton}>
                    {isLoading ? '⏳...' : '🤖 Estimer via IA'}
                  </button>
                </div>
              ))}
              {tasks.length === 0 && <div className={styles.taskEmpty}>Aucune tâche pour ce projet. Ajoutez-en une ci-dessus !</div>}
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