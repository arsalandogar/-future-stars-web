export interface TemplateType {
  id: number;
  name: string;
  extraPrice: number;
  createdAt?: string;
}

export interface TemplateTypesListResponse {
  data: TemplateType[];
}

export interface CreateTemplateTypeParams {
  name: string;
  extraPrice: number;
}

export interface UpdateTemplateTypeParams {
  id: number;
  name?: string;
  extraPrice?: number;
}
