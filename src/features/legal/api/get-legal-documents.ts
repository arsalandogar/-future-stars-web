import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type {
  LegalDocumentsListParams,
  LegalDocumentsListResponse,
} from '../types';

export const useLegalDocuments = createQuery({
  queryKey: ['admin', 'legal'],
  fetcher: (
    params: LegalDocumentsListParams
  ): Promise<LegalDocumentsListResponse> => api.get('admin/legal', { params }),
});
