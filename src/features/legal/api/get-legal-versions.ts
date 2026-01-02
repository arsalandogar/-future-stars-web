import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { LegalDocumentType, LegalVersionsListResponse } from '../types';

export const useLegalVersions = createQuery({
  queryKey: ['admin', 'legal', 'versions'],
  fetcher: (type: LegalDocumentType): Promise<LegalVersionsListResponse> =>
    api.get(`admin/legal/versions/${type}`),
});
