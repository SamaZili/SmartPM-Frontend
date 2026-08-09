import { useState, useEffect, useCallback } from 'react';
import { taskAssignmentApi } from '../api/taskAssignmentApi';
import { Task } from '../../../types';

export type ActionStatus = 'accepted' | 'in_progress' | 'completed';

export function useMyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await taskAssignmentApi.getMyTasks();
      setTasks(data);
    } catch (error) {
      console.error('Erreur chargement mes tâches:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (taskId: number, status: ActionStatus) => {
    await taskAssignmentApi.updateAssignmentStatus(taskId, status);
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, assignment_status: status } : t)));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMyTasks();
    }
  }, [fetchMyTasks]);

  return { tasks, isLoading, fetchMyTasks, updateStatus };
}