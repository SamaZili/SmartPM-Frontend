import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Estimation } from '../../../types';
import { dashboardApi } from '../api/dashboardApi';
import { useTemporaryMessage } from '../../../hooks/useTemporaryMessage';

export const useEstimations = (selectedProjectId: number | null, tasks: Task[]) => {
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage } = useTemporaryMessage();

  // ✅ 1. Charger depuis localStorage au démarrage
  useEffect(() => {
    console.log('🔍 useEstimations: Chargement depuis localStorage...');
    const stored = localStorage.getItem('smartpm_estimations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setEstimations(parsed);
          console.log('✅ useEstimations: Estimations chargées:', parsed.length);
        }
      } catch (e) {
        console.error(' useEstimations: Erreur parsing:', e);
      }
    }
  }, []);

  // ✅ 2. Sauvegarder dans localStorage à chaque modification
  useEffect(() => {
    console.log('💾 useEstimations: Sauvegarde de', estimations.length, 'estimations');
    localStorage.setItem('smartpm_estimations', JSON.stringify(estimations));
  }, [estimations]);

  // ✅ 3. Fonction d'estimation (API + fallback local)
  const handleEstimate = useCallback(async (taskId: number) => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const response = await dashboardApi.estimateTask(selectedProjectId, taskId);
      console.log('🔍 useEstimations: Réponse API:', response);
      
      const estimationData: Estimation | undefined =
        response.data ||
        (response as any).estimation ||
        (response as any).data?.estimation;

      if (estimationData) {
        setEstimations(prev => {
          const exists = prev.some(e => e.task_id === taskId);
          if (exists) {
            showMessage('Déjà estimée !', 3000, 'error');
            return prev;
          }
          const updated = [...prev, estimationData];
          console.log('✅ useEstimations: Nouvelle estimation ajoutée:', updated);
          return updated;
        });
        showMessage('Estimation générée !');
      }
    } catch (err) {
      console.warn('⚠️ useEstimations: API indisponible, mode local');
      const now = new Date().toISOString();
      const fakeEstimation: Estimation = {
        id: Date.now(),
        task_id: taskId,
        predicted_effort: Math.floor(Math.random() * 8) + 2,
        confidence_score: 0.75 + Math.random() * 0.20,
        created_at: now,
        updated_at: now,
      };
      setEstimations(prev => {
        const exists = prev.some(e => e.task_id === taskId);
        if (exists) {
          showMessage('Déjà estimée !', 3000, 'error');
          return prev;
        }
        const updated = [...prev, fakeEstimation];
        console.log('✅ useEstimations: Estimation locale ajoutée:', updated);
        return updated;
      });
      showMessage('Estimation (mode local) !');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId, showMessage]);

  // ✅ 4. Calcul des Insights IA
  const aiInsights = useMemo(() => {
    const totalEstimations = estimations.length;
    const avgConfidence = totalEstimations > 0
      ? Math.round(estimations.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0) / totalEstimations * 100)
      : 0;
    const tasksWithoutEstimation = tasks.filter((task: Task) =>
      !estimations.some(est => est.task_id === task.id)
    ).length;

    console.log('📊 useEstimations: Insights calculés:', { totalEstimations, avgConfidence, tasksWithoutEstimation });

    return { totalEstimations, avgConfidence, tasksWithoutEstimation };
  }, [estimations, tasks]);

  return { estimations, isLoading, handleEstimate, aiInsights };
};