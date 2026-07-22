import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../features/Profile/hooks/useProfile';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useProfile();
  const { message, showMessage } = useTemporaryMessage();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      showMessage('Profil mis à jour avec succès !');
    } catch (err: any) {
      showMessage(err.message || 'Erreur', 5000, 'error');
    }
  };

  if (!user) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>Chargement...</div>
      </div>
    );
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

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
          <button onClick={() => navigate('/tasks')} className={styles.navButton}>✅ Tâches</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>👤 Profil</button>
        </nav>

        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{initial}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userRole}>{user.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur'}</p>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }} className={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Mon Profil</h1>

        {message && <div className={styles.alert}>{message}</div>}

        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>{initial}</div>
            <div>
              <h2>{user.name}</h2>
              <p className={styles.userEmail}>{user.email}</p>
              <p className={styles.userRole}>{user.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Nom complet</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;