import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { LegalDocumentType, PublicLegalDocumentResponse } from '../types';

export const usePublicLegalDocument = createQuery({
  queryKey: ['legal'],
  fetcher: (type: LegalDocumentType): Promise<PublicLegalDocumentResponse> =>
    api.get(`legal/${type}`),
});
