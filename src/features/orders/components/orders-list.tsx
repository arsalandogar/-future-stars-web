import { getRouteApi } from '@tanstack/react-router';
import { Button, Card, Group, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { Search, SlidersHorizontal } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';

import { useOrders } from '../api/get-orders';

import { OrderRow } from './order-row';

const routeApi = getRouteApi('/_authenticated/admin/orders');

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Date', width: 120 },
  { label: 'Customer' },
  { label: 'Total', width: 100 },
  { label: 'Status', width: 120 },
  { label: 'Actions', width: 60 },
];

export function OrdersList() {
  const { page, search } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const handleSearchChange = useDebouncedCallback((newSearch: string) => {
    void navigate({ search: { page: 1, search: newSearch }, replace: true });
  }, 300);

  const handlePageChange = (newPage: number) => {
    void navigate({ search: () => ({ page: newPage }) });
  };

  const { data, isLoading } = useOrders({
    variables: {
      page,
      limit: 10,
      search: search || undefined,
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
          </Group>

          <Group justify="space-between">
            <TextInput
              placeholder="Search..."
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
            data={orders}
            columns={COLUMNS}
            isLoading={isLoading}
            emptyMessage="No orders found"
            keyExtractor={(order) => order.id}
            renderRow={(order) => <OrderRow order={order} />}
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
