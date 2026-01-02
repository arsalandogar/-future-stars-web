import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { LegalDocument } from '../types';

export const useLegalDocument = createQuery({
  queryKey: ['admin', 'legal', 'detail'],
  fetcher: (id: number): Promise<LegalDocument> => api.get(`admin/legal/${id}`),
});
