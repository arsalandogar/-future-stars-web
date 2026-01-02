import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { LegalDocumentType, PublicLegalDocument } from '../types';

export const usePublicLegalDocument = createQuery({
  queryKey: ['legal'],
  fetcher: (type: LegalDocumentType): Promise<PublicLegalDocument> =>
    api.get(`legal/${type}`),
});
