import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { OrdersListPage } from '@/features/orders';

const defaultValues = {
  search: '',
};

const ordersSearchSchema = v.object({
  page: v.optional(
    v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
    1
  ),
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export const Route = createFileRoute('/_authenticated/admin/orders')({
  component: OrdersListPage,
  validateSearch: ordersSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});
