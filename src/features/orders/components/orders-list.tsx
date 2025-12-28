import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Pagination,
  Paper,
  Skeleton,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  Download,
  Eye,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import { useOrders } from '../api/get-orders';
import type { Order, OrderStatus } from '../types';

const statusColors: Record<OrderStatus, string> = {
  created: 'gray',
  payment_failed: 'red',
  paid: 'green',
  processing: 'blue',
  sent_to_production: 'indigo',
  shipped: 'violet',
  delivered: 'teal',
  cancelled: 'red',
  refunded: 'orange',
};

const statusLabels: Record<OrderStatus, string> = {
  created: 'Created',
  payment_failed: 'Payment Failed',
  paid: 'Paid',
  processing: 'Processing',
  sent_to_production: 'In Production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

function OrdersTableSkeleton() {
  return (
    <Table.Tbody>
      {Array.from({ length: 5 }).map((_, index) => (
        <Table.Tr key={index}>
          <Table.Td>
            <Skeleton height={20} width={60} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={100} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={150} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={80} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={24} width={90} radius="xl" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={28} width={28} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  );
}

interface OrderRowProps {
  order: Order;
}

function OrderRow({ order }: OrderRowProps) {
  const customerName = `${order.user.firstName} ${order.user.lastName}`;

  return (
    <Table.Tr>
      <Table.Td>
        <Text size="sm" fw={500}>
          #{order.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(order.createdAt)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{customerName}</Text>
        <Text size="xs" c="dimmed">
          {order.user.email}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {formatCurrency(order.totalAmount)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={statusColors[order.status]} variant="light" size="sm">
          {statusLabels[order.status]}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<Eye size={14} />}>View Details</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
}

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

          <Paper withBorder radius="md">
            <Table horizontalSpacing="md" verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              {isLoading ? (
                <OrdersTableSkeleton />
              ) : orders.length === 0 ? (
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text ta="center" c="dimmed" py="xl">
                        No orders found
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              ) : (
                <Table.Tbody>
                  {orders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </Table.Tbody>
              )}
            </Table>
          </Paper>

          {meta && meta.lastPage > 1 && (
            <Group justify="center">
              <Pagination
                value={page}
                onChange={setPage}
                total={meta.lastPage}
              />
            </Group>
          )}
        </div>
      </Card>
    </div>
  );
}
