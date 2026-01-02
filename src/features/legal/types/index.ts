import type { PaginationMeta } from '@/types';

export type LegalDocumentType = 'privacy-policy' | 'terms';
export type LegalDocumentStatus = 'draft' | 'published';

export const LEGAL_DOCUMENT_CONFIG: Record<
  LegalDocumentType,
  { title: string; description: string; publicUrl: string }
> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    description: 'Manage privacy policy document versions.',
    publicUrl: '/privacy-policy',
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Manage terms and conditions document versions.',
    publicUrl: '/terms-and-conditions',
  },
};

export function isLegalDocumentType(type: string): type is LegalDocumentType {
  return type === 'privacy-policy' || type === 'terms';
}

export function getLegalDocumentConfig(type: string) {
  if (!isLegalDocumentType(type)) {
    throw new Error(`Invalid legal document type: ${type}`);
  }
  return LEGAL_DOCUMENT_CONFIG[type];
}

export interface LegalDocumentCreator {
  id: number;
  firstName: string;
  lastName: string;
}

export interface LegalDocument {
  id: number;
  type: LegalDocumentType;
  version: string;
  content: string;
  requiresAcceptance: boolean;
  publishedAt: string | null;
  publishedBy: number | null;
  isDraft: boolean;
  isPublished: boolean;
  creator: LegalDocumentCreator;
  publisher?: LegalDocumentCreator;
  createdAt?: string;
}

export interface LegalVersionHistoryItem {
  id: number;
  version: string;
  publishedAt: string;
  requiresAcceptance: boolean;
  creator: LegalDocumentCreator;
  publisher: LegalDocumentCreator | null;
}

export interface LegalDocumentsListParams {
  page?: number;
  limit?: number;
  type?: LegalDocumentType;
  status?: LegalDocumentStatus;
  search?: string;
}

export interface LegalDocumentsListResponse {
  meta: PaginationMeta;
  data: LegalDocument[];
}

export interface CreateLegalDocumentParams {
  type: LegalDocumentType;
  version: string;
  content: string;
}

export interface UpdateLegalDocumentParams {
  id: number;
  version?: string;
  content?: string;
}

export interface PublishLegalDocumentParams {
  id: number;
  requiresAcceptance: boolean;
}

export interface PublicLegalDocument {
  id: number;
  type: LegalDocumentType;
  version: string;
  content: string;
  requiresAcceptance: boolean;
  publishedAt: string;
  isDraft: boolean;
  isPublished: boolean;
}

export type LegalVersionsListResponse = LegalVersionHistoryItem[];
