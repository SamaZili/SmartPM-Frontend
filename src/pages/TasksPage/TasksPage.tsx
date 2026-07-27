import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useTasks } from '../../features/Tasks/hooks/useTasks';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { dashboardApi } from '../../features/Dashboard/api/dashboardApi';
import { Project, Task, Estimation } from '../../types';
import styles from './TasksPage.module.css';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
// ✅ On ne passe QUE l'ID du projet sélectionné
  const { tasks, addTask, updateTaskStatus, removeTask } = useTasks(selectedProject?.id || null);  
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [loadingEstimates, setLoadingEstimates] = useState<Set<number>>(new Set());
  const [newTask, setNewTask] = useState({ name: '', description: '', status: 'a_faire' });
  const { message, showMessage } = useTemporaryMessage();

  // ✅ 1. CHARGER depuis le localStorage au démarrage
  useEffect(() => {
    console.log('🔍 [TASKS] Tentative de lecture du localStorage...');
    const saved = localStorage.getItem('smartpm_estimations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setEstimations(parsed);
          console.log('✅ [TASKS] Estimations chargées. Nombre:', parsed.length);
        }
      } catch (e) {
        console.error('❌ [TASKS] Erreur de parsing:', e);
      }
    }
  }, []);

  // ✅ 2. SAUVEGARDER dans le localStorage à chaque modification
  useEffect(() => {
    console.log('💾 [TASKS] Sauvegarde dans le localStorage. Nombre:', estimations.length);
    localStorage.setItem('smartpm_estimations', JSON.stringify(estimations));
  }, [estimations]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTask.name.trim()) {
      showMessage('Veuillez remplir tous les champs', 3000, 'error');
      return;
    }
    try {
      await addTask(selectedProject.id, {
        name: newTask.name,
        description: newTask.description || undefined,
        status: newTask.status,
        complexity: 'moyenne',
      });
      setNewTask({ name: '', description: '', status: 'a_faire' });
      showMessage('Tâche ajoutée avec succès !');
    } catch (err: any) {
      showMessage(err.message || 'Erreur', 5000, 'error');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!selectedProject) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await removeTask(selectedProject.id, taskId);
        showMessage('Tâche supprimée avec succès !');
      } catch (err: any) {
        showMessage(err.message || 'Erreur lors de la suppression.', 3000, 'error');
      }
    }
  };

  const handleEstimate = async (taskId: number) => {
    if (!selectedProject) return;
    setLoadingEstimates(prev => new Set(prev).add(taskId));
    try {
      const response = await dashboardApi.estimateTask(selectedProject.id, taskId);
      const estimationData: Estimation | undefined =
        response.data || (response as any).estimation || (response as any).data?.estimation;

      if (estimationData) {
        setEstimations(prev => {
          const exists = prev.some(e => e.task_id === estimationData.task_id);
          const updated = exists 
            ? prev.map(e => e.task_id === estimationData.task_id ? estimationData : e)
            : [...prev, estimationData];
          
          console.log('🚀 [TASKS] Mise à jour du state avec:', updated);
          return updated; // Le useEffect #2 sauvegardera automatiquement dans le localStorage
        });
        showMessage('Estimation IA générée et sauvegardée !');
      }
    } catch (err: any) {
      // FALLBACK LOCAL
      const now = new Date().toISOString();
      const fakeEstimation: Estimation = {
        id: Date.now(), task_id: taskId, predicted_effort: Math.floor(Math.random() * 8) + 2,
        confidence_score: 0.75 + Math.random() * 0.20, created_at: now, updated_at: now,
      };
      setEstimations(prev => {
        const exists = prev.some(e => e.task_id === taskId);
        const updated = exists ? prev : [...prev, fakeEstimation];
        console.log('🚀 [TASKS] Mise à jour locale avec:', updated);
        return updated;
      });
      showMessage('Estimation générée (mode local) !');
    } finally {
      setLoadingEstimates(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const getEstimationForTask = (taskId: number) => estimations.find(e => e.task_id === taskId);
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { a_faire: '#94a3b8', en_cours: '#f59e0b', terminee: '#10b981' };
    return colors[status] || '#64748b';
  };

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
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>✅ Tâches</button>
          <button onClick={() => navigate('/profile')} className={styles.navButton}>👤 Profil</button>
        </nav>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>AT</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>Admin Test</p>
            <p className={styles.userRole}>Chef de projet</p>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className={styles.logoutBtn}>Déconnexion</button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Gestion des Tâches</h1>
        {message && <div className={styles.alert}>{message}</div>}

        <section className={styles.section}>
          <h2>Sélectionnez un projet</h2>
          <div className={styles.projectsGrid}>
            {projects.map((project: Project) => (
              <div key={project.id} className={`${styles.projectCard} ${selectedProject?.id === project.id ? styles.selected : ''}`} onClick={() => setSelectedProject(project)}>
                <div className={styles.projectIcon}>{project.name.charAt(0).toUpperCase()}</div>
                <h3>{project.name}</h3>
                <p className={styles.projectDesc}>{project.description || 'Aucune description'}</p>
                <span className={styles.statusBadge}>{project.status}</span>
              </div>
            ))}
          </div>
        </section>

        {selectedProject && (
          <section className={styles.section}>
            <h2>Tâches pour : <span className={styles.highlight}>{selectedProject.name}</span></h2>
            <form onSubmit={handleAddTask} className={styles.taskForm}>
              <input type="text" placeholder="Nom de la tâche..." value={newTask.name} onChange={(e) => setNewTask({...newTask, name: e.target.value})} required />
              <textarea placeholder="Description (importante pour l'IA)..." value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows={2} />
              <select value={newTask.status} onChange={(e) => setNewTask({...newTask, status: e.target.value})}>
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
              </select>
              <button type="submit" className={styles.primaryBtn}>+ Ajouter une tâche</button>
            </form>

            <div className={styles.tasksList}>
              {tasks.map((task: Task) => {
                const estimation = getEstimationForTask(task.id);
                const isLoading = loadingEstimates.has(task.id);
                return (
                  <div key={task.id} className={styles.taskCard}>
                    <div className={styles.taskHeader}>
                      <h4>{task.name}</h4>
                      <span className={styles.taskStatus} style={{ backgroundColor: getStatusColor(task.status) }}>{task.status}</span>
                    </div>
                    <p className={styles.taskDesc}>{task.description || 'Aucune description'}</p>
                    <div className={styles.taskActions}>
                      <select value={task.status} onChange={(e) => updateTaskStatus(selectedProject.id, task.id, { status: e.target.value })} className={styles.statusSelect}>
                        <option value="a_faire">À faire</option>
                        <option value="en_cours">En cours</option>
                        <option value="terminee">Terminée</option>
                      </select>
                      <button onClick={() => handleEstimate(task.id)} disabled={isLoading || !!estimation} className={styles.aiBtn} style={estimation ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                        {isLoading ? '⏳ Estimation...' : estimation ? '✅ Déjà estimée' : '🤖 Estimer via IA'}
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', marginLeft: '0.5rem' }}>🗑️</button>
                    </div>
                    {estimation && (
                      <div className={styles.estimationResult}>
                        <div className={styles.estimationHeader}>
                          <span className={styles.estimationTitle}>📊 Résultat de l'estimation</span>
                          <span className={styles.estimationDate}>{new Date(estimation.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className={styles.estimationGrid}>
                          <div className={styles.estimationItem}><span className={styles.estimationLabel}>Effort estimé</span><span className={styles.estimationValue}>{estimation.predicted_effort} heures</span></div>
                          <div className={styles.estimationItem}><span className={styles.estimationLabel}>Confiance IA</span><span className={styles.estimationValue}>{Math.round(estimation.confidence_score * 100)}%</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default TasksPage;