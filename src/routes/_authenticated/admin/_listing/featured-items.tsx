import { createFileRoute } from '@tanstack/react-router';

import { FeaturedItemsListPage } from '@/features/featured-items';

export const Route = createFileRoute(
  '/_authenticated/admin/_listing/featured-items'
)({
  component: FeaturedItemsListPage,
});
