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

export default LoginPage;