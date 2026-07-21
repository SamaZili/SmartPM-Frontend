import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Project } from '../../types';
import styles from './ProjectsPage.module.css';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, addProject, updateProject, removeProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState('en_cours');
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    
    try {
      await addProject({ 
        name: newProjectName, 
        description: newDescription,
        status: newStatus
      });
      setNewProjectName('');
      setNewDescription('');
      setNewStatus('en_cours');
      showMessage('Projet créé avec succès !');
    } catch (err: any) {
      showMessage(err.message || 'Erreur lors de la création.', 5000, 'error');
    }
  };

  const handleEditProject = async (project: Project) => {
    const newName = prompt('Nouveau nom du projet:', project.name);
    const newDescription = prompt('Nouvelle description:', project.description || '');
    const newStatus = prompt('Nouveau statut:', project.status) || 'en_cours';
    
    if (newName) {
      try {
        await updateProject(project.id, { 
          name: newName,
          description: newDescription,
          status: newStatus
        });
        showMessage('Projet mis à jour avec succès !');
      } catch (err: any) {
        showMessage(err.message || 'Erreur lors de la modification.', 5000, 'error');
      }
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await removeProject(id);
        showMessage('Projet supprimé avec succès !');
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
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>Projets</button>
          <button className={styles.navButton} onClick={() => navigate('/tasks')}>Tâches</button>
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
        <h2 className={styles.pageTitle}>Gestion des Projets</h2>

        {successMsg && (
          <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>
            {successMsg}
          </div>
        )}

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
            <input 
              type="text" 
              placeholder="Description..." 
              value={newDescription} 
              onChange={(e) => setNewDescription(e.target.value)} 
            />
            <select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="en_pause">En pause</option>
            </select>
            <button type="submit">+ Nouveau projet</button>
          </form>

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
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => handleEditProject(project)}
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      background: '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    style={{ 
                      padding: '0.5rem 0.75rem', 
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
      </main>
    </div>
  );
};

export default ProjectsPage;