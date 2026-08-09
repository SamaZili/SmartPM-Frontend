// ========================================
// INTERFACES DE BASE
// ========================================

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'chef_de_projet' | 'developer' | 'admin';
  email_verified_at?: string | null;
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

export interface Estimation {
  id: number;
  task_id: number;
  predicted_effort: number;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

// ✅ ASSIGNATION DES TÂCHES
export type AssignmentStatus = 'pending' | 'accepted' | 'in_progress' | 'completed';

export interface UserSimple {
  id: number;
  name: string;
  email: string;
  type: 'chef_de_projet' | 'developer';
}

export interface Task {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  status: 'a_faire' | 'en_cours' | 'terminee';
  complexity?: string;
  estimation?: Estimation | null;
  assigned_to?: number | null;              // ✅ AJOUTÉ
  assignedTo?: UserSimple | null;           // ✅ AJOUTÉ (relation Eloquent)
  assignment_status?: AssignmentStatus | null; // ✅ AJOUTÉ
  created_at: string;
  updated_at: string;
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

// ========================================
// DTOs (Data Transfer Objects)
// ========================================

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
  password?: string;
  password_confirmation?: string;
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
  assigned_to?: number | null; // ✅ AJOUTÉ
}

export interface UpdateTaskStatusDto {
  status: string;
  assigned_to?: number | null;       // ✅ AJOUTÉ
  assignment_status?: AssignmentStatus; // ✅ AJOUTÉ
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  message_code?: string;
}