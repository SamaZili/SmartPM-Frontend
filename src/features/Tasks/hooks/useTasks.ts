import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../../Dashboard/api/dashboardApi';
import { Task, CreateTaskDto, UpdateTaskStatusDto } from '../../../types';

export function useTasks(projectId: number | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await dashboardApi.getTasks(projectId);
      const data = response?.data || response;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && projectId) {
      fetchTasks();
    }
  }, [fetchTasks, projectId]);

  const addTask = useCallback(async (pid: number, data: CreateTaskDto) => {
    await dashboardApi.createTask(pid, data);
    await fetchTasks(); // ✅ Recharge : l'assignation apparaît immédiatement
  }, [fetchTasks]);

  const updateTaskStatus = useCallback(async (pid: number, taskId: number, data: UpdateTaskStatusDto) => {
    await dashboardApi.updateTaskStatus(pid, taskId, data);
    await fetchTasks(); // ✅ Recharge : "déjà assigné" reste enregistré
  }, [fetchTasks]);

  const removeTask = useCallback(async (pid: number, taskId: number) => {
    await dashboardApi.deleteTask(pid, taskId);
    await fetchTasks();
  }, [fetchTasks]);

  return { tasks, isLoading, fetchTasks, addTask, updateTaskStatus, removeTask };
}