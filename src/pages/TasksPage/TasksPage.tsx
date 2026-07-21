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
  const { tasks, addTask, updateTaskStatus, removeTask } = useTasks(projects, selectedProject?.id || null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('a_faire');
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskName) return;
    
    try {
      await addTask(selectedProject.id, {
        name: newTaskName,
        description: newTaskDesc,
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

  const handleDeleteTask = async (task: Task) => {
    if (!selectedProject) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await removeTask(selectedProject.id, task.id);
        showMessage('Tâche supprimée avec succès !');
      } catch (err: any) {
        showMessage(err.message || 'Erreur lors de la suppression.', 5000, 'error');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={styles.pageContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>🏗️</div>
          <h1 className={styles.sidebarTitle}>SmartPM</h1>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={styles.navButton} onClick={() => navigate('/dashboard')}>Tableau de bord</button>
          <button className={styles.navButton} onClick={() => navigate('/projects')}>Projets</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>Tâches</button>
          <button className={styles.navButton} onClick={() => navigate('/profile')}>Profil</button>
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
        <h2 className={styles.pageTitle}>Gestion des Tâches</h2>

        {successMsg && (
          <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>
            {successMsg}
          </div>
        )}

        {/* Projects Section */}
        <div className={styles.projectsSection}>
          <h3 className={styles.projectsSectionTitle}>📁 Sélectionnez un projet</h3>
          
          <div className={styles.projectsGrid}>
            {projects.map(project => (
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
                <p style={{ margin: '0.5rem 0', color: '#64748b' }}>{project.description || 'Aucune description'}</p>
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
                placeholder="Description..." 
                value={newTaskDesc} 
                onChange={(e) => setNewTaskDesc(e.target.value)} 
              />
              <select 
                value={newTaskStatus} 
                onChange={(e) => setNewTaskStatus(e.target.value)}
              >
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
              </select>
              <button type="submit">+ Ajouter une tâche</button>
            </form>

            <div className={styles.taskList}>
              {tasks.map(task => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskItemContent}>
                    <h4 className={styles.taskItemTitle}>{task.name}</h4>
                    <p className={styles.taskItemDescription}>
                      {task.description || 'Aucune description'}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select 
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task, e.target.value)}
                      style={{ 
                        padding: '0.5rem', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="a_faire">À faire</option>
                      <option value="en_cours">En cours</option>
                      <option value="terminee">Terminée</option>
                    </select>
                    <button 
                      onClick={() => handleDeleteTask(task)}
                      style={{ 
                        padding: '0.5rem', 
                        background: '#ef4444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && selectedProject && (
          <div className={styles.taskEmpty}>
            Aucune tâche pour ce projet.
          </div>
        )}
      </main>
    </div>
  );
};

export default TasksPage;