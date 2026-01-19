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
}

export interface TagWithTemplates {
  id: number;
  name: string;
  label: string;
  displayOrder: number;
  totalTemplates: number;
  templates: BrowseTemplate[];
}

export interface BrowseTemplatesResponse {
  data: TagWithTemplates[];
}

export type ActiveTagFilter = 'all' | number;
