export type UserRole = 'admin' | 'user' | 'guest';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isAdmin: boolean;
  isGuest: boolean;
  fullName: string;
}

export interface Token {
  type: string;
  name: string;
  token: string;
  abilities: string[];
  expiresAt: string;
}

export interface AuthResponse {
  token: Token;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
