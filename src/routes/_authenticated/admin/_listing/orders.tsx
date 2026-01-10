import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { OrdersListPage } from '@/features/orders';

const defaultValues = {
  status: undefined,
  userId: undefined,
};

const ordersSearchSchema = v.object({
  status: v.optional(
    v.picklist([
      'created',
      'payment_failed',
      'paid',
      'processing',
      'sent_to_production',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ])
  ),
  userId: v.optional(v.pipe(v.number(), v.minValue(1))),
});

export const Route = createFileRoute('/_authenticated/admin/_listing/orders')({
  validateSearch: ordersSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  component: OrdersListPage,
});
