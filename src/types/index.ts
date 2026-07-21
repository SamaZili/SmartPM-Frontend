export interface User {
  id: number;
  name: string;
  email: string;
  type: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  complexity: string | null;
  project_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  estimations?: Estimation[];
}

export interface Estimation {
  id: number;
  task_id: number;
  predicted_effort: number;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error_code?: string;
  errors?: Record<string, string[]>;
}