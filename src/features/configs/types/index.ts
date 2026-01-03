export interface Config {
  name: string;
  value: string;
  description: string;
}

export interface ConfigsListResponse {
  data: Config[];
}

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
