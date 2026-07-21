import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { message, showMessage } = useTemporaryMessage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('Token de réinitialisation manquant.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.resetPassword({
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      if (response.success) {
        setSuccess('Mot de passe réinitialisé avec succès ! Redirection...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.message || 'Erreur lors de la réinitialisation.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.resetCard}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#dc2626' }}>Lien invalide</h2>
            <p style={{ color: '#64748b' }}>Le lien de réinitialisation est manquant ou incorrect.</p>
            <Link to="/login" className={styles.link}>Retour à la connexion</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.resetCard}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className={styles.logo}></div>
          <h1 className={styles.title}>SmartPM</h1>
          <p className={styles.subtitle}>Définissez votre nouveau mot de passe</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}
        {message && (
          <div className={styles.errorMessage}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Nouveau mot de passe</label>
            <input 
              type="password" 
              id="password"
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              disabled={isLoading} 
              minLength={8}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
            <input 
              type="password" 
              id="password_confirmation"
              name="password_confirmation" 
              value={formData.password_confirmation} 
              onChange={handleChange} 
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
          <Link to="/login" className={styles.link}>
            ? Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
