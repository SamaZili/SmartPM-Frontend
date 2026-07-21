import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../features/Profile/hooks/useProfile';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import { User } from '../../types';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading, error } = useProfile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      showMessage('Profil mis à jour avec succès !');
    } catch (err: any) {
      showMessage(err.message || 'Erreur lors de la mise à jour.', 5000, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

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
          <button className={styles.navButton} onClick={() => navigate('/tasks')}>Tâches</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>Profil</button>
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
        <h2 className={styles.pageTitle}>Mon Profil</h2>

        {successMsg && (
          <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>
            {successMsg}
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.profileSection}>
          <h3 className={styles.projectsSectionTitle}>Configurer mon profil</h3>
          
          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Nom complet</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                type="email"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="current_password">Mot de passe actuel</label>
              <input
                id="current_password"
                name="current_password"
                type="password"
                value={formData.current_password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="new_password">Nouveau mot de passe</label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                value={formData.new_password}
                onChange={handleChange}
                disabled={isLoading}
                minLength={8}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="new_password_confirmation">Confirmation du nouveau mot de passe</label>
              <input
                id="new_password_confirmation"
                name="new_password_confirmation"
                type="password"
                value={formData.new_password_confirmation}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;