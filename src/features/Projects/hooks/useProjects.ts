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
      const errorMessage = err.response?.data?.message || 'Impossible de charger les projets.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProject = useCallback(async (data: CreateProjectDto) => {
    try {
      const response = await projectsApi.create(data);
      if (response.success && response.data) {
        setProjects(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la création.');
    }
  }, []);

  const updateProject = useCallback(async (id: number, data: Partial<CreateProjectDto>) => {
    try {
      const response = await projectsApi.update(id, data);
      if (response.success && response.data) {
        setProjects(prev => prev.map(p => p.id === id ? response.data : p));
        return response.data;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la modification.');
    }
  }, []);

  const removeProject = useCallback(async (id: number) => {
    try {
      await projectsApi.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  }, []);

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