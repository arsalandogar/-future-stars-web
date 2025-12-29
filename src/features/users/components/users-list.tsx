import { getRouteApi } from '@tanstack/react-router';
import { Button, Card, Group, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { Download, Search, SlidersHorizontal } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';

import { useUsers } from '../api/get-users';

import { UserRow } from './user-row';

const routeApi = getRouteApi('/_authenticated/admin/users');

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
  const { page, search } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const handleSearchChange = useDebouncedCallback((newSearch: string) => {
    void navigate({ search: { page: 1, search: newSearch }, replace: true });
  }, 300);

  const handlePageChange = (newPage: number) => {
    void navigate({ search: () => ({ page: newPage }) });
  };

  const { data, isLoading } = useUsers({
    variables: {
      page,
      limit: 10,
      search: search || undefined,
    },
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <Card withBorder radius="md" p="lg">
        <div className="flex flex-col gap-6">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={4}>Users List</Title>
              <Text size="sm" c="dimmed">
                View and manage registered users.
              </Text>
            </div>
            <Group>
              <Button
                variant="default"
                leftSection={<Download size={16} />}
                disabled
              >
                Export
              </Button>
            </Group>
          </Group>

          <Group justify="space-between">
            <TextInput
              placeholder="Search by name or email..."
              leftSection={<Search size={16} />}
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.currentTarget.value)}
              className="w-80"
            />
            <Button
              variant="default"
              leftSection={<SlidersHorizontal size={16} />}
              disabled
            >
              Filter
            </Button>
          </Group>

          <DataTable
            data={users}
            columns={COLUMNS}
            isLoading={isLoading}
            emptyMessage="No users found"
            keyExtractor={(user) => user.id}
            renderRow={(user) => <UserRow user={user} />}
            pagination={
              meta && meta.lastPage > 1
                ? { page, total: meta.lastPage, onChange: handlePageChange }
                : undefined
            }
          />
        </div>
      </Card>
    </div>
  );
}
