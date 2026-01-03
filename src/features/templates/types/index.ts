import type { Tag, PaginationMeta } from '@/types';

export type TemplateSide = 'front' | 'back';
export type TemplateAttributeType = 'color' | 'image' | 'string';

export interface TemplatesListParams {
  page?: number;
  limit?: number;
  search?: string;
  tagIds?: string;
}

export interface TemplatesListResponse {
  meta: PaginationMeta;
  data: Template[];
}

export interface TemplateAttribute {
  id: number;
  templateId: number;
  type: TemplateAttributeType;
  name: string;
  label: string;
  defaultValue?: string | null;
  defaultColor?: string | null;
}

export interface TemplateTypeRef {
  id: number;
  name: string;
}

export interface TemplateBackTemplate {
  id: number;
  side: TemplateSide;
  name: string;
  svgString?: string;
  attributes?: TemplateAttribute[];
}

export interface Template {
  id: number;
  side: TemplateSide;
  name: string;
  label: string;
  description: string | null;
  svgString: string;
  templateTypeId: number;
  frontendComponentName?: string;
  frontendComponentFileName?: string;
  backTemplateId?: number;
  createdAt: string;
  attributes: TemplateAttribute[];
  backTemplate: TemplateBackTemplate | null;
  type: TemplateTypeRef;
  tags: Tag[];
}

export interface SetTagsParams {
  templateIds: number[];
  tagIds: number[];
}

export interface SetTagsResponse {
  id: number;
  name: string;
  tags: Tag[];
}
