export interface Card {
  id: number;
  userId: number;
  templateId: number;
  frontCardImage: string;
  backCardImage: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  hiddenFromGallery: boolean;
  createdAt: string;
  updatedAt: string;
}
