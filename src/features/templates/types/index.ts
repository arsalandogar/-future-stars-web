import type { Tag, PaginationMeta } from '@/types';

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
  svgString: string;
}

export interface Template {
  id: number;
  name: string;
  label: string;
  description: string | null;
  svgString: string;
  createdAt: string;
  backTemplate: TemplateBackTemplate | null;
  tags: Tag[];
}
