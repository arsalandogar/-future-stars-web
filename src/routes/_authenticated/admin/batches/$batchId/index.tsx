import { createFileRoute } from '@tanstack/react-router';

import { BatchDetailPage, printBatchQuery } from '@/features/print-batches';

export const Route = createFileRoute('/_authenticated/admin/batches/$batchId/')(
  {
    loader: ({ context: { queryClient }, params: { batchId } }) =>
      queryClient.ensureQueryData(printBatchQuery.getOptions(Number(batchId))),
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { batchId } = Route.useParams();
  return <BatchDetailPage batchId={Number(batchId)} />;
}
