import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';

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
  const { page, limit, search, setPage } = useListingContext();

  const { data, isLoading } = useUsers({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <ListingShell
      title="Users List"
      description="View and manage registered users."
      searchPlaceholder="Search by name or email..."
    >
      <DataTable
        data={users}
        columns={COLUMNS}
        isLoading={isLoading}
        emptyMessage="No users found"
        keyExtractor={(user) => user.id}
        renderRow={(user) => <UserRow user={user} />}
        pagination={
          meta && meta.lastPage > 1
            ? { page, total: meta.lastPage, onChange: setPage }
            : undefined
        }
      />
    </ListingShell>
  );
}
