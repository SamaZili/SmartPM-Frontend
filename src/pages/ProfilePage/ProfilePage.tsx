import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../features/Profile/hooks/useProfile';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading, error: apiError } = useProfile();
  const { message: successMsg, type: msgType, showMessage } = useTemporaryMessage();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
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
    
    if (formData.new_password && formData.new_password !== formData.new_password_confirmation) {
      showMessage('Les nouveaux mots de passe ne correspondent pas', 5000, 'error');
      return;
    }

    const updateData: any = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.new_password) {
      updateData.current_password = formData.current_password;
      updateData.new_password = formData.new_password;
      updateData.new_password_confirmation = formData.new_password_confirmation;
    }
    
    try {
      await updateProfile(updateData);
      showMessage('Profil mis à jour avec succès !');
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      }));
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
        <div className={styles.loading}>Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>🏗️</div>
          <h1 className={styles.sidebarTitle}>SmartPM</h1>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={styles.navButton} onClick={() => navigate('/dashboard')}>📊 Tableau de bord</button>
          <button className={styles.navButton} onClick={() => navigate('/projects')}>📁 Projets</button>
          <button className={styles.navButton} onClick={() => navigate('/tasks')}>✅ Tâches</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>👤 Profil</button>
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
        <h2 className={styles.pageTitle}>Mon Profil</h2>

        {successMsg && (
          <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>
            {successMsg}
          </div>
        )}

        {apiError && (
          <div className={styles.errorMessage}>
            {apiError}
          </div>
        )}

        <div className={styles.profileSection}>
          <h3 className={styles.sectionTitle}>Configurer mon profil</h3>
          
          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nom complet</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="current_password">Mot de passe actuel</label>
              <input
                id="current_password"
                name="current_password"
                type="password"
                value={formData.current_password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Laissez vide si vous ne changez pas le mot de passe"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="new_password">Nouveau mot de passe</label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                value={formData.new_password}
                onChange={handleChange}
                disabled={isLoading}
                minLength={8}
                placeholder="Minimum 8 caractères"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="new_password_confirmation">Confirmation du nouveau mot de passe</label>
              <input
                id="new_password_confirmation"
                name="new_password_confirmation"
                type="password"
                value={formData.new_password_confirmation}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Confirmez le nouveau mot de passe"
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