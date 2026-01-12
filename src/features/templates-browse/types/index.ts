export interface BrowseTemplate {
  id: number;
  name: string;
  label: string;
  side: 'front' | 'back';
  templateImage: string;
  templateImageMedium: string;
  isPublished: boolean;
  pivotDisplayOrder: number;
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
