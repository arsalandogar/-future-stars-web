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
  createdAt: string;
  updatedAt: string;
}
