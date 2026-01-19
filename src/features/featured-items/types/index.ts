import type { FeaturedItem } from '@/types';

export type { FeaturedItem };

export interface FeaturedItemsListResponse {
  data: FeaturedItem[];
}

export interface FeaturedItemsListParams {
  search?: string;
}

export type CreateFeaturedItemParam = {
  title: string;
  description?: string;
  ctaText?: string;
  image: File | null;
  templateId?: number;
  displayOrder?: number;
  isActive?: boolean;
};

export type UpdateFeaturedItemParam = {
  id: number;
  title?: string;
  description?: string;
  ctaText?: string;
  image: File | null;
  templateId?: number;
  displayOrder?: number;
  isActive?: boolean;
};
