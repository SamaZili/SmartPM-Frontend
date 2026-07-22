import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Project } from '../../types';
import styles from './ProjectsPage.module.css';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, addProject, updateProject, removeProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'en_cours' });
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();

  const resetForm = () => {
    setFormData({ name: '', description: '', status: 'en_cours' });
    setEditingProject(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(editingProject.id, { ...formData, description: formData.description || undefined });
        showMessage('Projet mis à jour avec succès !');
      } else {
        await addProject({ ...formData, description: formData.description || undefined });
        showMessage('Projet créé avec succès !');
      }
      resetForm();
    } catch (err: any) {
      showMessage(err.message || 'Erreur.', 5000, 'error');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '', status: project.status });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer ce projet ?')) {
      try {
        await removeProject(id);
        showMessage('Projet supprimé !');
      } catch (err: any) {
        showMessage(err.message || 'Erreur.', 5000, 'error');
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><span className={styles.logoLetter}>S</span></div>
          <h1 className={styles.logoText}>SmartPM</h1>
        </div>
        <nav className={styles.navMenu}>
          <button className={styles.navButton} onClick={() => navigate('/dashboard')}>📊 Tableau de bord</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>📁 Projets</button>
          <button className={styles.navButton} onClick={() => navigate('/tasks')}>✅ Tâches</button>
          <button className={styles.navButton} onClick={() => navigate('/profile')}>👤 Profil</button>
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
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Gestion des Projets</h1>
          <button onClick={() => setShowModal(true)} className={styles.primaryBtn}>+ Nouveau Projet</button>
        </div>

        {successMsg && <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>{successMsg}</div>}

        <div className={styles.projectsGrid}>
          {projects.map((project: Project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectCardHeader}>
                <div className={styles.projectCardIcon}>{project.name.charAt(0).toUpperCase()}</div>
                <span className={styles.projectCardBadge}>{project.status}</span>
              </div>
              <h3 className={styles.projectCardTitle}>{project.name}</h3>
              <p className={styles.projectCardDescription}>{project.description || 'Aucune description'}</p>
              <div className={styles.projectCardActions}>
                <button onClick={() => handleEdit(project)} className={styles.editButton}>Modifier</button>
                <button onClick={() => handleDelete(project.id)} className={styles.deleteButton}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>{editingProject ? 'Modifier le projet' : 'Nouveau projet'}</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Nom du projet</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>
                <div className={styles.formGroup}>
                  <label>Statut</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="en_pause">En pause</option>
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" onClick={resetForm} className={styles.secondaryBtn}>Annuler</button>
                  <button type="submit" className={styles.primaryBtn}>{editingProject ? 'Mettre à jour' : 'Créer'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;