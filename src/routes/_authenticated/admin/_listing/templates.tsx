import { createFileRoute } from '@tanstack/react-router';

import { TemplatesListPage } from '@/features/templates';

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/templates'
)({
  component: TemplatesListPage,
});
