import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useLegalDocuments } from './get-legal-documents';
import type { LegalDocument, CreateLegalDocumentParams } from '../types';

export const useCreateLegalDocument = createMutation({
  mutationFn: ({
    type,
    version,
    content,
  }: CreateLegalDocumentParams): Promise<LegalDocument> =>
    api.post('admin/legal', { type, version, content }),
  use: [invalidateQueries([useLegalDocuments.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Document created',
      message: 'Legal document draft has been created successfully.',
      color: 'green',
    });
  },
});
