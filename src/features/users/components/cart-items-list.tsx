import { DataTable, type Column } from '@/components/ui/data-table';
import { useListingContext } from '@/components/ui/listing';

import { useUserCartItems } from '../api/get-user-cart-items';
import { CartItemRow } from './cart-item-row';

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Pack Name' },
  { label: 'Quantity', width: 100 },
  { label: 'Status', width: 100 },
  { label: 'Added', width: 120 },
];

interface CartItemsTableProps {
  userId: number;
}

export function CartItemsList({ userId }: CartItemsTableProps) {
  const { page, limit, search } = useListingContext();

  const queryResult = useUserCartItems({
    variables: { userId, page, limit, search: search || undefined },
  });

  return (
    <DataTable
      columns={COLUMNS}
      queryResult={queryResult}
      emptyMessage="No cart items found"
      keyExtractor={(item) => item.id}
      renderRow={(item) => <CartItemRow cartItem={item} />}
    />
  );
}
