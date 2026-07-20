import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, put } from '../services/api';
import { ApiResponse, User } from '../types';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'chef_de_projet',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await get<{ user: User }>('/profile');
      if (response.success && response.data) {
        setUser(response.data.user);
        setFormData({
          name: response.data.user.name,
          email: response.data.user.email,
          type: response.data.user.type,
        });
      }
    } catch (err) {
      setError('Impossible de charger le profil.');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await put<User>('/profile', formData);
      if (response.success && response.data) {
        setUser(response.data);
        setSuccessMsg('Profil mis à jour avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Note: Tu devras créer cette route dans ton backend si elle n'existe pas
      const response = await put('/profile/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      if (response.success) {
        setSuccessMsg('Mot de passe changé avec succès !');
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'chef_de_projet': 'Chef de projet',
      'developer': 'Développeur',
      'admin': 'Administrateur',
    };
    return types[type] || type;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: '250px', 
        backgroundColor: 'white', 
        borderRight: '1px solid #e2e8f0',
        padding: '1.5rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#10b981', fontSize: '1.5rem', margin: 0 }}>🏗️ SmartPM</h1>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: 'transparent', 
              color: '#64748b', 
              border: 'none', 
              borderRadius: '6px',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            📊 Tableau de bord
          </button>
          <button 
            onClick={() => navigate('/projects')}
            style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: 'transparent', 
              color: '#64748b', 
              border: 'none', 
              borderRadius: '6px',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            📁 Projets
          </button>
          <button 
            onClick={() => navigate('/tasks')}
            style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: 'transparent', 
              color: '#64748b', 
              border: 'none', 
              borderRadius: '6px',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            ✅ Tâches
          </button>
          <button 
            style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: '#f0fdf4', 
              color: '#166534', 
              border: 'none', 
              borderRadius: '6px',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            👤 Profil
          </button>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={handleLogout} style={{ 
            width: '100%',
            padding: '0.5rem', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1e293b', margin: 0 }}>Profil</h2>
        </div>

        {error && <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}
        {successMsg && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>{successMsg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Profile Info */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#10b981', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <span style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                  {user ? getInitials(user.name) : 'ML'}
                </span>
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#1e293b' }}>{user?.name || 'Marc Lefebvre'}</h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>{getTypeLabel(user?.type || 'chef_de_projet')}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                    Rôle
                  </label>
                  <input
                    type="text"
                    value={getTypeLabel(formData.type)}
                    disabled
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                    Fuseau horaire
                  </label>
                  <input
                    type="text"
                    value="Europe/Paris"
                    disabled
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button 
                  type="button"
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#f1f5f9', 
                    color: '#64748b', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginRight: '0.5rem'
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: isLoading ? '#94a3b8' : '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>

          {/* Activity Stats */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>
              ACTIVITÉ
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Projets pilotés</span>
                <strong style={{ color: '#1e293b' }}>5</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tâches assignées</span>
                <strong style={{ color: '#1e293b' }}>1</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Estimations lancées</span>
                <strong style={{ color: '#1e293b' }}>14</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Précision moyenne</span>
                <strong style={{ color: '#1e293b' }}>92%</strong>
              </div>
            </div>

            {/* AI Preferences */}
            <div style={{ 
              marginTop: '1.5rem', 
              backgroundColor: '#1e293b', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px' 
            }}>
              <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', textTransform: 'uppercase', color: '#94a3b8' }}>
                PRÉFÉRENCES IA
              </h5>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', lineHeight: '1.5' }}>
                Les estimations utilisent votre historique. Vous pouvez les désactiver à tout moment.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>Suggestions automatiques</span>
                <div style={{ 
                  width: '40px', 
                  height: '20px', 
                  backgroundColor: '#10b981', 
                  borderRadius: '10px',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: 'white', 
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    right: '2px'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginTop: '2rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Sécurité</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
            Modifiez votre mot de passe régulièrement pour sécuriser votre compte.
          </p>
          
          <form onSubmit={handleChangePassword}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                  Confirmation
                </label>
                <input
                  type="password"
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button 
                type="submit"
                disabled={isLoading}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: isLoading ? '#94a3b8' : '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;