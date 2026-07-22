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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.new_password && formData.new_password !== formData.new_password_confirmation) {
      showMessage('Les mots de passe ne correspondent pas', 5000, 'error');
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
      setFormData(prev => ({ ...prev, current_password: '', new_password: '', new_password_confirmation: '' }));
    } catch (err: any) {
      showMessage(err.message || 'Erreur', 5000, 'error');
    }
  };

  if (!user) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}><span>S</span></div>
          <h1>SmartPM</h1>
        </div>
        
        <nav className={styles.nav}>
          <button onClick={() => navigate('/dashboard')} className={styles.navItem}>📊 Tableau de bord</button>
          <button onClick={() => navigate('/projects')} className={styles.navItem}>📁 Projets</button>
          <button onClick={() => navigate('/tasks')} className={styles.navItem}>✅ Tâches</button>
          <button className={`${styles.navItem} ${styles.active}`}>👤 Profil</button>
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>AT</div>
            <div>
              <p className={styles.userName}>Admin Test</p>
              <p className={styles.userRole}>Chef de projet</p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Mon Profil</h1>

        {message && (
          <div className={styles.alert}>{message}</div>
        )}

        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{user.name}</h2>
              <p className={styles.userRole}>{user.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <div className={styles.formSection}>
              <h3>Informations personnelles</h3>
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
                <label>Adresse e-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Sécurité</h3>
              <div className={styles.formGroup}>
                <label>Mot de passe actuel <span className={styles.optional}>(pour changer)</span></label>
                <input
                  type="password"
                  value={formData.current_password}
                  onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                  placeholder="Laissez vide si inchangé"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                  placeholder="Minimum 8 caractères"
                  minLength={8}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Confirmation</label>
                <input
                  type="password"
                  value={formData.new_password_confirmation}
                  onChange={(e) => setFormData({...formData, new_password_confirmation: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              {isLoading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;