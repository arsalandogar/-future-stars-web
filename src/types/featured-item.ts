export type FeaturedItem = {
  id: number;
  title: string;
  description?: string;
  ctaText?: string;
  imageUrl?: string;
  templateId?: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  template?: {
    id: number;
    name: string;
    label?: string;
  };
};
