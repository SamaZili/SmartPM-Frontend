import { useState, useMemo, useCallback } from 'react';
import { Task, Estimation } from '../../../types';
import { dashboardApi } from '../api/dashboardApi';
import { useTemporaryMessage } from '../../../hooks/useTemporaryMessage';

export const useEstimations = (selectedProjectId: number | null, tasks: Task[]) => {
  const [isEstimating, setIsEstimating] = useState(false);
  const { showMessage } = useTemporaryMessage();

  // ✅ Extraire les estimations DIRECTEMENT des tâches (qui viennent du backend avec `with('estimation')`)
  const estimations: Estimation[] = useMemo(
    () => tasks
      .filter(t => t.estimation)
      .map(t => t.estimation as Estimation),
    [tasks]
  );

  const handleEstimate = useCallback(async (taskId: number) => {
    if (!selectedProjectId) return;
    setIsEstimating(true);
    
    try {
      await dashboardApi.estimateTask(selectedProjectId, taskId);
      showMessage('Estimation générée ! Rechargez la page pour voir le résultat.');
      
      // Recharger la page pour récupérer les nouvelles données du backend
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Erreur lors de l\'estimation', 5000, 'error');
    } finally {
      setIsEstimating(false);
    }
  }, [selectedProjectId, showMessage]);

  const aiInsights = useMemo(() => {
    const totalEstimations = estimations.length;
    const avgConfidence = totalEstimations > 0
      ? Math.round(estimations.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0) / totalEstimations * 100)
      : 0;
    const tasksWithoutEstimation = tasks.filter((task: Task) => !task.estimation).length;
    
    return { totalEstimations, avgConfidence, tasksWithoutEstimation };
  }, [estimations, tasks]);

  return { estimations, isEstimating, handleEstimate, aiInsights };
};