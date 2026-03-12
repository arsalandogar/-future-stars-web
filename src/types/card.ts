import type { Edits } from '@fs-card-engine';

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
  backTemplateId: number;
  frontCardImage: string | null;
  backCardImage: string | null;
  svgString: string | null;
  backSvgString: string | null;
  editsJson?: Edits;
  backEditsJson?: Edits;
  status: CardPreviewStatus;
  hiddenFromGallery: boolean;
  sharedLink?: SharedLinkInfo;
  createdAt: string;
  updatedAt: string;
}
