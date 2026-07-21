import { useMemo } from 'react';
import { Project, Task, Estimation } from '../../../types';

export interface DashboardStats {
  activeProjects: number;
  tasksInProgress: number;
  tasksDone: number;
  completionRate: number;
  avgEstimation: string;
  statusDistribution: {
    a_faire: number;
    en_cours: number;
    terminee: number;
  };
}

export function useDashboardStats(projects: Project[], tasks: Task[], estimations: Estimation[]): DashboardStats {
  return useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'en_cours').length;
    const tasksInProgress = tasks.filter(t => t.status === 'en_cours').length;
    const tasksDone = tasks.filter(t => t.status === 'terminee').length;
    
    const completionRate = tasks.length > 0 
      ? Math.round((tasksDone / tasks.length) * 100) 
      : 0;

    const avgEstimation = estimations.length > 0
      ? (estimations.reduce((sum, e) => sum + e.predicted_effort, 0) / estimations.length).toFixed(1)
      : '0';

    const statusDistribution = {
      a_faire: tasks.filter(t => t.status === 'a_faire').length,
      en_cours: tasks.filter(t => t.status === 'en_cours').length,
      terminee: tasks.filter(t => t.status === 'terminee').length,
    };

    return {
      activeProjects,
      tasksInProgress,
      tasksDone,
      completionRate,
      avgEstimation,
      statusDistribution,
    };
  }, [projects, tasks, estimations]);
}