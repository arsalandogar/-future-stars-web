import type { Tag } from '@/types';

export interface BrowseTemplate {
  id: number;
  name: string;
  label: string;
  side: 'front' | 'back';
  templateImage: string;
  templateImageMedium: string;
  isPublished: boolean;
  pivotDisplayOrder: number;
  backTemplateId?: number;
  backTemplate?: BrowseTemplate;
  tags?: Tag[];
}
