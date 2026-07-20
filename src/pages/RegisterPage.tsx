import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { post } from '../services/api';
import { ApiResponse } from '../types';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  type: 'chef_de_projet' | 'developer';
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    type: 'chef_de_projet',
  });
  
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value as any,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    try {
      const response: ApiResponse<{ user: any; token: string }> = await post('/register', formData);
      
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Erreur lors de l\'inscription.');
      }
    } catch (err: any) {
      // LOG DÉTAILLÉ POUR LE DÉBOGAGE
      console.error('=== ERREUR INSCRIPTION ===');
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.keys(errors).map(key => {
          return `${key}: ${errors[key].join(', ')}`;
        }).join('. ');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur inattendue est survenue. Vérifiez votre connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', height: '64px', backgroundColor: '#10b981', borderRadius: '16px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '2.5rem', marginBottom: '1rem'
          }}>
            🏗️
          </div>
          <h1 style={{ color: '#10b981', fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>SmartPM</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem' }}>Créez votre compte</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {error && (
            <div style={{ 
              color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', 
              marginBottom: '1.5rem', border: '1px solid #fecaca', fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Nom complet</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required disabled={isLoading} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem' }} />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Adresse e-mail</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required disabled={isLoading} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="type" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Rôle</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} required disabled={isLoading} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem' }}>
                <option value="chef_de_projet">Chef de projet</option>
                <option value="developer">Développeur</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Mot de passe</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required disabled={isLoading} minLength={8} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem' }} />
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="password_confirmation" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Confirmation du mot de passe</label>
              <input type="password" id="password_confirmation" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required disabled={isLoading} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem' }} />
            </div>
            
            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '1rem', backgroundColor: isLoading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background-color 0.2s' }}>
              {isLoading ? 'Inscription en cours...' : "S'inscrire"}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>
              Déjà un compte ?{' '}
              <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;