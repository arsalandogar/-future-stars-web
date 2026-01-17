import { DataTable, type Column } from '@/components/ui/data-table';
import { useListingContext } from '@/components/ui/listing';

import { useUserPacks } from '../api/get-user-packs';
import { PackRow } from './pack-row';

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Name' },
  { label: 'Designs', width: 120 },
  { label: 'Total Cards', width: 140 },
  { label: 'Created', width: 120 },
];

interface PacksTableProps {
  userId: number;
}

export function PacksList({ userId }: PacksTableProps) {
  const { page, limit, search } = useListingContext();

  const queryResult = useUserPacks({
    variables: { userId, page, limit, search: search || undefined },
  });

  return (
    <DataTable
      columns={COLUMNS}
      queryResult={queryResult}
      emptyMessage="No packs found"
      keyExtractor={(pack) => pack.id}
      renderRow={(pack) => <PackRow pack={pack} />}
    />
  );
}
