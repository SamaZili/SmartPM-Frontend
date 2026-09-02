import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../features/Auth/api/authApi';
import { useTemporaryMessage } from '../../hooks/useTemporaryMessage';
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { message, showMessage } = useTemporaryMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setIsSent(true);
      showMessage('Email de réinitialisation envoyé ! Vérifiez votre boîte Gmail.');
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Erreur lors de l\'envoi', 5000, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✅</div>
          <h1>Email envoyé !</h1>
          <p>Un lien de réinitialisation a été envoyé à <strong>{email}</strong></p>
          <p className={styles.hint}>Vérifiez votre boîte Gmail (et les spams)</p>
          <Link to="/login" className={styles.link}>← Retour à la connexion</Link>
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
          <p className={styles.subtitle}>Réinitialisation du mot de passe</p>
        </div>

        {message && <div className={styles.errorMessage}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" className={styles.link}>
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;