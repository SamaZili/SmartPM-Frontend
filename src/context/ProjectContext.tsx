import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { projectsApi, CreateProjectDto } from '../features/Projects/api/projectsApi';
import { Project } from '../types';
import { ProjectContextType } from './ProjectContext.type'; // ✅ Import du type séparé

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectsApi.getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err) {
      setError('Impossible de charger les projets.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProject = useCallback(async (data: CreateProjectDto) => {
    const response = await projectsApi.createProject(data);
    if (response.success && response.data) {
      setProjects(prev => [...prev, response.data as Project]);
    }
  }, []);

  const updateProject = useCallback(async (id: number, data: Partial<CreateProjectDto>) => {
    const response = await projectsApi.updateProject(id, data);
    if (response.success && response.data) {
      setProjects(prev => prev.map(p => p.id === id ? (response.data as Project) : p));
    }
  }, []);

  const removeProject = useCallback(async (id: number) => {
    const response = await projectsApi.deleteProject(id);
    if (response.success) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectContext.Provider value={{ projects, isLoading, error, fetchProjects, addProject, updateProject, removeProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectsContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectProvider');
  }
  return context;
};