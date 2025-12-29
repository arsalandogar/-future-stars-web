import type { MantineColor } from '@mantine/core';

import type { OrderStatus } from './types';

export const ORDER_STATUS_COLORS: Record<OrderStatus, MantineColor> = {
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

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
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
