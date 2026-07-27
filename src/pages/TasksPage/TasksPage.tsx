import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useTasks } from '../../features/Tasks/hooks/useTasks';
import { useEstimations } from '../../features/Dashboard/hooks/useEstimations';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Project, Task } from '../../types';
import styles from './TasksPage.module.css';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const { tasks, addTask, updateTaskStatus, removeTask } = useTasks(selectedProject?.id || null);
  const { estimations, isLoading: isEstimating, handleEstimate } = useEstimations(selectedProject?.id || null, tasks);
  
  const [newTask, setNewTask] = useState({ name: '', description: '', status: 'a_faire' });
  const { message, showMessage } = useTemporaryMessage();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTask.name.trim()) {
      showMessage('Veuillez remplir tous les champs', 3000, 'error');
      return;
    }
    try {
      await addTask(selectedProject.id, { name: newTask.name, description: newTask.description || undefined, status: newTask.status, complexity: 'moyenne' });
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
              <textarea placeholder="Description..." value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows={2} />
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
                      <button onClick={() => handleEstimate(task.id)} disabled={isEstimating || !!estimation} className={styles.aiBtn} style={estimation ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                        {isEstimating ? '⏳...' : estimation ? '✅ Déjà estimée' : '🤖 Estimer via IA'}
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', marginLeft: '0.5rem' }}>🗑️</button>
                    </div>
                    {estimation && (
                      <div className={styles.estimationResult}>
                        <div className={styles.estimationHeader}>
                          <span className={styles.estimationTitle}>📊 Résultat</span>
                          <span className={styles.estimationDate}>{new Date(estimation.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className={styles.estimationGrid}>
                          <div className={styles.estimationItem}><span className={styles.estimationLabel}>Effort</span><span className={styles.estimationValue}>{estimation.predicted_effort}h</span></div>
                          <div className={styles.estimationItem}><span className={styles.estimationLabel}>Confiance</span><span className={styles.estimationValue}>{Math.round(estimation.confidence_score * 100)}%</span></div>
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