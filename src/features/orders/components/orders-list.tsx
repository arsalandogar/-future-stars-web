import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';

import { useOrders } from '../api/get-orders';

import { OrderRow } from './order-row';

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Date', width: 120 },
  { label: 'Customer' },
  { label: 'Total', width: 100 },
  { label: 'Status', width: 120 },
  { label: 'Actions', width: 60 },
];

export function OrdersList() {
  const { page, limit, search, setPage } = useListingContext();

  const { data, isLoading } = useOrders({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <ListingShell
      title="Orders List"
      description="Manage and fulfill your custom card pack orders."
    >
      <DataTable
        data={orders}
        columns={COLUMNS}
        isLoading={isLoading}
        emptyMessage="No orders found"
        keyExtractor={(order) => order.id}
        renderRow={(order) => <OrderRow order={order} />}
        pagination={
          meta && meta.lastPage > 1
            ? { page, total: meta.lastPage, onChange: setPage }
            : undefined
        }
      />
    </ListingShell>
  );
}
