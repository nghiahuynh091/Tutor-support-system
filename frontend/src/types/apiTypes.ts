
export interface User {
  id: string;
  email: string;
  full_name: string;
  name?: string; // Alias for full_name for compatibility
  role: UserRole;
  avatar?: string; // Optional avatar URL
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

export interface ApiError {
  detail: string;
}

export type UserRole = 'mentee' | 'tutor' | 'coordinator' | 'admin';