import { useState } from 'react';
import { Button, Card, Group, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Download, Search, SlidersHorizontal } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';

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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const { data, isLoading } = useOrders({
    variables: {
      page,
      limit: 10,
      search: debouncedSearch || undefined,
    },
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <Card withBorder radius="md" p="lg">
        <div className="flex flex-col gap-6">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={4}>Orders List</Title>
              <Text size="sm" c="dimmed">
                Manage and fulfill your custom card pack orders.
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
              placeholder="Search..."
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
        </div>
      </Card>
    </div>
  );
}
