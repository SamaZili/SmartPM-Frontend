import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { Task, CreateTaskDto, UpdateTaskStatusDto } from '../../../types';

export function useTasks(projects: any[], selectedProjectId: number | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await dashboardApi.getTasks(selectedProjectId);
      if (response) {
        setTasks(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  const addTask = useCallback(async (projectId: number, data: CreateTaskDto) => {
    try {
      const response = await dashboardApi.createTask(projectId, data);
      if (response) {
        setTasks(prev => [...prev, response]);
        return response;
      }
    } catch (error) {
      console.error('Erreur création tâche:', error);
      throw error;
    }
  }, []);

  const updateTaskStatus = useCallback(async (projectId: number, taskId: number, data: UpdateTaskStatusDto) => {
    try {
      const response = await dashboardApi.updateTaskStatus(projectId, taskId, data);
      if (response) {
        setTasks(prev => prev.map(t => t.id === taskId ? response : t));
        return response;
      }
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
      throw error;
    }
  }, []);

  const removeTask = useCallback(async (projectId: number, taskId: number) => {
    try {
      await dashboardApi.deleteTask(projectId, taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
    }
  }, [selectedProjectId, fetchTasks]);

  return { 
    tasks, 
    isLoading, 
    fetchTasks,
    addTask, 
    updateTaskStatus,
    removeTask,
    setTasks 
  };
}