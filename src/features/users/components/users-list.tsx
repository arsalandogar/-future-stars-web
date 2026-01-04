import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks/use-page-header';

import { useUsers } from '../api/get-users';

import { UserRow } from './user-row';

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Name' },
  { label: 'Email' },
  { label: 'Phone', width: 140 },
  { label: 'Role', width: 100 },
  { label: 'Joined', width: 120 },
  { label: 'Actions', width: 60 },
];

export function UsersList() {
  const { page, limit, search } = useListingContext();

  usePageHeader({
    title: 'Users',
    description: 'View and manage registered users.',
  });

  const queryResult = useUsers({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return (
    <ListingShell searchPlaceholder="Search by name or email...">
      <DataTable
        queryResult={queryResult}
        columns={COLUMNS}
        emptyMessage="No users found"
        keyExtractor={(user) => user.id}
        renderRow={(user) => <UserRow user={user} />}
      />
    </ListingShell>
  );
}
