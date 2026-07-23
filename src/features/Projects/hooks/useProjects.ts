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
    
    // 1. Vérifier d'abord si on a des données locales (qui contiennent nos suppressions/ajouts)
    const storedProjects = localStorage.getItem('projects');
    
    try {
      const response = await projectsApi.getAll();
      if (response.success && response.data) {
        // Si on a déjà des données locales, on les garde pour la démo (priorité au localStorage)
        // Sinon, on initialise avec les données de l'API
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        } else {
          setProjects(response.data);
          localStorage.setItem('projects', JSON.stringify(response.data));
        }
      }
    } catch (err: any) {
      console.warn('API projects indisponible, utilisation du localStorage');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
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
        setProjects(prev => {
          const updated = [...prev, newProject];
          localStorage.setItem('projects', JSON.stringify(updated));
          return updated;
        });
        return newProject;
      }
    } catch (err: any) {
      console.warn('API create indisponible, création locale uniquement');
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

  const updateProject = useCallback(async (id: number, data: Partial<CreateProjectDto>) => {
    // Mise à jour locale prioritaire
    setProjects(prev => {
      const updated = prev.map(p => 
        p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
      );
      localStorage.setItem('projects', JSON.stringify(updated));
      return updated;
    });
    
    // On tente l'API en arrière-plan sans bloquer l'interface
    try {
      await projectsApi.update(id, data);
    } catch (err) {
      console.warn('API update indisponible, mise à jour locale conservée.');
    }
  }, []);

  const removeProject = useCallback(async (id: number) => {
    // Suppression locale immédiate et prioritaire
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('projects', JSON.stringify(updated));
      return updated;
    });
    
    // On tente l'API en arrière-plan sans bloquer l'interface
    try {
      await projectsApi.delete(id);
    } catch (err) {
      console.warn('API delete indisponible, suppression locale conservée.');
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