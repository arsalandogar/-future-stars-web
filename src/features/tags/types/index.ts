import type { Tag } from '@/types';

export interface TagsListParams {
  search?: string;
}

export interface TagsListResponse {
  data: Tag[];
}

export type CreateTagParam = {
  name: string;
  label: string;
  description?: string;
};
