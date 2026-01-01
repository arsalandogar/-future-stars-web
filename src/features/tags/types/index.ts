export interface TagsListParams {
  search?: string;
}

export type CreateTagParam = {
  name: string;
  label: string;
  description?: string;
};
