import { get, post, put, del } from '../../../services/api';
import { Project, Task, Estimation, CreateProjectDto, CreateTaskDto, UpdateTaskStatusDto } from '../../../types';

export const dashboardApi = {
  getProjects: () => get<Project[]>('/projects'),
  createProject: (data: CreateProjectDto) => post<Project>('/projects', data),
  getTasks: (projectId: number) => get<Task[]>(`/projects/${projectId}/tasks`),
  createTask: (projectId: number, data: CreateTaskDto) => post<Task>(`/projects/${projectId}/tasks`, data),
  updateTaskStatus: (projectId: number, taskId: number, data: UpdateTaskStatusDto) => put<Task>(`/projects/${projectId}/tasks/${taskId}`, data),
  deleteTask: (projectId: number, taskId: number) => del(`/projects/${projectId}/tasks/${taskId}`),
  estimateTask: (projectId: number, taskId: number) => post<Estimation>(`/projects/${projectId}/tasks/${taskId}/estimate`),
};