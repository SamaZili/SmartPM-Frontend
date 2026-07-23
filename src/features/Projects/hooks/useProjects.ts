import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboardApi';
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

  const createProject = useCallback(async (data: CreateProjectDto) => {
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

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, selectedProject, setSelectedProject, isLoading, createProject };
}