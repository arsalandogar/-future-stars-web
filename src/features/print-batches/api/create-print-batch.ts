import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import type { CreatePrintBatchParams, PrintBatch } from '../types';
import { usePrintBatches } from './get-print-batches';

// Using query key directly to avoid circular dependency with orders feature
const ORDERS_QUERY_KEY = ['admin', 'orders'] as const;

export const useCreatePrintBatch = createMutation({
  mutationFn: ({
    name,
    orderIds,
    exclude,
  }: CreatePrintBatchParams): Promise<PrintBatch> =>
    api.post('admin/print-batches', { name, orderIds, exclude }),
  use: [invalidateQueries([usePrintBatches.getKey(), ORDERS_QUERY_KEY])],
});
