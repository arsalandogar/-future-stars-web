import type { ColorLeague } from '../../color-leagues';

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
