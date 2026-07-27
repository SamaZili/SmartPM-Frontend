import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Estimation } from '../../../types';
import { dashboardApi } from '../api/dashboardApi';
import { useTemporaryMessage } from '../../../hooks/useTemporaryMessage';

export const useEstimations = (selectedProjectId: number | null, tasks: Task[]) => {
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const { showMessage } = useTemporaryMessage();

  // ✅ 1. CHARGER les estimations DEPUIS LE BACKEND
  useEffect(() => {
    if (!selectedProjectId) {
      setEstimations([]);
      return;
    }

    const loadEstimations = async () => {
      try {
        const response = await dashboardApi.getEstimations(selectedProjectId);
        const estimationsData = response?.data || response;
        
        if (Array.isArray(estimationsData)) {
          setEstimations(estimationsData);
        }
      } catch (error) {
        console.error('Erreur chargement estimations:', error);
      }
    };

    loadEstimations();
  }, [selectedProjectId]);

  // ✅ 2. Fonction d'estimation
  const handleEstimate = useCallback(async (taskId: number) => {
    if (!selectedProjectId) return;
    setIsEstimating(true);
    
    try {
      const response = await dashboardApi.estimateTask(selectedProjectId, taskId);
      
      // Recharger toutes les estimations après l'estimation
      const estimationsResponse = await dashboardApi.getEstimations(selectedProjectId);
      const estimationsData = estimationsResponse?.data || estimationsResponse;
      
      if (Array.isArray(estimationsData)) {
        setEstimations(estimationsData);
      }
      
      showMessage('Estimation générée et sauvegardée !');
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Erreur lors de l\'estimation', 5000, 'error');
    } finally {
      setIsEstimating(false);
    }
  }, [selectedProjectId, showMessage]);

  // ✅ 3. Calcul des Insights IA
  const aiInsights = useMemo(() => {
    const totalEstimations = estimations.length;
    const avgConfidence = totalEstimations > 0
      ? Math.round(estimations.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0) / totalEstimations * 100)
      : 0;
    const tasksWithoutEstimation = tasks.filter((task: Task) =>
      !estimations.some(est => est.task_id === task.id)
    ).length;
    
    return { totalEstimations, avgConfidence, tasksWithoutEstimation };
  }, [estimations, tasks]);

  return { estimations, isLoading, isEstimating, handleEstimate, aiInsights };
};