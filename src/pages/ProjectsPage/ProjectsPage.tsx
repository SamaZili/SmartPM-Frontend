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
    if (!newProjectName.trim()) {
      showMessage('Veuillez entrer un nom de projet', 3000, 'error');
      return;
    }
    
    try {
      await addProject({ 
        name: newProjectName, 
        description: newDescription || undefined,
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
    if (!newName) return;
    
    const rawDescription = prompt('Nouvelle description:', project.description || '');
    const newStatus = prompt('Nouveau statut (en_cours, termine, en_pause):', project.status) || 'en_cours';
    
    try {
      await updateProject(project.id, { 
        name: newName,
        description: rawDescription !== null ? rawDescription : project.description,
        status: newStatus
      });
      showMessage('Projet mis à jour avec succès !');
    } catch (err: any) {
      showMessage(err.message || 'Erreur lors de la modification.', 5000, 'error');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await removeProject(id);
        if (selectedProject?.id === id) {
          setSelectedProject(null);
        }
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
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>️</div>
          <h1 className={styles.sidebarTitle}>SmartPM</h1>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={styles.navButton} onClick={() => navigate('/dashboard')}>📊 Tableau de bord</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}> Projets</button>
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

      <main className={styles.mainContent}>
        <h2 className={styles.pageTitle}>Gestion des Projets</h2>

        {successMsg && (
          <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>
            {successMsg}
          </div>
        )}

        <div className={styles.projectsSection}>
          <h3 className={styles.projectsSectionTitle}>📁 Mes Projets</h3>
          
          <form onSubmit={handleAddProject} className={styles.projectForm}>
            <input 
              type="text" 
              placeholder="Nom du nouveau projet..." 
              value={newProjectName} 
              onChange={(e) => setNewProjectName(e.target.value)} 
              className={styles.formInput}
            />
            <input 
              type="text" 
              placeholder="Description..." 
              value={newDescription} 
              onChange={(e) => setNewDescription(e.target.value)} 
              className={styles.formInput}
            />
            <select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
              className={styles.formSelect}
            >
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="en_pause">En pause</option>
            </select>
            <button type="submit" className={styles.addButton}>+ Nouveau projet</button>
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
                  <span className={styles.projectCardBadge}>{project.status}</span>
                </div>
                <h4 className={styles.projectCardTitle}>{project.name}</h4>
                <p className={styles.projectCardId}>ID: {project.id}</p>
                <p className={styles.projectCardDescription}>{project.description || 'Aucune description'}</p>
                
                <div className={styles.projectCardActions}>
                  <button 
                    onClick={() => handleEditProject(project)}
                    className={styles.editButton}
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className={styles.deleteButton}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className={styles.emptyState}>
                Aucun projet pour le moment. Créez votre premier projet !
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectsPage;