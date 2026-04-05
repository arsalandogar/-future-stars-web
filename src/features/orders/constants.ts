import type { MantineColor } from '@mantine/core';

import type { OrderStatus, ShipmentStatus } from './types';

export const ORDER_STATUS_COLORS: Record<OrderStatus, MantineColor> = {
  created: 'yellow',
  payment_failed: 'red',
  paid: 'green',
  processing: 'blue',
  sent_to_production: 'indigo',
  shipped: 'violet',
  delivered: 'teal',
  cancelled: 'red',
  refunded: 'orange',
};

export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, MantineColor> = {
  unbatched: 'yellow',
  batched: 'blue',
  printing: 'indigo',
  shipped: 'green',
};
