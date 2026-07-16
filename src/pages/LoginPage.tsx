import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../services/api';
import { ApiResponse, User } from '../types';

interface LoginFormData {
  email: string;
  password: string;
}

// Interface spécifique pour la réponse de connexion de Laravel (ajuste selon ta réponse backend réelle)
interface LoginResponse {
  user: User;
  token: string; // Ou 'access_token' selon ton backend
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: LoginFormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Appel typé : on envoie LoginFormData, on attend une réponse contenant LoginResponse
      const response: ApiResponse<LoginResponse> = await post<LoginResponse, LoginFormData>('/login', formData);
      
      if (response.success && response.data) {
        // Sauvegarder le token d'authentification
        localStorage.setItem('token', response.data.token);
        
        // Optionnel : sauvegarder les infos utilisateur
        // localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('Connexion réussie !', response.data);
        
        // Redirection vers le tableau de bord ou la page d'accueil protégée
        navigate('/dashboard'); // Assure-toi d'ajouter cette route plus tard, ou '/' pour l'instant
      } else {
        setError(response.message || 'Identifiants incorrects.');
      }
    } catch (err) {
      // L'erreur est déjà typée et formatée dans notre service api.ts
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '2rem auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center' }}>Connexion à SmartPM</h1>
      
      {error && (
        <div style={{ color: '#dc3545', backgroundColor: '#f8d7da', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Mot de passe :</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            backgroundColor: isLoading ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;