import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post, del } from '../services/api';
import { Task, Project } from '../types';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchAllTasks();
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
      setError('Impossible de charger les tâches.');
    }
  };

  const handleDeleteTask = async (taskId: number, projectId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      const response = await del(`/projects/${projectId}/tasks/${taskId}`);
      if (response.success) {
        setTasks(tasks.filter(t => t.id !== taskId));
        setSuccessMsg('Tâche supprimée avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setError('Erreur lors de la suppression.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'a_faire': return '#94a3b8';
      case 'en_cours': return '#f59e0b';
      case 'terminee': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'a_faire': return 'À FAIRE';
      case 'en_cours': return 'EN COURS';
      case 'terminee': return 'TERMINÉE';
      default: return status.toUpperCase();
    }
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projet inconnu';
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

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
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.875rem', fontWeight: '700' }}>Toutes les tâches</h2>
        </div>

        {error && <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}
        {successMsg && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>{successMsg}</div>}

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {['all', 'a_faire', 'en_cours', 'terminee'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{ 
                padding: '0.625rem 1.25rem', 
                backgroundColor: filter === status ? '#1e293b' : 'white', 
                color: filter === status ? 'white' : '#64748b', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: filter === status ? '600' : '400',
                fontSize: '0.875rem'
              }}
            >
              {status === 'all' ? 'Toutes' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Tableau des tâches */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>TÂCHE</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>PROJET</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>STATUT</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: getStatusColor(task.status || 'a_faire'), 
                        borderRadius: '50%' 
                      }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{task.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {task.description || 'Aucune description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>
                    {getProjectName(task.project_id)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.375rem 0.875rem', 
                      backgroundColor: getStatusColor(task.status || 'a_faire') + '20',
                      color: getStatusColor(task.status || 'a_faire'),
                      border: `1px solid ${getStatusColor(task.status || 'a_faire')}`,
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {getStatusLabel(task.status || 'a_faire')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteTask(task.id, task.project_id)}
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
                  </td>
                </tr>
              ))}
              
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Aucune tâche trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;