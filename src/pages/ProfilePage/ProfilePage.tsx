import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { message, showMessage } = useTemporaryMessage();
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
      });
    } else {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const fallbackUser = {
          id: payload.sub || payload.id || 1,
          name: payload.name || 'Utilisateur',
          email: payload.email || '',
          type: payload.type || 'chef_de_projet',
        };
        setUser(fallbackUser);
        setFormData({
          name: fallbackUser.name,
          email: fallbackUser.email,
        });
        localStorage.setItem('user', JSON.stringify(fallbackUser));
      } catch (err) {
        console.error('Erreur décodage token:', err);
        navigate('/login');
      }
    }
    
    setIsLoading(false);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, ...formData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    showMessage('Profil mis à jour avec succès !');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const userRole = user.type === 'chef_de_projet' ? 'Chef de projet' : 'Développeur';

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><span className={styles.logoLetter}>S</span></div>
          <h1 className={styles.logoText}>SmartPM</h1>
        </div>
        
        <nav className={styles.navMenu}>
          <button onClick={() => navigate('/dashboard')} className={styles.navButton}> Tableau de bord</button>
          <button onClick={() => navigate('/projects')} className={styles.navButton}>📁 Projets</button>
          <button onClick={() => navigate('/tasks')} className={styles.navButton}>✅ Tâches</button>
          <button className={`${styles.navButton} ${styles.navButtonActive}`}>👤 Profil</button>
        </nav>

        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{initial}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userRole}>{userRole}</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
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
              <p className={styles.userRole}>{userRole}</p>
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

            <button type="submit" className={styles.primaryBtn}>
              Mettre à jour le profil
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;