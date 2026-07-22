import { useState, useCallback, useEffect } from 'react';
import { projectsApi, CreateProjectDto } from '../api/projectsApi';
import { Project } from '../../../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await projectsApi.getAll();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err: any) {
      // Fallback : données locales si API échoue
      console.warn('API projects indisponible');
      const stored = localStorage.getItem('projects');
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProject = useCallback(async (data: CreateProjectDto) => {
    try {
      const response = await projectsApi.create(data);
      if (response.success && response.data) {
        const newProject = response.data;
        setProjects(prev => [...prev, newProject]);
        localStorage.setItem('projects', JSON.stringify([...projects, newProject]));
        return newProject;
      }
    } catch (err: any) {
      // Création locale si API échoue
      const newProject: Project = {
        id: Date.now(),
        name: data.name,
        description: data.description || '',
        status: data.status || 'en_cours',
        user_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const updated = [...projects, newProject];
      setProjects(updated);
      localStorage.setItem('projects', JSON.stringify(updated));
      
      return newProject;
    }
  }, [projects]);

  const updateProject = useCallback(async (id: number, data: Partial<CreateProjectDto>) => {
    try {
      // Ne pas appeler l'API si elle n'existe pas
      // const response = await projectsApi.update(id, data);
      
      // Mise à jour locale
      const updated = projects.map(p => 
        p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
      );
      
      setProjects(updated);
      localStorage.setItem('projects', JSON.stringify(updated));
      
      return updated.find(p => p.id === id);
    } catch (err: any) {
      // Fallback local
      const updated = projects.map(p => 
        p.id === id ? { ...p, ...data } : p
      );
      
      setProjects(updated);
      localStorage.setItem('projects', JSON.stringify(updated));
      
      return updated.find(p => p.id === id);
    }
  }, [projects]);

  const removeProject = useCallback(async (id: number) => {
    try {
      // const response = await projectsApi.delete(id);
      
      // Suppression locale
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('projects', JSON.stringify(updated));
    } catch (err: any) {
      // Fallback local
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('projects', JSON.stringify(updated));
    }
  }, [projects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { 
    projects, 
    isLoading, 
    error, 
    fetchProjects, 
    addProject, 
    updateProject,
    removeProject,
    setProjects 
  };
}