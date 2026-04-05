import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { usePrintBatch } from './get-print-batch';
import { usePrintBatches } from './get-print-batches';

export const useSendPrintBatch = createMutation({
  mutationFn: (id: number): Promise<unknown> =>
    api.post(`admin/print-batches/${id}/send`),
  use: [invalidateQueries([usePrintBatches.getKey(), usePrintBatch.getKey()])],
});
