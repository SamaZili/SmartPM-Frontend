import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../../Dashboard/api/dashboardApi';
import { Task, CreateTaskDto, UpdateTaskStatusDto } from '../../../types';

// ✅ Suppression du paramètre 'projects' inutilisé qui causait un warning TypeScript
export function useTasks(selectedProjectId: number | null) {
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
      // ✅ Extraire les données de la réponse API (ApiResponse<Task[]>)
      const tasksData = response?.data || response;
      if (tasksData) {
        setTasks(Array.isArray(tasksData) ? tasksData : []);
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
      // ✅ Extraire la tâche de la réponse API
      const newTask = response?.data || response;
      if (newTask) {
        setTasks(prev => [...prev, newTask as Task]);
        return newTask as Task;
      }
    } catch (error) {
      console.error('Erreur création tâche:', error);
      throw error;
    }
  }, []);

  const updateTaskStatus = useCallback(async (projectId: number, taskId: number, data: UpdateTaskStatusDto) => {
    try {
      const response = await dashboardApi.updateTaskStatus(projectId, taskId, data);
      // ✅ Extraire la tâche mise à jour
      const updatedTask = response?.data || response;
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? (updatedTask as Task) : t));
        return updatedTask as Task;
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