import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type {
  PrintBatchesListParams,
  PrintBatchesListResponse,
} from '../types';

export const usePrintBatches = createQuery({
  queryKey: ['admin', 'print-batches'],
  fetcher: (
    params: PrintBatchesListParams
  ): Promise<PrintBatchesListResponse> =>
    api.get('admin/print-batches', { params }),
});
