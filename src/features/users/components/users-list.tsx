import { useState } from 'react';
import { Button, Card, Group, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Download, Search, SlidersHorizontal } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';

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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const { data, isLoading } = useUsers({
    variables: {
      page,
      limit: 10,
      search: debouncedSearch || undefined,
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
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
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
                ? { page, total: meta.lastPage, onChange: setPage }
                : undefined
            }
          />
        </div>
      </Card>
    </div>
  );
}
