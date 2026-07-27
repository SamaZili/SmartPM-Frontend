// src/types/index.ts

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

export interface Task {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  status: 'a_faire' | 'en_cours' | 'terminee';
  complexity?: string;
  created_at: string;
  updated_at: string;
}

// ✅ CORRECTION : updated_at rendu optionnel car le backend FastAPI ne le retourne pas toujours
// ✅ CORRECTION : Ajout des champs optionnels qui peuvent venir du backend
export interface Estimation {
  id: number;
  task_id: number;
  predicted_effort: number;
  confidence_score: number;
  created_at: string;
  updated_at?: string;           // ← Optionnel (évite l'erreur TS2741)
  project_id?: number;           // ← Optionnel (utilisé dans useEstimations)
  task_name?: string;            // ← Optionnel (utilisé dans useEstimations)
  task_description?: string;     // ← Optionnel (utilisé dans useEstimations)
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

// --- DTOs (Data Transfer Objects) pour les API ---
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

// ✅ CORRECTION : Ajout de `password` et `password_confirmation` pour compatibilité Laravel
export interface UpdateProfileDto { 
  name?: string; 
  email?: string; 
  current_password?: string; 
  password?: string;                        // ← Ajouté (standard Laravel)
  password_confirmation?: string;           // ← Ajouté (standard Laravel)
  new_password?: string;                    // ← Conservé pour compatibilité
  new_password_confirmation?: string;       // ← Conservé pour compatibilité
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

// ✅ CORRECTION : Ajout de error_code et message_code pour gérer les erreurs Laravel
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  message_code?: string;
}