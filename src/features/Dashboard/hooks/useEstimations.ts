import { useState, useMemo, useCallback } from 'react';
import { Task, Estimation } from '../../../types';
import { dashboardApi } from '../api/dashboardApi';
import { useTemporaryMessage } from '../../../hooks/useTemporaryMessage';

export const useEstimations = (selectedProjectId: number | null, tasks: Task[]) => {
  const [isEstimating, setIsEstimating] = useState(false);
  const { showMessage } = useTemporaryMessage();

  // ✅ Extraire les estimations VALIDES des tâches
  const estimations: Estimation[] = useMemo(
    () => tasks
      .filter(t => t.estimation && t.estimation.predicted_effort != null)
      .map(t => t.estimation as Estimation),
    [tasks]
  );

  const handleEstimate = useCallback(async (taskId: number) => {
    if (!selectedProjectId) return;
    setIsEstimating(true);
    
    try {
      await dashboardApi.estimateTask(selectedProjectId, taskId);
      showMessage('Estimation générée ! Rechargez la page pour voir le résultat.');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Erreur lors de l\'estimation', 5000, 'error');
    } finally {
      setIsEstimating(false);
    }
  }, [selectedProjectId, showMessage]);

  // ✅ Calcul des Insights IA avec vérification des valeurs
  const aiInsights = useMemo(() => {
    const totalEstimations = estimations.length;
    
    // Calcul de la confiance moyenne avec vérification
    const avgConfidence = totalEstimations > 0
      ? Math.round(
          estimations.reduce((acc, curr) => {
            const score = parseFloat(String(curr.confidence_score || 0));
            return acc + (isNaN(score) ? 0 : score);
          }, 0) / totalEstimations * 100
        )
      : 0;

    // Calcul de l'estimation moyenne avec vérification
    const avgEstimation = totalEstimations > 0
      ? Math.round(
          estimations.reduce((acc, curr) => {
            const effort = parseFloat(String(curr.predicted_effort || 0));
            return acc + (isNaN(effort) ? 0 : effort);
          }, 0) / totalEstimations
        )
      : 0;

    const tasksWithoutEstimation = tasks.filter((task: Task) => !task.estimation).length;
    
    return { 
      totalEstimations, 
      avgConfidence, 
      avgEstimation,
      tasksWithoutEstimation 
    };
  }, [estimations, tasks]);

  return { estimations, isEstimating, handleEstimate, aiInsights };
};