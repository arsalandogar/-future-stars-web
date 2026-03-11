export interface SharedLinkInfo {
  id: number;
  code: string;
  message: string | null;
  isActive: boolean;
  addToCartCount: number;
  addToCollectionCount: number;
}
export type CardPreviewStatus = 'draft' | 'processing' | 'completed' | 'failed';

export interface Card {
  id: number;
  userId: number;
  templateId: number;
  frontCardImage: string | null;
  backCardImage: string | null;
  svgString: string | null;
  backSvgString: string | null;
  status: CardPreviewStatus;
  hiddenFromGallery: boolean;
  sharedLink?: SharedLinkInfo;
  createdAt: string;
  updatedAt: string;
}
