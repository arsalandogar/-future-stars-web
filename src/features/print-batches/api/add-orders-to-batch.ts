import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import type { AddOrdersToBatchParams, PrintBatch } from '../types';
import { usePrintBatch } from './get-print-batch';
import { usePrintBatches } from './get-print-batches';

// Using query key directly to avoid circular dependency with orders feature
const ORDERS_QUERY_KEY = ['admin', 'orders'] as const;

export const useAddOrdersToBatch = createMutation({
  mutationFn: ({
    batchId,
    orderIds,
  }: AddOrdersToBatchParams): Promise<PrintBatch> =>
    api.post(`admin/print-batches/${batchId}/orders`, { orderIds }),
  use: [
    invalidateQueries([
      usePrintBatches.getKey(),
      usePrintBatch.getKey(),
      ORDERS_QUERY_KEY,
    ]),
  ],
});
