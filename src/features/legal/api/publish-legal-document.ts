import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useLegalDocuments } from './get-legal-documents';
import { useLegalDocument } from './get-legal-document';
import type { LegalDocument, PublishLegalDocumentParams } from '../types';

export const usePublishLegalDocument = createMutation({
  mutationFn: ({
    id,
    requiresAcceptance,
  }: PublishLegalDocumentParams): Promise<LegalDocument> =>
    api.post(`admin/legal/${id}/publish`, { requiresAcceptance }),
  use: [
    invalidateQueries([useLegalDocuments.getKey(), useLegalDocument.getKey()]),
  ],
  onSuccess: () => {
    notifications.show({
      title: 'Document published',
      message: 'Legal document has been published successfully.',
      color: 'green',
    });
  },
});
