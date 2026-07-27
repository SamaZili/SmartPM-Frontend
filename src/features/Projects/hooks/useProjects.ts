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
      // Extraire les données de la réponse API
      const projectsData = response.data || response;
      if (projectsData) {
        setProjects(Array.isArray(projectsData) ? projectsData : []);
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
      // Extraire le projet de la réponse
      const newProject = response.data || response;
      if (newProject) {
        setProjects(prev => [...prev, newProject as Project]);
        return newProject as Project;
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