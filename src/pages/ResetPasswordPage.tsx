import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { post } from '../services/api';

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

    try {
      const response: any = await post('/reset-password', {
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
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.keys(errors).map(key => errors[key].join(', ')).join('. ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Une erreur inattendue est survenue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#dc2626' }}>Lien invalide</h2>
          <p style={{ color: '#64748b' }}>Le lien de réinitialisation est manquant ou incorrect.</p>
          <Link to="/login" style={{ color: '#10b981', fontWeight: '600' }}>Retour à la connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#10b981', fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>SmartPM</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Définissez votre nouveau mot de passe</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
          {error && (
            <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bbf7d0', fontSize: '0.875rem' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Nouveau mot de passe</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required disabled={isLoading} minLength={8} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem' }} />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Confirmer le mot de passe</label>
              <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required disabled={isLoading} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem' }} />
            </div>
            
            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '1rem', backgroundColor: isLoading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;