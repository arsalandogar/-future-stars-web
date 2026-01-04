// Pages
export { LegalViewPage } from './pages/legal-view-page';
export { LegalEditPage } from './pages/legal-edit-page';
export { LegalCreatePage } from './pages/legal-create-page';
export { LegalVersionsPage } from './pages/legal-versions-page';

// Components
export { LegalDocumentList } from './components/legal-document-list';
export { LegalDocumentForm } from './components/legal-document-form';
export { LegalDocumentView } from './components/legal-document-view';
export { LegalVersionHistory } from './components/legal-version-history';
export { PublishModal } from './components/publish-modal';
export { PublicLegalPage } from './components/public-legal-page';

// API
export { useLegalDocuments } from './api/get-legal-documents';
export { useLegalDocument } from './api/get-legal-document';
export { useCreateLegalDocument } from './api/create-legal-document';
export { useUpdateLegalDocument } from './api/update-legal-document';
export { useDeleteLegalDocument } from './api/delete-legal-document';
export { usePublishLegalDocument } from './api/publish-legal-document';
export { useLegalVersions } from './api/get-legal-versions';
export { usePublicLegalDocument } from './api/get-public-legal-document';

// Types
export type {
  LegalDocument,
  LegalDocumentType,
  LegalDocumentStatus,
  LegalDocumentCreator,
  LegalVersionHistoryItem,
  LegalDocumentsListParams,
  LegalDocumentsListResponse,
  CreateLegalDocumentParams,
  UpdateLegalDocumentParams,
  PublishLegalDocumentParams,
  PublicLegalDocument,
} from './types';

export {
  LEGAL_DOCUMENT_CONFIG,
  isLegalDocumentType,
  getLegalDocumentConfig,
} from './types';
