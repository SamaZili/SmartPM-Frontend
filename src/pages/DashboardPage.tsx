import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../services/api';
import { ApiResponse, Project, Task, Estimation } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [estimationResult, setEstimationResult] = useState<Estimation | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject.id);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await get<Project[]>('/projects');
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de charger les projets.');
    }
  };

  const fetchTasks = async (projectId: number) => {
    try {
      const response = await get<Task[]>(`/projects/${projectId}/tasks`);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de charger les tâches.');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      const response = await post<Project>('/projects', { 
        name: newProjectName, 
        description: 'Nouveau projet',
        status: 'en_cours'
      });
      if (response.success && response.data) {
        setProjects([...projects, response.data]);
        setNewProjectName('');
        setSuccessMsg('Projet créé avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du projet.');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskName) return;
    try {
      const response = await post<Task>(`/projects/${selectedProject.id}/tasks`, {
        name: newTaskName,
        description: newTaskDesc,
        status: 'a_faire',
        complexity: 'moyenne',
        user_id: 1
      });
      if (response.success && response.data) {
        setTasks([...tasks, response.data]);
        setNewTaskName('');
        setNewTaskDesc('');
        setSuccessMsg('Tâche ajoutée avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la tâche.');
    }
  };

  const handleEstimate = async (taskId: number) => {
    if (!selectedProject) return;
    setIsLoading(true);
    setError('');
    setEstimationResult(null);

    try {
      const response = await post<Estimation>(`/projects/${selectedProject.id}/tasks/${taskId}/estimate`, {});
      if (response.success && response.data) {
        setEstimationResult(response.data);
      } else {
        setError(response.message || "L'estimation a échoué.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur inattendue lors de l'appel à l'IA.");
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
            🏗️
          </div>
          <h1 style={{ color: '#10b981', fontSize: '1.5rem', margin: 0, fontWeight: '700' }}>SmartPM</h1>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
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
            <span>📊</span> Tableau de bord
          </button>
          <button 
            onClick={() => navigate('/projects')}
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
              gap: '0.75rem',
              transition: 'all 0.2s'
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
              gap: '0.75rem',
              transition: 'all 0.2s'
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
              gap: '0.75rem',
              transition: 'all 0.2s'
            }}
          >
            <span>👤</span> Profil
          </button>
        </nav>

        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#10b981', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {getInitials('Admin Test')}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>Admin Test</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>Chef de projet</p>
          </div>
          <button onClick={handleLogout} style={{ 
            padding: '0.5rem', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.875rem', fontWeight: '700' }}>Vue d'ensemble analytique</h2>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Projets actifs</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{projects.length}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Tâches en cours</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{tasks.filter(t => t.status === 'en_cours').length}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Taux de complétion</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'terminee').length / tasks.length) * 100) : 0}%
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#10b981', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Estimation IA moyenne</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
              {estimationResult ? `${estimationResult.predicted_effort}h` : '0h'}
            </p>
          </div>
        </div>

        {error && <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}
        {successMsg && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>{successMsg}</div>}

        {/* Projects Section */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>📁 Mes Projets</h3>
          </div>
          
          <form onSubmit={handleAddProject} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <input 
              type="text" 
              placeholder="Nom du nouveau projet..." 
              value={newProjectName} 
              onChange={(e) => setNewProjectName(e.target.value)} 
              style={{ flex: 1, padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' }}
            />
            <button type="submit" style={{ 
              padding: '0.875rem 1.5rem', 
              backgroundColor: '#10b981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              + Nouveau projet
            </button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {projects.map(project => (
              <div 
                key={project.id} 
                onClick={() => setSelectedProject(project)}
                style={{ 
                  border: selectedProject?.id === project.id ? '2px solid #10b981' : '1px solid #e2e8f0', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  backgroundColor: selectedProject?.id === project.id ? '#f0fdf4' : 'white',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
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
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {project.status === 'en_cours' ? 'Actif' : project.status}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.125rem', fontWeight: '600' }}>{project.name}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>ID: {project.id}</p>
              </div>
            ))}
            {projects.length === 0 && (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '3rem',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                Aucun projet pour le moment. Créez votre premier projet ci-dessus !
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        {selectedProject && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>
              📋 Tâches pour : <span style={{ color: '#10b981' }}>{selectedProject.name}</span>
            </h3>
            
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <input 
                type="text" 
                placeholder="Nom de la tâche..." 
                value={newTaskName} 
                onChange={(e) => setNewTaskName(e.target.value)} 
                required
                style={{ padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' }}
              />
              <textarea 
                placeholder="Description (importante pour l'IA)..." 
                value={newTaskDesc} 
                onChange={(e) => setNewTaskDesc(e.target.value)} 
                style={{ padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px', resize: 'vertical', fontSize: '1rem' }}
              />
              <button type="submit" style={{ 
                padding: '0.875rem 1.5rem', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600',
                fontSize: '1rem',
                alignSelf: 'flex-start'
              }}>
                + Ajouter une tâche
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  padding: '1.25rem', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>{task.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>{task.description || 'Aucune description'}</p>
                  </div>
                  <button 
                    onClick={() => handleEstimate(task.id)}
                    disabled={isLoading}
                    style={{ 
                      padding: '0.625rem 1.25rem', 
                      backgroundColor: isLoading ? '#94a3b8' : '#8b5cf6', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: isLoading ? 'not-allowed' : 'pointer', 
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      marginLeft: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                     Estimer via IA
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '2px dashed #e2e8f0'
                }}>
                  Aucune tâche pour ce projet. Ajoutez-en une ci-dessus !
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Result */}
        {estimationResult && (
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            color: '#166534', 
            padding: '2rem', 
            borderRadius: '12px', 
            border: '2px solid #10b981',
            marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
              ✅ Résultat de l'Estimation IA
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <p style={{ margin: '0.75rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
                  <span style={{ color: '#15803d' }}>Effort prédit :</span> {estimationResult.predicted_effort} heures
                </p>
                <p style={{ margin: '0.75rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
                  <span style={{ color: '#15803d' }}>Score de confiance :</span> {(estimationResult.confidence_score * 100).toFixed(0)}%
                </p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#15803d' }}>
                  Généré le {new Date(estimationResult.created_at).toLocaleDateString('fr-FR')} à {new Date(estimationResult.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;