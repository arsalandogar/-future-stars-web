import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import type { PrintBatch, UpdatePrintBatchParams } from '../types';
import { usePrintBatch } from './get-print-batch';
import { usePrintBatches } from './get-print-batches';

export const useUpdatePrintBatch = createMutation({
  mutationFn: ({
    id,
    ...params
  }: UpdatePrintBatchParams): Promise<PrintBatch> =>
    api.put(`admin/print-batches/${id}`, params),
  use: [invalidateQueries([usePrintBatches.getKey(), usePrintBatch.getKey()])],
});
