// src/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'project_manager' | 'developer' | 'admin'; // Ajouté 'admin' au cas où
  email_verified_at: string | null; // Champ standard Laravel
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null; // Souvent nullable en base de données
  status: 'active' | 'completed' | 'on_hold';
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  name: string;
  description: string | null;
  status: 'a_faire' | 'en_cours' | 'terminee';
  complexity: 'faible' | 'moyenne' | 'elevee';
  project_id: number;
  user_id: number;
  
  // ⚠️ Champs spécifiques à l'estimation IA / Méthode Desharnais 
  // (Ceux que nous avons ajoutés dans les migrations Laravel)
  transactions: number;
  entities: number;
  team_exp: number;
  manager_exp: number;
  
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

// Interface spécifique pour la réponse de l'endpoint de Login
export interface LoginResponse {
  user: User;
  token: string; // Adaptez en 'access_token' si ton backend Laravel renvoie ce nom
}

// Type générique pour les réponses de l'API Laravel
// L'utilisation de <T = unknown> garantit qu'on ne tombe jamais implicitement sur 'any'
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  debug?: string; // Présent dans ton contrôleur Laravel quand app()->environment('local')
}