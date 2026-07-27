import { get, post, put, del } from '../../../services/api';
import { Project, Task, Estimation, CreateProjectDto, CreateTaskDto, UpdateTaskStatusDto } from '../../../types';

export const dashboardApi = {
  // Projets
  getProjects: () => get<Project[]>('/projects'),
  createProject: (data: CreateProjectDto) => post<Project>('/projects', data),
  updateProject: (id: number, data: Partial<CreateProjectDto>) => put<Project>(`/projects/${id}`, data),
  deleteProject: (id: number) => del(`/projects/${id}`),
  
  // Tâches
  getTasks: (projectId: number) => get<Task[]>(`/projects/${projectId}/tasks`),
  createTask: (projectId: number, data: CreateTaskDto) => post<Task>(`/projects/${projectId}/tasks`, data),
  updateTaskStatus: (projectId: number, taskId: number, data: UpdateTaskStatusDto) => put<Task>(`/projects/${projectId}/tasks/${taskId}`, data),
  deleteTask: (projectId: number, taskId: number) => del(`/projects/${projectId}/tasks/${taskId}`),
  
  // Estimations IA
  estimateTask: (projectId: number, taskId: number) => post<Estimation>(`/projects/${projectId}/tasks/${taskId}/estimate`),
  getEstimations: (projectId: number) => get<Estimation[]>(`/projects/${projectId}/estimations`),
};