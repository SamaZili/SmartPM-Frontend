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
      // ✅ Extraire les données de la réponse API (ApiResponse<Project[]>)
      const projectsData = response?.data || response;
      if (projectsData) {
        setProjects(Array.isArray(projectsData) ? projectsData : []);
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
      // ✅ Extraire le projet de la réponse API (ApiResponse<Project>)
      const newProject = response?.data || response;
      if (newProject) {
        setProjects(prev => [...prev, newProject as Project]);
        return newProject as Project;
      }
    } catch (error) {
      console.error('Erreur création projet:', error);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id: number, data: Partial<CreateProjectDto>) => {
    try {
      const response = await dashboardApi.updateProject(id, data);
      const updatedProject = response?.data || response;
      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === id ? (updatedProject as Project) : p));
        return updatedProject as Project;
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
    addProject,       // ✅ Requis par ProjectsPage
    updateProject,    // ✅ Requis par ProjectsPage
    removeProject,    // ✅ Requis par ProjectsPage
    fetchProjects 
  };
}