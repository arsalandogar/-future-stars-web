import type { MantineColor } from '@mantine/core';

export const ORDER_STATUSES = [
  'created',
  'payment_failed',
  'paid',
  'processing',
  'sent_to_production',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'sent_to_production', label: 'Sent to Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

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
