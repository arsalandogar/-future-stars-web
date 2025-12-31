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
