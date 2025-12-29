import type { PaginationMeta, User, UserRole } from '@/types';

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export interface UsersListResponse {
  meta: PaginationMeta;
  data: User[];
}
