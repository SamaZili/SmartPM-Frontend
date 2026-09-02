import { get, post, put, del } from '../../../services/api';
import { Project, Task, Estimation, CreateProjectDto, CreateTaskDto, UpdateTaskStatusDto } from '../../../types';

export const dashboardApi = {
  // ==========================================
  // PROJETS
  // ==========================================
  getProjects: () => get<Project[]>('/projects'),
  createProject: (data: CreateProjectDto) => post<Project>('/projects', data),
  updateProject: (id: number, data: Partial<CreateProjectDto>) => put<Project>(`/projects/${id}`, data),
  deleteProject: (id: number) => del(`/projects/${id}`),

  // ==========================================
  // TÂCHES
  // ==========================================
  getTasks: (projectId: number) => get<Task[]>(`/projects/${projectId}/tasks`),
  createTask: (projectId: number, data: CreateTaskDto) => post<Task>(`/projects/${projectId}/tasks`, data),
  
  updateTask: (projectId: number, taskId: number, data: UpdateTaskStatusDto) =>
    put<Task>(`/projects/${projectId}/tasks/${taskId}`, data),

  // ✅ ALIAS : utilisé par useTasks.ts (corrige "updateTaskStatus is not a function")
  updateTaskStatus: (projectId: number, taskId: number, data: UpdateTaskStatusDto) =>
    put<Task>(`/projects/${projectId}/tasks/${taskId}`, data),

  deleteTask: (projectId: number, taskId: number) => del(`/projects/${projectId}/tasks/${taskId}`),

  // ==========================================
  // ESTIMATIONS IA
  // ==========================================
  // ✅ CORRECTION : Ajout de projectId (le backend attend les 2 paramètres)
  estimateTask: (projectId: number, taskId: number) =>
    post<Estimation>(`/projects/${projectId}/tasks/${taskId}/estimate`, {}),
};