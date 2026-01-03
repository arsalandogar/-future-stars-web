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
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Token {
  type: string;
  name: string;
  token: string;
  abilities: string[];
  expiresAt: string;
}
