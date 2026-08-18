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
  updated_at?: string;
  project_id?: number;
  task_name?: string;
  task_description?: string;
}

// ✅ ASSIGNATION DES TÂCHES
export type AssignmentStatus = 'pending' | 'accepted' | 'in_progress' | 'completed';

// ✅ PRIORITÉS DES TÂCHES (Amélioration C)
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

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
  assigned_to?: number | null;
  assignedTo?: UserSimple | null;
  assignment_status?: AssignmentStatus | null;
  project?: Project | null;
  // ✅ NOUVEAUX CHAMPS : Deadline + Priorité (Amélioration C)
  due_date?: string | null;
  priority?: TaskPriority | null;
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
  assigned_to?: number | null;
  // ✅ NOUVEAUX CHAMPS (Amélioration C)
  due_date?: string | null;
  priority?: TaskPriority;
}

export interface UpdateTaskStatusDto {
  status: string;
  assigned_to?: number | null;
  assignment_status?: AssignmentStatus;
  // ✅ NOUVEAUX CHAMPS (Amélioration C)
  due_date?: string | null;
  priority?: TaskPriority;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  message_code?: string;
}// ✅ NOTIFICATIONS
export interface AppNotification {
  id: number;
  user_id: number;
  task_id?: number | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}