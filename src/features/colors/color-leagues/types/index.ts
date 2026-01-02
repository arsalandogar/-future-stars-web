export interface ColorLeague {
  id: number;
  name: string;
  label: string;
  rank: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ColorLeaguesListResponse = { data: ColorLeague[] };

export interface ColorLeaguesListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateColorLeagueParams {
  name: string;
  label: string;
  rank: number;
  isActive: boolean;
}

export interface UpdateColorLeagueParams {
  id: number;
  name?: string;
  label?: string;
  rank?: number;
  isActive?: boolean;
}
