import { getRouteApi } from '@tanstack/react-router';

import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks/use-page-header';

import { useOrders } from '../api/get-orders';

import { OrderRow } from './order-row';
import { OrdersFilters } from './orders-filters';

const routeApi = getRouteApi('/_authenticated/admin/_listing/orders');

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Date', width: 120 },
  { label: 'Customer' },
  { label: 'Total', width: 100 },
  { label: 'Status', width: 120 },
  { label: 'Actions', width: 60 },
];

export function OrdersList() {
  const { page, limit, search } = useListingContext();
  const { status, userId } = routeApi.useSearch();

  usePageHeader({
    title: 'Orders',
    description: 'Manage and fulfill your custom card pack orders.',
  });

  const queryResult = useOrders({
    variables: {
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
      userId: userId || undefined,
    },
  });

  return (
    <ListingShell filters={<OrdersFilters />}>
      <DataTable
        queryResult={queryResult}
        columns={COLUMNS}
        emptyMessage="No orders found"
        keyExtractor={(order) => order.id}
        renderRow={(order) => <OrderRow order={order} />}
      />
    </ListingShell>
  );
}
