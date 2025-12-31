export type Tag = {
  id: string;
  name: string;
  label: string;
  description?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
};

export interface TagsListParams {
  search?: string;
}

export type CreateTagParam = {
  name: string;
  label: string;
  description?: string;
};
