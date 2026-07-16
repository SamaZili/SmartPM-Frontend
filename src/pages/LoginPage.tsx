import React, { useState } from 'react';
import { post } from '../services/api';
import { ApiResponse, User } from '../types';

// Interface pour les données du formulaire (strictement typée, pas de 'any')
interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  // Typage explicite du state
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Ajout du type explicite "LoginFormData" pour "prev"
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
      // Appel à l'API typé : on attend une réponse contenant un objet User
      const response: ApiResponse<User> = await post<User, LoginFormData>('/login', formData);
      
      if (response.success && response.data) {
        // Sauvegarder le token (à adapter selon la réponse exacte de ton backend Laravel Sanctum)
        // localStorage.setItem('token', response.data.token);
        console.log('Connexion réussie !', response.data);
        // Redirection vers le dashboard ici (ex: navigate('/dashboard'))
      } else {
        setError(response.message || 'Erreur de connexion.');
      }
    } catch (err) {
      // L'erreur est déjà typée dans notre service api.ts
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Connexion à SmartPM</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Mot de passe :</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            backgroundColor: isLoading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- AJOUTÉ pour la redirection
import { post } from '../services/api';
import { ApiResponse, User } from '../types';

// Interface pour les données du formulaire
interface LoginFormData {
  email: string;
  password: string;
}

// Interface correspondant EXACTEMENT à la réponse de ton AuthController Laravel
interface LoginResponseData {
  message_code: string;
  user: User;
  token: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate(); // <-- AJOUTÉ
  
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
    e.preventDefault(); // <-- EMPÊCHE le rechargement de page (évite l'erreur GET)
    setError('');
    setIsLoading(true);

    try {
      // Appel typé : on envoie LoginFormData, on attend LoginResponseData
      const response: ApiResponse<LoginResponseData> = await post<LoginResponseData, LoginFormData>('/login', formData);
      
      // Vérification du code de succès et des données
      if (response.data && response.data.message_code === 'LOGIN_SUCCESS') {
        // 1. Sauvegarder le token pour les futures requêtes
        localStorage.setItem('token', response.data.token);
        
        // 2. Rediriger vers le tableau de bord
        navigate('/dashboard');
      } else {
        setError(response.data?.message || 'Erreur de connexion.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '4rem auto', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', color: '#2563eb', marginBottom: '1.5rem' }}>Connexion à SmartPM</h1>
      
      {error && (
        <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', color: '#374151' }}>Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', color: '#374151' }}>Mot de passe :</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            backgroundColor: isLoading ? '#93c5fd' : '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;