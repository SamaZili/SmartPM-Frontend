import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../services/api';
import { ApiResponse, Project, Task, Estimation } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // --- États pour les données ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [estimationResult, setEstimationResult] = useState<Estimation | null>(null);

  // --- États pour les formulaires ---
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // --- États UI ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Charger les projets au démarrage
  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Charger les tâches quand on sélectionne un projet
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
      // CORRECTION : Ajout du statut 'en_cours' requis par la base de données
      const response = await post<Project>('/projects', { 
        name: newProjectName, 
        description: 'Nouveau projet',
        status: 'en_cours' 
      });
      
      if (response.success && response.data) {
        setProjects([...projects, response.data]);
        setNewProjectName('');
        setSuccessMsg('Projet ajouté avec succès !');
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
        user_id: 1 // À adapter si tu as l'ID de l'utilisateur connecté dynamiquement
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

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#10b981', margin: 0 }}>🏗️ Tableau de Bord SmartPM</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
          Se déconnecter
        </button>
      </div>

      {error && <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}
      {successMsg && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>{successMsg}</div>}

      {/* SECTION 1 : PROJETS */}
      <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', backgroundColor: 'white' }}>
        <h2 style={{ marginTop: 0, color: '#1e293b' }}>📁 Mes Projets</h2>
        
        <form onSubmit={handleAddProject} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Nom du nouveau projet..." 
            value={newProjectName} 
            onChange={(e) => setNewProjectName(e.target.value)} 
            required
            style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1rem' }}
          />
          <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            + Ajouter Projet
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {projects.map(project => (
            <div 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              style={{ 
                border: selectedProject?.id === project.id ? '2px solid #10b981' : '1px solid #e2e8f0', 
                padding: '1.25rem', 
                borderRadius: '8px', 
                cursor: 'pointer',
                backgroundColor: selectedProject?.id === project.id ? '#f0fdf4' : '#f8fafc',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>{project.name}</strong>
                <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {project.status === 'en_cours' ? 'ACTIF' : project.status?.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>ID: {project.id}</p>
            </div>
          ))}
          {projects.length === 0 && <p style={{ color: '#64748b' }}>Aucun projet pour le moment.</p>}
        </div>
      </div>

      {/* SECTION 2 : TÂCHES */}
      {selectedProject && (
        <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', backgroundColor: 'white' }}>
          <h2 style={{ marginTop: 0, color: '#1e293b' }}>📋 Tâches pour : {selectedProject.name}</h2>
          
          <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Nom de la tâche..." 
              value={newTaskName} 
              onChange={(e) => setNewTaskName(e.target.value)} 
              required
              style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
            />
            <textarea 
              placeholder="Description (importante pour l'IA)..." 
              value={newTaskDesc} 
              onChange={(e) => setNewTaskDesc(e.target.value)} 
              style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', minHeight: '80px', resize: 'vertical' }}
            />
            <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', alignSelf: 'flex-start' }}>
              + Ajouter Tâche
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                <div>
                  <strong style={{ color: '#1e293b' }}>{task.name}</strong>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{task.description || 'Aucune description'}</p>
                </div>
                <button 
                  onClick={() => handleEstimate(task.id)}
                  disabled={isLoading}
                  style={{ padding: '0.5rem 1rem', backgroundColor: isLoading ? '#94a3b8' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  🤖 Estimer via IA
                </button>
              </div>
            ))}
            {tasks.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>Aucune tâche pour ce projet. Ajoutez-en une ci-dessus !</p>}
          </div>
        </div>
      )}

      {/* SECTION 3 : RÉSULTAT IA */}
      {estimationResult && (
        <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '1.5rem', borderRadius: '8px', border: '2px solid #10b981' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✅ Résultat de l'Estimation IA</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <p style={{ margin: '0.5rem 0', fontSize: '1.25rem' }}><strong>Effort prédit :</strong> {estimationResult.predicted_effort} heures</p>
              <p style={{ margin: '0.5rem 0', fontSize: '1.25rem' }}><strong>Score de confiance :</strong> {(estimationResult.confidence_score * 100).toFixed(0)}%</p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#15803d' }}>
                Généré le {new Date(estimationResult.created_at).toLocaleDateString('fr-FR')} à {new Date(estimationResult.created_at).toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;