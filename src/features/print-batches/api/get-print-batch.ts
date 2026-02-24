import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { PrintBatch } from '../types';

interface PrintBatchResponse {
  data: PrintBatch;
}

export const usePrintBatch = createQuery({
  queryKey: ['admin', 'print-batches', 'detail'],
  fetcher: (batchId: number): Promise<PrintBatchResponse> =>
    api.get(`admin/print-batches/${batchId}`),
});
