import type { Tag, PaginationMeta } from '@/types';

export type TemplateSide = 'front' | 'back';
export type TemplateAttributeType = 'color' | 'image' | 'string';

export interface TemplatesListParams {
  page?: number;
  limit?: number;
  search?: string;
  tagIds?: string;
  side?: TemplateSide;
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

// Single template response
export interface TemplateResponse {
  data: Template;
}

// Create template params
export interface CreateTemplateAttributeParams {
  type: TemplateAttributeType;
  name: string;
  label: string;
  defaultValue?: string;
  defaultColor?: string;
}

export interface CreateTemplateParams {
  side: TemplateSide;
  name: string;
  templateTypeId: number;
  label?: string;
  description?: string;
  svgString?: string;
  frontendComponentName?: string;
  frontendComponentFileName?: string;
  backTemplateId?: number;
  attributes?: CreateTemplateAttributeParams[];
  tagIds?: number[];
}

// Update template params
export interface UpdateTemplateParams {
  id: number;
  side?: TemplateSide;
  name?: string;
  templateTypeId?: number;
  label?: string;
  description?: string;
  svgString?: string;
  frontendComponentName?: string;
  frontendComponentFileName?: string;
  backTemplateId?: number | null;
  attributes?: CreateTemplateAttributeParams[];
  tagIds?: number[];
}

// Form values
export interface TemplateAttributeFormValues {
  type: TemplateAttributeType;
  name: string;
  label: string;
  defaultValue: string;
  defaultColor: string;
}

export interface TemplateFormValues {
  side: TemplateSide;
  name: string;
  label: string;
  description: string;
  svgString: string;
  templateTypeId: number | null;
  backTemplateId: number | null;
  tagIds: string[];
  attributes: TemplateAttributeFormValues[];
}
