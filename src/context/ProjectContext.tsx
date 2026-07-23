import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { projectsApi, CreateProjectDto } from '../features/Projects/api/projectsApi';
import { Project } from '../types';

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string;
  addProject: (data: CreateProjectDto) => Promise<Project | undefined>;
  updateProject: (id: number, data: Partial<CreateProjectDto>) => Promise<void>;
  removeProject: (id: number) => Promise<void>;
  fetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    const storedProjects = localStorage.getItem('projects');
    
    try {
      const response = await projectsApi.getAll();
      if (response.success && response.data) {
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        } else {
          setProjects(response.data);
          localStorage.setItem('projects', JSON.stringify(response.data));
        }
      }
    } catch (err: any) {
      console.warn('API projects indisponible');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProject = useCallback(async (data: CreateProjectDto): Promise<Project | undefined> => {
    try {
      const response = await projectsApi.create(data);
      if (response.success && response.data) {
        const newProject = response.data;
        setProjects(prev => {
          const updated = [...prev, newProject];
          localStorage.setItem('projects', JSON.stringify(updated));
          return updated;
        });
        return newProject;
      }
    } catch (err: any) {
      const newProject: Project = {
        id: Date.now(),
        name: data.name,
        description: data.description || '',
        status: data.status || 'en_cours',
        user_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setProjects(prev => {
        const updated = [...prev, newProject];
        localStorage.setItem('projects', JSON.stringify(updated));
        return updated;
      });
      
      return newProject;
    }
  }, []);

  const updateProject = useCallback(async (id: number, data: Partial<CreateProjectDto>): Promise<void> => {
    setProjects(prev => {
      const updated = prev.map(p => 
        p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
      );
      localStorage.setItem('projects', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeProject = useCallback(async (id: number): Promise<void> => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('projects', JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      isLoading, 
      error, 
      addProject, 
      updateProject, 
      removeProject,
      fetchProjects 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectsContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within ProjectProvider');
  }
  return context;
};