// Color League types
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

// Color Preset types
export interface ColorPreset {
  id: number;
  colorLeagueId: number;
  name: string;
  abbreviation: string;
  colors: string[];
  rank: number;
  isFeatured: boolean;
  isActive: boolean;
  league: ColorLeague;
  createdAt?: string;
  updatedAt?: string;
}

export type ColorPresetsListResponse = { data: ColorPreset[] };

export interface ColorPresetsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateColorPresetParams {
  colorLeagueId: number;
  name: string;
  abbreviation: string;
  colors: string[];
  rank: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateColorPresetParams {
  id: number;
  colorLeagueId?: number;
  name?: string;
  abbreviation?: string;
  colors?: string[];
  rank?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}
