// src/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'chef_de_projet' | 'developer' | 'admin';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  status: 'a_faire' | 'en_cours' | 'terminee';
  complexity?: string;
  transactions?: number;
  entities?: number;
  team_exp?: number;
  manager_exp?: number;
  created_at: string;
  updated_at: string;
}

export interface Estimation {
  id: number;
  task_id: number;
  predicted_effort: number;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  type: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

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
}

export interface UpdateTaskStatusDto {
  status: string;
}

export interface DashboardStats {
  activeProjects: number;
  tasksInProgress: number;
  completionRate: number;
  avgEstimation: number;
  statusDistribution: {
    a_faire: number;
    en_cours: number;
    terminee: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  message_code?: string;
}