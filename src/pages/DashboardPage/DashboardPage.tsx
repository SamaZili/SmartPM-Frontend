import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useTasks } from '../../features/Tasks/hooks/useTasks';
import { useDashboardStats } from '../../features/Dashboard/hooks/useDashboardStats';
import { useEstimations } from '../../features/Dashboard/hooks/useEstimations';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Project, Task } from '../../types';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjects();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // ✅ Le hook useTasks ne prend plus que l'ID du projet sélectionné
  const { tasks } = useTasks(selectedProject?.id || null);
  
  // ✅ TOUTE la logique complexe (localStorage, calculs, appel API) est dans ce hook
  const { estimations, isLoading, handleEstimate, aiInsights } = useEstimations(selectedProject?.id || null, tasks);
  
  const stats = useDashboardStats(projects, tasks, estimations);
  const { message: successMsg, type: msgType } = useTemporaryMessage();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const userName = user?.name || 'Utilisateur';
  const userRole = user?.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur';

  const chartData = [
    { name: 'À faire', value: stats.statusDistribution?.a_faire || 0, color: '#94a3b8' },
    { name: 'En cours', value: stats.statusDistribution?.en_cours || 0, color: '#f59e0b' },
    { name: 'Terminée', value: stats.statusDistribution?.terminee || 0, color: '#10b981' },
  ];

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

        <div className={styles.statsGrid}>
          <div className={styles.statCard}><p className={styles.statLabel}>Projets actifs</p><p className={styles.statValue}>{stats.activeProjects}</p></div>
          <div className={styles.statCard}><p className={styles.statLabel}>Tâches en cours</p><p className={styles.statValue}>{stats.tasksInProgress}</p></div>
          <div className={styles.statCard}><p className={styles.statLabel}>Taux de complétion</p><p className={styles.statValue}>{stats.completionRate}%</p></div>
          <div className={styles.statCard}><p className={styles.statLabel}>Estimation IA moyenne</p><p className={styles.statValuePrimary}>{stats.avgEstimation}h</p></div>
        </div>

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

        <div className={styles.dashboardSplit}>
          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>📊 Distribution des tâches</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.recentProjectsSection}>
            <div className={styles.recentProjectsHeader}>
              <h3>📁 Projets Récents</h3>
              <button onClick={() => navigate('/projects')} className={styles.viewAllBtn}>Voir tous →</button>
            </div>
            <div className={styles.recentProjectsList}>
              {recentProjects.length > 0 ? recentProjects.map((project) => (
                <div key={project.id} className={styles.recentProjectItem} onClick={() => setSelectedProject(project)}>
                  <div className={styles.recentProjectIcon}>{project.name?.charAt(0)?.toUpperCase() ?? '?'}</div>
                  <div className={styles.recentProjectInfo}>
                    <h4>{project.name}</h4>
                    <span>{project.status}</span>
                  </div>
                </div>
              )) : <p>Aucun projet</p>}
            </div>
          </div>
        </div>

        {selectedProject && (
          <div className={styles.tasksSection}>
            <h3>Tâches : {selectedProject.name}</h3>
            <div className={styles.taskList}>
              {tasks.map((task: Task) => {
                const hasEst = estimations.some(e => e.task_id === task.id);
                return (
                  <div key={task.id} className={styles.taskItem}>
                    <div>
                      <h4>{task.name}</h4>
                      <p>{task.description || 'Aucune description'}</p> {/* ✅ Sécurité ajoutée ici */}
                    </div>
                    <button 
                      onClick={() => handleEstimate(task.id)} 
                      disabled={hasEst || isLoading} 
                      className={styles.estimateButton} 
                      style={hasEst ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      {hasEst ? '✅ Fait' : isLoading ? '⏳...' : '🤖 Estimer'}
                    </button>
                  </div>
                );
              })}
              {tasks.length === 0 && <div className={styles.taskEmpty}>Aucune tâche pour ce projet.</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;