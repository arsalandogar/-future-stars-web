import type { PaginationMeta } from '@/types';

// League types (renamed from ColorLeague)
export interface League {
  id: number;
  name: string;
  label: string;
  rank: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type LeaguesListResponse = { data: League[] };

export interface CreateLeagueParams {
  name: string;
  label: string;
  rank: number;
  isActive: boolean;
}

export interface UpdateLeagueParams {
  id: number;
  name?: string;
  label?: string;
  rank?: number;
  isActive?: boolean;
}

// Minimal palette shape as seen from the colors feature
export interface TeamPalette {
  id: number;
  name: string;
  colorPairs: { bg: string; fg: string; rank: number }[];
  isActive: boolean;
}

// Color Team types (renamed from ColorPreset)
export interface ColorTeam {
  id: number;
  name: string;
  abbreviation: string;
  colorPaletteId: number;
  leagueId: number | null;
  userId: number | null;
  rank: number;
  isFeatured: boolean;
  isActive: boolean;
  palette?: TeamPalette;
  league?: League;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColorTeamsListResponse {
  meta: PaginationMeta;
  data: ColorTeam[];
}

export interface ColorTeamsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateColorTeamParams {
  name: string;
  abbreviation: string;
  colorPaletteId: number;
  leagueId: number | null;
  rank: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateColorTeamParams {
  id: number;
  name?: string;
  abbreviation?: string;
  colorPaletteId?: number;
  leagueId?: number | null;
  rank?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface PaletteOption {
  id: number;
  name: string;
  colorPairs: { bg: string; fg: string }[];
}
