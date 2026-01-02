import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useLegalDocuments } from './get-legal-documents';
import { useLegalDocument } from './get-legal-document';
import type { LegalDocument, UpdateLegalDocumentParams } from '../types';

export const useUpdateLegalDocument = createMutation({
  mutationFn: ({
    id,
    version,
    content,
  }: UpdateLegalDocumentParams): Promise<LegalDocument> =>
    api.put(`admin/legal/${id}`, { version, content }),
  use: [
    invalidateQueries([useLegalDocuments.getKey(), useLegalDocument.getKey()]),
  ],
  onSuccess: () => {
    notifications.show({
      title: 'Document updated',
      message: 'Legal document has been updated successfully.',
      color: 'green',
    });
  },
});
