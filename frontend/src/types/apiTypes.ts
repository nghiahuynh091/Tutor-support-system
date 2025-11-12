
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
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