export interface TemplateType {
  id: number;
  name: string;
  extraPrice: number;
  createdAt?: string;
}

export type TemplateTypesListResponse = TemplateType[];

export interface CreateTemplateTypeParams {
  name: string;
  extraPrice: number;
}

export interface UpdateTemplateTypeParams {
  id: number;
  name?: string;
  extraPrice?: number;
}
