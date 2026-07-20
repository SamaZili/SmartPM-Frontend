import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../services/api';
import { Project, Task, Estimation } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [estimations, setEstimations] = useState<Estimation[]>([]);
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
    fetchAllEstimations();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject.id);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  // Recalculer toutes les tâches quand les projets changent
  useEffect(() => {
    if (projects.length > 0) {
      fetchAllTasks();
    }
  }, [projects]);

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

  const fetchAllTasks = async () => {
    try {
      const allTasks: Task[] = [];
      for (const project of projects) {
        const response = await get<Task[]>(`/projects/${project.id}/tasks`);
        if (response.success && response.data) {
          allTasks.push(...response.data);
        }
      }
      setTasks(allTasks);
    } catch (err: any) {
      console.error('Erreur chargement tâches:', err);
    }
  };

  const fetchTasks = async (projectId: number) => {
    try {
      const response = await get<Task[]>(`/projects/${projectId}/tasks`);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err: any) {
      setError('Impossible de charger les tâches.');
    }
  };

  const fetchAllEstimations = async () => {
    try {
      // On récupère les estimations via les tâches
      const allEstimations: Estimation[] = [];
      for (const project of projects) {
        const response = await get<Task[]>(`/projects/${project.id}/tasks`);
        if (response.success && response.data) {
          for (const task of response.data) {
            if (task.estimations) {
              allEstimations.push(...(task.estimations as any));
            }
          }
        }
      }
      setEstimations(allEstimations);
    } catch (err: any) {
      console.error('Erreur estimations:', err);
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
      setError(err.response?.data?.message || 'Erreur lors de la création.');
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
        const updatedTasks = [...tasks, response.data];
        setTasks(updatedTasks);
        setNewTaskName('');
        setNewTaskDesc('');
        setSuccessMsg('Tâche ajoutée avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
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
        // Ajouter à l'historique
        setEstimations([...estimations, response.data]);
      } else {
        setError(response.message || "L'estimation a échoué.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur inattendue.");
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

  // === CALCULS DYNAMIQUES ===
  const activeProjects = projects.filter(p => p.status === 'en_cours').length;
  const tasksInProgress = tasks.filter(t => t.status === 'en_cours').length;
  const tasksDone = tasks.filter(t => t.status === 'terminee').length;
  const completionRate = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;
  
  // Moyenne des estimations IA
  const avgEstimation = estimations.length > 0 
    ? (estimations.reduce((sum, e) => sum + e.predicted_effort, 0) / estimations.length).toFixed(1)
    : '0';

  // Distribution par statut pour le graphique
  const statusDistribution = {
    a_faire: tasks.filter(t => t.status === 'a_faire').length,
    en_cours: tasks.filter(t => t.status === 'en_cours').length,
    terminee: tasks.filter(t => t.status === 'terminee').length,
  };

  const maxStatusCount = Math.max(...Object.values(statusDistribution), 1);

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
          <button style={{ 
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
          }}>
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
            AT
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Projets actifs</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{activeProjects}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Tâches en cours</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{tasksInProgress}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Taux de complétion</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{completionRate}%</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#10b981', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Estimation IA moyenne</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{avgEstimation}h</p>
          </div>
        </div>

        {/* Graphique : Distribution des tâches par statut */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>
             Distribution des tâches par statut
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', height: '250px', paddingBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
            {[
              { label: 'À faire', value: statusDistribution.a_faire, color: '#94a3b8' },
              { label: 'En cours', value: statusDistribution.en_cours, color: '#f59e0b' },
              { label: 'Terminée', value: statusDistribution.terminee, color: '#10b981' },
            ].map(item => (
              <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '100%', 
                  maxWidth: '120px',
                  height: `${(item.value / maxStatusCount) * 200}px`,
                  backgroundColor: item.color,
                  borderRadius: '8px 8px 0 0',
                  transition: 'height 0.5s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '0.5rem',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.25rem'
                }}>
                  {item.value}
                </div>
                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historique des estimations IA */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>
            🤖 Historique des estimations IA
          </h3>
          {estimations.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              Aucune estimation pour le moment. Lancez votre première estimation via IA !
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {estimations.slice(-5).reverse().map((est, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div>
                    <strong style={{ color: '#166534' }}>Estimation #{est.id}</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                      {new Date(est.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                      {est.predicted_effort}h
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      Confiance: {(est.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}
        {successMsg && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>{successMsg}</div>}

        {/* Projects Section */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>📁 Mes Projets</h3>
          
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
              fontWeight: '600'
            }}>
              + Nouveau projet
            </button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
                  transition: 'all 0.2s ease'
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
                    fontWeight: '600'
                  }}>
                    ACTIF
                  </span>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.125rem', fontWeight: '600' }}>{project.name}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>ID: {project.id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        {selectedProject && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
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
                  backgroundColor: '#f8fafc'
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
                      marginLeft: '1rem'
                    }}
                  >
                    🤖 Estimer via IA
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
                  Aucune tâche pour ce projet.
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
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
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
                  Généré le {new Date(estimationResult.created_at).toLocaleString('fr-FR')}
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