import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../features/Auth/api/authApi';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import styles from './ResetPasswordPage.module.css';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { message, showMessage } = useTemporaryMessage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      showMessage('Token de réinitialisation manquant', 5000, 'error');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      showMessage('Les mots de passe ne correspondent pas', 5000, 'error');
      return;
    }

    if (formData.password.length < 8) {
      showMessage('Le mot de passe doit contenir au moins 8 caractères', 5000, 'error');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      
      showMessage('Mot de passe réinitialisé avec succès ! Redirection...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Erreur lors de la réinitialisation', 5000, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>❌</div>
          <h1>Lien invalide</h1>
          <p>Le lien de réinitialisation est manquant ou incorrect.</p>
          <button onClick={() => navigate('/forgot-password')} className={styles.primaryBtn}>
            Demander un nouveau lien
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className={styles.logo}></div>
          <h1 className={styles.title}>SmartPM</h1>
          <p className={styles.subtitle}>Nouveau mot de passe</p>
        </div>

        {message && <div className={styles.errorMessage}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 caractères"
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirmez votre nouveau mot de passe"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button onClick={() => navigate('/login')} className={styles.link}>
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;