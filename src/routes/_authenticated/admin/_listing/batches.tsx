import { createFileRoute } from '@tanstack/react-router';

import { BatchesListPage } from '@/features/print-batches';

export const Route = createFileRoute('/_authenticated/admin/_listing/batches')({
  component: BatchesListPage,
});
