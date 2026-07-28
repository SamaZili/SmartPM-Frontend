import { Project, CreateProjectDto } from '../types';

export interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (data: CreateProjectDto) => Promise<void>;
  updateProject: (id: number, data: Partial<CreateProjectDto>) => Promise<void>;
  removeProject: (id: number) => Promise<void>;
}