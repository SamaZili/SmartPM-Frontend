import { Project, Task, Estimation } from '../../../types';

export interface DashboardState {
  projects: Project[];
  tasks: Task[];
  estimations: Estimation[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status?: string;
}

export interface TaskFormData {
  name: string;
  description?: string;
  status?: string;
  complexity?: string;
}

export type TaskStatus = 'a_faire' | 'en_cours' | 'terminee';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  a_faire: 'À FAIRE',
  en_cours: 'EN COURS',
  terminee: 'TERMINÉE',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  a_faire: '#94a3b8',
  en_cours: '#f59e0b',
  terminee: '#10b981',
};