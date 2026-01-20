import { DataTable, type Column } from '@/components/ui/data-table';
import { useListingContext } from '@/components/ui/listing';

import { useUserOrders } from '../api/get-user-orders';
import { UserOrderRow } from './user-order-row';

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Date', width: 120 },
  { label: 'Total', width: 100 },
  { label: 'Status', width: 120 },
];

interface OrdersListProps {
  userId: number;
}

export function UserOrdersList({ userId }: OrdersListProps) {
  const { page, limit, search } = useListingContext();

  const queryResult = useUserOrders({
    variables: { userId, page, limit, search: search || undefined },
  });

  return (
    <DataTable
      columns={COLUMNS}
      queryResult={queryResult}
      emptyMessage="No orders found"
      keyExtractor={(order) => order.id}
      renderRow={(order) => <UserOrderRow order={order} />}
    />
  );
}
