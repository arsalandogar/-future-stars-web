export interface Config {
  name: string;
  value: string;
  description: string;
}

export type ConfigsListResponse = Config[];

export interface CreateConfigParams {
  name: string;
  value?: string;
  description?: string;
}

export interface UpdateConfigParams {
  name: string;
  value?: string;
  description?: string;
}
