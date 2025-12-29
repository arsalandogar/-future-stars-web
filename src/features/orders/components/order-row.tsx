import { ActionIcon, Menu, Table, Text } from '@mantine/core';
import { Eye, MoreHorizontal } from 'lucide-react';

import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

import type { Order } from '../types';

import { OrderStatusBadge } from './order-status-badge';

interface OrderRowProps {
  order: Order;
}

export function OrderRow({ order }: OrderRowProps) {
  const customerName = `${order.user.firstName} ${order.user.lastName}`;

  return (
    <>
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
        <OrderStatusBadge status={order.status} />
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
    </>
  );
}
