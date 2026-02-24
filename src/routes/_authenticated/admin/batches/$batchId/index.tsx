import { createFileRoute } from '@tanstack/react-router';

import { BatchDetailPage, usePrintBatch } from '@/features/print-batches';

export const Route = createFileRoute('/_authenticated/admin/batches/$batchId/')(
  {
    loader: ({ context: { queryClient }, params: { batchId } }) =>
      queryClient.ensureQueryData(usePrintBatch.getOptions(Number(batchId))),
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { batchId } = Route.useParams();
  return <BatchDetailPage batchId={Number(batchId)} />;
}
