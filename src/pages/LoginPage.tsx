import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { post } from '../services/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response: any = await post('/login', formData);
      
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Email ou mot de passe incorrect.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    setIsLoading(true);

    try {
      const response: any = await post('/forgot-password', { email: forgotEmail });
      if (response.success) {
        setForgotSuccess('Un lien de réinitialisation a été envoyé à votre email.');
        setForgotEmail('');
      } else {
        setError(response.message || 'Erreur lors de la demande.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur inattendue.');
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '1rem'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '440px'
      }}>
        {/* Logo et titre */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#10b981', 
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2.5rem',
            marginBottom: '1rem'
          }}>
            ️
          </div>
          <h1 style={{ color: '#10b981', fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>SmartPM</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem' }}>
            {showForgotPassword ? 'Réinitialisation du mot de passe' : 'Connexion à votre espace'}
          </p>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '2.5rem', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e2e8f0'
        }}>
          {error && (
            <div style={{ 
              color: '#dc2626', 
              backgroundColor: '#fef2f2', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              border: '1px solid #fecaca',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {forgotSuccess && (
            <div style={{ 
              color: '#166534', 
              backgroundColor: '#f0fdf4', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              border: '1px solid #bbf7d0',
              fontSize: '0.875rem'
            }}>
              {forgotSuccess}
            </div>
          )}

          {!showForgotPassword ? (
            <>
              {/* Formulaire de connexion */}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="exemple@smartpm.com"
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0',
                      boxSizing: 'border-box',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label htmlFor="password" style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#10b981', 
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        padding: 0
                      }}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0',
                      boxSizing: 'border-box',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    backgroundColor: isLoading ? '#94a3b8' : '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>
                  Pas encore de compte ?{' '}
                  <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>
                    Créer un compte
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Formulaire mot de passe oublié */}
              <form onSubmit={handleForgotPassword}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="forgotEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="exemple@smartpm.com"
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0',
                      boxSizing: 'border-box',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    backgroundColor: isLoading ? '#94a3b8' : '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {isLoading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setForgotSuccess('');
                  }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#10b981', 
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  ← Retour à la connexion
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          © 2026 SmartPM. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;