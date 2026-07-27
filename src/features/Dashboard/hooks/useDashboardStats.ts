import { useMemo } from 'react';
import { Project, Task, Estimation, DashboardStats } from '../../../types';

export function useDashboardStats(projects: Project[], tasks: Task[], estimations: Estimation[]): DashboardStats {
  return useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'en_cours' || p.status === 'active').length;
    const tasksInProgress = tasks.filter(t => t.status === 'en_cours').length;
    const tasksDone = tasks.filter(t => t.status === 'terminee').length;
    
    const completionRate = tasks.length > 0 
      ? Math.round((tasksDone / tasks.length) * 100) 
      : 0;

    const avgEstimation = estimations.length > 0
  ? Math.round(
      estimations.reduce((acc, curr) => {
        const effort = parseFloat(String(curr.predicted_effort || 0));
        return acc + (isNaN(effort) ? 0 : effort);
      }, 0) / estimations.length
    )
  : 0;

    const statusDistribution = {
      a_faire: tasks.filter(t => t.status === 'a_faire').length,
      en_cours: tasks.filter(t => t.status === 'en_cours').length,
      terminee: tasks.filter(t => t.status === 'terminee').length,
    };

    return {
      activeProjects,
      tasksInProgress,
      completionRate,
      avgEstimation,
      statusDistribution,
    };
  }, [projects, tasks, estimations]);
}