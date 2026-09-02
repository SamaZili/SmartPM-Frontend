import { get, post, put, del } from '../../../services/api';
import { Task } from '../../../types';

export interface CreateTaskDto {
  name: string;
  description?: string;
  status?: string;
  complexity?: string;
}

export interface UpdateTaskStatusDto {
  status: string;
}

export const tasksApi = {
  getAllByProject: (projectId: number) => get<Task[]>(`/projects/${projectId}/tasks`),
  create: (projectId: number, data: CreateTaskDto) => post<Task>(`/projects/${projectId}/tasks`, data),
  updateStatus: (projectId: number, taskId: number, data: UpdateTaskStatusDto) => 
    put<Task>(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId: number, taskId: number) => del(`/projects/${projectId}/tasks/${taskId}`),
};