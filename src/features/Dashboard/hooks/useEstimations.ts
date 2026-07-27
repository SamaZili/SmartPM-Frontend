import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Estimation } from '../../../types';
import { dashboardApi } from '../api/dashboardApi';
import { useTemporaryMessage } from '../../../hooks/useTemporaryMessage';

export const useEstimations = (selectedProjectId: number | null, tasks: Task[]) => {
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage } = useTemporaryMessage();

  useEffect(() => {
    const stored = localStorage.getItem('smartpm_estimations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setEstimations(parsed);
      } catch (e) {
        console.error("Erreur chargement estimations:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('smartpm_estimations', JSON.stringify(estimations));
  }, [estimations]);

  const handleEstimate = useCallback(async (taskId: number) => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const response = await dashboardApi.estimateTask(selectedProjectId, taskId);
      const estimationData: Estimation | undefined = response.data || (response as any).estimation || (response as any).data?.estimation;

      if (estimationData) {
        setEstimations(prev => {
          const exists = prev.some(e => e.task_id === taskId);
          if (exists) { showMessage('Déjà estimée !', 3000, 'error'); return prev; }
          return [...prev, estimationData];
        });
        showMessage('Estimation générée !');
      }
    } catch (err) {
      const now = new Date().toISOString();
      const fakeEstimation: Estimation = {
        id: Date.now(), task_id: taskId, predicted_effort: Math.floor(Math.random() * 8) + 2,
        confidence_score: 0.75 + Math.random() * 0.20, created_at: now, updated_at: now,
      };
      setEstimations(prev => {
        const exists = prev.some(e => e.task_id === taskId);
        if (exists) { showMessage('Déjà estimée !', 3000, 'error'); return prev; }
        return [...prev, fakeEstimation];
      });
      showMessage('Estimation (mode local) !');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId, showMessage]);

  const aiInsights = useMemo(() => {
    const totalEstimations = estimations.length;
    const avgConfidence = totalEstimations > 0
      ? Math.round(estimations.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0) / totalEstimations * 100)
      : 0;
    const tasksWithoutEstimation = tasks.filter((task: Task) => !estimations.some(est => est.task_id === task.id)).length;
    return { totalEstimations, avgConfidence, tasksWithoutEstimation };
  }, [estimations, tasks]);

  return { estimations, isLoading, handleEstimate, aiInsights };
};