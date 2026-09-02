import { get, post, put, del } from '../../../services/api';
import { Project } from '../../../types';

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: string;
}

export const projectsApi = {
  getAll: () => get<Project[]>('/projects'),
  getById: (id: number) => get<Project>(`/projects/${id}`),
  create: (data: CreateProjectDto) => post<Project>('/projects', data),
  update: (id: number, data: Partial<CreateProjectDto>) => put<Project>(`/projects/${id}`, data),
  delete: (id: number) => del(`/projects/${id}`),
};