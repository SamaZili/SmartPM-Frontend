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
    } catch (err) {
      setError('Impossible de charger les projets.');
    }
  };

  const fetchTasks = async (projectId: number) => {
    try {
      const response = await get<Task[]>(`/projects/${projectId}/tasks`);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err) {
      setError('Impossible de charger les tâches.');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      const response = await post<Project>('/projects', { name: newProjectName, description: 'Nouveau projet' });
      if (response.success && response.data) {
        setProjects([...projects, response.data]);
        setNewProjectName('');
        setSuccessMsg('Projet ajouté avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError('Erreur lors de la création du projet.');
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
        user_id: 1 // À adapter si tu as l'ID de l'utilisateur connecté dans le localStorage/context
      });
      if (response.success && response.data) {
        setTasks([...tasks, response.data]);
        setNewTaskName('');
        setNewTaskDesc('');
        setSuccessMsg('Tâche ajoutée avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError('Erreur lors de la création de la tâche.');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue lors de l'appel à l'IA.");
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
        <h1 style={{ color: '#2563eb', margin: 0 }}>Tableau de Bord SmartPM</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Se déconnecter
        </button>
      </div>

      {error && <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}
      {successMsg && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>{successMsg}</div>}

      {/* SECTION 1 : PROJETS */}
      <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>📁 Mes Projets</h2>
        
        <form onSubmit={handleAddProject} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Nom du nouveau projet..." 
            value={newProjectName} 
            onChange={(e) => setNewProjectName(e.target.value)} 
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            + Ajouter Projet
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {projects.map(project => (
            <div 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              style={{ 
                border: selectedProject?.id === project.id ? '2px solid #2563eb' : '1px solid #e2e8f0', 
                padding: '1rem', 
                borderRadius: '6px', 
                cursor: 'pointer',
                backgroundColor: selectedProject?.id === project.id ? '#eff6ff' : 'white'
              }}
            >
              <strong>{project.name}</strong>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>ID: {project.id}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2 : TÂCHES */}
      {selectedProject && (
        <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>📋 Tâches pour : {selectedProject.name}</h2>
          
          <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Nom de la tâche..." 
              value={newTaskName} 
              onChange={(e) => setNewTaskName(e.target.value)} 
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <textarea 
              placeholder="Description (important pour l'IA)..." 
              value={newTaskDesc} 
              onChange={(e) => setNewTaskDesc(e.target.value)} 
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }}>
              + Ajouter Tâche
            </button>
          </form>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tasks.map(task => (
              <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
                <div>
                  <strong>{task.name}</strong>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{task.description}</p>
                </div>
                <button 
                  onClick={() => handleEstimate(task.id)}
                  disabled={isLoading}
                  style={{ padding: '0.5rem 1rem', backgroundColor: isLoading ? '#94a3b8' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                   Estimer via IA
                </button>
              </li>
            ))}
            {tasks.length === 0 && <p style={{ color: '#64748b' }}>Aucune tâche pour ce projet.</p>}
          </ul>
        </div>
      )}

      {/* SECTION 3 : RÉSULTAT IA */}
      {estimationResult && (
        <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <h3 style={{ marginTop: 0 }}>✅ Résultat de l'Estimation IA</h3>
          <p style={{ fontSize: '1.2rem' }}><strong>Effort prédit :</strong> {estimationResult.predicted_effort} heures</p>
          <p style={{ fontSize: '1.2rem' }}><strong>Score de confiance :</strong> {(estimationResult.confidence_score * 100).toFixed(0)}%</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;