import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, CreateTaskDto, UpdateTaskStatusDto } from '../api/dashboardApi';
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
      const response = await dashboardApi.getTasks(selectedProjectId);
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
      // ✅ CORRECTION N+1 : Requêtes parallèles avec Promise.all
      const projectIds = projects.map(p => p.id);
      const responses = await dashboardApi.getAllTasks(projectIds);
      
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
      const response = await dashboardApi.createTask(projectId, data);
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
      const response = await dashboardApi.updateTaskStatus(projectId, taskId, data);
      if (response.success && response.data) {
        setTasks(prev => prev.map(t => t.id === taskId ? response.data! : t));
        return response.data;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
  }, []);

  const removeTask = useCallback(async (projectId: number, taskId: number) => {
    try {
      await dashboardApi.deleteTask(projectId, taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  }, []);

  // ✅ CORRECTION Infinite Loop : dépendance stable
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
    removeTask,
    setTasks 
  };
}