import { createFileRoute } from '@tanstack/react-router';

import { CreateCardPage } from '@/features/card-builder';

export const Route = createFileRoute(
  '/_authenticated/_customer/_card-builder/create-card'
)({
  component: CreateCardPage,
});
