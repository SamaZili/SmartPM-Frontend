import { get, post, put, del } from '../../../services/api';
import { Project, Task, Estimation } from '../../../types';

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: string;
}

export interface CreateTaskDto {
  name: string;
  description?: string;
  status?: string;
  complexity?: string;
  user_id?: number;
}

export interface UpdateTaskStatusDto {
  status: string;
}

export const dashboardApi = {
  // Projects
  getProjects: () => get<Project[]>('/projects'),
  
  createProject: (data: CreateProjectDto) => 
    post<Project>('/projects', data),
  
  updateProject: (id: number, data: Partial<CreateProjectDto>) => 
    put<Project>(`/projects/${id}`, data),
  
  deleteProject: (id: number) => 
    del(`/projects/${id}`),

  // Tasks
  getTasks: (projectId: number) => 
    get<Task[]>(`/projects/${projectId}/tasks`),
  
  getAllTasks: (projectIds: number[]) => 
    Promise.all(projectIds.map(id => get<Task[]>(`/projects/${id}/tasks`))),
  
  createTask: (projectId: number, data: CreateTaskDto) => 
    post<Task>(`/projects/${projectId}/tasks`, data),
  
  updateTaskStatus: (projectId: number, taskId: number, data: UpdateTaskStatusDto) => 
    put<Task>(`/projects/${projectId}/tasks/${taskId}`, data),
  
  deleteTask: (projectId: number, taskId: number) => 
    del(`/projects/${projectId}/tasks/${taskId}`),

  // Estimation IA
  estimateTask: (projectId: number, taskId: number) => 
    post<Estimation>(`/projects/${projectId}/tasks/${taskId}/estimate`, {}),
};