import type { PaginationMeta } from '@/types';

export interface TemplatesListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface TemplatesListResponse {
  meta: PaginationMeta;
  data: Template[];
}

export interface TemplateBackTemplate {
  id: number;
  name: string;
}

export interface Template {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  backTemplate: TemplateBackTemplate | null;
}
