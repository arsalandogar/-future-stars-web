import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useLegalDocuments } from './get-legal-documents';

export const useDeleteLegalDocument = createMutation({
  mutationFn: (id: number): Promise<void> => api.delete(`admin/legal/${id}`),
  use: [invalidateQueries([useLegalDocuments.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Document deleted',
      message: 'Legal document has been deleted successfully.',
      color: 'green',
    });
  },
});
