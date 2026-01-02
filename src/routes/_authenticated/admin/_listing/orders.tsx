import { createFileRoute } from '@tanstack/react-router';

import { OrdersListPage } from '@/features/orders';

export const Route = createFileRoute('/_authenticated/admin/_listing/orders')({
  component: OrdersListPage,
});
