import { createFileRoute } from '@tanstack/react-router';

import { BatchDetailPage } from '@/features/print-batches';

export const Route = createFileRoute('/_authenticated/admin/batches/$batchId/')(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { batchId } = Route.useParams();
  return <BatchDetailPage batchId={Number(batchId)} />;
}
