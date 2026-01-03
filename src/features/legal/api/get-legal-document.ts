import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { LegalDocumentResponse } from '../types';

export const useLegalDocument = createQuery({
  queryKey: ['admin', 'legal', 'detail'],
  fetcher: (id: number): Promise<LegalDocumentResponse> =>
    api.get(`admin/legal/${id}`),
});
