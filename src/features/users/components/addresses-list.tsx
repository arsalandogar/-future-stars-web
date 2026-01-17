import { DataTable, type Column } from '@/components/ui/data-table';
import { useListingContext } from '@/components/ui/listing';

import { useUserAddresses } from '../api/get-user-addresses';
import { AddressRow } from './address-row';

const COLUMNS: Column[] = [
  { label: 'Name' },
  { label: 'Address' },
  { label: 'Country', width: 140 },
  { label: 'Phone', width: 140 },
  { label: 'Tags', width: 140 },
];

interface AddressesTableProps {
  userId: number;
}

export function AddressesList({ userId }: AddressesTableProps) {
  const { page, limit, search } = useListingContext();

  const queryResult = useUserAddresses({
    variables: { userId, page, limit, search: search || undefined },
  });

  return (
    <DataTable
      columns={COLUMNS}
      queryResult={queryResult}
      emptyMessage="No addresses found"
      keyExtractor={(address) => address.id}
      renderRow={(address) => <AddressRow address={address} />}
    />
  );
}
