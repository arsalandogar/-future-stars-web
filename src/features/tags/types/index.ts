import type { Tag } from '@/types';
import type { Template } from '@/features/templates';

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

// Template with pivot data from tag relationship
export interface TagTemplate extends Template {
  pivotDisplayOrder: number;
}

// Extended tag type with templates
export interface TagWithTemplates extends Tag {
  templates: TagTemplate[];
}

export interface TagDetailResponse {
  data: TagWithTemplates;
}
