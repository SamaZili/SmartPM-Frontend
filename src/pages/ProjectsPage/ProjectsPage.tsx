import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../features/Projects/hooks/useProjects';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { Project } from '../../types';
import styles from './ProjectsPage.module.css';

type FilterStatus = 'tous' | 'en_cours' | 'termine' | 'en_pause';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, addProject, updateProject, removeProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'en_cours' });
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();

  // 🔍 Nouveaux états pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('tous');

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
      showMessage(err.message || 'Erreur lors de l\'opération', 5000, 'error');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '', status: project.status });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await removeProject(id);
        showMessage('Projet supprimé avec succès !');
      } catch (err: any) {
        showMessage(err.message || 'Erreur lors de la suppression', 5000, 'error');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 🎯 Logique de filtrage et recherche
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'tous' || project.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchTerm, filterStatus]);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const userName = user?.name || 'Utilisateur';
  const userRole = user?.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur';

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><span className={styles.logoLetter}>S</span></div>
          <h1 className={styles.logoText}>SmartPM</h1>
        </div>
        
        <nav className={styles.navMenu}>
          <button onClick={() => navigate('/dashboard')} className={styles.navButton}>📊 Tableau de bord</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>📁 Projets</button>
          <button onClick={() => navigate('/tasks')} className={styles.navButton}>✅ Tâches</button>
          <button onClick={() => navigate('/profile')} className={styles.navButton}>👤 Profil</button>
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
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Gestion des Projets</h1>
          <button onClick={() => setShowModal(true)} className={styles.primaryBtn}>+ Nouveau Projet</button>
        </div>

        {successMsg && (
          <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>
            {successMsg}
          </div>
        )}

        {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
        <div className={styles.searchFilterBar}>
          <div className={styles.searchContainer}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className={styles.clearSearch}
                title="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.filterContainer}>
            <button
              className={`${styles.filterBtn} ${filterStatus === 'tous' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus('tous')}
            >
              Tous ({projects.length})
            </button>
            <button
              className={`${styles.filterBtn} ${filterStatus === 'en_cours' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus('en_cours')}
            >
              En cours ({projects.filter(p => p.status === 'en_cours').length})
            </button>
            <button
              className={`${styles.filterBtn} ${filterStatus === 'termine' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus('termine')}
            >
              Terminés ({projects.filter(p => p.status === 'termine').length})
            </button>
            <button
              className={`${styles.filterBtn} ${filterStatus === 'en_pause' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus('en_pause')}
            >
              En pause ({projects.filter(p => p.status === 'en_pause').length})
            </button>
          </div>
        </div>

        {/* 📊 COMPTEUR DE RÉSULTATS */}
        {(searchTerm || filterStatus !== 'tous') && (
          <div className={styles.resultsInfo}>
            {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
            {searchTerm && <span> pour "{searchTerm}"</span>}
          </div>
        )}

        {/* 📋 GRILLE DES PROJETS */}
        <div className={styles.projectsGrid}>
          {filteredProjects.map((project: Project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectCardHeader}>
                <div className={styles.projectCardIcon}>
                  {project.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
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
          
          {filteredProjects.length === 0 && (
            <div className={styles.emptyState}>
              {searchTerm || filterStatus !== 'tous' ? (
                <>
                  <div className={styles.emptyStateIcon}>🔍</div>
                  <h3>Aucun projet ne correspond à votre recherche</h3>
                  <p>Essayez de modifier vos critères de recherche ou vos filtres</p>
                  <button 
                    onClick={() => { setSearchTerm(''); setFilterStatus('tous'); }}
                    className={styles.resetFiltersBtn}
                  >
                    Réinitialiser les filtres
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.emptyStateIcon}>📁</div>
                  <h3>Aucun projet pour le moment</h3>
                  <p>Créez votre premier projet pour commencer !</p>
                  <button 
                    onClick={() => setShowModal(true)}
                    className={styles.primaryBtn}
                  >
                    + Nouveau Projet
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 🔧 MODALE DE CRÉATION/ÉDITION */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2>{editingProject ? 'Modifier le projet' : 'Nouveau projet'}</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Nom du projet</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    autoFocus
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="en_pause">En pause</option>
                  </select>
                </div>
                
                <div className={styles.modalActions}>
                  <button type="button" onClick={resetForm} className={styles.secondaryBtn}>Annuler</button>
                  <button type="submit" className={styles.primaryBtn}>
                    {editingProject ? 'Mettre à jour' : 'Créer'}
                  </button>
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