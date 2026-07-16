// src/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'project_manager' | 'developer';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold';
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  status: 'a_faire' | 'en_cours' | 'terminee';
  complexity: 'faible' | 'moyenne' | 'elevee';
  project_id: number;
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

// Type générique pour les réponses de ton API Laravel (évite d'utiliser 'any' pour les réponses)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
}