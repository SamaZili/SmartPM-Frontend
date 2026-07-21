import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { RegisterDto } from '../../features/Auth/api/authApi';
import styles from './RegisterPage.module.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();  
  const [formData, setFormData] = useState<RegisterDto>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    type: 'chef_de_projet',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      // Géré dans useAuth
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.registerCard}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className={styles.logo}>🏗️</div>
          <h1 className={styles.title}>SmartPM</h1>
          <p className={styles.subtitle}>Créez votre compte</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="type">Rôle</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="chef_de_projet">Chef de projet</option>
              <option value="developer">Développeur</option>
            </select>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password_confirmation">Confirmation du mot de passe</label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
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
            {isLoading ? 'Inscription en cours...' : "S'inscrire"}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;