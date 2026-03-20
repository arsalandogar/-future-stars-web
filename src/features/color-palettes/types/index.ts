import type { PaginationMeta } from '@/types';

export interface ColorPair {
  bg: string;
  fg: string;
  rank: number;
}

export interface ColorPalette {
  id: number;
  name: string;
  colorPairs: ColorPair[];
  isActive: boolean;
  teams?: { id: number; name: string }[];
  templates?: {
    id: number;
    name: string;
    label?: string;
    templateImageMedium?: string;
    $extras?: { pivot_rank?: number };
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ColorPalettesListResponse {
  meta: PaginationMeta;
  data: ColorPalette[];
}

export interface ColorPalettesListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ColorPaletteResponse {
  data: ColorPalette;
}

export interface CreateColorPaletteParams {
  name: string;
  colorPairs: ColorPair[];
  isActive: boolean;
}

export interface UpdateColorPaletteParams {
  id: number;
  name?: string;
  colorPairs?: ColorPair[];
  isActive?: boolean;
}

export interface AttachTemplatePaletteParams {
  paletteId: number;
  templateId: number;
  rank?: number;
}

export interface DetachTemplatePaletteParams {
  paletteId: number;
  templateId: number;
}
