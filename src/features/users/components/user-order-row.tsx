import { Anchor, Table, Text } from '@mantine/core';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

import type { UserOrder } from '../types';
import { ORDER_STATUS_COLORS } from '@/features/orders';
import { Link } from '@tanstack/react-router';
import { MappedBadge } from '@/components/ui/mapped-badge';

interface UserOrderRowProps {
  order: UserOrder;
}

export function UserOrderRow({ order }: UserOrderRowProps) {
  return (
    <>
      <Table.Td>
        <Anchor
          component={Link}
          to={`/admin/orders/${order.id}`}
          size="sm"
          fw={500}
        >
          #{order.id}
        </Anchor>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(order.createdAt)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {formatCurrency(order.totalAmount)}
        </Text>
      </Table.Td>
      <Table.Td>
        <MappedBadge value={order.status} colorMap={ORDER_STATUS_COLORS} />
      </Table.Td>
    </>
  );
}
