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
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export interface PaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

export interface UsersListResponse {
  meta: PaginationMeta;
  data: User[];
}
