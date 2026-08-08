import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useTasks } from '../../features/Tasks/hooks/useTasks';
import { useDashboardStats } from '../../features/Dashboard/hooks/useDashboardStats';
import { useEstimations } from '../../features/Dashboard/hooks/useEstimations';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { dashboardApi } from '../../features/Dashboard/api/dashboardApi';
import { Project, Task } from '../../types';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Tâches du projet sélectionné (pour la section "Tâches")
  const { tasks: selectedProjectTasks } = useTasks(selectedProject?.id || null);
  
  // ✅ TOUTES les tâches de TOUS les projets (pour les stats globales)
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  
  // Estimations (extraites de allTasks via le hook)
  const { estimations, isEstimating, handleEstimate, aiInsights } = useEstimations(selectedProject?.id || null, allTasks);
  
  // ✅ CORRECTION : suppression de showMessage (jamais utilisé)
  const { message: successMsg, type: msgType } = useTemporaryMessage();

  // ✅ Charger les tâches de TOUS les projets au démarrage
  useEffect(() => {
    const loadAllTasks = async () => {
      if (projects.length === 0) return;
      
      try {
        const allTasksPromises = projects.map(project => 
          dashboardApi.getTasks(project.id)
        );
        const responses = await Promise.all(allTasksPromises);
        
        const tasks = responses.flatMap(response => {
          const tasksData = response?.data || response;
          return Array.isArray(tasksData) ? tasksData : [];
        });
        
        setAllTasks(tasks);
      } catch (error) {
        console.error('Erreur chargement toutes les tâches:', error);
      }
    };

    loadAllTasks();
  }, [projects]);

  // ✅ Calculer les stats avec TOUTES les tâches
  const stats = useDashboardStats(projects, allTasks, estimations);

  // ✅ Données pour le PieChart
  const chartData = useMemo(() => {
    const statusCounts = {
      a_faire: allTasks.filter(t => t.status === 'a_faire').length,
      en_cours: allTasks.filter(t => t.status === 'en_cours').length,
      terminee: allTasks.filter(t => t.status === 'terminee').length,
    };

    return [
      { name: 'À faire', value: statusCounts.a_faire, color: '#94a3b8' },
      { name: 'En cours', value: statusCounts.en_cours, color: '#f59e0b' },
      { name: 'Terminée', value: statusCounts.terminee, color: '#10b981' },
    ];
  }, [allTasks]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const userName = user?.name || 'Utilisateur';
  const userRole = user?.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur';

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

        {/* ✅ STATS GLOBALES */}
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

        {/* ✅ INSIGHTS IA */}
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
              <span className={styles.aiMetricLabel}>Confiance moyenne</span>
            </div>
            <div className={styles.aiMetric}>
              <span className={styles.aiMetricValue}>{aiInsights.tasksWithoutEstimation}</span>
              <span className={styles.aiMetricLabel}>Tâches en attente</span>
            </div>
          </div>
        </div>

        {/* ✅ GRAPHIQUE + PROJETS RÉCENTS */}
        <div className={styles.dashboardSplit}>
          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>📊 Distribution des tâches</h3>
            <div className={styles.chartContainer}>
              {allTasks.length > 0 ? (
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
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#94a3b8' }}>
                  <p>Aucune tâche à afficher.</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.recentProjectsSection}>
            <div className={styles.recentProjectsHeader}>
              <h3> Projets Récents</h3>
              <button onClick={() => navigate('/projects')} className={styles.viewAllBtn}>Voir tous →</button>
            </div>
            <div className={styles.recentProjectsList}>
              {recentProjects.length > 0 ? recentProjects.map((project) => (
                <div key={project.id} className={styles.recentProjectItem} onClick={() => setSelectedProject(project)}>
                  <div className={styles.recentProjectIcon}>{project.name?.charAt(0)?.toUpperCase()}</div>
                  <div className={styles.recentProjectInfo}>
                    <h4>{project.name}</h4>
                    <span>{project.status}</span>
                  </div>
                </div>
              )) : <p>Aucun projet</p>}
            </div>
          </div>
        </div>

        {/* ✅ TÂCHES DU PROJET SÉLECTIONNÉ */}
        {selectedProject && (
          <div className={styles.tasksSection}>
            <h3>Tâches : {selectedProject.name}</h3>
            <div className={styles.taskList}>
              {selectedProjectTasks.map((task: Task) => {
                const hasEst = !!task.estimation;
                return (
                  <div key={task.id} className={styles.taskItem}>
                    <div>
                      <h4>{task.name}</h4>
                      <p>{task.description || 'Aucune description'}</p>
                    </div>
                    <button
                      onClick={() => handleEstimate(task.id)}
                      disabled={hasEst || isEstimating}
                      className={styles.estimateButton}
                      style={hasEst ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      {hasEst ? '✅ Fait' : isEstimating ? '⏳...' : '🤖 Estimer'}
                    </button>
                  </div>
                );
              })}
              {selectedProjectTasks.length === 0 && <div className={styles.taskEmpty}>Aucune tâche pour ce projet.</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;