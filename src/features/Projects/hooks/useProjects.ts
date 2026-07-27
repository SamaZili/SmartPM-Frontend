import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../../Dashboard/api/dashboardApi';
import { Project, CreateProjectDto } from '../../../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.getProjects();
      if (response) {
        setProjects(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProject = useCallback(async (data: CreateProjectDto) => {
    try {
      const response = await dashboardApi.createProject(data);
      if (response) {
        setProjects(prev => [...prev, response]);
        return response;
      }
    } catch (error) {
      console.error('Erreur création projet:', error);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id: number, data: Partial<CreateProjectDto>) => {
    try {
      const response = await dashboardApi.updateProject(id, data);
      if (response) {
        setProjects(prev => prev.map(p => p.id === id ? response : p));
        return response;
      }
    } catch (error) {
      console.error('Erreur mise à jour projet:', error);
      throw error;
    }
  }, []);

  const removeProject = useCallback(async (id: number) => {
    try {
      await dashboardApi.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erreur suppression projet:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { 
    projects, 
    selectedProject, 
    setSelectedProject, 
    isLoading, 
    addProject,       // ✅ Ajouté
    updateProject,    // ✅ Ajouté
    removeProject,    // ✅ Ajouté
    fetchProjects 
  };
}