import { Badge } from '@mantine/core';

import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../constants';
import type { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge color={ORDER_STATUS_COLORS[status]} variant="light" size="sm">
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
