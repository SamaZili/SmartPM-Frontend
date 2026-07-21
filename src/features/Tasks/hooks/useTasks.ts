import { useState, useEffect, useCallback } from 'react';
import { tasksApi, CreateTaskDto, UpdateTaskStatusDto } from '../api/tasksApi';
import { Task, Project } from '../../../types';

export function useTasks(projects: Project[], selectedProjectId: number | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchTasks = useCallback(async () => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await tasksApi.getAllByProject(selectedProjectId);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Impossible de charger les tâches.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  const fetchAllTasks = useCallback(async () => {
    if (projects.length === 0) {
      setTasks([]);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const projectIds = projects.map(p => p.id);
      const responses = await Promise.all(
        projectIds.map(id => tasksApi.getAllByProject(id))
      );
      
      const allTasks = responses.flatMap(res => 
        (res.success && res.data) ? res.data : []
      );
      
      setTasks(allTasks);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Impossible de charger les tâches.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projects]);

  const addTask = useCallback(async (projectId: number, data: CreateTaskDto) => {
    try {
      const response = await tasksApi.create(projectId, data);
      if (response.success && response.data) {
        setTasks(prev => [...prev, response.data!]);
        return response.data;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la création.');
    }
  }, []);

  const updateTaskStatus = useCallback(async (projectId: number, taskId: number, data: UpdateTaskStatusDto) => {
    try {
      const response = await tasksApi.updateStatus(projectId, taskId, data);
      if (response.success && response.data) {
        setTasks(prev => prev.map(t => t.id === taskId ? response.data! : t).filter((t): t is Task => t !== undefined));
        return response.data;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
    } else {
      fetchAllTasks();
    }
  }, [selectedProjectId, fetchTasks, fetchAllTasks]);

  return { 
    tasks, 
    isLoading, 
    error, 
    fetchTasks,
    fetchAllTasks,
    addTask, 
    updateTaskStatus,
    setTasks 
  };
}