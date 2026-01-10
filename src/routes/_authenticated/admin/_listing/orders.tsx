import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { ORDER_STATUSES, OrdersListPage } from '@/features/orders';

const defaultValues = {
  status: undefined,
};

const ordersSearchSchema = v.object({
  status: v.optional(v.picklist([...ORDER_STATUSES])),
});

export const Route = createFileRoute('/_authenticated/admin/_listing/orders')({
  validateSearch: ordersSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  component: OrdersListPage,
});
