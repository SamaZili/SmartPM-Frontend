import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useTasks } from '../../features/Tasks/hooks/useTasks';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Project, Task } from '../../types';
import styles from './TasksPage.module.css';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { tasks, addTask, updateTaskStatus } = useTasks(projects, selectedProject?.id || null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('a_faire');
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskName.trim()) {
      showMessage('Veuillez sélectionner un projet et entrer un nom de tâche', 3000, 'error');
      return;
    }
    
    try {
      await addTask(selectedProject.id, {
        name: newTaskName,
        description: newTaskDesc || undefined,
        status: newTaskStatus,
        complexity: 'moyenne',
      });
      setNewTaskName('');
      setNewTaskDesc('');
      setNewTaskStatus('a_faire');
      showMessage('Tâche ajoutée avec succès !');
    } catch (err: any) {
      showMessage(err.message || 'Erreur lors de la création.', 5000, 'error');
    }
  };

  const handleUpdateStatus = async (task: Task, newStatus: string) => {
    if (!selectedProject) return;
    try {
      await updateTaskStatus(selectedProject.id, task.id, { status: newStatus });
      showMessage('Statut mis à jour avec succès !');
    } catch (err: any) {
      showMessage(err.message || 'Erreur lors de la mise à jour.', 5000, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'a_faire': return '#94a3b8';
      case 'en_cours': return '#f59e0b';
      case 'terminee': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>️</div>
          <h1 className={styles.sidebarTitle}>SmartPM</h1>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={styles.navButton} onClick={() => navigate('/dashboard')}>📊 Tableau de bord</button>
          <button className={styles.navButton} onClick={() => navigate('/projects')}>📁 Projets</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>✅ Tâches</button>
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

      <main className={styles.mainContent}>
        <h2 className={styles.pageTitle}>Gestion des Tâches</h2>

        {successMsg && (
          <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>
            {successMsg}
          </div>
        )}

        <div className={styles.projectsSection}>
          <h3 className={styles.projectsSectionTitle}>📁 Sélectionnez un projet</h3>
          
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
                  <span className={styles.projectCardBadge}>{project.status}</span>
                </div>
                <h4 className={styles.projectCardTitle}>{project.name}</h4>
                <p className={styles.projectCardId}>ID: {project.id}</p>
                <p className={styles.projectCardDescription}>{project.description || 'Aucune description'}</p>
              </div>
            ))}
            {projects.length === 0 && (
              <div className={styles.emptyState}>
                Aucun projet disponible. Créez d'abord un projet !
              </div>
            )}
          </div>
        </div>

        {selectedProject && (
          <div className={styles.tasksSection}>
            <h3 className={styles.tasksSectionTitle}>
               Tâches pour : <span>{selectedProject.name}</span>
            </h3>
            
            <form onSubmit={handleAddTask} className={styles.taskForm}>
              <input 
                type="text" 
                placeholder="Nom de la tâche..." 
                value={newTaskName} 
                onChange={(e) => setNewTaskName(e.target.value)} 
                required
                className={styles.formInput}
              />
              <textarea 
                placeholder="Description (importante pour l'IA)..." 
                value={newTaskDesc} 
                onChange={(e) => setNewTaskDesc(e.target.value)} 
                className={styles.formTextarea}
              />
              <select 
                value={newTaskStatus} 
                onChange={(e) => setNewTaskStatus(e.target.value)}
                className={styles.formSelect}
              >
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
              </select>
              <button type="submit" className={styles.addButton}>+ Ajouter une tâche</button>
            </form>

            <div className={styles.taskList}>
              {tasks.map((task: Task) => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskItemContent}>
                    <h4 className={styles.taskItemTitle}>{task.name}</h4>
                    <p className={styles.taskItemDescription}>
                      {task.description || 'Aucune description'}
                    </p>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                  </div>
                  
                  <div className={styles.taskActions}>
                    <select 
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="a_faire">À faire</option>
                      <option value="en_cours">En cours</option>
                      <option value="terminee">Terminée</option>
                    </select>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className={styles.emptyState}>
                  Aucune tâche pour ce projet. Ajoutez une tâche pour commencer !
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TasksPage;