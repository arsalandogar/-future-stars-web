export type FeaturedItem = {
  id: string;
  title: string;
  description?: string;
  ctaText?: string;
  imageUrl?: string;
  templateId?: number;
  displayOrder: number;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
  template?: {
    id: number;
    name: string;
    label?: string;
  };
};

export type FeaturedItemListResponse = { data: FeaturedItem[] };

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
  id: string;
  title?: string;
  description?: string;
  ctaText?: string;
  image: File | null;
  templateId?: number;
  displayOrder?: number;
  isActive?: boolean;
};
