import type { PaginationMeta } from '@/types';

export type Tag = {
  id: string;
  name: string;
  label: string;
  description?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
};

export interface TagsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type TagListResponse = {
  meta: PaginationMeta;
  data: Tag[];
};

export type CreateTagParam = {
  name: string;
  label: string;
  description?: string;
};
