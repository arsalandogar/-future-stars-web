import type { Tag, PaginationMeta } from '@/types';

export { EDITABLE_FIELDS } from './template-vocabulary';
export type { EditableFieldId, EditableFieldType } from './template-vocabulary';

export type TemplateSide = 'front' | 'back';

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

export interface TemplateTypeRef {
  id: number;
  name: string;
}

export interface TemplateBackTemplate {
  id: number;
  side: TemplateSide;
  name: string;
  templateImage: string;
  templateImageMedium: string;
}

export type ThumbnailStatus = 'pending' | 'processing' | 'completed' | 'failed';

export function isThumbnailProcessing(status: ThumbnailStatus | null): boolean {
  return status === 'pending' || status === 'processing';
}

export interface Template {
  id: number;
  side: TemplateSide;
  name: string;
  label: string;
  description: string | null;
  templateImage: string;
  templateImageMedium: string;
  thumbnailStatus: ThumbnailStatus | null;
  templateTypeId: number;
  frontendComponentName?: string;
  frontendComponentFileName?: string;
  backTemplateId?: number;
  isDefaultBack?: boolean;
  isPublished?: boolean;
  createdAt: string;
  backTemplate: TemplateBackTemplate | null;
  defaultBackTemplate?: TemplateBackTemplate;
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
export interface CreateTemplateParams {
  side: TemplateSide;
  name: string;
  templateTypeId: number;
  label?: string;
  description?: string;
  frontendComponentName?: string;
  frontendComponentFileName?: string;
  backTemplateId?: number | null;
  isDefaultBack?: boolean;
  isPublished?: boolean;
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
  frontendComponentName?: string;
  frontendComponentFileName?: string;
  backTemplateId?: number | null;
  isDefaultBack?: boolean;
  isPublished?: boolean;
  tagIds?: number[];
}

// Form values
export type BackTemplateMode = 'default' | 'custom';

export interface TemplateFormValues {
  side: TemplateSide;
  name: string;
  label: string;
  description: string;
  templateTypeId: number | null;
  backTemplateId: number | null;
  backTemplateMode: BackTemplateMode;
  isDefaultBack: boolean;
  isPublished: boolean;
  tagIds: number[];
}
