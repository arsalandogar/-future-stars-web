import type { MantineColor } from '@mantine/core';

export const PERIOD_OPTIONS = [
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

export const STAT_COLORS: Record<string, MantineColor> = {
  revenue: 'green',
  orders: 'blue',
  pending: 'orange',
  average: 'violet',
} as const;

export const CHART_HEIGHT = 250;
