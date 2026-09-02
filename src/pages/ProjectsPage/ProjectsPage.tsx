import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const }
    },
    hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } }
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, damping: 25, stiffness: 300 }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <div className={styles.pageContainer}>
      <motion.aside 
        className={styles.sidebar}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
      >
        <div className={styles.logoContainer}>
          <motion.div className={styles.logoIcon} whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}>
            <span className={styles.logoLetter}>S</span>
          </motion.div>
          <h1 className={styles.logoText}>SmartPM</h1>
        </div>
        
        <nav className={styles.navMenu}>
          {[
            { path: '/dashboard', label: '📊 Tableau de bord', active: false },
            { path: '/projects', label: '📁 Projets', active: true },
            { path: '/tasks', label: '✅ Tâches', active: false },
            { path: '/profile', label: '👤 Profil', active: false },
          ].map((item, idx) => (
            <motion.button
              key={item.path}
              className={`${styles.navButton} ${item.active ? styles.navButtonActive : ''}`}
              onClick={() => navigate(item.path)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.label}
            </motion.button>
          ))}
        </nav>

        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{userInitial}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{userName}</p>
            <p className={styles.userRole}>{userRole}</p>
          </div>
          <motion.button onClick={handleLogout} className={styles.logoutBtn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Déconnexion
          </motion.button>
        </div>
      </motion.aside>

      <motion.main className={styles.mainContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <motion.div className={styles.header} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
          <h1 className={styles.pageTitle}>Gestion des Projets</h1>
          <motion.button onClick={() => setShowModal(true)} className={styles.primaryBtn} whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }} whileTap={{ scale: 0.95 }}>
            + Nouveau Projet
          </motion.button>
        </motion.div>

        {successMsg && (
          <motion.div className={msgType === 'error' ? styles.errorMessage : styles.successMessage} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {successMsg}
          </motion.div>
        )}

        <motion.div className={styles.searchFilterBar} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className={styles.searchContainer}>
            <span className={styles.searchIcon}>🔍</span>
            <input type="text" placeholder="Rechercher un projet..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
            {searchTerm && (
              <motion.button onClick={() => setSearchTerm('')} className={styles.clearSearch} title="Effacer la recherche" initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                ✕
              </motion.button>
            )}
          </div>

          <div className={styles.filterContainer}>
            {(['tous', 'en_cours', 'termine', 'en_pause'] as FilterStatus[]).map((status, idx) => {
              const count = status === 'tous' ? projects.length : projects.filter(p => p.status === status).length;
              const label = status === 'tous' ? 'Tous' : status === 'en_cours' ? 'En cours' : status === 'termine' ? 'Terminés' : 'En pause';

              return (
                <motion.button
                  key={status}
                  className={`${styles.filterBtn} ${filterStatus === status ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilterStatus(status)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {label} ({count})
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {(searchTerm || filterStatus !== 'tous') && (
          <motion.div className={styles.resultsInfo} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
            {searchTerm && <span> pour "{searchTerm}"</span>}
          </motion.div>
        )}

        <div className={styles.projectsGrid}>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project: Project, index: number) => (
              <motion.div
                key={project.id}
                className={styles.projectCard}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
                layout
              >
                <div className={styles.projectCardHeader}>
                  <motion.div className={styles.projectCardIcon} whileHover={{ rotate: 5, scale: 1.1 }}>
                    {project.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </motion.div>
                  <span className={styles.projectCardBadge}>{project.status}</span>
                </div>
                <h3 className={styles.projectCardTitle}>{project.name}</h3>
                <p className={styles.projectCardDescription}>{project.description || 'Aucune description'}</p>
                <div className={styles.projectCardActions}>
                  <motion.button onClick={() => handleEdit(project)} className={styles.editButton} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Modifier</motion.button>
                  <motion.button onClick={() => handleDelete(project.id)} className={styles.deleteButton} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Supprimer</motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredProjects.length === 0 && (
            <motion.div className={styles.emptyState} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              {searchTerm || filterStatus !== 'tous' ? (
                <>
                  <motion.div className={styles.emptyStateIcon} animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5, repeat: 2 }}>🔍</motion.div>
                  <h3>Aucun projet ne correspond à votre recherche</h3>
                  <p>Essayez de modifier vos critères de recherche ou vos filtres</p>
                  <motion.button onClick={() => { setSearchTerm(''); setFilterStatus('tous'); }} className={styles.resetFiltersBtn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Réinitialiser les filtres
                  </motion.button>
                </>
              ) : (
                <>
                  <div className={styles.emptyStateIcon}>📁</div>
                  <h3>Aucun projet pour le moment</h3>
                  <p>Créez votre premier projet pour commencer !</p>
                  <motion.button onClick={() => setShowModal(true)} className={styles.primaryBtn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    + Nouveau Projet
                  </motion.button>
                </>
              )}
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {showModal && (
            <motion.div className={styles.modalOverlay} variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={() => setShowModal(false)}>
              <motion.div className={styles.modalContent} variants={modalVariants} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()}>
                <h2>{editingProject ? 'Modifier le projet' : 'Nouveau projet'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label>Nom du projet</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required autoFocus />
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
                    <motion.button type="button" onClick={resetForm} className={styles.secondaryBtn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Annuler</motion.button>
                    <motion.button type="submit" className={styles.primaryBtn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {editingProject ? 'Mettre à jour' : 'Créer'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default ProjectsPage;