import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post, del } from '../services/api';
import { Project } from '../types';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await get<Project[]>('/projects');
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err: any) {
      setError('Impossible de charger les projets.');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await post<Project>('/projects', { 
        name: newProjectName, 
        description: newProjectDesc,
        status: 'en_cours'
      });
      
      if (response.success && response.data) {
        setProjects([...projects, response.data]);
        setNewProjectName('');
        setNewProjectDesc('');
        setShowForm(false);
        setSuccessMsg('Projet créé avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    
    try {
      const response = await del(`/projects/${projectId}`);
      if (response.success) {
        setProjects(projects.filter(p => p.id !== projectId));
        setSuccessMsg('Projet supprimé avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setError('Erreur lors de la suppression.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_cours': return '#10b981';
      case 'termine': return '#3b82f6';
      case 'en_pause': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_cours': return 'ACTIF';
      case 'termine': return 'TERMINÉ';
      case 'en_pause': return 'EN PAUSE';
      default: return status.toUpperCase();
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        backgroundColor: 'white', 
        borderRight: '1px solid #e2e8f0',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#10b981', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            ️
          </div>
          <h1 style={{ color: '#10b981', fontSize: '1.5rem', margin: 0, fontWeight: '700' }}>SmartPM</h1>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ 
              padding: '0.875rem 1rem', 
              backgroundColor: 'transparent', 
              color: '#64748b', 
              border: 'none', 
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <span></span> Tableau de bord
          </button>
          <button 
            style={{ 
              padding: '0.875rem 1rem', 
              backgroundColor: '#f0fdf4', 
              color: '#166534', 
              border: 'none', 
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <span>📁</span> Projets
          </button>
          <button 
            onClick={() => navigate('/tasks')}
            style={{ 
              padding: '0.875rem 1rem', 
              backgroundColor: 'transparent', 
              color: '#64748b', 
              border: 'none', 
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <span>✅</span> Tâches
          </button>
          <button 
            onClick={() => navigate('/profile')}
            style={{ 
              padding: '0.875rem 1rem', 
              backgroundColor: 'transparent', 
              color: '#64748b', 
              border: 'none', 
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <span>👤</span> Profil
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.875rem', fontWeight: '700' }}>Projets</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              padding: '0.875rem 1.5rem', 
              backgroundColor: '#10b981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            + Nouveau projet
          </button>
        </div>

        {error && <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}
        {successMsg && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>{successMsg}</div>}

        {/* Formulaire d'ajout */}
        {showForm && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Créer un nouveau projet</h3>
            <form onSubmit={handleAddProject}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '500' }}>Nom du projet</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '500' }}>Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  style={{ width: '100%', padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px', resize: 'vertical', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" disabled={isLoading} style={{ 
                  padding: '0.875rem 1.5rem', 
                  backgroundColor: isLoading ? '#94a3b8' : '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}>
                  {isLoading ? 'Création...' : 'Créer le projet'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ 
                  padding: '0.875rem 1.5rem', 
                  backgroundColor: '#f1f5f9', 
                  color: '#64748b', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des projets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {projects.map(project => (
            <div key={project.id} style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#10b981', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ 
                  padding: '0.375rem 0.875rem', 
                  backgroundColor: getStatusColor(project.status || 'en_cours'), 
                  color: 'white', 
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {getStatusLabel(project.status || 'en_cours')}
                </span>
              </div>
              
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.125rem', fontWeight: '600' }}>{project.name}</h3>
              <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {project.description || 'Aucune description'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {project.id}</span>
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '3rem',
              color: '#64748b',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px dashed #e2e8f0'
            }}>
              <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Aucun projet pour le moment</p>
              <button 
                onClick={() => setShowForm(true)}
                style={{ 
                  padding: '0.875rem 1.5rem', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Créer votre premier projet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;